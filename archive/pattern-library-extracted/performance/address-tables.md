# Address Tables

**Category**: Performance
**Difficulty**: Advanced
**Appears in**: Lessons 55, 58
**Prerequisites**: [Basic Game Loop](../game-loops/basic-game-loop.md), [READ/DATA Pattern](../data/read-data-pattern.md)

## Overview

Pre-calculate frequently-accessed memory addresses into lookup tables to eliminate slow multiplication and addition during game loops. Essential for smooth screen memory access and sprite positioning in performance-critical BASIC code.

## The Pattern

```basic
REM --- ADDRESS TABLE SETUP ---
10 DIM SC(24)               : REM screen row addresses
20 FOR I=0 TO 24
30 SC(I)=1024+I*40          : REM calculate once
40 NEXT I

REM --- FAST ACCESS ---
100 Y=10:X=15               : REM character position
110 POKE SC(Y)+X,81         : REM instant lookup!
```

## Parameters

| Variable | Type | Purpose | Typical Values |
|----------|------|---------|----------------|
| `SC()` | Integer array | Screen row start addresses | 1024 to 1984 |
| `CO()` | Integer array | Color RAM row addresses | 55296 to 56256 |
| `Y` | Integer | Row coordinate | 0-24 |
| `X` | Integer | Column coordinate | 0-39 |

## How It Works

### Step 1: Calculate Table Once
```basic
10 DIM SC(24)
20 FOR I=0 TO 24:SC(I)=1024+I*40:NEXT I
```
- Pre-calculate all 25 screen row start addresses
- Store in array for instant access
- Happens once during initialization
- Cost: 25 multiplications (one-time)

### Step 2: Fast Lookup During Game Loop
```basic
100 POKE SC(Y)+X,CHR
```
- No multiplication at runtime
- Array lookup + addition only
- 10-20x faster than calculating each time
- Critical for smooth animation

### Step 3: Why It's Fast
**Without table** (slow):
```basic
POKE 1024+Y*40+X,CHR  : REM calculates Y*40 every time
```
- Multiplication every frame
- Integer math in BASIC is slow
- 60 frames/sec × multiplication = lag

**With table** (fast):
```basic
POKE SC(Y)+X,CHR      : REM array lookup only
```
- Pre-calculated value
- Simple array access
- Addition only (fast!)

## Variations

### Variation 1: Screen and Color Tables
```basic
10 REM DUAL TABLES FOR SCREEN+COLOR
20 DIM SC(24),CO(24)
30 FOR I=0 TO 24
40 SC(I)=1024+I*40          : REM screen memory
50 CO(I)=55296+I*40         : REM color RAM
60 NEXT I

100 REM DRAW COLORED CHARACTER
110 Y=10:X=15:CHR=81:COL=5
120 POKE SC(Y)+X,CHR
130 POKE CO(Y)+X,COL
```

**Use case**: Drawing colored text/graphics

### Variation 2: Sprite Position Tables
```basic
10 REM SPRITE X/Y REGISTER ADDRESSES
20 DIM SPX(7),SPY(7)
30 FOR I=0 TO 7
40 SPX(I)=53248+I*2         : REM X registers
50 SPY(I)=53249+I*2         : REM Y registers
60 NEXT I

100 REM POSITION SPRITE
110 S=0:X=100:Y=150
120 POKE SPX(S),X
130 POKE SPY(S),Y
```

**Feature**: Fast sprite positioning

### Variation 3: Frequency Tables (Music)
```basic
10 REM SID NOTE FREQUENCY TABLE
20 DIM FREQ(11)             : REM one octave
30 DATA 268,284,301,319,338,358
40 DATA 379,402,426,451,478,506
50 FOR I=0 TO 11:READ FREQ(I):NEXT I

100 REM PLAY NOTE
110 NOTE=5:OCTAVE=2
120 F=FREQ(NOTE)*OCTAVE
130 POKE 54272,F AND 255   : REM low byte
140 POKE 54273,F/256        : REM high byte
```

