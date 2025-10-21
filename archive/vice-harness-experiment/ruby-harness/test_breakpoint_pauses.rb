#!/usr/bin/env ruby
# Test: Does setting a breakpoint pause a running C64?

require 'socket'
require 'timeout'

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

puts "✓ Connected"

# Boot
socket.write("g\n")
socket.flush
sleep 5
puts "✓ C64 booted and running"

# Set breakpoint
puts "\n=== Setting breakpoint ==="
socket.write("break e5d4\n")
socket.flush

# Check if we get immediate response (= paused) or timeout (= still running)
begin
  Timeout.timeout(1) do
    response = ''
    loop do
      chunk = socket.readpartial(4096)
      response += chunk
      puts "GOT: #{chunk.inspect}"
      break if response.include?('(C:$') || response.include?('BREAK')
    rescue IO::WaitReadable
      IO.select([socket], nil, nil, 0.1)
      retry
    end

    puts "\n✓ Got response immediately - C64 PAUSED after setting breakpoint!"
    puts "Response: #{response}"
  end
rescue Timeout::Error
  puts "\n✗ TIMEOUT - C64 still running"
end

socket.close
