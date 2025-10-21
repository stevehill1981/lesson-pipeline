#!/usr/bin/env ruby
# Test what command to use for reading screen RAM

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

puts "Connected: #{buffer.strip}"

# Try 'd' command on screen RAM
puts "\n=== Testing 'd' command on $0400-$041F (first line of screen) ==="
socket.write("d 0400 041f\n")
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
