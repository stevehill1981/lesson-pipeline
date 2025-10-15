# Timing Measurement

**Category**: Performance
**Difficulty**: Intermediate
**Appears in**: Lessons 55, 58
**Prerequisites**: [Basic Game Loop](../game-loops/basic-game-loop.md)

## Overview

Measure code execution time using the C64's built-in jiffy clock (TI) and time-of-day clock (TI$) to identify performance bottlenecks, verify optimizations, and maintain consistent frame rates in games.

## The Pattern

```basic
REM --- BASIC TIMING ---
100 T=TI                    : REM capture start time
110 REM ... code to measure ...
120 ELAPSED=TI-T            : REM calculate elapsed time
130 PRINT "TIME:";ELAPSED;" JIFFIES"
```

## Parameters

| Variable | Type | Purpose | Values |
|----------|------|---------|--------|
| `TI` | Integer | Jiffy clock (60Hz) | 0 to ~1,296,000 (24 hours) |
| `TI$` | String | Time HH:MM:SS | "000000" to "235959" |
| `T` | Integer | Start time | Snapshot of TI |
| `ELAPSED` | Integer | Duration | Jiffies elapsed |

**Jiffy timing**:
- 1 jiffy = 1/60 second (NTSC) or 1/50 second (PAL)
- 60 jiffies = 1 second (NTSC)
- 3600 jiffies = 1 minute

## How It Works

### Step 1: Understand the Jiffy Clock
```basic
PRINT TI
```
- **TI** = jiffies since power-on or reset
- Increments 60 times per second (NTSC)
- Wraps around at ~1.3 million (24 hours)
- Read-only from BASIC

### Step 2: Capture Start Time
```basic
100 T=TI
```
- Store TI value before code executes
- Snapshot at exact moment
- Use integer variable (faster than array)

### Step 3: Run Code to Measure
```basic
110 FOR I=1 TO 1000
120 A=A+1
130 NEXT I
```
- Execute code normally
- TI continues incrementing in background
- Hardware timer, very accurate

### Step 4: Calculate Elapsed Time
```basic
140 ELAPSED=TI-T
150 PRINT "JIFFIES:";ELAPSED
160 PRINT "SECONDS:";ELAPSED/60
```
- Subtract start from current TI
- Result in jiffies
- Divide by 60 for seconds

## Variations

### Variation 1: Frame Timing (Game Loop)
```basic
10 REM MAINTAIN 60 FPS
20 TARGET=1                 : REM 1 jiffy = 60fps
30 FRAME=TI
40 REM
50 REM ... game logic ...
60 REM
70 WAIT=TARGET-(TI-FRAME)
80 IF WAIT>0 THEN FOR I=1 TO WAIT*10:NEXT I
90 GOTO 30
```

**Use case**: Consistent frame rate

### Variation 2: Benchmark Comparison
```basic
10 REM COMPARE TWO METHODS
20 PRINT CHR$(147);"BENCHMARK"
30 PRINT
40 REM METHOD 1
50 PRINT "METHOD 1:"
60 T=TI
70 FOR I=1 TO 1000:A=I*2:NEXT I
80 PRINT "TIME:";TI-T
90 PRINT
100 REM METHOD 2
110 PRINT "METHOD 2:"
120 T=TI
130 FOR I=1 TO 1000:A=I+I:NEXT I
140 PRINT "TIME:";TI-T
150 PRINT:PRINT "WINNER: METHOD 2"
```

**Feature**: Compare optimizations

### Variation 3: Section Profiling
```basic
10 DIM PROF(10)             : REM timing sections
20 PROF(0)=TI               : REM start
30 GOSUB 1000               : REM input
40 PROF(1)=TI-PROF(0)
50 PROF(0)=TI
60 GOSUB 2000               : REM update
70 PROF(2)=TI-PROF(0)
80 PROF(0)=TI
90 GOSUB 3000               : REM draw
100 PROF(3)=TI-PROF(0)
110 REM
120 PRINT "INPUT:";PROF(1)
130 PRINT "UPDATE:";PROF(2)
140 PRINT "DRAW:";PROF(3)
```

**Use case**: Identify bottlenecks

### Variation 4: Time-of-Day Clock
```basic
10 TI$="000000"             : REM reset to midnight
20 PRINT "STARTING..."
30 REM ... long operation ...
40 T$=TI$
50 H=VAL(LEFT$(T$,2))
60 M=VAL(MID$(T$,3,2))
70 S=VAL(RIGHT$(T$,2))
80 PRINT H;"H ";M;"M ";S;"S"
```

**Feature**: Human-readable time

### Variation 5: Performance Warning
```basic
10 TARGET=1                 : REM 60fps = 1 jiffy/frame
20 FRAME=TI
30 REM
40 REM ... game logic ...
50 REM
60 ELAPSED=TI-FRAME
70 IF ELAPSED>TARGET THEN PRINT "SLOW!";ELAPSED
80 GOTO 20
```

