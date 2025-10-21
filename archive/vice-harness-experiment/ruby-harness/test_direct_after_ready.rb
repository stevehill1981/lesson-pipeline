#!/usr/bin/env ruby
# Test: Wait for READY prompt before injecting keys

require 'socket'

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
  socket.write("m 0400 04e7\n")  # Read 8 lines (320 bytes)
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

puts "✓ Connected"

# Exit monitor immediately to let C64 boot
puts "\n=== Letting C64 boot (exiting monitor) ==="
socket.write("x\n")
socket.flush

puts "Waiting 3s for C64 to reach READY prompt..."
sleep 3

# Re-enter monitor
puts "\n=== Re-entering monitor ==="
socket.write("\n")
socket.flush

response = ''
loop do
  chunk = socket.readpartial(4096)
  response += chunk
  break if response.include?('(C:$')
rescue IO::WaitReadable
  retry
end

# Check screen state
screen_text = read_screen(socket)
puts "\n=== Current screen state ==="
screen_text.scan(/.{1,40}/).each_with_index do |line, i|
  puts "Line #{i}: '#{line}'"
end
puts "\nContains 'READY'? #{screen_text.include?('READY')}"

if screen_text.include?('READY')
  puts "\n✓ C64 is at READY prompt!"

  # Now inject "LIST"
  puts "\n=== Injecting LIST command ==="
  petscii_codes = [0x4C, 0x49, 0x53, 0x54, 0x0D]  # "LIST\r"

  petscii_codes.each_with_index do |code, index|
    addr = 0x0277 + index
    socket.write(format(">%04x %02x\n", addr, code))
    socket.flush

    response = ''
    loop do
      chunk = socket.readpartial(4096)
      response += chunk
      break if response.include?('(C:$')
    rescue IO::WaitReadable
      retry
    end
  end

  socket.write(format(">00c6 %02x\n", petscii_codes.length))
  socket.flush

  response = ''
  loop do
    chunk = socket.readpartial(4096)
    response += chunk
    break if response.include?('(C:$')
  rescue IO::WaitReadable
    retry
  end

  puts "✓ Keys injected"

  # Exit monitor to let C64 process
  puts "\n=== Exiting monitor to process keys ==="
  socket.write("x\n")
  socket.flush

  sleep 2

  # Re-enter and check screen
  puts "\n=== Re-entering monitor ==="
  socket.write("\n")
  socket.flush

  response = ''
  loop do
    chunk = socket.readpartial(4096)
    response += chunk
    break if response.include?('(C:$')
  rescue IO::WaitReadable
    retry
  end

  screen_text = read_screen(socket)
  puts "\n=== Screen after LIST ==="
  screen_text.scan(/.{1,40}/).each_with_index do |line, i|
    puts "Line #{i}: '#{line}'"
  end

  puts "\nContains 'LIST'? #{screen_text.include?('LIST')}"
  puts "Contains 'READY'? #{screen_text.include?('READY')}"
else
  puts "\n✗ C64 not at READY prompt yet"
end

socket.close
