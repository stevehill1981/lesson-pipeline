#!/usr/bin/env ruby
# Test actual screen memory reading with the adapter

require_relative 'lib/vice_adapter'

adapter = VICEAdapter.new(port: 6510)
adapter.connect

puts "Connected to VICE"

# Wait for boot
sleep 1

# Inject some text
puts "\nInjecting text: HELLO"
adapter.inject_keys('HELLO')
sleep 0.5

# Read screen RAM
puts "\n=== Reading screen RAM (first 80 bytes) ==="
screen_data = adapter.read_memory(0x0400, 80)
puts "Got #{screen_data.length} bytes"
puts "Data: #{screen_data.inspect}"

# Also try reading from a known good location (program memory)
puts "\n=== Reading program memory at $0801 ==="
prog_data = adapter.read_memory(0x0801, 10)
puts "Got #{prog_data.length} bytes"
puts "Data: #{prog_data.inspect}"

adapter.disconnect
