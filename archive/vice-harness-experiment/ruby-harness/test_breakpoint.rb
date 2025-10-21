#!/usr/bin/env ruby
# Test: Use breakpoints to automatically return to monitor after execution

require 'socket'
require 'timeout'

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

# Start execution to let C64 boot
puts "\n=== Sending 'g' to boot C64 ==="
socket.write("g\n")
socket.flush

puts "Waiting 5s for C64 to boot..."
sleep 5

# Set a breakpoint at $E5D4 (BASIC READY loop - where it waits for input)
# This address is called after each command executes
puts "\n=== Setting breakpoint at $E5D4 (BASIC READY loop) ==="
socket.write("break e5d4\n")
socket.flush

# Wait for breakpoint response (might get it immediately if we're already there)
begin
  Timeout.timeout(3) do
    response = ''
    loop do
      chunk = socket.readpartial(4096)
      response += chunk
      puts "Got: #{response}"
      break if response.include?('BREAK') || response.include?('(C:$')
    rescue IO::WaitReadable
      IO.select([socket], nil, nil, 0.1)
      retry
    end
  end
rescue Timeout::Error
  puts "✗ Timeout waiting for breakpoint acknowledgment"
end

# Now inject keystrokes
puts "\n=== Injecting PRINT 1 command ==="
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

# Continue execution with 'g'
# The breakpoint should trigger automatically and return us to monitor
puts "\n=== Continuing with 'g' - waiting for breakpoint hit ==="
socket.write("g\n")
socket.flush

# Wait for breakpoint to hit (should return "BREAK: ..." message)
begin
  Timeout.timeout(5) do
    response = ''
    loop do
      chunk = socket.readpartial(4096)
      response += chunk
      puts "Response: #{response}"
      break if response.include?('BREAK') || response.include?('(C:$')
    rescue IO::WaitReadable
      IO.select([socket], nil, nil, 0.1)
      retry
    end

    if response.include?('BREAK')
      puts "\n✓ Breakpoint hit! Back in monitor"
    end
  end
rescue Timeout::Error
  puts "\n✗ Timeout waiting for breakpoint to hit"
end

# Now read screen
screen_text = read_screen(socket)
puts "\n=== Screen content ==="
screen_text.scan(/.{1,40}/).each_with_index do |line, i|
  puts "Line #{i}: '#{line}'" if line.strip.length > 0
end

puts "\nContains 'PRINT'? #{screen_text.include?('PRINT')}"
puts "Contains '1'? #{screen_text.include?('1')}"
puts "Contains 'READY'? #{screen_text.include?('READY')}"

socket.close
