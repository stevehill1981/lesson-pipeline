#!/usr/bin/env ruby
# Debug: What does the screen actually show after injecting PRINT "HELLO"?

require_relative 'lib/vice_adapter'

adapter = VICEAdapter.new(port: 6510)
adapter.connect

puts "✓ Connected"

# Wait for C64 boot
sleep 2

# Inject PRINT statement
puts "\n=== Injecting: PRINT \"HELLO\" + RETURN ==="
adapter.inject_keys('PRINT "HELLO"')
adapter.inject_keys("\n")

# Wait for processing
puts "Waiting for C64 to process keystrokes..."
sleep 2  # Longer wait

# Read screen RAM
puts "\n=== Reading screen RAM (first 200 bytes) ==="
screen_data = adapter.read_memory(0x0400, 200)
puts "Got #{screen_data.length} bytes"

# Convert to ASCII
screen_text = screen_data.map do |code|
  case code
  when 0
    '@'
  when 1..26
    (code + 64).chr  # A-Z
  when 32
    ' '
  when 33..63
    code.chr
  else
    '.'
  end
end.join

puts "\n=== Screen content (as ASCII) ==="
# Print in lines of 40 characters
screen_text.scan(/.{1,40}/).each_with_index do |line, i|
  puts "Line #{i}: '#{line}'"
end

puts "\n=== Does it contain 'HELLO'? #{screen_text.include?('HELLO')} ==="

adapter.disconnect
