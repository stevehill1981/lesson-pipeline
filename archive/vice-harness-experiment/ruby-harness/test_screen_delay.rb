#!/usr/bin/env ruby
# Test with delay after sending command

require 'socket'

socket = TCPSocket.new('localhost', 6510)
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

# Send memory read for screen RAM
puts "\n=== Sending: m 0400 041f ==="
socket.write("m 0400 041f\n")
socket.flush

# WAIT before reading response
puts "Waiting 0.5s for VICE to process..."
sleep 0.5

# Now read response
buffer = ''
prompt_count = 0
loop do
  chunk = socket.readpartial(4096)
  buffer += chunk
  prompt_count = buffer.scan(/\(C:\$[0-9a-fA-F]+\)/).length
  puts "Read chunk, total #{buffer.length} bytes, prompts: #{prompt_count}"
  break if prompt_count > 0 && buffer =~ /\(C:\$[0-9a-fA-F]+\)\s*$/
rescue IO::WaitReadable
  break if prompt_count > 0
  retry
end

puts "\n=== Full response ==="
puts buffer

socket.close
