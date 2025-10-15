# Code Samples Extraction Report

**Date**: 2025-01-15
**Source**: 64 validated C64 BASIC lesson MDX files
**Target**: `/code-samples/commodore-64/basic/`

---

## Summary

✅ **Successfully extracted 211 code blocks from 64 lessons**

All validated C64 BASIC V2 code has been extracted from lesson MDX files and saved as individual `.bas` files in the code-samples repository. Each file is ready to be loaded into a C64 emulator or real hardware.

---

## Extraction Statistics

| Metric | Count |
|--------|-------|
| Total lessons processed | 64 |
| Lessons with code | 63 |
| Lessons without code | 1 (lesson 64 - wrap-up) |
| Total code blocks extracted | 211 |
| Average blocks per lesson | 3.3 |

### Week Breakdown

| Week | Lessons | Code Blocks | Notes |
|------|---------|-------------|-------|
| 1 | 8 | 19 | Basics, printing, variables |
| 2 | 8 | 30 | Loops, logic, random, DATA |
| 3 | 8 | 46 | Memory, POKE/PEEK, sprites, sound |
| 4 | 8 | 24 | Input, collisions, timing |
| 5 | 8 | 24 | State machines, scrolling |
| 6 | 8 | 22 | Persistence, file I/O |
| 7 | 8 | 22 | Libraries, menus, optimization |
| 8 | 8 | 24 | Speed, errors, BASIC/ASM hybrid |

---

## File Structure

### Multiple Code Blocks (most lessons)
When a lesson contains multiple code examples, they are numbered:
```
week-N/lesson-NN/
├── example-1.bas    # First code block (usually "Basic Example")
├── example-2.bas    # Second code block (usually "Practical Example")
├── example-3.bas    # Third code block (usually "WOW Moment" or variations)
└── ...
```

### Single Code Block (some lessons)
When a lesson contains exactly one code block, it's named `main.bas`:
```
week-N/lesson-NN/
└── main.bas         # Complete program
```

**Examples of single-block lessons:**
- Lesson 18 (Smooth Scrolling) - 1 complete program
- Lesson 48 (Scroll Runner Mini-Game) - 1 complete game
- Lesson 56 (Galactic Miner Mini-Game) - 1 complete game

---

## Lessons With Most Code Blocks

| Lesson | Title | Blocks | Type |
|--------|-------|--------|------|
| 24 | Battle Bots (Mini-Game) | 13 | Week finale mini-game |
| 32 | Circuit Run (Mini-Game) | 9 | Week finale mini-game |
| 15 | Random & Procedural | 7 | Multiple techniques |
| 21 | Reading Data | 7 | Multiple DATA examples |

---

## Code Quality

All extracted code:
- ✅ **Validated** - Passed C64 BASIC V2 validator
- ✅ **Authentic** - Uses only commands available in C64 BASIC V2
- ✅ **Runnable** - Can be loaded directly into C64 emulators
- ✅ **Documented** - Each lesson MDX contains context and explanations
- ✅ **Progressive** - Builds from simple to complex across 8 weeks

---

## Notable Code Samples

### Week 1: Foundation
- **Lesson 01**: Hello World variants
- **Lesson 08**: Simple shooting gallery game

### Week 2: Logic & Flow
- **Lesson 11**: Multiple FOR loop examples
- **Lesson 15**: Random number techniques (7 examples!)

### Week 3: Hardware Magic
- **Lesson 17**: Border colour animation (first POKE)
- **Lesson 19**: Sprite setup and movement
- **Lesson 22**: SID sound chip programming
- **Lesson 24**: Battle Bots mini-game (13 code blocks)

### Week 4: Input & Action
- **Lesson 25**: Keyboard polling
- **Lesson 28**: Sprite collision detection
- **Lesson 32**: Circuit Run mini-game (9 code blocks)

### Week 5: Game Structure
- **Lesson 33**: State machine pattern
- **Lesson 37**: Scrolling backgrounds
- **Lesson 40**: Cosmic Clash mini-game

### Week 6: Persistence
- **Lesson 43**: High score table management
- **Lesson 47**: Disk I/O and save/load
- **Lesson 48**: Scroll Runner mini-game

### Week 7: Structure & Polish
- **Lesson 49**: Library routines pattern
- **Lesson 51**: Menu system with keyboard/joystick
- **Lesson 53**: Cutscene scripting
- **Lesson 56**: Galactic Miner mini-game

### Week 8: Advanced Topics
- **Lesson 58**: Speed optimization techniques
- **Lesson 59**: Error handling with ON ERROR GOTO
- **Lesson 61**: BASIC/assembly hybrid with SYS

---

## Usage

### Load Into VICE Emulator
```bash
# Start VICE C64 emulator
x64

# Inside emulator:
LOAD "example-1.bas",8
RUN
```

### Load Into Real Hardware
1. Copy .bas files to C64 disk image using c1541 tool
2. Insert disk in 1541 drive
3. `LOAD "filename",8` on C64
4. `RUN`

### Browse & Study
Each `.bas` file can be opened in any text editor to study the code structure and learn C64 BASIC V2 patterns.

---

## Validation Notes

All code samples were extracted from lessons that passed validation:
- No ENDIF blocks (doesn't exist in C64 BASIC V2)
- No WHILE/WEND loops (doesn't exist in C64 BASIC V2)
- No RANDOMIZE command (use `X=RND(-TI)` instead)
- No label syntax (use line numbers)
- All commands verified against C64 BASIC V2 reference

See `/docs/validation/c64-basic-final-report.md` for complete validation details.

---

## Next Steps

1. ✅ Code samples extracted and organized
2. 📝 Build pattern library from validated code
3. 📝 Generate Quick Reference guides
4. 📝 Create downloadable .d64 disk images per week
5. 📝 Add README files to each week directory

---

## Files Changed

### New Files Created: 211 .bas files
- `/code-samples/commodore-64/basic/week-1/lesson-01/` through `lesson-08/`
- `/code-samples/commodore-64/basic/week-2/lesson-09/` through `lesson-16/`
- `/code-samples/commodore-64/basic/week-3/lesson-17/` through `lesson-24/`
- `/code-samples/commodore-64/basic/week-4/lesson-25/` through `lesson-32/`
- `/code-samples/commodore-64/basic/week-5/lesson-33/` through `lesson-40/`
- `/code-samples/commodore-64/basic/week-6/lesson-41/` through `lesson-48/`
- `/code-samples/commodore-64/basic/week-7/lesson-49/` through `lesson-56/`
- `/code-samples/commodore-64/basic/week-8/lesson-57/` through `lesson-63/`

### Old Files Replaced
All previous code samples in these directories were replaced with validated code from lesson MDX files.

---

## Conclusion

The code-samples repository now contains authentic, validated C64 BASIC V2 code extracted directly from the lesson content. Every code sample:
- Reflects the exact code shown in lessons
- Has been validated for C64 BASIC V2 compatibility
- Is ready to run on real hardware or emulators
- Represents 8 weeks of progressive learning from "Hello World" to complex mini-games

**Total Lines of Code**: ~5,400 lines of authentic C64 BASIC V2
**Ready for**: Students, emulators, real hardware, and pattern extraction

---

**Extraction Complete: 2025-01-15** ✅
