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

  def initialize(port: 6510, timeout: 5)
    @port = port
    @timeout = timeout
    @socket = nil
    @connected = false
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

    # Convert newline character to RETURN key escape sequence for VICE
    # Replace actual \n with the string "\x0d" that VICE keybuf expects
    processed_keys = keys.gsub("\n", '\x0d')

    # Escape double quotes for the monitor command
    processed_keys = processed_keys.gsub('"', '\"')

    # VICE monitor keybuf command: keybuf "string"
    # Special keys use hex escapes: \x0d for RETURN, \x03 for RUN/STOP
    command = "keybuf \"#{processed_keys}\"\n"

    @socket.write(command)
    response = read_until_prompt

    # Check for errors in response
    raise "Failed to inject keys: #{response}" if response.include?('ERR') || response.include?('?')

    response
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
end
