#!/usr/bin/env ruby
# Test screenshot command directly

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

# Wait for C64 to boot
puts "Waiting for C64 boot..."
sleep 2

# Try screenshot command
screenshot_path = File.expand_path('/tmp/test_vice_screenshot.png')
command = "screenshot \"#{screenshot_path}\" 2\n"
puts "\nSending: #{command.inspect}"

socket.write(command)
buffer = ''
puts "Waiting for response..."
loop do
  chunk = socket.readpartial(4096)
  buffer += chunk
  puts "Got chunk: #{chunk.inspect}"
  break if buffer.include?('(C:$')
rescue IO::WaitReadable
  puts "Waiting for more data..."
  sleep 0.1
  retry
end

puts "\nResponse: #{buffer}"
puts "\nFile exists?: #{File.exist?(screenshot_path)}"
puts "File size: #{File.size(screenshot_path)}" if File.exist?(screenshot_path)

socket.close
