#!/usr/bin/env ruby
# Test: Verify breakpoint behavior after boot

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

puts "✓ Connected: #{buffer.lines.last}"

# Boot C64
puts "\n=== Sending 'g' to boot C64 ==="
socket.write("g\n")
socket.flush

puts "Sleeping 5s for boot..."
sleep 5

# Set breakpoint
puts "\n=== Setting breakpoint at $E5D4 ==="
socket.write("break e5d4\n")
socket.flush

# Read response
puts "\n=== Waiting for response (10s timeout) ==="
begin
  Timeout.timeout(10) do
    response = ''
    loop do
      chunk = socket.readpartial(4096)
      response += chunk
      puts "GOT: #{chunk.inspect}"

      break if response.include?('BREAK') || response.include?('(C:$')
    rescue IO::WaitReadable
      IO.select([socket], nil, nil, 0.1)
      retry
    end

    puts "\n=== Final response ==="
    puts response

    if response.include?('BREAK')
      puts "\n✓ Breakpoint triggered!"
    elsif response.include?('(C:$')
      puts "\n✗ Got prompt but no BREAK"
    end
  end
rescue Timeout::Error
  puts "\n✗ TIMEOUT - no response in 10 seconds"
end

socket.close
