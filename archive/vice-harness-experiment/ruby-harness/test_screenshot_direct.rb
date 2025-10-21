#!/usr/bin/env ruby
# Direct test of screenshot functionality

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

puts "✓ Connected: #{buffer.lines.last.strip}"

# Boot C64
puts "\n=== Booting C64 ==="
socket.write("g\n")
socket.flush
sleep 7
puts "✓ C64 booted"

# Take screenshot
puts "\n=== Taking screenshot ==="
screenshot_path = File.expand_path('/tmp/test_direct_screenshot.png')
command = "screenshot \"#{screenshot_path}\" 2\n"
puts "Command: #{command.inspect}"

socket.write(command)
socket.flush
sleep 1

# Read response
response = ''
loop do
  chunk = socket.readpartial(4096)
  response += chunk
  break if response.include?('(C:$')
rescue IO::WaitReadable
  retry
end

puts "\n=== Response ==="
puts response

# Check if file exists
if File.exist?(screenshot_path)
  puts "\n✓ Screenshot created: #{screenshot_path}"
  puts "  Size: #{File.size(screenshot_path)} bytes"

  # Check PNG magic bytes
  File.open(screenshot_path, 'rb') do |f|
    magic = f.read(8)
    if magic == "\x89PNG\r\n\x1a\n".force_encoding('ASCII-8BIT')
      puts "  ✓ Valid PNG file"
    else
      puts "  ✗ Invalid PNG (wrong magic bytes)"
    end
  end
else
  puts "\n✗ Screenshot not created"
end

socket.close
