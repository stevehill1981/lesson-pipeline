# VICE Integration - Remote Monitor Protocol Complete

## Summary

Successfully updated VICEAdapter to use VICE's **remote monitor protocol** (text-based, port 6510) instead of the binary monitor protocol.

## Changes Made

### 1. VICEAdapter Implementation (src/harness/vice-adapter.ts)

**Port Configuration:**
- Changed default port from 6502 (binary) to 6510 (remote monitor)
- Updated all documentation to reference remote monitor

**Connection Logic:**
- Wait for initial prompt `(C:$xxxx)` on connection
- Set up data listener BEFORE connecting to avoid race condition
- Properly handle the text-based welcome message

**Command/Response Parsing:**
- `loadProgram()`: Look for prompt `(C:$` instead of status code "250"
- `injectKeys()`: Look for prompt instead of status code
- `readMemory()`: Parse text format `>C:0400  20 20 20...` instead of binary packets
  - Changed command from `memory` to `m`
  - Parse hex bytes from lines starting with `>C:`

### 2. Test Suite Updates

Updated all 7 test files to use port 6510 and reference remote monitor:
- tests/harness/vice-adapter.test.ts
- tests/harness/vice-adapter-connect.test.ts
- tests/harness/vice-adapter-load.test.ts
- tests/harness/vice-adapter-inject.test.ts
- tests/harness/vice-adapter-wait.test.ts
- tests/harness/vice-adapter-memory.test.ts
- tests/harness/lesson-runner.test.ts

All tests updated to show:
```typescript
// These tests require VICE to be running with remote monitor:
// x64sc -remotemonitor -monport 6510
```

### 3. Verification

**Test Script Verification:**
```bash
node test-vice-commands.js
```

Successfully demonstrated:
- Connection establishes to port 6510
- Initial prompt received: `(C:$e5d4)`
- Memory read command works: `m 0400 0410`
- Response format correct:
  ```
  >C:0400  20 20 20 20  20 20 20 20  20 20 20 20  20 20 20 20
  >C:0410  20
  (C:$0411)
  ```

## Protocol Documentation

### VICE Remote Monitor (Text-Based)

**Start VICE:**
```bash
x64sc -remotemonitor -monport 6510
```

**Connection:**
- TCP to localhost:6510
- Immediate welcome prompt: `(C:$xxxx)` where xxxx is current PC

**Command Format:**
- Commands are ASCII text terminated with `\n`
- Responses are ASCII text
- Each response ends with prompt: `(C:$xxxx)`

**Memory Read:**
```
→ m 0400 0410\n
← >C:0400  20 20 20 20  20 20 20 20  20 20 20 20  20 20 20 20
← >C:0410  20
← (C:$0411)
```

**Load Program:**
```
→ load "path/to/file.prg"\n
← Ready.
← (C:$xxxx)
```

**Error Responses:**
- Start with `?` character
- Example: `?File not found`

## Test Results

### Unit Tests: ✅ All Passing
```
npm test tests/harness/
```
- 30/30 tests pass when VICE not available (graceful skip)
- Tests correctly updated for port 6510

### Manual Verification: ✅ Confirmed Working
```
node test-vice-commands.js
```
- Connection successful
- Command/response cycle working
- Text parsing correct

### Integration Tests: ⏸️ Requires Manual VICE
To run full integration tests with live VICE:

1. Start VICE with remote monitor (keep GUI open):
   ```bash
   x64sc -remotemonitor -monport 6510
   ```

2. Run test suite:
   ```bash
   npm test tests/harness/vice-adapter-connect.test.ts
   npm test tests/harness/vice-adapter-memory.test.ts
   npm test tests/harness/vice-adapter-wait.test.ts
   ```

Note: VICE GUI must remain open during tests. Background/headless mode causes VICE to exit immediately.

## Key Implementation Details

### Race Condition Fix
Original code set up data listener inside `connect` event handler, causing prompt to be missed. Fixed by setting up listener before calling `socket.connect()`:

```typescript
// BEFORE (wrong - race condition)
this.socket.on('connect', () => {
  this.socket?.on('data', promptHandler);
});

// AFTER (correct - listener ready before data arrives)
this.socket.on('data', promptHandler);
this.socket.on('connect', () => {
  // TCP connected
});
```

### Memory Dump Parsing
Remote monitor returns formatted hex dump:
```
>C:0400  20 20 20 20  20 20 20 20  ...
```

Regex pattern to extract bytes:
```typescript
const match = line.match(/^>C:[0-9a-fA-F]+\s+([0-9a-fA-F\s]+)/);
```

### Prompt Detection
All commands wait for prompt to know response is complete:
```typescript
if (buffer.includes('(C:$')) {
  // Response complete
}
```

## Files Modified

- src/harness/vice-adapter.ts (370 lines)
- tests/harness/vice-adapter.test.ts
- tests/harness/vice-adapter-connect.test.ts
- tests/harness/vice-adapter-load.test.ts
- tests/harness/vice-adapter-inject.test.ts
- tests/harness/vice-adapter-wait.test.ts
- tests/harness/vice-adapter-memory.test.ts
- tests/harness/lesson-runner.test.ts
- test-vice-commands.js (updated port)

## Next Steps

1. **Manual Testing**: Start VICE GUI and run full integration test suite
2. **End-to-End Test**: Load hello.prg, inject "RUN\n", verify "HELLO WORLD" appears
3. **Performance Tuning**: Adjust poll intervals and timeouts based on real usage
4. **Documentation**: Update main README with remote monitor setup instructions

## References

- VICE Manual: https://vice-emu.sourceforge.io/vice_12.html
- Remote Monitor Commands: Text-based, human-readable
- Default Port: 6510 (configurable with `-monport`)
