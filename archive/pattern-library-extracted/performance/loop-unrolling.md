# Loop Unrolling

**Category**: Performance
**Difficulty**: Advanced
**Appears in**: Lessons 55, 58
**Prerequisites**: [Basic Game Loop](../game-loops/basic-game-loop.md), [Address Tables](address-tables.md)

## Overview

Eliminate loop overhead by explicitly writing out loop iterations. Trades code size for speed by removing FOR/NEXT bookkeeping, variable increments, and conditional checks that slow down repetitive operations in BASIC.

## The Pattern

```basic
REM --- WITH LOOP (SLOW) ---
100 FOR I=0 TO 3
110 POKE 53248+I*2,X(I)
120 NEXT I

REM --- UNROLLED (FAST) ---
100 POKE 53248,X(0)
110 POKE 53250,X(1)
120 POKE 53252,X(2)
130 POKE 53254,X(3)
```

## Parameters

| Concept | Explanation | Trade-off |
|---------|-------------|-----------|
| Loop overhead | FOR/NEXT tracking, I increment, bounds check | Eliminated |
| Code size | One line per iteration | Increases |
| Speed gain | 2-3x faster | Worth it for small loops |
| Sweet spot | 2-10 iterations | Best performance/size ratio |

## How It Works

### Step 1: Identify Loop Overhead Cost
```basic
FOR I=0 TO 3
  POKE 53248+I*2,X(I)
NEXT I
```
**Hidden costs**:
- Initialize I=0
- Check I<=3 each iteration
- Increment I each time
- Calculate I*2 each time
- NEXT returns to FOR
- **~40% of time is overhead!**

### Step 2: Unroll the Loop
```basic
POKE 53248,X(0)
POKE 53250,X(1)
POKE 53252,X(2)
POKE 53254,X(3)
```
**Eliminated**:
- No loop variable
- No bounds check
- No incrementing
- Pre-calculated addresses
- **~60% faster!**

### Step 3: When to Unroll
**Good candidates**:
- Fixed number of iterations (sprites, voices, etc.)
- Performance-critical sections (game loop core)
- Small iteration counts (2-10)
- Inner loops (executed thousands of times)

**Bad candidates**:
- Variable iteration counts
- Large loops (>20 iterations)
- Rarely-executed code
- When memory is scarce

## Variations

### Variation 1: Sprite Positioning (8 sprites)
```basic
REM SLOW: Loop through all sprites
100 FOR S=0 TO 7
110 POKE 53248+S*2,SX(S)
120 POKE 53249+S*2,SY(S)
130 NEXT S

REM FAST: Unrolled
100 POKE 53248,SX(0):POKE 53249,SY(0)
110 POKE 53250,SX(1):POKE 53251,SY(1)
120 POKE 53252,SX(2):POKE 53253,SY(2)
130 POKE 53254,SX(3):POKE 53255,SY(3)
140 POKE 53256,SX(4):POKE 53257,SY(4)
150 POKE 53258,SX(5):POKE 53259,SY(5)
160 POKE 53260,SX(6):POKE 53261,SY(6)
170 POKE 53262,SX(7):POKE 53263,SY(7)
```

**Speed gain**: 2.5x faster

### Variation 2: SID Voice Initialization
```basic
REM SLOW: Loop through 3 voices
100 FOR V=0 TO 2
110 POKE 54272+V*7,F(V) AND 255
120 POKE 54273+V*7,F(V)/256
130 POKE 54277+V*7,17
140 NEXT V

REM FAST: Unrolled
100 POKE 54272,F(0) AND 255:POKE 54273,F(0)/256:POKE 54277,17
110 POKE 54279,F(1) AND 255:POKE 54280,F(1)/256:POKE 54284,17
120 POKE 54286,F(2) AND 255:POKE 54287,F(2)/256:POKE 54291,17
```

**Feature**: All voices initialized instantly

### Variation 3: Partial Unrolling
```basic
REM SLOW: 20 enemies
100 FOR I=0 TO 19
110 EX(I)=EX(I)+1
120 NEXT I

REM PARTIAL: Process 4 at a time
100 FOR I=0 TO 19 STEP 4
110 EX(I)=EX(I)+1:EX(I+1)=EX(I+1)+1
120 EX(I+2)=EX(I+2)+1:EX(I+3)=EX(I+3)+1
130 NEXT I
```

**Use case**: Balance speed and code size

