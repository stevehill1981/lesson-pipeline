# frozen_string_literal: true

require_relative '../lib/vice_adapter'
require 'fileutils'

RSpec.describe 'VICEAdapter#capture_screenshot' do
  before(:all) do
    @vice_port = 6514  # Different port to avoid conflict with other tests
    @vice_log = '/tmp/vice_screenshot_test.log'
    @vice_pid = spawn(
      'x64sc',
      '-remotemonitor',
      '-remotemonitoraddress', "127.0.0.1:#{@vice_port}",
      out: @vice_log,
      err: @vice_log
    )

    sleep 3
    puts "✓ VICE started for screenshot tests (PID: #{@vice_pid}, port: #{@vice_port})"
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
    FileUtils.rm_f(Dir.glob('/tmp/test_screenshot*.png'))
  end

  it 'captures a PNG screenshot of the C64 screen' do
    skip 'VICE not available' unless @vice_pid

    adapter = VICEAdapter.new(port: @vice_port)
    adapter.connect

    # Give C64 time to boot to READY prompt
    sleep 1

    # Inject some visible text
    adapter.inject_keys('PRINT "HELLO WORLD"')
    adapter.inject_keys("\n")

    # Give C64 time to display the text
    sleep 0.5

    # Capture screenshot
    screenshot_path = '/tmp/test_screenshot.png'
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

  it 'supports different image formats' do
    skip 'VICE not available' unless @vice_pid

    adapter = VICEAdapter.new(port: @vice_port)
    adapter.connect

    sleep 1

    # Test BMP format
    bmp_path = '/tmp/test_screenshot.bmp'
    adapter.capture_screenshot(bmp_path, format: :bmp)
    expect(File.exist?(bmp_path)).to be true
    expect(File.size(bmp_path)).to be > 0

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
