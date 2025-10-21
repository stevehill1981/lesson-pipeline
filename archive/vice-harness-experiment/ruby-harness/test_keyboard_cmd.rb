#!/usr/bin/env ruby
# Quick test to discover VICE keyboard commands

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

puts "Connected: #{buffer}"

# Try help command
socket.write("help\n")
buffer = ''
loop do
  chunk = socket.readpartial(4096)
  buffer += chunk
  break if buffer.include?('(C:$')
rescue IO::WaitReadable
  retry
end

puts "\n=== Help output ==="
puts buffer

# Look for keyboard-related commands
puts "\n=== Keyboard-related commands ==="
buffer.each_line do |line|
  puts line if line.match?(/key|input|type/i)
end

socket.close
