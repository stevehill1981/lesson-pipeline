#!/usr/bin/env ruby
# Test: Use 'g' (go) command to start C64 execution

require 'socket'

def screen_codes_to_ascii(codes)
  codes.map do |code|
    case code
    when 0 then '@'
    when 1..26 then (code + 64).chr
    when 32 then ' '
    when 33..63 then code.chr
    else '.'
    end
  end.join
end

def read_screen(socket)
  socket.write("m 0400 04e7\n")  # Read 8 lines
  socket.flush
  sleep 0.1

  response = ''
  loop do
    chunk = socket.readpartial(4096)
    response += chunk
    break if response.include?('(C:$')
  rescue IO::WaitReadable
    retry
  end

  screen_bytes = []
  response.each_line do |line|
    if line =~ /[>.  ]C:[0-9a-fA-F]+\s+([0-9a-fA-F]{2}(?:\s+[0-9a-fA-F]{2})*)/
      hex_values = $1.scan(/[0-9a-fA-F]{2}/)
      screen_bytes.concat(hex_values.map { |h| h.to_i(16) })
    end
  end

  screen_codes_to_ascii(screen_bytes)
end

socket = TCPSocket.new('localhost', 6510)

# Initial connection
socket.write("\n")
socket.flush

buffer = ''
loop do
  chunk = socket.readpartial(4096)
  buffer += chunk
  break if buffer.include?('(C:$')
rescue IO::WaitReadable
  retry
end

puts "✓ Connected to VICE monitor"

# VICE starts PAUSED when monitor is active
# Use 'g' (go) command to start execution!
puts "\n=== Sending 'g' (go) command to start C64 ==="
socket.write("g\n")
socket.flush

# IMPORTANT: 'g' returns NO data - don't try to read!
# Just wait for boot to complete
puts "Waiting 3s for C64 to boot to READY prompt..."
sleep 3

# Break back into monitor
puts "\n=== Breaking back into monitor (send newline) ==="
socket.write("\n")
socket.flush

response = ''
loop do
  chunk = socket.readpartial(4096)
  response += chunk
  break if response.include?('(C:$')
rescue IO::WaitReadable
  retry
end

# Check screen
screen_text = read_screen(socket)
puts "\n=== Screen content ==="
screen_text.scan(/.{1,40}/).each_with_index do |line, i|
  puts "Line #{i}: '#{line}'" if line.strip.length > 0
end

puts "\n✓ Contains 'READY'? #{screen_text.include?('READY')}"
puts "✓ Contains 'COMMODORE'? #{screen_text.include?('COMMODORE')}"

if screen_text.include?('READY')
  puts "\n=== SUCCESS! C64 booted to READY prompt ==="

  # Now test keyboard injection
  puts "\n=== Injecting PRINT command ==="
  # "PRINT \"HI\"\r" - 11 bytes, fits in 10-byte buffer? Let's use shorter: "PRINT 1\r" = 8 bytes
  petscii_codes = [0x50, 0x52, 0x49, 0x4E, 0x54, 0x20, 0x31, 0x0D]  # "PRINT 1\r"

  petscii_codes.each_with_index do |code, index|
    addr = 0x0277 + index
    socket.write(format(">%04x %02x\n", addr, code))
    socket.flush

    response = ''
    loop do
      chunk = socket.readpartial(4096)
      response += chunk
      break if response.include?('(C:$')
    rescue IO::WaitReadable
      retry
    end
  end

  socket.write(format(">00c6 %02x\n", petscii_codes.length))
  socket.flush

  response = ''
  loop do
    chunk = socket.readpartial(4096)
    response += chunk
    break if response.include?('(C:$')
  rescue IO::WaitReadable
    retry
  end

  puts "✓ Keyboard buffer filled"

  # Resume execution
  puts "\n=== Resuming execution with 'g' ==="
  socket.write("g\n")
  socket.flush

  # Don't try to read after 'g' - it returns nothing
  sleep 1

  # Break back in
  puts "\n=== Breaking back into monitor ==="
  socket.write("\n")
  socket.flush

  response = ''
  loop do
    chunk = socket.readpartial(4096)
    response += chunk
    break if response.include?('(C:$')
  rescue IO::WaitReadable
    retry
  end

  screen_text = read_screen(socket)
  puts "\n=== Screen after PRINT command ==="
  screen_text.scan(/.{1,40}/).each_with_index do |line, i|
    puts "Line #{i}: '#{line}'" if line.strip.length > 0
  end

  puts "\nContains 'PRINT'? #{screen_text.include?('PRINT')}"
  puts "Contains '1'? #{screen_text.include?('1')}"
end

socket.close
