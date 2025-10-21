# Memory Checking

**Category**: Error Handling
**Difficulty**: Advanced
**Appears in**: Lesson 59
**Prerequisites**: [Error Handling](error-handling.md), [Library Initialization](../library/library-initialization.md)

## Overview

Prevent crashes and data corruption by validating memory availability with FRE(), checking array bounds before access, and defensive validation of coordinates and indices throughout game logic to catch bugs before they cause errors.

## The Pattern

```basic
REM --- MEMORY CHECK ---
10 PRINT "FREE:";FRE(0);" BYTES"
20 IF FRE(0)<5000 THEN PRINT "LOW MEMORY!":STOP

REM --- BOUNDS CHECK ---
100 IF X<0 OR X>39 OR Y<0 OR Y>24 THEN RETURN
110 POKE 1024+Y*40+X,CHR        : REM safe!
```

## Parameters

| Function/Variable | Type | Purpose | Values |
|-------------------|------|---------|--------|
| `FRE(0)` | Function | Free BASIC memory bytes | 0-38911 |
| `FRE(dummy)` | Function | Compact strings, return free | Any numeric arg |
| Bounds | Integer | Valid ranges | Screen: 0-39, 0-24 |
| Guard | Boolean | Safety check result | 0=fail, -1=pass |

## How It Works

### Step 1: Check Available Memory
```basic
10 PRINT FRE(0)
```
- Returns free BASIC memory in bytes
- Range: ~38K max (depends on system)
- Decreases with variables, arrays, strings
- FRE(0) doesn't compact, FRE(dummy) does

### Step 2: Validate Before Allocation
```basic
20 NEEDED=1000*2            : REM array size estimate
30 IF FRE(0)<NEEDED THEN PRINT "NOT ENOUGH MEMORY":STOP
40 DIM DATA(1000)
```
- Calculate memory needed
- Check before DIM
- Prevents "OUT OF MEMORY" crash
- Each integer = 2 bytes, string = ~length

### Step 3: Check Bounds
```basic
100 IF Y<0 OR Y>24 THEN RETURN
110 IF X<0 OR X>39 THEN RETURN
120 POKE 1024+Y*40+X,81     : REM safe!
```
- Validate coordinates before use
- Prevents "ILLEGAL QUANTITY" errors
- Return/GOTO instead of crashing

### Step 4: Defensive Array Access
```basic
200 IF I<0 OR I>=MAXENEMIES THEN RETURN
210 EX(I)=EX(I)+1           : REM safe array access
```
- Check index in valid range
- Prevents "BAD SUBSCRIPT" error
- Critical in loops with calculated indices

## Variations

### Variation 1: Memory Budget Check
```basic
10 REM CHECK MEMORY BUDGET
20 NEEDED=0
30 NEEDED=NEEDED+100*2      : REM enemy arrays
40 NEEDED=NEEDED+8*2        : REM sprite arrays
50 NEEDED=NEEDED+25*2       : REM screen table
60 NEEDED=NEEDED+2000       : REM string buffer
70 PRINT "NEED:";NEEDED;" HAVE:";FRE(0)
80 IF FRE(0)<NEEDED THEN PRINT "INSUFFICIENT":STOP
90 PRINT "OK TO ALLOCATE"
```

**Use case**: Pre-flight memory check

### Variation 2: Screen Coordinate Validator
```basic
1000 REM --- VALIDATE SCREEN POS ---
1010 REM Input: X, Y
1020 REM Output: OK (0=fail, -1=pass)
1030 OK=0
1040 IF X<0 OR X>39 THEN RETURN
1050 IF Y<0 OR Y>24 THEN RETURN
1060 OK=-1
1070 RETURN

100 REM USE VALIDATOR
110 X=PX:Y=PY
120 GOSUB 1000
130 IF NOT OK THEN GOTO 200
140 POKE 1024+Y*40+X,81
```

**Feature**: Reusable validation routine

### Variation 3: Safe Array Access Wrapper
```basic
1000 REM --- SAFE ARRAY GET ---
1010 REM Input: I (index), A() (array), MAX (size)
1020 REM Output: VAL (value or 0)
1030 VAL=0
1040 IF I<0 OR I>=MAX THEN RETURN
1050 VAL=A(I)
1060 RETURN

100 REM USE WRAPPER
110 I=5:MAX=10
120 GOSUB 1000              : REM get A(I)
130 PRINT "VALUE:";VAL
```

**Use case**: Defensive array reads

### Variation 4: Memory Monitor
```basic
10 DIM MEMLOG(100)
20 LOGIDX=0
30 GOSUB 9000               : REM log initial
40 REM
50 REM ... program allocates memory ...
60 GOSUB 9000               : REM log again
70 REM ... more allocations ...
80 GOSUB 9000               : REM log again
90 GOSUB 9100               : REM show report
100 END

9000 REM LOG MEMORY
9010 IF LOGIDX>=100 THEN RETURN
9020 MEMLOG(LOGIDX)=FRE(0)
9030 LOGIDX=LOGIDX+1
9040 RETURN

9100 REM MEMORY REPORT
9110 PRINT "MEMORY LOG:"
9120 FOR I=0 TO LOGIDX-1
9130 PRINT I;": ";MEMLOG(I);" BYTES"
9140 IF I>0 THEN PRINT "  DELTA: ";MEMLOG(I)-MEMLOG(I-1)
9150 NEXT I
9160 RETURN
```

