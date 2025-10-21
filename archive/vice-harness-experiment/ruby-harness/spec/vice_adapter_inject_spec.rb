# frozen_string_literal: true

require_relative '../lib/vice_adapter'

RSpec.describe 'VICEAdapter#inject_keys' do
  before(:all) do
    @vice_port = 6512  # Different port to avoid conflict with other tests
    @vice_log = '/tmp/vice_inject_test.log'
    @vice_pid = spawn(
      'x64sc',
      '-remotemonitor',
      '-remotemonitoraddress', "127.0.0.1:#{@vice_port}",
      out: @vice_log,
      err: @vice_log
    )

    sleep 7  # Increased from 3 to allow full C64 boot
    puts "✓ VICE started for inject tests (PID: #{@vice_pid}, port: #{@vice_port})"
  end

  after(:all) do
    if @vice_pid
      Process.kill('TERM', @vice_pid)
      Process.wait(@vice_pid)
      puts "✓ VICE stopped"
    end
  rescue Errno::ESRCH, Errno::ECHILD
    # Already terminated
  end

  it 'injects keyboard input into C64' do
    skip 'VICE not available' unless @vice_pid

    adapter = VICEAdapter.new(port: @vice_port)
    adapter.connect

    # Inject simple PRINT statement (must be ≤10 bytes with RETURN)
    # "PRINT 1\n" = 8 bytes total
    adapter.inject_keys("PRINT 1\n")

    # No additional sleep needed - inject_keys waits for breakpoint

    # Read screen memory - should contain the output " 1"
    # (C64 adds leading space for positive numbers)
    screen_data = adapter.read_memory(0x0400, 1000)

    # Convert screen codes to ASCII to verify output
    screen_text = screen_data.map do |code|
      case code
      when 0 then '@'
      when 1..26 then (code + 64).chr
      when 32 then ' '
      when 33..63 then code.chr
      else '.'
      end
    end.join

    # Should contain "PRINT 1" command and " 1" output
    expect(screen_data.length).to be >= 1000  # Full screen (may include last byte)
    expect(screen_text).to include('PRINT')
    expect(screen_text).to include(' 1')  # C64 adds space before positive numbers
    expect(screen_text).to include('READY')  # Should be at READY prompt

    adapter.disconnect
  end
end
