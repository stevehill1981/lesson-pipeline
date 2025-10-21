# frozen_string_literal: true

require_relative '../lib/vice_adapter'
require 'fileutils'

RSpec.describe 'VICEAdapter#capture_screenshot (simple)' do
  before(:all) do
    @vice_port = 6515  # Different port to avoid conflict with other tests
    @vice_log = '/tmp/vice_screenshot_simple_test.log'
    @vice_pid = spawn(
      'x64sc',
      '-remotemonitor',
      '-remotemonitoraddress', "127.0.0.1:#{@vice_port}",
      out: @vice_log,
      err: @vice_log
    )

    sleep 7  # Full boot time
    puts "✓ VICE started for simple screenshot tests (PID: #{@vice_pid}, port: #{@vice_port})"
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

  after(:each) do
    # Clean up any test screenshots
    FileUtils.rm_f(Dir.glob('/tmp/test_screenshot_simple*.png'))
  end

  it 'captures a PNG screenshot of the C64 READY screen' do
    skip 'VICE not available' unless @vice_pid

    adapter = VICEAdapter.new(port: @vice_port)
    adapter.connect

    # Boot C64 to READY prompt (no keyboard injection needed)
    # C64 should already be at READY after 7s boot
    # Just give the monitor 'g' command and pause briefly
    @socket = adapter.instance_variable_get(:@socket)
    @socket.write("g\n")
    @socket.flush
    sleep 2  # Wait for READY prompt to appear

    # Capture screenshot of READY screen
    screenshot_path = '/tmp/test_screenshot_simple.png'
    result = adapter.capture_screenshot(screenshot_path)

    # Verify file was created
    expect(File.exist?(screenshot_path)).to be true

    # Verify the result is the absolute path
    expect(result).to eq(File.expand_path(screenshot_path))

    # Verify file has content (not empty)
    expect(File.size(screenshot_path)).to be > 0

    # Verify it's a PNG file (check magic bytes)
    File.open(screenshot_path, 'rb') do |f|
      magic = f.read(8)
      expect(magic).to eq("\x89PNG\r\n\x1a\n".force_encoding('ASCII-8BIT'))
    end

    adapter.disconnect
  end

  it 'supports BMP format' do
    skip 'VICE not available' unless @vice_pid

    adapter = VICEAdapter.new(port: @vice_port)
    adapter.connect

    # Boot C64
    @socket = adapter.instance_variable_get(:@socket)
    @socket.write("g\n")
    @socket.flush
    sleep 2

    # Test BMP format
    bmp_path = '/tmp/test_screenshot_simple.bmp'
    adapter.capture_screenshot(bmp_path, format: :bmp)
    expect(File.exist?(bmp_path)).to be true
    expect(File.size(bmp_path)).to be > 0

    # BMP magic bytes: "BM" (0x42 0x4D)
    File.open(bmp_path, 'rb') do |f|
      magic = f.read(2)
      expect(magic).to eq("BM".force_encoding('ASCII-8BIT'))
    end

    adapter.disconnect
    FileUtils.rm_f(bmp_path)
  end

  it 'raises error when not connected' do
    adapter = VICEAdapter.new(port: @vice_port)

    expect {
      adapter.capture_screenshot('/tmp/test.png')
    }.to raise_error('Not connected')
  end
end