**Feature**: Track memory usage

### Variation 5: Sprite Bounds Check
```basic
1000 REM --- VALIDATE SPRITE POS ---
1010 REM Input: SX, SY (sprite position)
1020 REM Output: OK (0=fail, -1=pass)
1030 OK=0
1040 IF SX<0 OR SX>255 THEN RETURN
1050 IF SY<0 OR SY>250 THEN RETURN
1060 OK=-1
1070 RETURN

100 REM MOVE SPRITE
110 SX=SX+VX:SY=SY+VY
120 GOSUB 1000
130 IF OK THEN POKE 53248,SX:POKE 53249,SY
140 IF NOT OK THEN VX=-VX:VY=-VY  : REM bounce
```

**Use case**: Boundary enforcement

### Variation 6: String Memory Check
```basic
10 REM STRINGS CONSUME MEMORY
20 PRINT "FREE:";FRE(0)
30 FOR I=1 TO 100
40 A$=A$+"X"                : REM grow string
50 IF I MOD 10=0 THEN PRINT I;FRE(0)
60 NEXT I
70 PRINT
80 PRINT "COMPACTING..."
90 X=FRE(0)                 : REM compact strings
100 PRINT "AFTER:";FRE(0)
```

**Feature**: String garbage collection

## Common Mistakes

- **Mistake 1**: Not checking before POKE
  - **Symptom**: "ILLEGAL QUANTITY ERROR" crashes game
  - **Fix**: Validate X, Y before memory access

- **Mistake 2**: Off-by-one errors
  - **Symptom**: Array index 10 in DIM(10) fails
  - **Fix**: Remember DIM(10) is 0-10 (11 elements)

- **Mistake 3**: Forgetting string memory
  - **Symptom**: OUT OF MEMORY with "plenty" free
  - **Fix**: Strings consume heap, use FRE(0) to compact

- **Mistake 4**: Checking after the fact
  - **Symptom**: Error occurs, then check runs
  - **Fix**: Validate BEFORE risky operation

- **Mistake 5**: Not accounting for overhead
  - **Symptom**: DIM succeeds, program still crashes
  - **Fix**: Leave 2-5KB safety margin for BASIC internals

## Memory Usage

**FRE(0) function**:
- No memory cost (built-in)
- Instant execution
- Safe to call anytime

**Validation routines**:
- Guard code: ~50-100 bytes per check
- Worth it: Prevents crashes

**Safety margin**:
- Reserve 2-5KB for BASIC stack
- Don't allocate last 2000 bytes

## Integration Example

```basic
NEW
10 REM === MEMORY CHECKING DEMO ===
20 GOSUB 9000               : REM memory report
30 GOSUB 100                : REM test allocations
40 END

100 REM --- TEST ALLOCATIONS ---
110 PRINT CHR$(147);"ALLOCATION TEST"
120 PRINT:GOSUB 9000
130 PRINT:PRINT "PRESS KEY"
140 GET K$:IF K$="" THEN 140
150 REM
160 PRINT "ALLOCATING 100-INT ARRAY..."
170 NEEDED=100*2
180 IF FRE(0)<NEEDED+2000 THEN PRINT "NOT ENOUGH":RETURN
190 DIM A(100)
200 PRINT "OK":GOSUB 9000
210 PRINT:PRINT "PRESS KEY"
220 GET K$:IF K$="" THEN 220
230 REM
240 PRINT "ALLOCATING 50-INT ARRAY..."
250 NEEDED=50*2
260 IF FRE(0)<NEEDED+2000 THEN PRINT "NOT ENOUGH":RETURN
270 DIM B(50)
280 PRINT "OK":GOSUB 9000
290 PRINT:PRINT "PRESS KEY"
300 GET K$:IF K$="" THEN 300
310 REM
320 PRINT "ALLOCATING HUGE ARRAY..."
330 NEEDED=10000*2
340 IF FRE(0)<NEEDED+2000 THEN PRINT "NOT ENOUGH - EXPECTED":GOTO 360
350 DIM C(10000)
360 PRINT "OK":GOSUB 9000
370 RETURN

9000 REM === MEMORY REPORT ===
9010 M=FRE(0)
9020 PRINT "FREE: ";M;" BYTES"
9030 PRINT "      ";INT(M/1024);"KB"
9040 IF M<5000 THEN PRINT "      LOW!"
9050 IF M<2000 THEN PRINT "      CRITICAL!"
9060 RETURN
```

## Memory Map

**C64 BASIC memory layout**:
```
$0000-$00FF   Zero page (256 bytes)
$0100-$01FF   Stack (256 bytes)
$0200-$03FF   BASIC/KERNAL work area
$0400-$07FF   Screen memory (1KB)
$0800-$9FFF   BASIC program area (~38KB)
              - Program text
              - Variables
              - Arrays
              - String heap
$A000-$BFFF   BASIC ROM
$C000-$CFFF   RAM (4KB, under ROM)
$D000-$DFFF   I/O (4KB)
$E000-$FFFF   KERNAL ROM
```

