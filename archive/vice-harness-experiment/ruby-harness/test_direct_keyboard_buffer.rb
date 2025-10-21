#!/usr/bin/env ruby
# Test: Direct keyboard buffer manipulation instead of keybuf
# Write PETSCII codes to $0277-$0280 and set length at $00C6

require 'socket'

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
sleep 2

# C64 keyboard buffer:
# $00C6 = buffer length (NDXPTR)
# $0277-$0280 = 10-byte buffer (KEYBUF)

# PETSCII for "LIST\r" (5 bytes - fits in buffer!)
# L = $4C, I = $49, S = $53, T = $54, RETURN = $0D
petscii_codes = [0x4C, 0x49, 0x53, 0x54, 0x0D]

puts "\n=== Writing PETSCII codes directly to keyboard buffer ==="
puts "Codes: #{petscii_codes.map { |c| '%02X' % c }.join(' ')}"

# Write each byte to buffer at $0277-$027B
petscii_codes.each_with_index do |code, index|
  addr = 0x0277 + index
  command = format(">%04x %02x\n", addr, code)
  puts "  Writing $%02X to $%04X" % [code, addr]

  socket.write(command)
  socket.flush

  # Read response
  response = ''
  loop do
    chunk = socket.readpartial(4096)
    response += chunk
    break if response.include?('(C:$')
  rescue IO::WaitReadable
    retry
  end
end

# Set buffer length at $00C6
puts "\nSetting buffer length = #{petscii_codes.length}"
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

# Exit monitor to let C64 process the buffer
puts "\n=== Exiting monitor (x) ==="
socket.write("x\n")
socket.flush

puts "Waiting 2s for C64 to process keyboard buffer..."
sleep 2

# Re-enter monitor
puts "\n=== Re-entering monitor ==="
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

# Read screen RAM
puts "\n=== Reading screen RAM (first 3 lines = 120 bytes) ==="
socket.write("m 0400 0477\n")
socket.flush
sleep 0.5

response = ''
loop do
  chunk = socket.readpartial(4096)
  response += chunk
  break if response.include?('(C:$')
rescue IO::WaitReadable
  retry
end

puts "\nScreen RAM dump:"
puts response

# Parse and display
screen_bytes = []
response.each_line do |line|
  if line =~ /[>.  ]C:[0-9a-fA-F]+\s+([0-9a-fA-F]{2}(?:\s+[0-9a-fA-F]{2})*)/
    hex_values = $1.scan(/[0-9a-fA-F]{2}/)
    screen_bytes.concat(hex_values.map { |h| h.to_i(16) })
  end
end

puts "\n=== Screen content as ASCII ==="
screen_text = screen_bytes.map do |code|
  case code
  when 0 then '@'
  when 1..26 then (code + 64).chr
  when 32 then ' '
  when 33..63 then code.chr
  else '.'
  end
end.join

# Print 3 lines of 40 characters each
(0..2).each do |i|
  start_pos = i * 40
  line_text = screen_text[start_pos, 40] || ''
  puts "Line #{i}: '#{line_text}'"
end

puts "\nContains 'LIST'? #{screen_text.include?('LIST')}"
puts "Contains 'READY'? #{screen_text.include?('READY')}"

# Verify buffer is now empty
puts "\n=== Checking if buffer was consumed ==="
socket.write("m 00c6 00c6\n")
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

puts "Buffer length at $00C6:"
puts response

socket.close
