#!/usr/bin/env ruby
# Test reading from C64 KERNAL ROM (always has data)

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

puts "Connected"

# Wait for C64 to boot
puts "Waiting for C64 boot..."
sleep 2

# Try reading from KERNAL ROM ($E000-$E01F)
puts "\n=== Testing 'm' command on $E000 (KERNAL ROM) ==="
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

# Now try screen RAM
puts "\n=== Testing 'm' command on $0400 (screen RAM) ==="
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

socket.close
