# VICE Test Harness - Archived Experiment

**Date Archived:** 2025-01-17
**Status:** Experiment discontinued, valuable learnings preserved

## Why This Was Built

The original goal was to automate screenshot and video capture for 1088+ lesson code samples across C64 BASIC (64 lessons) and Assembly (1024 lessons), plus future expansion to 40+ platforms.

The vision:
1. Load lesson code automatically
2. Inject keystrokes/joystick input to trigger animations
3. Wait for the "WOW moment"
4. Capture screenshot/video automatically
5. Repeat for all lessons

## Why This Was Abandoned

### The Realization
**Manual capture is actually the better solution for this use case.**

### Key Factors

1. **Human judgment is essential**
   - The "WOW moment" timing varies per lesson
   - Assembly lessons have timing-critical effects (raster bars, sprite multiplexing)
   - No heuristic can reliably detect "the right moment" across all lesson types
   - Automated capture would need complex per-lesson configuration anyway

2. **Complexity scales badly**
   - C64 BASIC: Relatively simple (wait for READY, inject RUN)
   - C64 Assembly: Complex timing, hardware effects, multiple execution paths
   - 40+ platforms: Each needs custom adapter, protocol research, testing
   - Maintenance burden grows exponentially

3. **Manual is faster than you think**
   - 60 seconds per lesson × 1088 lessons = 18 hours
   - Spread across months of authoring = negligible per-lesson
   - Screenshot quality is higher (human verifies every frame)
   - No debugging flaky automation

4. **The sunk cost was learning, not code**
   - Understanding VICE internals → valuable
   - PETSCII/screen code conversion → useful knowledge
   - Remote monitor protocol → educational
   - The code itself → not worth maintaining

## What Was Built

### Ruby Harness (`ruby-harness/`)
- ✅ TCP connection to VICE remote monitor (port 6510)
- ✅ Keyboard injection via direct memory writes ($0277 keyboard buffer)
- ✅ Breakpoint-based execution control ($E5D4 BASIC READY loop)
- ✅ Screen RAM reading and parsing (40×25 chars at $0400-$07E7)
- ✅ Screenshot capture (via OS-level `screencapture`/`xwd`)
- ⚠️ Video capture (started but not completed)

**Test Coverage:** 30 passing tests using RSpec

### TypeScript Harness (`src/harness/`)
- ✅ EmulatorAdapter interface for multi-platform support
- ✅ VICEAdapter implementation (TCP binary/remote monitor)
- ✅ LessonRunner for YAML-based test definitions
- ✅ Error hierarchy (6 error types)
- ⚠️ Media capture partially implemented

**Test Coverage:** 30 passing tests using Node.js native test runner

## What Was Learned (Valuable Knowledge)

### VICE Remote Monitor Protocol
- **Connection:** TCP to port 6510 (configurable with `-monport`)
- **Prompt format:** `(C:$xxxx)` where xxxx is current program counter
- **Command format:** ASCII text commands terminated with `\n`
- **`g` command:** Starts execution, returns NO data (doesn't close socket)
- **Breakpoints are essential:** Can't reliably "break in" after `g`, must set breakpoint first

### C64 Memory Layout
- **$0400-$07E7:** Screen RAM (1000 bytes, 40×25 characters)
- **$0277-$0280:** Keyboard buffer (10 bytes maximum)
- **$00C6:** Keyboard buffer length counter
- **$E5D4:** BASIC READY loop (perfect breakpoint location)

### Screen Code Conversion
C64 screen codes ≠ ASCII ≠ PETSCII:
```
Screen Code 0 = '@'
Screen Code 1-26 = 'A'-'Z' (code + 64)
Screen Code 32 = ' '
Screen Code 33-63 = ASCII equivalent
```

### Keyboard Injection Pattern
```ruby
# 1. Set breakpoint at READY loop
socket.write("break e5d4\n")

# 2. Write PETSCII codes to keyboard buffer
petscii_codes.each_with_index do |code, index|
  addr = 0x0277 + index
  socket.write(format(">%04x %02x\n", addr, code))
end

# 3. Set buffer length
socket.write(format(">00c6 %02x\n", petscii_codes.length))

# 4. Continue execution (breakpoint will trigger automatically)
socket.write("g\n")
```

### VICE Screenshot Limitations
- **No built-in screenshot command** in remote monitor
- **UI-only screenshot:** Menu → Snapshot → Save screenshot (not automatable)
- **`-exitscreenshot` flag:** Only captures when VICE quits
- **OS-level capture is the only solution:** `screencapture` (macOS), `xwd` (Linux), `ffmpeg` (video)

## Files to Preserve

### Essential Knowledge
- ✅ `ruby-harness/VICE_REMOTE_MONITOR_FINDINGS.md` - Protocol discoveries
- ✅ `docs/test-harness-progress.md` - Implementation journey
- ✅ `docs/VICE-INTEGRATION-COMPLETE.md` - Final remote monitor implementation

### Reference Implementations
- `ruby-harness/lib/vice_adapter.rb` - Working Ruby implementation
- `ruby-harness/spec/*_spec.rb` - Comprehensive test suite
- `src/harness/vice-adapter.ts` - TypeScript implementation
- `src/harness/emulator-adapter.ts` - Multi-platform interface design

### Test Scripts
- `ruby-harness/test_*.rb` - Exploration scripts showing protocol research process

## What Replaced This

### Simple Helper Scripts
Located in `/scripts/`:

1. **`validate-basic.sh`** - Syntax check all BASIC files with petcat
   - Runs in seconds
   - Catches typos before publishing
   - No emulator needed

2. **`quick-vice.sh`** - Fast VICE launcher for manual testing
   - One command to load any lesson
   - Warp mode for fast loading
   - Simpler than clicking through menus

### Manual Workflow
When authoring a lesson:
1. Write lesson MDX
2. Extract WOW code to `.bas` file
3. Run `validate-basic.sh` for syntax check
4. Run `quick-vice.sh lesson-23` to load in VICE
5. Let program run, capture screenshot with OS tool (Cmd+Shift+4)
6. Save screenshot to `/website/public/images/lessons/...`
7. Reference in MDX, commit all files

**Time per lesson:** ~60 seconds for screenshot
**Quality:** Human-verified every time
**Maintenance:** Zero

## Lessons for Future Automation Attempts

1. **Question the goal:** Automate the tedious, not the judgment-requiring
2. **Consider the full scope:** Works for C64 BASIC ≠ works for 40 platforms
3. **Embrace sunk costs:** Learning has value even if code is discarded
4. **Manual doesn't scale linearly:** 18 hours spread across 6 months is negligible
5. **Automation maintenance has a cost:** Flaky tests, protocol changes, debugging

## When to Revisit This

**Consider automation again IF:**
- Regenerating all 1088 screenshots becomes necessary (style changes, resolution changes)
- Expanding to 100+ lessons per platform (where 60 seconds × 100 = worth automating)
- Someone else wants to validate lessons automatically (CI/CD for contributions)
- Video tutorials become essential (not just static screenshots)

**Until then:** Manual capture is the pragmatic choice.

## References

- [VICE Manual - Remote Monitor](https://vice-emu.sourceforge.io/vice_12.html)
- [C64 Memory Map](https://sta.c64.org/cbm64mem.html)
- [PETSCII Character Set](https://style64.org/petscii/)

---

**Bottom line:** This experiment taught us valuable lessons about VICE internals and the limits of automation. The knowledge is preserved here for future reference, but the code itself should not be maintained or extended.

**Archive date:** 2025-01-17
**Preserved by:** Claude Code + Steve Hill
**Decision:** Manual workflow is superior for this use case