### Variation 4: Draw Fixed Pattern
```basic
REM SLOW: Loop to draw box
100 FOR I=0 TO 9
110 POKE 1024+I,160
120 POKE 1024+10*40+I,160
130 NEXT I

REM FAST: Unrolled box drawing
100 POKE 1024,160:POKE 1025,160:POKE 1026,160:POKE 1027,160
110 POKE 1028,160:POKE 1029,160:POKE 1030,160:POKE 1031,160
120 POKE 1032,160:POKE 1033,160
130 POKE 1424,160:POKE 1425,160:POKE 1426,160:POKE 1427,160
140 POKE 1428,160:POKE 1429,160:POKE 1430,160:POKE 1431,160
150 POKE 1432,160:POKE 1433,160
```

**Feature**: Fixed graphics drawn fast

### Variation 5: Clear Array Fast
```basic
REM SLOW: Clear 10 elements
100 FOR I=0 TO 9
110 A(I)=0
120 NEXT I

REM FAST: Unrolled clear
100 A(0)=0:A(1)=0:A(2)=0:A(3)=0:A(4)=0
110 A(5)=0:A(6)=0:A(7)=0:A(8)=0:A(9)=0
```

**Use case**: Fast array initialization

### Variation 6: Parallel Operations
```basic
REM Update 5 enemies (unrolled with different operations)
100 REM ENEMY 0
110 EX(0)=EX(0)+EVX(0):EY(0)=EY(0)+EVY(0)
120 IF EX(0)<0 OR EX(0)>255 THEN EVX(0)=-EVX(0)
130 REM ENEMY 1
140 EX(1)=EX(1)+EVX(1):EY(1)=EY(1)+EVY(1)
150 IF EX(1)<0 OR EX(1)>255 THEN EVX(1)=-EVX(1)
160 REM ENEMY 2
170 EX(2)=EX(2)+EVX(2):EY(2)=EY(2)+EVY(2)
180 IF EX(2)<0 OR EX(2)>255 THEN EVX(2)=-EVX(2)
190 REM ... etc
```

**Feature**: Complex updates unrolled

## Common Mistakes

- **Mistake 1**: Unrolling variable-count loops
  - **Symptom**: Code breaks when count changes
  - **Fix**: Only unroll fixed-count loops

- **Mistake 2**: Over-unrolling
  - **Symptom**: Out of memory, hard to maintain
  - **Fix**: Unroll only performance-critical inner loops

- **Mistake 3**: Forgetting to update all iterations
  - **Symptom**: Some elements not processed
  - **Fix**: Count iterations carefully, add REM comments

- **Mistake 4**: Unrolling rarely-executed code
  - **Symptom**: No speed benefit, wasted memory
  - **Fix**: Profile first, unroll only hot paths

- **Mistake 5**: Not testing edge cases
  - **Symptom**: Missing last element
  - **Fix**: Verify all elements processed (add debug PRINT)

## Memory Usage

**Loop version** (10 iterations):
```basic
100 FOR I=0 TO 9
110 POKE 1024+I,32
120 NEXT I
```
- Code size: ~30 bytes
- Execution: 10 iterations × loop overhead

**Unrolled version**:
```basic
100 POKE 1024,32:POKE 1025,32:POKE 1026,32:POKE 1027,32
110 POKE 1028,32:POKE 1029,32:POKE 1030,32:POKE 1031,32
120 POKE 1032,32:POKE 1033,32
```
- Code size: ~120 bytes
- Execution: No loop overhead

**Trade-off**: 4x more code, 2-3x faster execution

## Integration Example

```basic
NEW
10 REM === LOOP UNROLLING DEMO ===
20 GOSUB 9000               : REM init
30 GOSUB 100                : REM test loop
40 GOSUB 200                : REM test unrolled
50 END

100 REM --- LOOP VERSION ---
110 PRINT CHR$(147);"LOOP VERSION"
120 T=TI
130 FOR J=1 TO 100
140 FOR I=0 TO 7
150 POKE 53248+I*2,100+I*20
160 NEXT I
170 NEXT J
180 PRINT "TIME:";TI-T;" JIFFIES"
190 PRINT:PRINT "PRESS KEY"
200 GET K$:IF K$="" THEN 200
210 RETURN

200 REM --- UNROLLED VERSION ---
210 PRINT CHR$(147);"UNROLLED VERSION"
220 T=TI
230 FOR J=1 TO 100
240 POKE 53248,100:POKE 53250,120:POKE 53252,140:POKE 53254,160
250 POKE 53256,180:POKE 53258,200:POKE 53260,220:POKE 53262,240
260 NEXT J
270 PRINT "TIME:";TI-T;" JIFFIES"
280 PRINT:PRINT "~2.5X FASTER!"
290 RETURN

9000 REM === INIT ===
9010 POKE 53269,255          : REM enable all sprites
9020 FOR I=0 TO 7
9030 POKE 2040+I,13          : REM sprite pointers
9040 NEXT I
9050 RETURN
```

