#!/usr/bin/env ruby
# Test: Break into running C64, then set breakpoint

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

puts "✓ Connected: #{buffer.lines.last.strip}"

# Boot C64
puts "\n=== Sending 'g' to boot C64 ==="
socket.write("g\n")
socket.flush

puts "Sleeping 5s for boot..."
sleep 5

# Try to break in
puts "\n=== Sending newline to break into running C64 ==="
socket.write("\n")
socket.flush

# Wait for response
begin
  Timeout.timeout(3) do
    response = ''
    loop do
      chunk = socket.readpartial(4096)
      response += chunk
      puts "GOT (break): #{chunk.inspect}"
      break if response.include?('(C:$')
    rescue IO::WaitReadable
      IO.select([socket], nil, nil, 0.1)
      retry
    end

    puts "\n✓ Broke into monitor: #{response.lines.last.strip}"
  end
rescue Timeout::Error
  puts "\n✗ TIMEOUT - couldn't break in"
  socket.close
  exit 1
end

# Now set breakpoint while paused
puts "\n=== Setting breakpoint at $E5D4 ==="
socket.write("break e5d4\n")
socket.flush

response = ''
loop do
  chunk = socket.readpartial(4096)
  response += chunk
  break if response.include?('(C:$')
rescue IO::WaitReadable
  retry
end

puts "Breakpoint response: #{response.lines.last.strip}"

# Now continue
puts "\n=== Sending 'g' to continue ==="
socket.write("g\n")
socket.flush

# Wait for breakpoint to trigger
begin
  Timeout.timeout(5) do
    response = ''
    loop do
      chunk = socket.readpartial(4096)
      response += chunk
      puts "GOT (after g): #{chunk.inspect}"
      break if response.include?('BREAK') || response.include?('(C:$')
    rescue IO::WaitReadable
      IO.select([socket], nil, nil, 0.1)
      retry
    end

    if response.include?('BREAK')
      puts "\n✓✓✓ BREAKPOINT TRIGGERED!"
    else
      puts "\n✗ No BREAK, just prompt"
    end
  end
rescue Timeout::Error
  puts "\n✗ TIMEOUT waiting for breakpoint"
end

socket.close
