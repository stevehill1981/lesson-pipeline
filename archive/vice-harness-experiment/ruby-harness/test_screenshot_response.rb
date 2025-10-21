#!/usr/bin/env ruby
# Test what response VICE gives to screenshot command

require_relative 'lib/vice_adapter'

adapter = VICEAdapter.new(port: 6514)

begin
  adapter.connect
  puts "Connected successfully"

  sleep 1

  # Try screenshot command and capture raw response
  screenshot_path = '/tmp/test_screenshot.png'

  puts "\n=== Sending screenshot command ==="
  adapter.instance_variable_get(:@socket).write("screenshot \"#{screenshot_path}\" 2\n")

  # Read response
  buffer = ''
  loop do
    chunk = adapter.instance_variable_get(:@socket).readpartial(4096)
    buffer += chunk
    break if buffer.include?('(C:$')
  rescue IO::WaitReadable
    retry
  end

  puts "Response:"
  puts buffer
  puts "\n=== File exists? #{File.exist?(screenshot_path)} ==="

  adapter.disconnect
rescue => e
  puts "Error: #{e.class}: #{e.message}"
  puts e.backtrace.first(5)
end
