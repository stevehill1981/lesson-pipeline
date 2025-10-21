#!/usr/bin/env ruby
# Debug script to see what's on C64 screen

require_relative 'lib/vice_adapter'

adapter = VICEAdapter.new(port: 6510)
adapter.connect

puts "\n=== Reading C64 screen memory ==="
screen_data = adapter.read_memory(0x0400, 80)  # First 2 lines

puts "Raw screen codes: #{screen_data.inspect}"

# Convert to ASCII using the same method as wait_for_text
screen_text = screen_data.map do |code|
  case code
  when 0
    '@'
  when 1..26
    (code + 64).chr  # 'A'-'Z'
  when 32
    ' '
  when 33..63
    (code).chr
  else
    '?'
  end
end.join

puts "\nConverted text:"
puts screen_text[0..39]  # Line 1
puts screen_text[40..79]  # Line 2

puts "\nSearching for 'READY': #{screen_text.include?('READY')}"

adapter.disconnect
