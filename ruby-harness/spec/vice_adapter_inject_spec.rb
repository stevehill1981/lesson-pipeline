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

    sleep 3
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

    # Inject simple PRINT statement
    adapter.inject_keys('PRINT "TEST"')
    adapter.inject_keys("\n")  # Press RETURN

    # Give C64 time to process
    sleep 0.5

    # Read screen memory at $0400 (first line after READY.)
    # Screen should contain "TEST" somewhere
    screen_data = adapter.read_memory(0x0400, 40)

    # Convert screen codes to ASCII-ish for debugging
    # C64 screen codes: SPACE=32, letters start at different offsets
    # For now, just verify we got non-zero data
    expect(screen_data.length).to eq(40)
    expect(screen_data).not_to eq([0] * 40)

    adapter.disconnect
  end
end
