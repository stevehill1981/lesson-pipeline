#!/usr/bin/env ruby
# Test VICE keybuf command

require 'socket'

def read_until_prompt(socket)
  buffer = ''
  loop do
    chunk = socket.readpartial(4096)
    buffer += chunk
    break if buffer.include?('(C:$')
  rescue IO::WaitReadable
    retry
  end
  buffer
end

socket = TCPSocket.new('localhost', 6510)
socket.write("\n")
socket.flush
response = read_until_prompt(socket)
puts "Connected: #{response.strip}"

# Try keybuf command to inject "HELLO"
puts "\n=== Testing keybuf command ==="
socket.write("keybuf \"HELLO\\n\"\n")
response = read_until_prompt(socket)
puts "Response: #{response}"

# Read screen memory at $0400 to see if text appeared
puts "\n=== Reading screen RAM at $0400 (first line) ==="
socket.write("m 0400 0427\n")
response = read_until_prompt(socket)
puts "Response: #{response}"

socket.close
