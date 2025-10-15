# Timer Display

**Category**: HUD (Heads-Up Display)
**Difficulty**: Beginner
**Appears in**: Lessons 29, 32, 40, 48
**Prerequisites**: [Score Display](score-display.md)

## Overview

Display countdown or count-up timers using the C64's jiffy clock (TI) to create time pressure, bonus scoring, or time-based challenges. One jiffy = 1/60 second.

## The Pattern

```basic
REM --- COUNTDOWN TIMER ---
10 TIMER=600                    : REM 10 seconds (600/60=10)
20 TI$="000000"                 : REM reset jiffy clock
30 SECS=INT((TIMER-TI)/60)     : REM calculate seconds remaining
40 PRINT CHR$(19);"TIME:";RIGHT$("00"+STR$(SECS),2)
50 IF SECS<=0 THEN PRINT "TIME UP!":END
60 GOTO 30
```

## Parameters

| Variable | Type | Purpose | Typical Values |
|----------|------|---------|----------------|
| `TI` | Integer | Jiffy clock (read-only) | 0-5184000 (24hr max) |
| `TI$` | String | Time string for reset | "000000" to reset |
| `TIMER` | Integer | Target time in jiffies | 60-3600 (1-60 seconds) |
| `SECS` | Integer | Seconds remaining/elapsed | Calculated from TI |

## How It Works

### Step 1: Initialize Timer
```basic
TIMER=600                    : REM 10 seconds target
TI$="000000"                 : REM reset clock to zero
```
- `TIMER` is target duration in jiffies (60 jiffies = 1 second)
- `TI$="000000"` resets the system jiffy clock

### Step 2: Calculate Seconds
```basic
SECS=INT((TIMER-TI)/60)
```
- `TI` is current jiffy count (increases automatically)
- `TIMER-TI` gives remaining jiffies
- Divide by 60 to get seconds
- `INT()` removes fractional seconds

### Step 3: Display Timer
```basic
PRINT CHR$(19);"TIME:";RIGHT$("00"+STR$(SECS),2)
```
- Zero-pad to 2 digits (00-99)
- Update in fixed screen position

### Step 4: Check Expiration
```basic
IF SECS<=0 THEN PRINT "TIME UP!"
```
When countdown reaches zero, trigger time-up event

## Variations

### Variation 1: Basic Countdown
```basic
100 TIMER=600:TI$="000000"
110 SECS=INT((TIMER-TI)/60)
120 IF SECS<0 THEN SECS=0
130 PRINT CHR$(19);"TIME:";RIGHT$("00"+STR$(SECS),2)
140 IF SECS<=0 THEN GOTO 1000
150 GOTO 110
```

**Standard**: Simplest countdown pattern

### Variation 2: Count-Up Timer
```basic
100 TI$="000000"
110 SECS=INT(TI/60)
120 PRINT CHR$(19);"TIME:";RIGHT$("00"+STR$(SECS),2)
130 IF SECS>=60 THEN GOTO 1000  : REM time limit
140 GOTO 110
```

**Use case**: Speed runs, survival modes

### Variation 3: Minutes and Seconds
```basic
100 TIMER=3600:TI$="000000"  : REM 60 seconds
110 REMAIN=TIMER-TI
120 MINS=INT(REMAIN/3600)
130 SECS=INT((REMAIN MOD 3600)/60)
140 PRINT CHR$(19);"TIME:";MINS;":";RIGHT$("00"+STR$(SECS),2)
150 IF REMAIN<=0 THEN GOTO 1000
160 GOTO 110
```

**Format**: 1:30, 0:45, 0:00

### Variation 4: Combined HUD
```basic
100 TIMER=600:TI$="000000":SCORE=0:LIVES=3
110 SECS=INT((TIMER-TI)/60)
120 IF SECS<0 THEN SECS=0
130 PRINT CHR$(19);"SCORE:";RIGHT$("000"+STR$(SCORE),3);
140 PRINT "  LIVES:";LIVES;
150 PRINT "  TIME:";RIGHT$("00"+STR$(SECS),2)
160 GOTO 110
```

**Advantage**: All HUD elements together

### Variation 5: Warning Flash
```basic
100 TIMER=600:TI$="000000"
110 SECS=INT((TIMER-TI)/60)
120 IF SECS<0 THEN SECS=0
130 IF SECS<=5 AND (TI MOD 30)<15 THEN PRINT CHR$(19);"TIME:  "
140 IF SECS>5 OR (TI MOD 30)>=15 THEN PRINT CHR$(19);"TIME:";RIGHT$("00"+STR$(SECS),2)
150 IF SECS<=0 THEN GOTO 1000
160 GOTO 110
```

**Feature**: Flash timer when under 5 seconds

