#!/usr/bin/env ruby
# Test: Read full screen to see what PRINT 1 actually did

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

def read_full_screen(socket)
  socket.write("m 0400 07e7\n")  # Read all 25 lines (1000 bytes)
  socket.flush
  sleep 0.2

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

puts "✓ Connected"

# Boot C64
socket.write("g\n")
socket.flush
sleep 5

# Set breakpoint
socket.write("break e5d4\n")
socket.flush

Timeout.timeout(3) do
  response = ''
  loop do
    chunk = socket.readpartial(4096)
    response += chunk
    break if response.include?('(C:$')
  rescue IO::WaitReadable
    IO.select([socket], nil, nil, 0.1)
    retry
  end
end

# Inject PRINT 1
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

# Continue
socket.write("g\n")
socket.flush

Timeout.timeout(5) do
  response = ''
  loop do
    chunk = socket.readpartial(4096)
    response += chunk
    break if response.include?('BREAK') || response.include?('(C:$')
  rescue IO::WaitReadable
    IO.select([socket], nil, nil, 0.1)
    retry
  end
end

# Read full screen
screen_text = read_full_screen(socket)
puts "\n=== FULL SCREEN (25 lines × 40 chars) ==="
screen_text.scan(/.{40}/).each_with_index do |line, i|
  puts sprintf("%2d: '%s'", i, line)
end

socket.close