**Use case**: Musical note lookup

### Variation 4: Power-of-2 Tables
```basic
10 REM POWERS OF 2 FOR BIT OPERATIONS
20 DIM POW2(7)
30 FOR I=0 TO 7:POW2(I)=2^I:NEXT I
40 DATA 1,2,4,8,16,32,64,128

100 REM CHECK BIT
110 JOY=PEEK(56320)
120 IF JOY AND POW2(4) THEN PRINT "FIRE!"
```

**Feature**: Fast bit testing

### Variation 5: Distance Tables (Collision)
```basic
10 REM PRE-CALCULATED DISTANCES
20 DIM DIST(20,20)          : REM 20x20 grid
30 FOR DY=0 TO 20
40 FOR DX=0 TO 20
50 DIST(DX,DY)=INT(SQR(DX*DX+DY*DY))
60 NEXT DX:NEXT DY

100 REM CHECK DISTANCE
110 DX=ABS(X1-X2):DY=ABS(Y1-Y2)
120 IF DX<=20 AND DY<=20 THEN D=DIST(DX,DY)
130 IF D<10 THEN PRINT "HIT!"
```

**Use case**: Fast collision detection

### Variation 6: Data-Driven Tables
```basic
10 REM LOAD FROM DATA
20 DIM SC(24)
30 FOR I=0 TO 24:READ SC(I):NEXT I
40 DATA 1024,1064,1104,1144,1184,1224
50 DATA 1264,1304,1344,1384,1424,1464
60 DATA 1504,1544,1584,1624,1664,1704
70 DATA 1744,1784,1824,1864,1904,1944,1984
```

**Feature**: Store pre-calculated values

## Common Mistakes

- **Mistake 1**: Forgetting to DIM array
  - **Symptom**: `?OUT OF MEMORY ERROR` or garbage values
  - **Fix**: Always `DIM` before use

- **Mistake 2**: Wrong array size
  - **Symptom**: `?ILLEGAL QUANTITY ERROR`
  - **Fix**: Screen rows = 0-24 (DIM 24), sprites = 0-7 (DIM 7)

- **Mistake 3**: Calculating table inside game loop
  - **Symptom**: Still slow!
  - **Fix**: Calculate once in initialization (lines 1000-2000)

- **Mistake 4**: Not caching intermediate values
  - **Symptom**: Looking up same value repeatedly
  - **Fix**: Store in variable: `A=SC(Y)+X:POKE A,81:POKE A+40,82`

- **Mistake 5**: Overcomplicating tables
  - **Symptom**: Memory full, slow initialization
  - **Fix**: Only pre-calculate truly expensive operations

## Memory Usage

**Screen row table**:
- Array: 25 integers × 2 bytes = 50 bytes
- Calculation time: ~0.1 seconds (one-time)

**Sprite register table**:
- Array: 8 integers × 2 bytes = 16 bytes
- Calculation time: instant

**Frequency table**:
- Array: 12 integers × 2 bytes = 24 bytes
- Calculation time: instant

**Distance table** (20×20):
- Array: 400 integers × 2 bytes = 800 bytes
- Calculation time: ~5 seconds (one-time)

**Trade-off**: Memory for speed (always worth it in game loops)

## Integration Example

```basic
NEW
10 REM === ADDRESS TABLE DEMO ===
20 GOSUB 9000               : REM init tables
30 GOSUB 100                : REM demo fast drawing
40 END

100 REM --- FAST STARFIELD ---
110 PRINT CHR$(147)         : REM clear
120 FOR I=1 TO 100
130 X=INT(RND(1)*40)
140 Y=INT(RND(1)*25)
150 POKE SC(Y)+X,46         : REM instant!
160 POKE CO(Y)+X,1          : REM instant!
170 NEXT I
180 PRINT "DREW 100 STARS"
190 RETURN

9000 REM === INIT TABLES ===
9010 DIM SC(24),CO(24)
9020 REM
9030 REM BUILD SCREEN TABLE
9040 FOR I=0 TO 24
9050 SC(I)=1024+I*40
9060 NEXT I
9070 REM
9080 REM BUILD COLOR TABLE
9090 FOR I=0 TO 24
9100 CO(I)=55296+I*40
9110 NEXT I
9120 RETURN
```

