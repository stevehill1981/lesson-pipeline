# C64 Lesson Test Harness (Ruby + VICE)

Ruby-based test harness for verifying C64 BASIC lessons using VICE emulator's remote monitor protocol.

## Status: ✅ PRG-BASED WORKFLOW READY

The harness successfully implements PRG file loading, execution, and screen verification using VICE's remote monitor.

## Prerequisites

- **VICE 3.9+** installed and available in PATH
- **Ruby 3.0+**
- **Bundler** for dependency management

## Installation

```bash
bundle install
```

## Running Tests

Tests automatically spawn VICE and clean up afterward:

```bash
bundle exec rspec
```

VICE will launch in the background with its GUI, run tests, then terminate automatically.

## Architecture

### Emulator Adapter Pattern

`EmulatorAdapter` - Interface defining emulator capabilities
- `connect/disconnect/alive?` - Connection lifecycle
- `name/platform/capabilities` - Metadata
- `load_program/inject_keys/wait_for_text/read_memory` - Control operations

`VICEAdapter` - VICE C64 implementation using remote monitor protocol (port 6510)

### VICE Remote Monitor Protocol

- **Request-response protocol** - Client must initiate communication
- **Connection handshake**: Send `\n` first, then receive initial prompt
- **Text-based ASCII** with `\n` terminators
- **Responses end with prompt**: `(C:$xxxx)` where xxxx is current PC
- **Commands**: `load "file"`, `m 0400 0410` (memory), `g` (go), `r` (reset)
- **Memory format**: `>C:0400  20 20 20 20  20 20 20 20  ...`

### Critical Discovery

The remote monitor does NOT send data until the client speaks first:

1. ❌ **Common assumption**: Connect → Wait for prompt → Send commands
2. ✅ **Actual protocol**: Connect → **Send newline** → Receive prompt → Send commands

VICE's monitor waits for the client to initiate. Without sending data first, the connection hangs indefinitely waiting for a prompt that will never arrive.

## What Works ✅

### Core Functionality
- **Connection**: TCP connection to VICE remote monitor
- **PRG Loading**: Load C64 PRG files into emulator memory
- **Memory Reading**: Read any C64 memory region (including screen RAM)
- **Screenshots**: Capture PNG/BMP screenshots of C64 display
- **wait_for_text()**: Poll screen RAM for expected text output

### Complete PRG-Based Workflow
```ruby
# 1. Connect to VICE
adapter = VICEAdapter.new(port: 6510)
adapter.connect

# 2. Load student's PRG file
adapter.load_program('/path/to/lesson.prg')

# 3. Read program memory to verify it loaded
program_bytes = adapter.read_memory(0x0801, 10)

# 4. Take screenshot
adapter.capture_screenshot('/tmp/output.png')

# 5. Read screen output
screen_data = adapter.read_memory(0x0400, 1000)
screen_text = convert_screen_codes_to_ascii(screen_data)

# 6. Verify expected output
expect(screen_text).to include('HELLO WORLD')
```

## What Doesn't Work ❌

### inject_keys() - EXPERIMENTAL
The `inject_keys()` method can write to the C64 keyboard buffer but **commands do not execute**. This is due to timing/state issues with VICE's remote monitor and the C64's BASIC interpreter.

**Status**: Documented in `INJECT_KEYS_STATUS.md` - pivot to PRG-based workflow instead.

## Next Steps

1. **LessonRunner implementation** - Orchestrate lesson testing workflow
2. **BAS → PRG converter** - Convert BASIC text to PRG files
3. **Update old screenshot tests** - Remove dependency on inject_keys
4. **Documentation** - Add API docs and usage examples

## Development

Run tests with documentation format:

```bash
bundle exec rspec --format documentation
```

Run specific test file:

```bash
bundle exec rspec spec/vice_adapter_spec.rb
```
