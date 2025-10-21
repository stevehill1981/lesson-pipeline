#!/usr/bin/env ruby
# Simple test: can we read screen RAM?

require_relative 'lib/vice_adapter'

adapter = VICEAdapter.new(port: 6510)
adapter.connect

puts "✓ Connected"

# Wait for C64 boot
sleep 2

# Read screen RAM at $0400 (first line)
puts "\n=== Reading screen RAM at $0400 (40 bytes) ==="
screen_data = adapter.read_memory(0x0400, 40)
puts "Got #{screen_data.length} bytes"
puts "Data: #{screen_data.inspect}"
puts "Hex: #{screen_data.map { |b| format('%02x', b) }.join(' ')}"

# Inject text
puts "\n=== Injecting 'HELLO' ==="
adapter.inject_keys('HELLO')
sleep 0.5

# Read again
puts "\n=== Reading screen RAM after HELLO ==="
screen_data = adapter.read_memory(0x0400, 40)
puts "Got #{screen_data.length} bytes"
puts "Data: #{screen_data.inspect}"
puts "Hex: #{screen_data.map { |b| format('%02x', b) }.join(' ')}"

# Convert screen codes to ASCII (simplified)
text = screen_data.map do |code|
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

puts "ASCII: #{text.inspect}"

adapter.disconnect
puts "\n✓ Done"
