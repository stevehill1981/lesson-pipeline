#!/usr/bin/env ruby
# Debug: what does VICE actually return for screen RAM?

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

# Send memory read for screen RAM
puts "\n=== Sending: m 0400 041f ==="
socket.write("m 0400 041f\n")

# Read response manually
buffer = ''
prompt_count = 0
5.times do  # Read up to 5 chunks
  begin
    chunk = socket.readpartial(4096)
    buffer += chunk
    prompt_count = buffer.scan(/\(C:\$[0-9a-fA-F]+\)/).length
    puts "Read chunk #{buffer.length} bytes, prompts: #{prompt_count}"
    break if prompt_count > 1 || (prompt_count > 0 && buffer =~ /\(C:\$[0-9a-fA-F]+\)\s*$/)
    sleep 0.1
  rescue IO::WaitReadable
    puts "Wait readable..."
    sleep 0.1
    retry
  end
end

puts "\n=== Full response (#{buffer.length} bytes) ==="
puts buffer
puts "\n=== Lines matching >C: ==="
buffer.each_line do |line|
  puts line if line.match?(/[>.  ]C:[0-9a-fA-F]+/)
end

socket.close
