# frozen_string_literal: true

require_relative '../lib/vice_adapter'

RSpec.describe VICEAdapter do
  before(:all) do
    # Spawn VICE with remote monitor
    # Discovery: Remote monitor requires GUI initialization AND
    # client must send newline FIRST before receiving initial prompt
    @vice_log = '/tmp/vice_test.log'
    @vice_pid = spawn(
      'x64sc',
      '-remotemonitor',
      '-remotemonitoraddress', '127.0.0.1:6510',
      out: @vice_log,
      err: @vice_log
    )

    # Give VICE time to initialize
    sleep 3

    puts "✓ VICE started (PID: #{@vice_pid})"
  rescue Errno::ENOENT
    @vice_pid = nil
    puts "⚠️  x64sc not found - tests will skip VICE integration"
  end

  after(:all) do
    if @vice_pid
      Process.kill('TERM', @vice_pid)
      Process.wait(@vice_pid)
      puts "✓ VICE stopped"
    end
  rescue Errno::ESRCH, Errno::ECHILD
    # Process already terminated
  end
  describe '#name' do
    it 'returns VICE' do
      adapter = VICEAdapter.new(port: 6510)
      expect(adapter.name).to eq('VICE')
    end
  end

  describe '#platform' do
    it 'returns c64' do
      adapter = VICEAdapter.new(port: 6510)
      expect(adapter.platform).to eq('c64')
    end
  end

  describe '#capabilities' do
    it 'declares supported capabilities' do
      adapter = VICEAdapter.new(port: 6510)
      caps = adapter.capabilities

      expect(caps).to include(:load_program)
      expect(caps).to include(:inject_keys)
      expect(caps).to include(:wait_for_text)
      expect(caps).to include(:read_memory)
    end
  end

  describe '#supports?' do
    it 'returns true for supported capabilities' do
      adapter = VICEAdapter.new(port: 6510)

      expect(adapter.supports?(:load_program)).to be true
      expect(adapter.supports?(:inject_keys)).to be true
    end

    it 'returns false for unsupported capabilities' do
      adapter = VICEAdapter.new(port: 6510)

      expect(adapter.supports?(:inject_joystick)).to be false
    end
  end

  describe '#connect' do
    it 'establishes TCP connection to VICE remote monitor' do
      skip 'VICE not available' unless @vice_pid

      adapter = VICEAdapter.new(port: 6510)
      adapter.connect

      expect(adapter.alive?).to be true

      adapter.disconnect
    end
  end

  describe '#alive?' do
    it 'returns false when not connected' do
      adapter = VICEAdapter.new(port: 6510)
      expect(adapter.alive?).to be false
    end
  end
end
