# frozen_string_literal: true

require_relative '../lib/vice_adapter'

RSpec.describe 'VICEAdapter#wait_for_text' do
  before(:all) do
    @vice_port = 6513  # Different port to avoid conflict with other tests
    @vice_log = '/tmp/vice_wait_test.log'
    @vice_pid = spawn(
      'x64sc',
      '-remotemonitor',
      '-remotemonitoraddress', "127.0.0.1:#{@vice_port}",
      out: @vice_log,
      err: @vice_log
    )

    sleep 3
    puts "✓ VICE started for wait_for_text tests (PID: #{@vice_pid}, port: #{@vice_port})"
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

  it 'waits for text after injecting keys' do
    skip 'VICE not available' unless @vice_pid

    adapter = VICEAdapter.new(port: @vice_port)
    adapter.connect

    # Give C64 time to boot
    sleep 1

    # Inject a PRINT statement
    adapter.inject_keys('PRINT "HELLO"')
    adapter.inject_keys("\n")

    # Give C64 time to process keystrokes
    sleep 0.5

    # Wait for "HELLO" to appear on screen
    found = adapter.wait_for_text('HELLO', timeout: 5)

    expect(found).to be true

    adapter.disconnect
  end

  it 'returns false when text is not found within timeout' do
    skip 'VICE not available' unless @vice_pid

    adapter = VICEAdapter.new(port: @vice_port)
    adapter.connect

    # Wait for text that will never appear
    found = adapter.wait_for_text('IMPOSSIBLE', timeout: 1)

    expect(found).to be false

    adapter.disconnect
  end
end
