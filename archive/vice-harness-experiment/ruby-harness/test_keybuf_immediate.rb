#!/usr/bin/env ruby
# Test: Does keybuf work if we don't pause at all?
# Maybe we need to let C64 keep running while injecting keys

require 'socket'

socket = TCPSocket.new('localhost', 6510)

# Initial connection - send newline and wait for prompt
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

# Wait for C64 to boot to READY prompt
puts "\n=== Waiting 2s for C64 boot ==="
sleep 2

# Inject keystrokes
puts "\n=== Injecting: PRINT \"HELLO\" + RETURN (while running) ==="
socket.write("keybuf \"PRINT \\\"HELLO\\\"\\x0d\"\n")
socket.flush

buffer = ''
loop do
  chunk = socket.readpartial(4096)
  buffer += chunk
  break if buffer.include?('(C:$')
rescue IO::WaitReadable
  retry
end
puts "Keybuf response: #{buffer.strip}"

# Exit monitor to let C64 run
puts "\n=== Exiting monitor with 'x' ==="
socket.write("x\n")
socket.flush

# Wait longer for execution
puts "Waiting 3s for C64 to execute..."
sleep 3

# Re-enter monitor
puts "\n=== Re-entering monitor ==="
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
puts "Back in monitor"

# Read screen RAM
puts "\n=== Reading screen RAM (first 80 bytes = 2 lines) ==="
socket.write("m 0400 044f\n")
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

puts "\nScreen RAM dump:"
puts buffer

# Try to interpret the bytes as screen codes
screen_bytes = []
buffer.each_line do |line|
  if line =~ /[>.  ]C:[0-9a-fA-F]+\s+([0-9a-fA-F]{2}(?:\s+[0-9a-fA-F]{2})*)/
    hex_values = $1.scan(/[0-9a-fA-F]{2}/)
    screen_bytes.concat(hex_values.map { |h| h.to_i(16) })
  end
end

puts "\n=== Screen content as ASCII ==="
screen_text = screen_bytes.map do |code|
  case code
  when 0 then '@'
  when 1..26 then (code + 64).chr
  when 32 then ' '
  when 33..63 then code.chr
  else '.'
  end
end.join

# Print first 40 chars (line 1)
puts "Line 0: '#{screen_text[0..39]}'"
puts "Line 1: '#{screen_text[40..79]}'" if screen_text.length > 40

puts "\nContains HELLO? #{screen_text.include?('HELLO')}"
puts "Contains READY? #{screen_text.include?('READY')}"
puts "Contains PRINT? #{screen_text.include?('PRINT')}"

socket.close