### Variation 6: Bonus Timer (Decreasing Score)
```basic
100 TIMER=1800:TI$="000000"  : REM 30 seconds
110 BONUS=TIMER-TI
120 IF BONUS<0 THEN BONUS=0
130 BONUSPTS=INT(BONUS/6)    : REM 10 pts per second
140 PRINT CHR$(19);"BONUS:";BONUSPTS
150 IF LEVEL_DONE THEN SCORE=SCORE+BONUSPTS:GOTO 1000
160 GOTO 110
```

**Use case**: Time bonus that decreases each second

## Common Mistakes

- **Mistake 1**: Not resetting TI$ at start
  - **Symptom**: Timer starts at random value
  - **Fix**: Always `TI$="000000"` when timer starts

- **Mistake 2**: Forgetting INT() in calculation
  - **Symptom**: Fractional seconds (9.5, 8.2)
  - **Fix**: Use `INT((TIMER-TI)/60)`

- **Mistake 3**: Not clamping to zero
  - **Symptom**: Negative seconds displayed
  - **Fix**: `IF SECS<0 THEN SECS=0`

- **Mistake 4**: Using TI directly without division
  - **Symptom**: Timer counts way too fast (jiffies not seconds)
  - **Fix**: Divide by 60: `TI/60`

- **Mistake 5**: TI overflow on long sessions
  - **Symptom**: Timer wraps after ~24 hours
  - **Fix**: Reset TI$ at appropriate intervals or don't rely on absolute TI values

## Memory Usage

- **System**: TI is read-only hardware counter
- **Variables**: TIMER, SECS (~4 bytes)
- **Optional**: MINS for minute display (~2 bytes)

## Performance Tips

1. **Cache calculation**:
   ```basic
   REM Good: Calculate once per frame
   SECS=INT((TIMER-TI)/60)
   PRINT CHR$(19);"TIME:";SECS

   REM Wasteful: Calculate twice
   PRINT CHR$(19);"TIME:";INT((TIMER-TI)/60)
   IF INT((TIMER-TI)/60)<=0 THEN...
   ```

2. **Update with game loop timing**:
   ```basic
   REM Only update HUD at game tick rate
   IF TI>=NEXTT THEN GOSUB UPDATE_HUD:NEXTT=NEXTT+3
   ```

3. **Avoid unnecessary calculations**:
   ```basic
   REM Good: Only calculate if displaying minutes
   IF TIMER>3600 THEN GOSUB DISPLAY_MINS ELSE GOSUB DISPLAY_SECS
   ```

## Integration Example

```basic
NEW
10 REM --- TIMER DISPLAY DEMO ---
20 PRINT CHR$(147)
30 MODE=1:SCORE=0

40 REM instructions
50 PRINT "TIMER DEMO"
60 PRINT:PRINT "1 = 10 SEC COUNTDOWN"
70 PRINT "2 = 30 SEC COUNT-UP"
80 PRINT "3 = 2 MIN COUNTDOWN"
90 PRINT "Q = QUIT"
100 GET K$:IF K$="" THEN 100
110 IF K$="1" THEN MODE=1:GOSUB 1000:GOTO 200
120 IF K$="2" THEN MODE=2:GOSUB 1000:GOTO 300
130 IF K$="3" THEN MODE=3:GOSUB 1000:GOTO 400
140 IF K$="Q" THEN END
150 GOTO 100

200 REM --- 10 SECOND COUNTDOWN ---
210 TIMER=600:TI$="000000"
220 SECS=INT((TIMER-TI)/60)
230 IF SECS<0 THEN SECS=0
240 PRINT CHR$(19);"TIME:";RIGHT$("00"+STR$(SECS),2);"  ";
250 GET K$:IF K$="Q" THEN GOTO 40
260 IF SECS<=0 THEN PRINT:PRINT "TIME UP!":FOR D=1 TO 120:NEXT:GOTO 40
270 GOTO 220

300 REM --- 30 SECOND COUNT-UP ---
310 TI$="000000":MAXTIME=30
320 SECS=INT(TI/60)
330 PRINT CHR$(19);"TIME:";RIGHT$("00"+STR$(SECS),2);" / ";MAXTIME
340 GET K$:IF K$="Q" THEN GOTO 40
350 IF SECS>=MAXTIME THEN PRINT:PRINT "FINISHED!":FOR D=1 TO 120:NEXT:GOTO 40
360 GOTO 320

400 REM --- 2 MINUTE COUNTDOWN ---
410 TIMER=7200:TI$="000000"  : REM 120 seconds
420 REMAIN=TIMER-TI
430 IF REMAIN<0 THEN REMAIN=0
440 MINS=INT(REMAIN/3600)
450 SECS=INT((REMAIN MOD 3600)/60)
460 PRINT CHR$(19);"TIME:";MINS;":";RIGHT$("00"+STR$(SECS),2)
470 GET K$:IF K$="Q" THEN GOTO 40
480 IF REMAIN<=0 THEN PRINT:PRINT "TIME UP!":FOR D=1 TO 120:NEXT:GOTO 40
490 GOTO 420

1000 REM --- CLEAR SCREEN ---
1010 PRINT CHR$(147)
1020 RETURN
```

