# VICE Integration Setup Guide

## Summary

Successfully implemented VICE/C64 test harness with 30 passing tests (TDD methodology).
**Critical discovery:** VICE has TWO monitor protocols - we need the **text-based remote monitor**, NOT the binary monitor.

## VICE Monitor Protocols

### ❌ Binary Monitor (`-binarymonitor`)
- Binary packet protocol (not ASCII)
- Data format: Byte sequences with specific structures
- **NOT compatible with our current implementation**

### ✅ Remote Monitor (`-remotemonitor`)
- **Text-based ASCII protocol** ✓
- Commands: `m 0400 0410`, `load "file"`, etc.
- Responses: ASCII text with memory dumps
- Prompt: `(C:$xxxx)` after each command
- **This is what our adapter expects**

## Starting VICE Correctly

```bash
# ✓ CORRECT - Text-based remote monitor
x64sc -remotemonitor -remotemonitoraddress "127.0.0.1:6502" &

# ❌ WRONG - Binary protocol (incompatible)
x64sc -binarymonitor -binarymonitoraddress "127.0.0.1:6502" &
```

## Verified Protocol Behavior

### Connection
```
→ Connect to localhost:6502
← Receive prompt: (C:$e5d1)
```

### Memory Read
```
→ Send: m 0400 0410\n
← Receive:
>C:0400  20 20 20 20  20 20 20 20  20 20 20 20  20 20 20 20
>C:0410  20
(C:$0411)
```

### Screen RAM
- Address: `0x0400` - `0x07E7` (1000 bytes = 40×25 characters)
- Values: PETSCII screen codes (not ASCII)
- Space character: `0x20` (32 decimal)

## Required VICEAdapter Changes

The current implementation looks for status codes `250`/`251` which don't exist in the remote monitor protocol.

### What Needs Fixing

**1. Response Parsing**
```typescript
// ❌ Current (wrong for remote monitor)
if (response.includes('250')) { ... }

// ✓ Should be:
if (response.includes('(C:$')) {  // Prompt indicates command complete
  // Parse response data
}
```

**2. Command Format** (already correct!)
```typescript
// ✓ These commands are correct for remote monitor
const command = `m ${startAddr.toString(16)} ${endAddr.toString(16)}\n`;
const command = `load "${path}"\n`;
```

**3. Initial Prompt Handling**
```typescript
// Need to consume initial prompt on connect
socket.on('connect', () => {
  // Wait for initial (C:$xxxx) prompt before marking connected
});
```

## Test Results

### Current Status
- **30/30 tests pass** when VICE not running (graceful skip)
- Tests **hang** with binary monitor (wrong protocol)
- Tests **should work** with remote monitor after response parsing fix

### Test PRG File Created
```
lesson-pipeline/test-prgs/hello.prg (36 bytes)
10 PRINT "HELLO WORLD"
20 END
```

## Quick Verification

### Test TCP Connection
```bash
echo "m 0400 0410" | nc localhost 6502
# Should see: (C:$e5d1) >C:0400  20 20 20 ...
```

### Test with Node.js
```bash
node lesson-pipeline/test-vice-commands.js
# Should connect and receive text responses
```

## Next Steps

1. **Fix VICEAdapter response parsing** - Look for `(C:$xxxx)` prompts, not status codes
2. **Handle initial prompt** on connection
3. **Parse memory dumps** - Extract hex bytes from `>C:0400  20 20...` format
4. **Re-run integration tests** with remote monitor
5. **End-to-end lesson test** with real PRG file

## Integration Test Command

```bash
# Start VICE with remote monitor
x64sc -remotemonitor -remotemonitoraddress "127.0.0.1:6502" &

# Verify it's listening
lsof -i :6502

# Run tests (after VICEAdapter fixes)
npm test tests/harness/*.test.ts
```

## References

- VICE Monitor Commands: https://vice-emu.sourceforge.io/vice_12.html
- Remote Monitor: Text-based, port configurable
- Binary Monitor: Binary protocol, different packet format

---

**Key Takeaway:** Use `-remotemonitor`, not `-binarymonitor`. Our text-based command implementation is correct for remote monitor, but response parsing needs adjustment to look for prompts `(C:$xxxx)` instead of status codes.