**Use case**: Detect frame drops

### Variation 6: Accumulated Timing
```basic
10 TOTAL=0:RUNS=0
20 FOR J=1 TO 100
30 T=TI
40 REM ... code to measure ...
50 TOTAL=TOTAL+(TI-T)
60 RUNS=RUNS+1
70 NEXT J
80 PRINT "AVERAGE:";TOTAL/RUNS;" JIFFIES"
```

**Feature**: Average performance

## Common Mistakes

- **Mistake 1**: TI wraps around at 24 hours
  - **Symptom**: Negative elapsed time after midnight
  - **Fix**: Reset program daily or handle wraparound

- **Mistake 2**: Measuring too-fast code
  - **Symptom**: ELAPSED=0 (code ran in <1 jiffy)
  - **Fix**: Loop 100+ times, divide by iteration count

- **Mistake 3**: Including PRINT in timed section
  - **Symptom**: Timing includes slow screen I/O
  - **Fix**: Time code only, print results after

- **Mistake 4**: Not resetting TI$
  - **Symptom**: Wrong hours/minutes displayed
  - **Fix**: `TI$="000000"` before long operations

- **Mistake 5**: Forgetting NTSC vs PAL
  - **Symptom**: Different timing on different systems
  - **Fix**: Document assumed system, or detect with SYS calls

## Memory Usage

- **TI**: System variable (no memory cost)
- **TI$**: System variable (6 characters)
- **T** temp variable: 2 bytes
- **ELAPSED**: 2 bytes
- **Profile array**: `DIM PROF(10)` = 22 bytes

**Minimal overhead**: Timing adds ~4 bytes + capture time

## Integration Example

```basic
NEW
10 REM === TIMING DEMO ===
20 GOSUB 9000               : REM menu
30 END

9000 REM --- MAIN MENU ---
9010 PRINT CHR$(147);"TIMING TESTS"
9020 PRINT:PRINT "1. LOOP SPEED"
9030 PRINT "2. DRAW SPEED"
9040 PRINT "3. FRAME RATE"
9050 PRINT:INPUT "CHOICE";C$
9060 IF C$="1" THEN GOSUB 100
9070 IF C$="2" THEN GOSUB 200
9080 IF C$="3" THEN GOSUB 300
9090 GOTO 9000

100 REM --- LOOP SPEED TEST ---
110 PRINT CHR$(147);"LOOP SPEED TEST"
120 PRINT:PRINT "EMPTY LOOP:"
130 T=TI
140 FOR I=1 TO 1000:NEXT I
150 PRINT TI-T;" JIFFIES"
160 PRINT:PRINT "WITH ADDITION:"
170 T=TI
180 FOR I=1 TO 1000:A=A+1:NEXT I
190 PRINT TI-T;" JIFFIES"
200 PRINT:PRINT "PRESS KEY"
210 GET K$:IF K$="" THEN 210
220 RETURN

200 REM --- DRAW SPEED TEST ---
210 PRINT CHR$(147);"DRAW SPEED TEST"
220 PRINT:PRINT "DRAWING 100 CHARS..."
230 T=TI
240 FOR I=1 TO 100
250 X=INT(RND(1)*40):Y=INT(RND(1)*25)
260 POKE 1024+Y*40+X,46
270 NEXT I
280 PRINT:PRINT "TIME:";TI-T;" JIFFIES"
290 PRINT "(";(TI-T)/60;"SECONDS)"
300 PRINT:PRINT "PRESS KEY"
310 GET K$:IF K$="" THEN 310
320 RETURN

300 REM --- FRAME RATE TEST ---
310 PRINT CHR$(147);"FRAME RATE TEST"
320 PRINT:PRINT "RUNNING 60 FRAMES..."
330 FRAMES=0:START=TI
340 FRAME=TI
350 REM ... simulate game logic ...
360 FOR I=1 TO 10:NEXT I
370 REM ... end simulation ...
380 FRAMES=FRAMES+1
390 IF FRAMES<60 THEN 340
400 TOTAL=TI-START
410 PRINT:PRINT "TOTAL TIME:";TOTAL
420 PRINT "AVG PER FRAME:";TOTAL/60
430 PRINT "ACTUAL FPS:";3600/TOTAL
440 PRINT:PRINT "PRESS KEY"
450 GET K$:IF K$="" THEN 450
460 RETURN
```

## Timing Best Practices

### 1. Measure Multiple Iterations
```basic
REM BAD: Single run (may be 0!)
T=TI
X=X+1
PRINT TI-T  : REM probably 0

REM GOOD: Multiple runs
T=TI
FOR I=1 TO 1000:X=X+1:NEXT I
PRINT (TI-T)/1000  : REM average per iteration
```