## Time Conversion Reference

| Duration | Jiffies | Calculation |
|----------|---------|-------------|
| 1 second | 60 | 60 jiffies/sec |
| 5 seconds | 300 | 5 × 60 |
| 10 seconds | 600 | 10 × 60 |
| 30 seconds | 1800 | 30 × 60 |
| 1 minute | 3600 | 60 × 60 |
| 2 minutes | 7200 | 120 × 60 |
| 5 minutes | 18000 | 300 × 60 |

## Integration with Game Loop

### Fixed-Step Loop with Timer
```basic
100 TIMER=600:TI$="000000":NEXTT=0:STEP=3
110 GET K$
120 REM input handling
130 IF TI>=NEXTT THEN GOSUB 2000:NEXTT=NEXTT+STEP
140 GOSUB 3000  : REM update HUD
150 IF SECS<=0 THEN STATE=2
160 GOTO 110

2000 REM FIXED UPDATE
2010 REM game logic
2020 RETURN

3000 REM HUD UPDATE
3010 SECS=INT((TIMER-TI)/60)
3020 IF SECS<0 THEN SECS=0
3030 PRINT CHR$(19);"TIME:";RIGHT$("00"+STR$(SECS),2)
3040 RETURN
```

### Time-Based Scoring
```basic
2000 REM LEVEL COMPLETE
2010 REMAIN=TIMER-TI
2020 IF REMAIN<0 THEN REMAIN=0
2030 BONUS=INT(REMAIN/60)*10  : REM 10 pts per second
2040 SCORE=SCORE+BONUS
2050 PRINT "TIME BONUS:";BONUS
2060 RETURN
```

### Progressive Difficulty
```basic
1000 REM START LEVEL
1010 BASETIME=1800  : REM 30 seconds
1020 REDUCTION=LEVEL*120  : REM -2 sec per level
1030 TIMER=BASETIME-REDUCTION
1040 IF TIMER<600 THEN TIMER=600  : REM minimum 10 sec
1050 TI$="000000"
1060 RETURN
```

## Display Formats

### Seconds Only
```basic
PRINT "TIME:";RIGHT$("00"+STR$(SECS),2)
```
Output: `TIME:42`

### Minutes:Seconds
```basic
MINS=INT(REMAIN/3600)
SECS=INT((REMAIN MOD 3600)/60)
PRINT "TIME:";MINS;":";RIGHT$("00"+STR$(SECS),2)
```
Output: `TIME:1:42`

### With Tenths
```basic
SECS=INT(REMAIN/60)
TENTHS=INT((REMAIN MOD 60)/6)
PRINT "TIME:";SECS;".";TENTHS
```
Output: `TIME:42.5`

## See Also

- [Score Display](score-display.md) - Displaying player score
- [Lives Display](lives-display.md) - Displaying player lives
- [Basic Game Loop](../game-loops/basic-game-loop.md) - Frame timing with TI
- **Lessons**: 29 (Score & Timer), 32 (Circuit Run), 40 (Scroll Runner)
- **Vault**: [System Clock](/vault/system-clock)

## Quick Reference Card

```basic
REM Timer patterns
TI$="000000"                            : REM reset clock
TIMER=600                               : REM 10 seconds target

REM Countdown
SECS=INT((TIMER-TI)/60)
PRINT "TIME:";RIGHT$("00"+STR$(SECS),2)
IF SECS<=0 THEN TIMEOUT

REM Count-up
SECS=INT(TI/60)
PRINT "TIME:";SECS

REM Minutes and seconds
REMAIN=TIMER-TI
MINS=INT(REMAIN/3600)
SECS=INT((REMAIN MOD 3600)/60)
PRINT MINS;":";RIGHT$("00"+STR$(SECS),2)
```

## TI Clock Reference

| Property | Value |
|----------|-------|
| Unit | 1 jiffy = 1/60 second (NTSC) |
| Range | 0 to 5184000 (24 hours) |
| Wraps at | 86400 seconds (24 hours) |
| Read | `TI` (integer) |
| Reset | `TI$="000000"` (string) |
| Format | `TI$` is "HHMMSS" string |

## Best Practices

1. **Always reset TI$ when timer starts**
   - Prevents random starting values
   - Gives consistent timing

2. **Clamp negative values to zero**
   - Prevents confusing negative display
   - Clean timeout condition

3. **Use INT() for whole seconds**
   - Prevents decimal display
   - Consistent with player expectations

4. **Zero-pad timer display**
   - Prevents width changes (9→10)
   - Professional appearance

5. **Add warning for low time**
   - Flash or change color under 10 seconds
   - Creates urgency

---

**Status**: Phase 2 Pattern
**Last Updated**: 2025-01-15
**Source**: Code Like It's 198x - C64 BASIC Course
