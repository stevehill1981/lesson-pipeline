# frozen_string_literal: true

require 'socket'
require_relative 'emulator_adapter'

# VICE C64 emulator adapter using remote monitor protocol (text-based, port 6510)
#
# Protocol: Text-based ASCII commands with \n terminator
# Responses: Plain text ending with prompt: (C:$xxxx)
# Commands: load "file", m 0400 0410, g, r, etc.
#
# Launch VICE: x64sc -remotemonitor -monport 6510
class VICEAdapter
  include EmulatorAdapter

  # C64 BASIC READY loop address - perfect breakpoint location
  BASIC_READY_LOOP = 0xE5D4

  # C64 keyboard buffer addresses
  KEYBOARD_BUFFER = 0x0277  # 10-byte buffer
  KEYBOARD_BUFFER_LENGTH = 0x00C6

  def initialize(port: 6510, timeout: 5)
    @port = port
    @timeout = timeout
    @socket = nil
    @connected = false
    @c64_booted = false
    @breakpoint_set = false
  end

  def name
    'VICE'
  end

  def platform
    'c64'
  end

  def capabilities
    %i[load_program inject_keys wait_for_text read_memory reset]
  end

  def supports?(action)
    capabilities.include?(action.to_sym)
  end

  def connect
    @socket = TCPSocket.new('localhost', @port)
    @socket.setsockopt(Socket::IPPROTO_TCP, Socket::TCP_NODELAY, 1)

    # VICE remote monitor requires a newline to trigger initial prompt
    # Send newline first, THEN wait for prompt response
    @socket.write("\n")
    @socket.flush

    # Wait for initial prompt from VICE remote monitor
    # Remote monitor sends prompt like: (C:$e5d4)
    prompt = read_until_prompt
    raise "Expected VICE prompt, got: #{prompt}" unless prompt.include?('(C:$')

    @connected = true
  rescue Errno::ECONNREFUSED => e
    @connected = false
    raise e
  end

  def disconnect
    @socket&.close
    @socket = nil
    @connected = false
  end

  def alive?
    @connected && @socket && !@socket.closed?
  end

  def load_program(path, options = {})
    raise 'Not connected' unless alive?
    raise "File not found: #{path}" unless File.exist?(path)

    # VICE monitor load command: load "filename" device start_address
    # Device 0 = host filesystem
    # If no start address, uses the load address from the PRG file
    command = format("load \"%<path>s\" 0\n", path: path)

    @socket.write(command)
    response = read_until_prompt


    # Check for errors in response
    raise "Failed to load program: #{response}" if response.include?('ERR') || response.include?('?')

    response
  end

  def read_memory(start_address, length)
    raise 'Not connected' unless alive?

    end_address = start_address + length - 1
    # Use 'm' (memory dump) command for reading data
    # This is better for screen RAM and other data areas than 'd' (disassemble)
    command = format("m %<start>04x %<end>04x\n", start: start_address, end: end_address)

    @socket.write(command)
    @socket.flush

    # Small delay to allow VICE to process the command
    # The 'm' command is asynchronous - VICE returns prompt immediately
    # but actual memory data arrives slightly later
    sleep 0.1

    response = read_until_prompt


    # Parse hex bytes from response
    # Format can be:
    #   >C:0400  00 00 ff ff  ff ff 00 00  00 00 ff 7f  ff ff 00 02   @@����@@@@�߿�@b
    #   .C:002b  00          BRK (disassembly format)
    #   (C:$fd80) .C:002b  00          BRK (with prompt prefix)
    bytes = []
    response.each_line do |line|
      # Match lines containing >C: or .C: (may have prompt prefix)
      next unless line.match?(/[>.  ]C:[0-9a-fA-F]+/)

      # Extract hex bytes after address, before ASCII representation or mnemonic
      # Format: (C:$fd80) .C:002b  00          BRK
      #         >C:0400  00 00 ff ff  ...
      if line =~ /[>.  ]C:[0-9a-fA-F]+\s+([0-9a-fA-F]{2}(?:\s+[0-9a-fA-F]{2})*)/
        hex_values = $1.scan(/[0-9a-fA-F]{2}/)
        hex_values.each { |hex| bytes << hex.to_i(16) }
      end
    end

    bytes
  end

  def inject_keys(keys)
    raise 'Not connected' unless alive?

    # Ensure C64 is booted and breakpoint is set
    ensure_breakpoint_set

    # Convert ASCII to PETSCII codes
    petscii_codes = ascii_to_petscii(keys)

    # C64 keyboard buffer is only 10 bytes - split if needed
    if petscii_codes.length > 10
      raise "Command too long: #{petscii_codes.length} bytes (max 10)"
    end

    # Clear keyboard buffer length first to prevent premature processing
    command = format(">%04x 00\n", KEYBOARD_BUFFER_LENGTH)
    @socket.write(command)
    @socket.flush
    read_until_prompt

    # Write PETSCII codes directly to keyboard buffer memory
    petscii_codes.each_with_index do |code, index|
      addr = KEYBOARD_BUFFER + index
      command = format(">%04x %02x\n", addr, code)

      @socket.write(command)
      @socket.flush

      read_until_prompt
    end

    # Now set keyboard buffer length to trigger processing
    command = format(">%04x %02x\n", KEYBOARD_BUFFER_LENGTH, petscii_codes.length)
    @socket.write(command)
    @socket.flush

    read_until_prompt

    # Small delay to ensure keyboard buffer is fully set before continuing
    sleep 0.1

    # Continue execution - breakpoint will trigger after command executes
    continue_and_wait_for_breakpoint

    # Successfully executed - we're back in monitor at breakpoint
    true
  end

  def wait_for_text(text, timeout: 5)
    raise 'Not connected' unless alive?

    # Ensure C64 is booted
    boot_c64 unless @c64_booted

    deadline = Time.now + timeout

    while Time.now < deadline
      # Read full screen to check for text
      screen_data = read_memory(0x0400, 1000)

      # Convert screen codes to ASCII
      screen_text = screen_codes_to_ascii(screen_data)

      # Check if text appears anywhere on screen
      return true if screen_text.include?(text)

      # Wait before polling again
      sleep 0.5
    end

    # Timeout - text not found
    false
  end

  def capture_screenshot(filepath, format: :png)
    raise 'Not connected' unless alive?

    # VICE screenshot format codes:
    # default/0 = BMP, 1 = PCX, 2 = PNG, 3 = GIF, 4 = IFF
    format_code = case format
                  when :bmp then 0
                  when :pcx then 1
                  when :png then 2
                  when :gif then 3
                  when :iff then 4
                  else 2  # Default to PNG
                  end

    # Ensure absolute path
    absolute_path = File.expand_path(filepath)

    # VICE monitor screenshot command: screenshot "path" format
    command = format("screenshot \"%<path>s\" %<format>d\n", path: absolute_path, format: format_code)

    @socket.write(command)
    response = read_until_prompt

    # Check for errors
    raise "Failed to capture screenshot: #{response}" if response.include?('ERR') || response.include?('?')

    # Verify file was created
    raise "Screenshot file not created at #{absolute_path}" unless File.exist?(absolute_path)

    absolute_path
  end

  private

  # Convert C64 screen codes to ASCII characters
  # C64 screen code mapping (simplified):
  # 0 = '@', 1-26 = 'A'-'Z', 32 = ' ', etc.
  def screen_codes_to_ascii(screen_codes)
    screen_codes.map do |code|
      case code
      when 0
        '@'
      when 1..26
        (code + 64).chr  # 'A'-'Z'
      when 32
        ' '
      when 33..63
        (code).chr  # !'#$%&'()*+,-./0123456789:;<=>?
      else
        '?'  # Unknown/unprintable
      end
    end.join
  end

  def read_until_prompt
    buffer = ''
    prompt_count = 0

    loop do
      chunk = @socket.readpartial(4096)
      buffer += chunk

      # Count how many prompts we've seen
      prompt_count = buffer.scan(/\(C:\$[0-9a-fA-F]+\)/).length

      # Break if we've seen at least one prompt AND
      # either we've waited a bit OR the buffer ends with a prompt
      if prompt_count > 0 && (buffer =~ /\(C:\$[0-9a-fA-F]+\)\s*$/ || prompt_count > 1)
        break
      end
    rescue IO::WaitReadable
      # If no data available and we have at least one prompt, we're done
      break if prompt_count > 0
      retry
    end

    buffer
  end

  # Boot the C64 by sending 'g' (go) command
  # VICE starts paused when -remotemonitor is active
  # NOTE: If breakpoint is set, this will trigger when C64 reaches READY
  def boot_c64
    return if @c64_booted

    @socket.write("g\n")
    @socket.flush

    # Don't sleep here - let caller wait for breakpoint if needed
    @c64_booted = true
  end

  # Set breakpoint at BASIC READY loop
  # This breakpoint triggers automatically after each BASIC command executes
  def ensure_breakpoint_set
    return if @breakpoint_set

    # Boot C64 first if not already booted
    unless @c64_booted
      boot_c64
      # Wait for C64 to fully boot to READY prompt
      # This is essential - breakpoint must be set after C64 reaches READY
      # NOTE: C64 takes time to initialize BASIC and reach the READY loop
      sleep 7
    end

    # Set breakpoint - if C64 is sitting at $E5D4 (READY loop),
    # the breakpoint triggers IMMEDIATELY and pauses execution!
    command = format("break %04x\n", BASIC_READY_LOOP)
    @socket.write(command)
    @socket.flush

    # Wait for response - will get BREAK if C64 is at READY, or prompt if not
    response = read_until_prompt_or_break
    @breakpoint_set = true
  end

  # Read until we get either a prompt or a BREAK message
  def read_until_prompt_or_break
    require 'timeout'

    buffer = ''
    Timeout.timeout(10) do  # Increased to 10s for C64 boot time
      loop do
        chunk = @socket.readpartial(4096)
        buffer += chunk

        # Check for prompt or BREAK message
        # VICE breakpoint messages contain "Stop on  exec" or "BREAK"
        break if buffer.include?('(C:$') || buffer.include?('BREAK') || buffer.include?('Stop on')
      rescue IO::WaitReadable
        IO.select([@socket], nil, nil, 0.1)
        retry
      end
    end

    buffer
  rescue Timeout::Error
    buffer
  end

  # Continue execution with 'g' and wait for breakpoint to hit
  def continue_and_wait_for_breakpoint
    @socket.write("g\n")
    @socket.flush

    # Wait for breakpoint to trigger
    response = read_until_prompt_or_break

    # Verify we hit the breakpoint
    # VICE breakpoint messages contain "Stop on  exec" or "BREAK"
    raise "Breakpoint did not trigger: #{response}" unless response.include?('BREAK') || response.include?('Stop on') || response.include?('(C:$')

    response
  end

  # Convert ASCII string to PETSCII codes (for keyboard injection)
  def ascii_to_petscii(text)
    text.bytes.map do |byte|
      case byte
      when 10 then 0x0D  # \n -> RETURN
      when 65..90 then byte  # A-Z unchanged
      when 97..122 then byte - 32  # a-z -> A-Z (C64 BASIC is uppercase)
      else byte  # Everything else unchanged
      end
    end
  end
end
