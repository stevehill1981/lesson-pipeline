# VICE Remote Monitor Protocol Findings

## Summary
Successfully implemented keystroke injection and execution verification using VICE's remote monitor. The key breakthrough was using **breakpoints** instead of trying to manually break back into the monitor after execution.

## Critical Discoveries

### 1. C64 Starts Paused
When VICE launches with `-remotemonitor`, the C64 emulation is **paused** and waiting in the monitor. You must send the `g` (go) command to start execution.

### 2. The `g` Command Returns Nothing
Unlike other monitor commands that return a prompt `(C:$xxxx)`, the `g` command:
- Starts/resumes emulation
- Returns **no data** on the socket
- Does NOT close the connection
- Execution continues until a breakpoint is hit or error occurs

**DO NOT** try to read from the socket after sending `g` - it will block forever.

### 3. Breaking Back In Is Unreliable
Sending a newline `\n` to break back into the monitor after `g` does not work reliably:
- Sometimes it times out
- Sometimes the connection appears closed
- Screen RAM reads return empty data even when VICE window shows content

### 4. Breakpoints Are The Solution
Setting a breakpoint before using `g` solves everything:
```ruby
socket.write("break e5d4\n")  # Set breakpoint at BASIC READY loop
socket.flush
# Wait for prompt response...

socket.write("g\n")           # Start execution
socket.flush
# DON'T try to read here!

# Wait for breakpoint to trigger (it will return "BREAK:..." message)
# Now you can read screen RAM, registers, etc.
```

The breakpoint at **$E5D4** is perfect because:
- It's in the BASIC READY loop (where C64 waits for next command)
- It triggers automatically after each BASIC command executes
- Returns full control to the monitor with prompt

### 5. Keyboard Buffer Limitations
The C64 keyboard buffer is only **10 bytes long**:
- Buffer address: `$0277-$0280` (10 bytes)
- Buffer length: `$00C6` (1 byte)
- Commands longer than 10 bytes must be split with delays

### 6. Working Keystroke Injection Pattern

```ruby
# 1. Connect and boot C64
socket.write("\n")
socket.flush
# Read initial prompt...

socket.write("g\n")  # Boot C64
socket.flush
sleep 5  # Wait for boot

# 2. Set breakpoint at BASIC READY loop
socket.write("break e5d4\n")
socket.flush
# Read prompt response...

# 3. Inject keystrokes via direct memory writes
petscii_codes = [0x50, 0x52, 0x49, 0x4E, 0x54, 0x20, 0x31, 0x0D]  # "PRINT 1\r"

petscii_codes.each_with_index do |code, index|
  addr = 0x0277 + index
  socket.write(format(">%04x %02x\n", addr, code))
  socket.flush
  # Read prompt response...
end

# Set buffer length
socket.write(format(">00c6 %02x\n", petscii_codes.length))
socket.flush
# Read prompt response...

# 4. Continue execution
socket.write("g\n")
socket.flush

# 5. Wait for breakpoint (will return "BREAK:..." message)
# Now we're back in monitor and can read screen RAM
```

## Screen RAM Reading

Must use the **`m` (memory dump) command**, not `d` (disassemble):
```ruby
socket.write("m 0400 07e7\n")  # Read all 1000 bytes of screen RAM
socket.flush
sleep 0.1  # CRITICAL: 'm' command is asynchronous!

# Now read response...
```

The `m` command is **asynchronous** - VICE returns the prompt immediately but actual memory data arrives ~100ms later. Must add a delay before reading.

## Screen Code to ASCII Conversion

C64 screen codes are different from ASCII:
```ruby
def screen_codes_to_ascii(codes)
  codes.map do |code|
    case code
    when 0 then '@'
    when 1..26 then (code + 64).chr  # 'A'-'Z'
    when 32 then ' '
    when 33..63 then code.chr
    else '.'  # Unknown/unprintable
    end
  end.join
end
```

## Test Results

**Test: `PRINT 1`**
```
Line 5:  READY.
Line 6:  PRINT 1
Line 7:   1
Line 9:  READY.
```

✅ Full success! The command was:
1. Injected into keyboard buffer
2. Executed by BASIC interpreter
3. Output displayed on screen
4. Returned to READY prompt
5. Breakpoint triggered automatically
6. Monitor regained control
7. Screen RAM successfully read

## Important Addresses

- **$E5D4**: BASIC READY loop (perfect breakpoint location)
- **$0400-$07E7**: Screen RAM (1000 bytes, 40×25 chars)
- **$00C6**: Keyboard buffer length
- **$0277-$0280**: Keyboard buffer (10 bytes)

## Alternative Approaches Considered

1. **`keybuf` monitor command**: Accepts keystrokes but doesn't work in remote monitor mode
2. **`x` (exit monitor) command**: Changes screen state but execution unreliable
3. **Newline to break in**: Hangs/times out after `g` command
4. **Direct memory writes** ✅: Works! This is what we're using
5. **Breakpoints** ✅: Essential for reliable re-entry to monitor

## Recommendations for VICEAdapter

1. Add `boot` method that sends `g` and waits for C64 to initialize
2. Update `inject_keys` to:
   - Split commands > 10 bytes
   - Write directly to keyboard buffer memory
   - Set breakpoint at $E5D4 before continuing
   - Wait for breakpoint response
   - Return control when breakpoint hit
3. Add `continue_execution` method that sends `g` and waits for next breakpoint
4. Keep existing `read_memory` method (already correct with 100ms delay)

## Files Created During Investigation

- `test_exit_monitor.rb` - Tested `x` command (partially successful)
- `test_wait_debug.rb` - Discovered keystrokes not executing
- `test_keybuf_immediate.rb` - Tested keybuf timing variations
- `test_direct_keyboard_buffer.rb` - Tested direct memory writes
- `test_direct_after_ready.rb` - Tested waiting for READY prompt
- `test_go_command.rb` - Discovered `g` returns no data
- `test_break_in.rb` - Attempted to break in after `g` (failed)
- `test_breakpoint.rb` - **BREAKTHROUGH**: Discovered breakpoint approach works
- `test_breakpoint_full_screen.rb` - Verified full command execution

## Success Metrics

- ✅ Can connect to VICE remote monitor
- ✅ Can boot C64 with `g` command
- ✅ Can inject keystrokes into keyboard buffer
- ✅ Keystrokes execute and produce output
- ✅ Can set breakpoints at specific addresses
- ✅ Breakpoints trigger automatically
- ✅ Can read screen RAM reliably after execution
- ✅ Can parse screen codes to ASCII correctly
- ✅ Full round-trip working: inject → execute → verify

**Next step**: Refactor VICEAdapter to use this breakpoint-based approach and update all tests.
