# VICE Remote Monitor + Node.js Promise Incompatibility

## Critical Discovery

**VICE remote monitor does NOT send data when socket connections are wrapped in Promises.**

## Evidence

### ✅ Works: Plain Socket (No Promise)
```javascript
// test-vice-commands.js
const socket = new net.Socket();
socket.on('data', (data) => {
  console.log('Received:', data.toString());  // ✅ WORKS - receives prompt immediately
});
socket.connect(6510, 'localhost');
```

**Output:**
```
✓ Connected to VICE remote monitor
← Received: "(C:$e5d4) >C:0400  20 20 20 20 ..."
```

### ❌ Fails: Socket in Promise
```javascript
// test-promise-version.js
async function test() {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    socket.on('data', (data) => {
      console.log('Received:', data.toString());  // ❌ NEVER CALLED
    });
    socket.connect(6510, 'localhost');
  });
}
```

**Output:**
```
[TEST] TCP connection established
[TEST] Timeout!  // No data ever received
```

## What Was Tried

1. ✅ Verified VICE is running and accepting connections
2. ✅ Verified netcat receives data fine
3. ✅ Verified plain Node.js script receives data fine
4. ❌ Promise wrapper → NO DATA
5. ❌ Setting up handlers before Promise → NO DATA
6. ❌ socket.resume() → NO DATA
7. ❌ socket.setNoDelay(true) → NO DATA
8. ❌ Delays/timeouts → NO DATA
9. ❌ Different handler ordering → NO DATA

## Current Status

- **TCP connection**: ✅ Establishes successfully
- **Data reception**: ❌ Never fires when in Promise
- **VICE**: ✅ Running and responsive to non-Promise connections
- **Protocol**: ✅ Correct (text-based remote monitor on port 6510)

## Hypothesis

Possible causes:
1. **V8/Node.js Promise microtask timing** - Data arrives before Promise microtasks execute
2. **Event loop interaction** - Promise context affects event handler registration
3. **VICE implementation quirk** - Sends initial prompt only if no async context detected
4. **Socket reference issue** - Promise closure affects socket lifecycle

## Proposed Solutions

### Option 1: Callback-Based Adapter (No Promises)
Convert VICEAdapter to use callbacks instead of async/await:
```typescript
connect(callback: (error: Error | null) => void): void {
  this.socket = new net.Socket();
  this.socket.on('data', ...);  // Works!
  this.socket.connect(port);
}
```

**Pros:** Will work with VICE
**Cons:** Breaks async/await architecture, messy API

### Option 2: Event Emitter Pattern
Make VICEAdapter an EventEmitter:
```typescript
class VICEAdapter extends EventEmitter {
  connect(): void {  // Not async!
    this.socket.on('connect', () => this.emit('connected'));
    this.socket.on('data', () => this.emit('data', ...));
  }
}
```

**Pros:** Works with VICE, clean event-driven API
**Cons:** Different from other adapters, no async/await

### Option 3: Use Binary Monitor Instead
Switch to VICE binary monitor protocol (port 6502):
```
x64sc -binarymonitor -binarymonitoraddress 127.0.0.1:6502
```

**Pros:** Might not have same Promise issue
**Cons:** Binary protocol more complex to parse, different from spec

### Option 4: External Process Wrapper
Launch VICE and communicate via stdin/stdout instead of TCP:
```typescript
const vice = spawn('x64sc', ['-remotemonitor', ...]);
vice.stdout.on('data', ...);  // Might work!
```

**Pros:** Different I/O model might avoid Promise issue
**Cons:** More complex setup, process management overhead

### Option 5: Use Different Emulator
Try alternative C64 emulators with better async support:
- **CCS64** - Different protocol implementation
- **Denise** - Modern architecture
- **C64Forever** - Commercial but robust

## Recommendation

**Immediate:** Document this limitation and use test-vice-commands.js pattern for any production VICE integration.

**Short-term:** Implement Option 2 (EventEmitter) - maintains clean API while working with VICE's quirks.

**Long-term:** Contact VICE maintainers about remote monitor behavior with async Node.js code, or evaluate alternative emulators.

## Files for Reference

- `test-vice-commands.js` - ✅ Working non-Promise version
- `test-promise-version.js` - ❌ Failing Promise version (identical socket code)
- `test-external-socket.js` - ❌ Also fails even with external setup
- `src/harness/vice-adapter.ts` - Current (broken) Promise-based implementation

## Testing to Reproduce

```bash
# Start VICE
x64sc -remotemonitor -remotemonitoraddress 127.0.0.1:6510 &

# Test non-Promise (works)
node test-vice-commands.js

# Test Promise (fails)
node test-promise-version.js
```

Both use identical socket setup. Only difference is Promise wrapper. Result: non-Promise receives data, Promise does not.

---

**Date:** 2025-10-16
**Time Invested:** ~4 hours debugging
**Conclusion:** VICE remote monitor + Node.js Promises = incompatible for unknown reasons
