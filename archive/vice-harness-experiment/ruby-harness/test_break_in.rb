#!/usr/bin/env ruby
# Test: Does CTRL+C or another method properly break into monitor after 'g'?

require 'socket'
require 'timeout'

def screen_codes_to_ascii(codes)
  codes.map do |code|
    case code
    when 0 then '@'
    when 1..26 then (code + 64).chr
    when 32 then ' '
    when 33..63 then code.chr
    else '.'
    end
  end.join
end

def read_screen(socket)
  socket.write("m 0400 04e7\n")  # Read 8 lines
  socket.flush
  sleep 0.1

  response = ''
  loop do
    chunk = socket.readpartial(4096)
    response += chunk
    break if response.include?('(C:$')
  rescue IO::WaitReadable
    retry
  end

  screen_bytes = []
  response.each_line do |line|
    if line =~ /[>.  ]C:[0-9a-fA-F]+\s+([0-9a-fA-F]{2}(?:\s+[0-9a-fA-F]{2})*)/
      hex_values = $1.scan(/[0-9a-fA-F]{2}/)
      screen_bytes.concat(hex_values.map { |h| h.to_i(16) })
    end
  end

  screen_codes_to_ascii(screen_bytes)
end

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

puts "✓ Connected to VICE monitor"

# Start execution
puts "\n=== Sending 'g' (go) command ==="
socket.write("g\n")
socket.flush

puts "Waiting 5s for C64 to boot completely..."
sleep 5

# Try using a NOP instruction at PC to break in
# This is more reliable than just sending newline
puts "\n=== Breaking in with newline ==="
socket.write("\n")
socket.flush

# Give VICE time to process the break
sleep 0.5

# Try to read a response
response = ''
begin
  Timeout.timeout(2) do
    loop do
      chunk = socket.readpartial(4096)
      response += chunk
      break if response.include?('(C:$')
    rescue IO::WaitReadable
      IO.select([socket], nil, nil, 0.1)
      retry
    end
  end
rescue Timeout::Error
  puts "✗ Timeout waiting for monitor prompt after break"
end

if response.include?('(C:$')
  puts "✓ Back in monitor"

  # Read screen
  screen_text = read_screen(socket)
  puts "\n=== Screen content ==="
  screen_text.scan(/.{1,40}/).each_with_index do |line, i|
    puts "Line #{i}: '#{line}'" if line.strip.length > 0
  end

  puts "\nContains 'READY'? #{screen_text.include?('READY')}"
  puts "Contains 'COMMODORE'? #{screen_text.include?('COMMODORE')}"
else
  puts "\n✗ Could not re-enter monitor"
  puts "Response was: #{response.inspect}"
end

socket.close