### 2. Isolate Test Code
```basic
REM BAD: Includes overhead
T=TI
PRINT "STARTING"
FOR I=1 TO 100:A=A+1:NEXT I
PRINT "TIME:";TI-T

REM GOOD: Pure measurement
T=TI
FOR I=1 TO 100:A=A+1:NEXT I
ELAPSED=TI-T
PRINT "TIME:";ELAPSED
```

### 3. Warm Up Before Timing
```basic
REM Run once to cache variables
FOR I=1 TO 10:A=A+1:NEXT I

REM Now measure
T=TI
FOR I=1 TO 1000:A=A+1:NEXT I
PRINT TI-T
```

### 4. Use Consistent Conditions
```basic
REM Document system state
PRINT "C64 NTSC (60 HZ)"
PRINT "NO BACKGROUND TASKS"
T=TI
REM ... measurement ...
```

## Frame Rate Targets

| Target FPS | Jiffies/Frame | Milliseconds | Use Case |
|------------|---------------|--------------|----------|
| 60 FPS | 1 | 16.67ms | Smooth action |
| 30 FPS | 2 | 33.33ms | Standard games |
| 20 FPS | 3 | 50ms | Complex games |
| 15 FPS | 4 | 66.67ms | Strategy games |
| 10 FPS | 6 | 100ms | Minimum playable |

**Budget your frame time**:
```basic
REM For 30fps (2 jiffies per frame):
REM Input: 0.3 jiffies
REM Update: 1.0 jiffies
REM Draw: 0.7 jiffies
REM Total: 2.0 jiffies = 30fps
```

## Profiling Game Loop

```basic
10 REM GAME LOOP WITH PROFILING
20 DIM SEC(5)               : REM section timers
30 GOSUB 9000               : REM init
40 REM
50 REM === MAIN LOOP ===
60 LOOPSTART=TI
70 REM
80 REM INPUT
90 T=TI
100 GOSUB 1000
110 SEC(1)=TI-T
120 REM
130 REM UPDATE
140 T=TI
150 GOSUB 2000
160 SEC(2)=TI-T
170 REM
180 REM DRAW
190 T=TI
200 GOSUB 3000
210 SEC(3)=TI-T
220 REM
230 REM REPORT EVERY 60 FRAMES
240 FRAMES=FRAMES+1
250 IF FRAMES MOD 60=0 THEN GOSUB 8000
260 GOTO 60

8000 REM --- PERFORMANCE REPORT ---
8010 PRINT CHR$(19);        : REM home cursor
8020 PRINT "INPUT: ";SEC(1);" "
8030 PRINT "UPDATE:";SEC(2);" "
8040 PRINT "DRAW:  ";SEC(3);" "
8050 PRINT "TOTAL: ";TI-LOOPSTART;" "
8060 RETURN
```

## See Also

- [Address Tables](address-tables.md) - Optimize what timing reveals
- [Loop Unrolling](loop-unrolling.md) - Speed up measured code
- [Basic Game Loop](../game-loops/basic-game-loop.md) - Where to apply timing
- [Timer Display](../hud/timer-display.md) - User-facing timers
- **Lessons**: 55 (Optimising for Speed), 58 (Squeezing Speed)
- **Vault**: [TI Clock](/vault/ti-clock), [Performance Profiling](/vault/profiling)

## Quick Reference Card

```basic
REM Timing measurement patterns

REM 1. Basic timing
T=TI
REM ... code ...
PRINT "TIME:";TI-T;" JIFFIES"

REM 2. Seconds conversion
ELAPSED=TI-T
PRINT ELAPSED/60;" SECONDS"

REM 3. Frame rate
TARGET=1               : REM 60fps
FRAME=TI
REM ... game logic ...
IF TI-FRAME>TARGET THEN PRINT "SLOW!"

REM 4. Section profiling
T=TI:GOSUB 1000:SEC1=TI-T
T=TI:GOSUB 2000:SEC2=TI-T
PRINT "SEC1:";SEC1;" SEC2:";SEC2

REM 5. Average timing
TOTAL=0
FOR I=1 TO 100
  T=TI:GOSUB 1000:TOTAL=TOTAL+(TI-T)
NEXT I
PRINT "AVG:";TOTAL/100

REM Jiffy facts:
- 1 jiffy = 1/60 second (NTSC)
- 60 jiffies = 1 second
- 3600 jiffies = 1 minute
- TI wraps at ~24 hours
- TI$ = "HHMMSS" format

REM Frame targets:
- 60fps = 1 jiffy
- 30fps = 2 jiffies
- 20fps = 3 jiffies
- 15fps = 4 jiffies
```

---

**Status**: Phase 3 Pattern
**Last Updated**: 2025-01-15
**Source**: Code Like It's 198x - C64 BASIC Course
