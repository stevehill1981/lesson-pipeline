# C64 BASIC Pattern Library - Extraction Plan

**Goal**: Extract reusable code patterns from the 64 validated lessons and document them as building blocks for the Vault.

---

## Pattern Categories

### 1. Sprite Patterns
**Lessons**: 19, 20, 23, 28, 29, 31, 32, 37, 40, 48

**Patterns to extract**:
- Sprite initialization (shape data, pointers, enable)
- Basic sprite movement (WASD, smooth motion)
- Sprite positioning (X/Y coordinates, high bit)
- Collision detection (sprite-sprite, sprite-background)
- Multi-color sprite setup
- Sprite animation (frame cycling)

### 2. Sound Patterns
**Lessons**: 22, 23, 24, 32, 40, 48

**Patterns to extract**:
- SID chip initialization
- Simple beep/tone
- Explosion sound effect
- Pickup/coin sound effect
- Hit/damage sound effect
- Background music loop
- Note frequency table

### 3. Menu Patterns
**Lessons**: 51, 52, 56

**Patterns to extract**:
- Menu initialization (item array setup)
- Menu drawing with highlight (reverse video)
- Keyboard navigation (W/S, up/down arrows)
- Joystick navigation (port 2)
- Option selection (RETURN/SPACE)
- Menu dispatcher (ON...GOSUB)

### 4. HUD Patterns
**Lessons**: 29, 32, 40, 48, 56

**Patterns to extract**:
- Score display (multi-digit)
- Lives display (counter)
- Timer display (countdown)
- Level indicator
- Status bar (health bar, progress bar)
- HUD update routine (minimize flicker)

### 5. Scrolling Patterns
**Lessons**: 18, 26, 37, 38, 48

**Patterns to extract**:
- Smooth hardware scrolling (VIC-II registers)
- Coarse scrolling (character-by-character)
- Parallax scrolling (multiple layers)
- Wrap-around scrolling
- Scrolling with sprite movement

### 6. State Machine Patterns
**Lessons**: 33, 34, 35, 36, 40, 48, 56

**Patterns to extract**:
- Basic state machine (STATE variable)
- State transition logic
- ON...GOTO dispatch
- State-specific initialization
- State draw/update separation
- Nested states (game modes)

### 7. Input Patterns
**Lessons**: 25, 26, 27, 32, 40, 51

**Patterns to extract**:
- Keyboard polling (GET)
- Keyboard matrix reading (PEEK 197)
- Joystick reading (port 1, port 2)
- Input buffering
- Diagonal movement
- Fire button detection

### 8. Screen & Color Patterns
**Lessons**: 17, 18, 19, 20, 21

**Patterns to extract**:
- Screen memory access (1024-2023)
- Color memory access (55296-56295)
- Border color animation
- Background color change
- Character plotting
- Screen clear routine
- Color cycling effect

### 9. Data & Level Patterns
**Lessons**: 14, 21, 23, 24, 42, 52, 56

**Patterns to extract**:
- DATA block structure
- READ/DATA usage
- RESTORE for multi-level loading
- Level data format (map, entities, rules)
- Array-based level storage
- Dynamic level generation

### 10. Library & Subroutine Patterns
**Lessons**: 49, 50, 51, 56

**Patterns to extract**:
- Library initialization (line number table)
- Subroutine dispatch (GOSUB LIB(n))
- Parameter passing (global variables)
- Return value convention
- Library organization (9000+ block)
- Reusable module structure

### 11. Performance Patterns
**Lessons**: 55, 58

**Patterns to extract**:
- Address table precomputation
- String caching (ASC lookup)
- Loop unrolling
- Constant extraction
- Jiffy clock timing (TI$, TI)
- Hot loop optimization

### 12. Error Handling Patterns
**Lessons**: 59

**Patterns to extract**:
- ON ERROR GOTO setup
- Error code checking (ERR)
- Error line tracking (ERL)
- Memory checking (FRE)
- Graceful degradation
- Error logging

### 13. File I/O Patterns
**Lessons**: 43, 47

