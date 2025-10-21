#!/usr/bin/env ruby
# Test: Does 'x' (exit monitor) let the C64 execute keystrokes?

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

puts "✓ Connected"
sleep 2

# Inject keystrokes
puts "\n=== Injecting: PRINT \"HELLO\" + RETURN ==="
socket.write("keybuf \"PRINT \\\"HELLO\\\"\\x0d\"\n")
socket.flush
sleep 0.1

buffer = ''
loop do
  chunk = socket.readpartial(4096)
  buffer += chunk
  break if buffer.include?('(C:$')
rescue IO::WaitReadable
  retry
end
puts "Keybuf response: #{buffer.strip}"

# NOW: Exit monitor to let C64 run
puts "\n=== Sending 'x' (exit monitor) ==="
socket.write("x\n")
socket.flush

# Wait for C64 to execute keystrokes
puts "Waiting 2s for C64 to execute..."
sleep 2

# Re-enter monitor to read memory
puts "\n=== Pressing ENTER to re-enter monitor ==="
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
puts "Back in monitor: #{buffer.strip}"

# Read screen RAM
puts "\n=== Reading screen RAM ==="
socket.write("m 0400 041f\n")
socket.flush
sleep 0.5

buffer = ''
loop do
  chunk = socket.readpartial(4096)
  buffer += chunk
  break if buffer.include?('(C:$')
rescue IO::WaitReadable
  retry
end
puts buffer

socket.close
