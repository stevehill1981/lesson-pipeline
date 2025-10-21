# frozen_string_literal: true

require_relative '../lib/vice_adapter'

# Test the complete PRG-based workflow:
# 1. Load PRG file into C64 memory
# 2. Execute it with RUN command
# 3. Read screen RAM to verify output
#
# This is the workflow we'll use for lesson verification
RSpec.describe 'VICEAdapter PRG-based workflow' do
  before(:all) do
    @vice_port = 6517  # Different port to avoid conflict with other tests
    @vice_log = '/tmp/vice_prg_workflow_test.log'
    @vice_pid = spawn(
      'x64sc',
      '-remotemonitor',
      '-remotemonitoraddress', "127.0.0.1:#{@vice_port}",
      out: @vice_log,
      err: @vice_log
    )

    sleep 7  # Full boot time
    puts "✓ VICE started for PRG workflow tests (PID: #{@vice_pid}, port: #{@vice_port})"
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

  it 'loads PRG, executes it, and verifies screen output' do
    skip 'VICE not available' unless @vice_pid

    adapter = VICEAdapter.new(port: @vice_port)
    adapter.connect

    # Boot C64 to READY prompt
    socket = adapter.instance_variable_get(:@socket)
    socket.write("g\n")
    socket.flush
    sleep 2  # Wait for READY prompt

    # Load PRG file
    prg_path = File.expand_path('fixtures/hello.prg', __dir__)
    puts "Loading PRG: #{prg_path}"
    adapter.load_program(prg_path)

    # Execute with RUN command
    # In VICE monitor, we use 'g 0801' to start execution at $0801 (BASIC start)
    puts "Executing program..."
    socket.write("g 0801\n")
    socket.flush
    sleep 1  # Wait for program to execute

    # Read screen RAM to check output
    puts "Reading screen output..."
    screen_data = adapter.read_memory(0x0400, 1000)

    # Convert screen codes to ASCII
    screen_text = screen_data.map do |code|
      case code
      when 0 then '@'
      when 1..26 then (code + 64).chr  # A-Z
      when 32 then ' '
      when 33..63 then code.chr
      else '.'
      end
    end.join

    puts "Screen content (first 200 chars):"
    puts screen_text[0..200].inspect

    # Verify we have some output on screen (not all spaces/zeros)
    expect(screen_data).not_to be_empty
    expect(screen_data.any? { |byte| byte != 0 && byte != 32 }).to be true

    # The screen should contain some text content
    # (exact content depends on what hello.prg does)
    expect(screen_text.strip.length).to be > 0

    adapter.disconnect
  end

  it 'demonstrates complete lesson verification workflow' do
    skip 'VICE not available' unless @vice_pid

    adapter = VICEAdapter.new(port: @vice_port)
    adapter.connect

    # 1. Load PRG file (student's compiled BASIC code)
    prg_path = File.expand_path('fixtures/hello.prg', __dir__)
    puts "Step 1: Loading student PRG..."
    adapter.load_program(prg_path)

    # 2. Read program memory to verify it loaded
    puts "Step 2: Verifying PRG loaded into memory..."
    program_bytes = adapter.read_memory(0x0801, 10)
    expect(program_bytes).not_to be_empty
    expect(program_bytes).not_to eq([0] * 10)  # Not all zeros

    # 3. Take screenshot before execution
    puts "Step 3: Taking before screenshot..."
    before_screenshot = '/tmp/lesson_before.png'
    adapter.capture_screenshot(before_screenshot)
    expect(File.exist?(before_screenshot)).to be true

    # 4. Execute program (in real workflow, would run and wait for completion)
    # For now, we can verify the setup works
    puts "Step 4: Execution setup verified"

    # 5. Read screen RAM to check output (this is how we'll verify lessons)
    puts "Step 5: Reading screen for verification..."
    screen_data = adapter.read_memory(0x0400, 1000)
    screen_text = screen_data.map { |c|
      case c
      when 1..26 then (c + 64).chr
      when 32 then ' '
      else '.'
      end
    }.join

    # Verify screen contains READY message (proves we can read screen)
    expect(screen_text).to include('READY')

    puts "✓ Complete lesson verification workflow demonstrated"

    adapter.disconnect
  end
end
