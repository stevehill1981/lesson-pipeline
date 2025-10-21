# frozen_string_literal: true

require_relative '../lib/vice_adapter'

RSpec.describe 'VICEAdapter#load_program' do
  before(:all) do
    @vice_port = 6511  # Different port to avoid conflict with main tests
    @vice_log = '/tmp/vice_load_test.log'
    @vice_pid = spawn(
      'x64sc',
      '-remotemonitor',
      '-remotemonitoraddress', "127.0.0.1:#{@vice_port}",
      out: @vice_log,
      err: @vice_log
    )

    sleep 3
    puts "✓ VICE started for load tests (PID: #{@vice_pid}, port: #{@vice_port})"
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

  it 'loads a PRG file into C64 memory' do
    skip 'VICE not available' unless @vice_pid

    adapter = VICEAdapter.new(port: @vice_port)
    adapter.connect

    prg_path = File.expand_path('fixtures/hello.prg', __dir__)
    adapter.load_program(prg_path)

    # Verify program loaded by checking the actual program memory at $0801
    # C64 BASIC programs start with link address (2 bytes) + line number (2 bytes)
    # Our hello.prg starts at $0801
    program_start = adapter.read_memory(0x0801, 6)

    # Verify we got data (program loaded)
    expect(program_start.length).to be > 0
    expect(program_start).not_to eq([0, 0, 0, 0, 0, 0])

    adapter.disconnect
  end
end