## Performance Comparison

### Without Address Tables
```basic
REM Drawing 100 random characters
10 T=TI
20 FOR I=1 TO 100
30 X=INT(RND(1)*40):Y=INT(RND(1)*25)
40 POKE 1024+Y*40+X,46      : REM calculate each time
50 NEXT I
60 PRINT "TIME:";TI-T       : REM ~120 jiffies (2 seconds)
```

### With Address Tables
```basic
REM Drawing 100 random characters
10 GOSUB 9000:T=TI          : REM init tables first
20 FOR I=1 TO 100
30 X=INT(RND(1)*40):Y=INT(RND(1)*25)
40 POKE SC(Y)+X,46          : REM instant lookup
50 NEXT I
60 PRINT "TIME:";TI-T       : REM ~12 jiffies (0.2 seconds)
```

**Result**: 10x faster!

## When to Use Address Tables

**Good candidates**:
- Screen/color memory access (Y*40 calculation)
- Sprite register access (base + sprite*2)
- Musical note frequencies (expensive to calculate)
- Trigonometry tables (SIN/COS very slow)
- Distance calculations (SQR is slow)

**Not worth it**:
- Simple addition/subtraction
- Values used once or twice
- Tables bigger than 1KB (memory cost)

## Best Practices

1. **Calculate in initialization**:
   ```basic
   1000 REM INIT ROUTINE
   1010 GOSUB 9000  : REM build tables
   ```

2. **Use meaningful names**:
   ```basic
   SC()  = screen rows
   CO()  = color rows
   SPX() = sprite X registers
   ```

3. **Document table size**:
   ```basic
   10 DIM SC(24)  : REM 0-24 rows
   ```

4. **Bounds check when needed**:
   ```basic
   IF Y<0 OR Y>24 THEN RETURN
   A=SC(Y)+X
   ```

5. **Consider DATA for complex tables**:
   ```basic
   10 DIM FREQ(84)  : REM 7 octaves × 12 notes
   20 FOR I=0 TO 83:READ FREQ(I):NEXT I
   30 DATA ...
   ```

## See Also

- [Loop Unrolling](loop-unrolling.md) - Another optimization technique
- [Timing Measurement](timing-measurement.md) - Measuring performance gains
- [Basic Game Loop](../game-loops/basic-game-loop.md) - Where to apply optimization
- **Lessons**: 55 (Optimising for Speed), 58 (Squeezing Speed)
- **Vault**: [C64 Memory Map](/vault/c64-memory-map), [Performance Tips](/vault/performance-tips)

## Quick Reference Card

```basic
REM Address table pattern

REM 1. Initialize (once)
10 DIM SC(24)
20 FOR I=0 TO 24:SC(I)=1024+I*40:NEXT I

REM 2. Use (fast!)
100 POKE SC(Y)+X,CHR

REM Common tables:
SC(24)   = screen rows (1024 + Y*40)
CO(24)   = color rows (55296 + Y*40)
SPX(7)   = sprite X regs (53248 + S*2)
SPY(7)   = sprite Y regs (53249 + S*2)
FREQ(11) = note frequencies
POW2(7)  = powers of 2 (1,2,4,8,16,32,64,128)

REM Speed gain: 10-20x for repeated calculations
REM Memory cost: 2 bytes per entry
REM Rule: If calculated in loop, use table!
```

---

**Status**: Phase 3 Pattern
**Last Updated**: 2025-01-15
**Source**: Code Like It's 198x - C64 BASIC Course
