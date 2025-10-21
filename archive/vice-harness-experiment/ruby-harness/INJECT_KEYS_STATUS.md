# inject_keys Implementation Status

## Current Status: EXPERIMENTAL / INCOMPLETE

The `inject_keys` method has been extensively developed but is not yet fully working for lesson verification. After significant debugging, we've decided to **pivot to PRG-based verification** instead, as this better matches the actual use case.

## What Works

- ✅ Connecting to VICE remote monitor
- ✅ Booting C64 to READY prompt
- ✅ Setting breakpoints at BASIC READY loop ($E5D4)
- ✅ Breakpoint triggering and detection ("Stop on exec" messages)
- ✅ PETSCII conversion (ASCII → C64 keyboard codes)
- ✅ Direct memory writes to keyboard buffer ($0277-$027E)
- ✅ Setting keyboard buffer length ($00C6)

## What Doesn't Work

❌ **BASIC command execution** - Commands are written to keyboard buffer but not executed by BASIC interpreter

## Problem Analysis

The keyboard buffer is correctly populated with PETSCII codes, but the C64's BASIC interpreter doesn't process them. Possible causes:

1. **Timing issue** - Breakpoint may trigger before/after buffer processing window
2. **IRQ state** - Keyboard IRQ handler might not be active when paused in monitor
3. **Buffer pointer mismatch** - C64 may track buffer read position separately
4. **VICE simulator quirk** - Real hardware vs emulator differences

## Working Alternative: PRG Loading

Instead of typing commands, we use the **already-working** PRG file loading approach:

```ruby
adapter.load_program('/path/to/test.prg')
# PRG auto-executes
screen_text = adapter.read_memory(0x0400, 1000)  # Read screen RAM
expect(screen_text).to include('EXPECTED OUTPUT')
```

This matches the actual lesson verification workflow:
1. Student writes BASIC code
2. Code is converted to PRG file
3. PRG is loaded and run in VICE
4. Screen output is verified

## Key Discoveries Documented

See `VICE_REMOTE_MONITOR_FINDINGS.md` for detailed protocol documentation including:

- VICE boot timing requirements (7+ seconds)
- Breakpoint message formats ("Stop on exec")
- Keyboard buffer memory layout
- Monitor command behavior

## Future Work (If Needed)

If interactive keystroke injection becomes required later:

1. Try different breakpoint addresses (keyboard IRQ handler, not READY loop)
2. Investigate VICE-specific commands for keyboard injection
3. Test with real C64 hardware via network monitor
4. Use VICE's built-in automation features instead of remote monitor

## Recommendation

**Use PRG-based verification for lesson testing.** This is:
- Already working ✅
- More reliable
- Closer to actual use case (verifying student PRG files)
- Simpler to debug
- Matches VICE's strengths

## Files to Review

- `lib/vice_adapter.rb` - Contains experimental inject_keys implementation
- `spec/vice_adapter_inject_spec.rb` - Test showing the issue
- `test_breakpoint.rb` - Manual test script (worked in isolation but not in adapter)
- `VICE_REMOTE_MONITOR_FINDINGS.md` - Complete protocol documentation

---

*Last updated: 2025-10-17*
*Decision: Pivot to PRG-based workflow*