## Performance Comparison

### Test: Position 8 Sprites 1000 Times

**With loop**:
```basic
10 T=TI
20 FOR J=1 TO 1000
30 FOR S=0 TO 7:POKE 53248+S*2,100+S*20:NEXT S
40 NEXT J
50 PRINT TI-T  : REM ~180 jiffies (3 seconds)
```

**Unrolled**:
```basic
10 T=TI
20 FOR J=1 TO 1000
30 POKE 53248,100:POKE 53250,120:POKE 53252,140:POKE 53254,160
40 POKE 53256,180:POKE 53258,200:POKE 53260,220:POKE 53262,240
50 NEXT J
60 PRINT TI-T  : REM ~60 jiffies (1 second)
```

**Result**: 3x faster!

## When to Unroll

**Excellent candidates**:
- Sprite positioning (8 sprites)
- SID voice setup (3 voices)
- Fixed-size buffers (screen rows)
- Inner game loop operations
- Drawing fixed UI elements

**Poor candidates**:
- Variable-length arrays
- User-input dependent counts
- Rarely-executed initialization
- Large iteration counts (>20)

## Decision Matrix

| Iterations | Executed | Unroll? | Why |
|------------|----------|---------|-----|
| 2-5 | Every frame | YES | Big win |
| 6-10 | Every frame | YES | Good win |
| 11-20 | Every frame | MAYBE | Consider partial |
| 20+ | Every frame | NO | Too much code |
| Any | Once at start | NO | Not worth it |
| Variable | Any | NO | Must use loop |

## Best Practices

1. **Profile first**:
   ```basic
   T=TI
   REM ... code to test ...
   PRINT TI-T
   ```

2. **Comment each iteration**:
   ```basic
   100 POKE 53248,X(0)  : REM SPRITE 0
   110 POKE 53250,X(1)  : REM SPRITE 1
   ```

3. **Use address tables with unrolling**:
   ```basic
   100 POKE SPX(0),X(0)  : REM clearer than 53248
   ```

4. **Consider partial unrolling**:
   ```basic
   FOR I=0 TO 19 STEP 4
     A(I)=0:A(I+1)=0:A(I+2)=0:A(I+3)=0
   NEXT I
   ```

5. **Keep the loop version commented**:
   ```basic
   REM 100 FOR I=0 TO 7:POKE 53248+I*2,X:NEXT I
   100 POKE 53248,X:POKE 53250,X:POKE 53252,X:POKE 53254,X
   110 POKE 53256,X:POKE 53258,X:POKE 53260,X:POKE 53262,X
   ```

## See Also

- [Address Tables](address-tables.md) - Combine with unrolling for maximum speed
- [Timing Measurement](timing-measurement.md) - Measure performance gains
- [Basic Game Loop](../game-loops/basic-game-loop.md) - Where to apply unrolling
- **Lessons**: 55 (Optimising for Speed), 58 (Squeezing Speed)
- **Vault**: [Performance Tips](/vault/performance-tips), [Code Optimization](/vault/optimization)

## Quick Reference Card

```basic
REM Loop unrolling pattern

REM BEFORE: Slow loop
FOR I=0 TO 7
  POKE 53248+I*2,X(I)
NEXT I

REM AFTER: Unrolled (2-3x faster)
POKE 53248,X(0):POKE 53250,X(1)
POKE 53252,X(2):POKE 53254,X(3)
POKE 53256,X(4):POKE 53258,X(5)
POKE 53260,X(6):POKE 53262,X(7)

REM When to unroll:
- Fixed iteration count
- Performance-critical code
- 2-10 iterations (sweet spot)
- Executed every frame

REM When NOT to unroll:
- Variable counts
- Large loops (>20)
- Rarely executed
- Memory is tight

REM Trade-off:
- Speed: 2-3x faster
- Cost: 3-4x more code
- Rule: Unroll hot inner loops only!
```

---

**Status**: Phase 3 Pattern
**Last Updated**: 2025-01-15
**Source**: Code Like It's 198x - C64 BASIC Course