**Patterns to extract**:
- High score save/load
- File OPEN/CLOSE
- Sequential write (PRINT#)
- Sequential read (INPUT#)
- Disk error handling
- File existence check

### 14. Game Loop Patterns
**Lessons**: 24, 32, 40, 48, 56

**Patterns to extract**:
- Basic game loop structure
- Input → Update → Draw cycle
- Frame timing
- Pause handling
- Win/lose conditions
- Score/lives checking

---

## Pattern Library Structure

```
/docs/patterns/
├── README.md                          # Overview and index
├── sprites/
│   ├── sprite-initialization.md
│   ├── sprite-movement.md
│   ├── sprite-collision.md
│   └── sprite-animation.md
├── sound/
│   ├── sid-initialization.md
│   ├── sound-effects.md
│   └── simple-music.md
├── menus/
│   ├── menu-system.md
│   ├── keyboard-navigation.md
│   └── joystick-navigation.md
├── hud/
│   ├── score-display.md
│   ├── lives-display.md
│   └── timer-display.md
├── scrolling/
│   ├── smooth-scrolling.md
│   ├── coarse-scrolling.md
│   └── parallax-scrolling.md
├── state-machines/
│   ├── basic-state-machine.md
│   ├── state-transitions.md
│   └── on-goto-dispatch.md
├── input/
│   ├── keyboard-polling.md
│   ├── joystick-reading.md
│   └── diagonal-movement.md
├── screen/
│   ├── screen-memory.md
│   ├── color-manipulation.md
│   └── border-effects.md
├── data/
│   ├── read-data-pattern.md
│   ├── level-loading.md
│   └── restore-pattern.md
├── library/
│   ├── library-initialization.md
│   ├── subroutine-dispatch.md
│   └── parameter-passing.md
├── performance/
│   ├── address-tables.md
│   ├── loop-unrolling.md
│   └── timing-measurement.md
├── errors/
│   ├── error-handling.md
│   └── memory-checking.md
├── file-io/
│   ├── save-high-scores.md
│   └── disk-operations.md
└── game-loops/
    ├── basic-game-loop.md
    ├── input-update-draw.md
    └── frame-timing.md
```

---

## Pattern Document Template

Each pattern document should contain:

```markdown
# Pattern Name

**Category**: [sprite|sound|menu|etc.]
**Difficulty**: [Beginner|Intermediate|Advanced]
**Appears in**: Lessons [list]
**Prerequisites**: [other patterns needed]

## Overview

[1-2 sentence description of what this pattern does]

## The Pattern

```basic
[Core reusable code - minimal, commented]
```

## Parameters

| Variable | Type | Purpose | Example |
|----------|------|---------|---------|
| X | Integer | Sprite X position | 100 |
| Y | Integer | Sprite Y position | 120 |

## How It Works

[Step-by-step explanation]

## Variations

### Variation 1: [Name]
[Description and code snippet]

### Variation 2: [Name]
[Description and code snippet]

## Common Mistakes

- **Mistake 1**: [description]
  - **Fix**: [solution]

## Memory Usage

- **Addresses**: [memory locations used]
- **Variables**: [list of variables]
- **Size**: [approximate bytes]

## Integration Example

```basic
[Show pattern integrated into a larger program]
```

## See Also

- [Related patterns]
- [Lessons that use this]
- [Vault articles]
```

---

## Extraction Process

1. **Identify** - Map lessons to pattern categories
2. **Extract** - Pull core code from lesson examples
3. **Distill** - Remove lesson-specific context, keep reusable core
4. **Document** - Add parameters, variations, mistakes
5. **Cross-reference** - Link to lessons and related patterns
6. **Validate** - Ensure extracted pattern is valid C64 BASIC V2

---

## Priority Order

Phase 1 (Core building blocks):
1. Sprite patterns
2. Input patterns
3. Screen & color patterns
4. Basic game loop

Phase 2 (Game structure):
5. State machines
6. HUD patterns
7. Menu patterns
8. Sound patterns

Phase 3 (Advanced):
9. Scrolling patterns
10. Performance patterns
11. Data & level patterns
12. Library patterns

Phase 4 (Polish):
13. Error handling
14. File I/O

---

## Success Criteria

- [ ] All 14 pattern categories documented
- [ ] Minimum 30 distinct patterns extracted
- [ ] Each pattern validated for C64 BASIC V2
- [ ] Cross-references to lessons complete
- [ ] Pattern variations documented
- [ ] Integration examples provided
- [ ] Memory usage documented
- [ ] Common mistakes listed

---

**Next Step**: Begin Phase 1 extraction with sprite patterns