**BASIC uses**:
- Program: Line text and tokens
- Variables: Simple variables first
- Arrays: After variables
- Strings: Top of memory, grows down
- Free: Between arrays and strings

**FRE(0) returns free space between arrays and strings**

## Bounds Checking Strategies

### Strategy 1: Early Return
```basic
100 IF X<0 OR X>39 THEN RETURN
110 POKE 1024+X,81
```

### Strategy 2: Clamp Values
```basic
100 IF X<0 THEN X=0
110 IF X>39 THEN X=39
120 POKE 1024+X,81
```

### Strategy 3: Wrap Around
```basic
100 IF X<0 THEN X=X+40
110 IF X>39 THEN X=X-40
120 POKE 1024+X,81
```

### Strategy 4: Validation Function
```basic
100 X=PX:Y=PY:GOSUB 1000
110 IF NOT OK THEN GOTO 200
120 POKE 1024+Y*40+X,81
```

## Best Practices

1. **Check memory at startup**:
   ```basic
   10 IF FRE(0)<10000 THEN PRINT "NEED 10K FREE":STOP
   ```

2. **Validate before every POKE**:
   ```basic
   IF X<0 OR X>39 OR Y<0 OR Y>24 THEN RETURN
   POKE 1024+Y*40+X,CHR
   ```

3. **Reserve safety margin**:
   ```basic
   NEEDED=1000*2+2000  : REM array + 2K safety
   IF FRE(0)<NEEDED THEN PRINT "NO MEMORY"
   ```

4. **Use constants for limits**:
   ```basic
   10 MAXENEMIES=20:MINX=0:MAXX=39:MINY=0:MAXY=24
   100 IF I<0 OR I>=MAXENEMIES THEN RETURN
   110 IF X<MINX OR X>MAXX THEN RETURN
   ```

5. **Document assumptions**:
   ```basic
   1000 REM VALIDATE X,Y
   1010 REM ASSUMES: 0-39, 0-24 SCREEN
   1020 REM RETURNS: OK (-1=valid, 0=invalid)
   ```

## Testing Memory Limits

```basic
10 REM DELIBERATE MEMORY TEST
20 PRINT "FILLING MEMORY..."
30 I=0
40 I=I+1
50 DIM A(100)               : REM will fail eventually
60 PRINT I;"ARRAYS, ";FRE(0);" FREE"
70 GOTO 40
```

**Expected**: OUT OF MEMORY error after ~190 arrays

## Defensive Patterns

| Check | Code | Prevents |
|-------|------|----------|
| Screen X | `IF X<0 OR X>39` | ILLEGAL QUANTITY |
| Screen Y | `IF Y<0 OR Y>24` | ILLEGAL QUANTITY |
| Sprite X | `IF SX<0 OR SX>255` | Sprite off-screen |
| Sprite Y | `IF SY<0 OR SY>250` | Sprite off-screen |
| Array | `IF I<0 OR I>=MAX` | BAD SUBSCRIPT |
| Memory | `IF FRE(0)<NEEDED` | OUT OF MEMORY |
| Division | `IF D=0 THEN RETURN` | DIVISION BY ZERO |

## See Also

- [Error Handling](error-handling.md) - Trap errors when checks fail
- [Address Tables](../performance/address-tables.md) - Safe memory patterns
- [Sprite Movement](../sprites/sprite-movement.md) - Boundary checking example
- **Lesson**: 59 (When BASIC Breaks)
- **Vault**: [Memory Map](/vault/memory-map), [C64 Architecture](/vault/c64-arch)

## Quick Reference Card

```basic
REM Memory checking patterns

REM 1. Check free memory
PRINT "FREE:";FRE(0);" BYTES"
IF FRE(0)<5000 THEN PRINT "LOW!"

REM 2. Check before allocation
NEEDED=1000*2+2000          : REM 2K safety margin
IF FRE(0)<NEEDED THEN PRINT "NOT ENOUGH":STOP
DIM DATA(1000)

REM 3. Validate screen coordinates
IF X<0 OR X>39 OR Y<0 OR Y>24 THEN RETURN
POKE 1024+Y*40+X,CHR

REM 4. Validate array index
IF I<0 OR I>=MAX THEN RETURN
VAL=ARRAY(I)

REM 5. Clamp values
IF X<0 THEN X=0
IF X>39 THEN X=39

REM 6. Wrap around
IF X<0 THEN X=X+40
IF X>39 THEN X=X-40

REM Memory facts:
- FRE(0) = free BASIC memory
- ~38KB max on C64
- Reserve 2-5KB safety margin
- Integer = 2 bytes
- String = length + overhead
- Array bounds: DIM(10) = 0 to 10

REM Always validate:
- Screen coords before POKE
- Array indices before access
- Memory before DIM
- Sprite positions before POKE
- Division denominators
```

---

**Status**: Phase 4 Pattern
**Last Updated**: 2025-01-15
**Source**: Code Like It's 198x - C64 BASIC Course
