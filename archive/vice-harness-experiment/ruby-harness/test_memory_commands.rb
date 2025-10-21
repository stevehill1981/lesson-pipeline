#!/usr/bin/env ruby
# Comprehensive test of VICE memory commands

require 'socket'

socket = TCPSocket.new('localhost', 6510)
socket.write("\n")
socket.flush

# Read initial prompt
buffer = ''
loop do
  chunk = socket.readpartial(4096)
  buffer += chunk
  break if buffer.include?('(C:$')
rescue IO::WaitReadable
  retry
end

puts "✓ Connected"

# Wait for C64 boot
sleep 2

# Test 1: Read KERNAL ROM (we know this has data)
puts "\n=== Test 1: KERNAL ROM at $E000 with 'm' command ==="
socket.write("m e000 e01f\n")
buffer = ''
loop do
  chunk = socket.readpartial(4096)
  buffer += chunk
  break if buffer.include?('(C:$')
rescue IO::WaitReadable
  retry
end
puts buffer

# Test 2: Read screen RAM with 'm' command
puts "\n=== Test 2: Screen RAM at $0400 with 'm' command ==="
socket.write("m 0400 041f\n")
buffer = ''
loop do
  chunk = socket.readpartial(4096)
  buffer += chunk
  break if buffer.include?('(C:$')
rescue IO::WaitReadable
  retry
end
puts buffer

# Test 3: Inject text first, THEN read screen RAM
puts "\n=== Test 3: Inject 'HELLO' then read screen RAM ==="
socket.write("keybuf \"HELLO\"\n")
buffer = ''
loop do
  chunk = socket.readpartial(4096)
  buffer += chunk
  break if buffer.include?('(C:$')
rescue IO::WaitReadable
  retry
end
puts "Keybuf response: #{buffer}"

sleep 1

socket.write("m 0400 041f\n")
buffer = ''
loop do
  chunk = socket.readpartial(4096)
  buffer += chunk
  break if buffer.include?('(C:$')
rescue IO::WaitReadable
  retry
end
puts "Screen RAM after HELLO:"
puts buffer

# Test 4: Try 'i' (inspect) command
puts "\n=== Test 4: Screen RAM with 'i' command ==="
socket.write("i 0400\n")
buffer = ''
loop do
  chunk = socket.readpartial(4096)
  buffer += chunk
  break if buffer.include?('(C:$')
rescue IO::WaitReadable
  retry
end
puts buffer

socket.close
