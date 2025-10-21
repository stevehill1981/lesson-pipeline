#!/usr/bin/env ruby
# Test: What state is C64 in after boot+sleep?

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
puts "\n=== Sending 'g' to boot C64 ==="
socket.write("g\n")
socket.flush

puts "Sleeping 5s for boot..."
sleep 5

# Try sending a simple monitor command
puts "\n=== Sending 'r' (show registers) command ==="
socket.write("r\n")
socket.flush

# Try to read response with timeout
require 'timeout'
begin
  Timeout.timeout(2) do
    response = ''
    loop do
      chunk = socket.readpartial(4096)
      response += chunk
      puts "GOT: #{chunk.inspect}"
      break if response.include?('(C:$')
    rescue IO::WaitReadable
      IO.select([socket], nil, nil, 0.1)
      retry
    end

    puts "\n=== Response ==="
    puts response
    puts "\n✓ Got response - C64 is PAUSED in monitor"
  end
rescue Timeout::Error
  puts "\n✗ TIMEOUT - C64 is RUNNING, not in monitor"
end

socket.close
