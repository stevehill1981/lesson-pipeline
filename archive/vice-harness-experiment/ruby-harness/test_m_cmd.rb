#!/usr/bin/env ruby
# Test VICE 'm' command for memory dumps

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

# Try 'm' command on screen RAM
puts "\n=== Testing 'm' command on $0400-$041F (first line of screen) ==="
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
puts "\n=== Analyzing format ==="
buffer.each_line do |line|
  puts "Line: #{line.inspect}" if line.include?(':')
end

socket.close
