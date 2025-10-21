# Score Display

**Category**: HUD (Heads-Up Display)
**Difficulty**: Beginner
**Appears in**: Lessons 29, 32, 40, 48, 56
**Prerequisites**: None (foundational pattern)

## Overview

Display and update player score in a fixed screen position using zero-padded string formatting to prevent flicker and maintain consistent width across all score values.

## The Pattern

```basic
REM --- SCORE DISPLAY ---
10 SCORE=0
20 PRINT CHR$(19);"SCORE:";RIGHT$("000"+STR$(SCORE),3)
30 REM ... game logic ...
40 SCORE=SCORE+10
50 PRINT CHR$(19);"SCORE:";RIGHT$("000"+STR$(SCORE),3)
```

## Parameters

| Variable | Type | Purpose | Typical Range |
|----------|------|---------|---------------|
| `SCORE` | Integer | Player's current score | 0-999 (3 digits) or 0-9999 (4 digits) |
| `CHR$(19)` | String | Cursor home command | Fixed value |
| Padding | String | Zero-padding string | "000" for 3 digits, "0000" for 4 digits |

## How It Works

### Step 1: Cursor Home
```basic
PRINT CHR$(19);
```
- `CHR$(19)` moves cursor to top-left (home position)
- Ensures score always prints in same location
- Semi-colon prevents newline

### Step 2: Label
```basic
"SCORE:"
```
Fixed label so player knows what the number means

### Step 3: Zero-Padding
```basic
RIGHT$("000"+STR$(SCORE),3)
```
- `STR$(SCORE)` converts number to string (adds leading space)
- `"000"+STR$(SCORE)` prepends zeros: "000 42" for SCORE=42
- `RIGHT$(...,3)` takes rightmost 3 characters: "042"
- Result: Always 3 digits (001, 042, 999)

### Step 4: Full Update Line
```basic
PRINT CHR$(19);"SCORE:";RIGHT$("000"+STR$(SCORE),3)
```
Combines all elements in one PRINT statement to avoid flicker

## Variations

### Variation 1: Three-Digit Score (0-999)
```basic
100 SCORE=0
110 PRINT CHR$(19);"SCORE:";RIGHT$("000"+STR$(SCORE),3)
120 REM game loop
130 SCORE=SCORE+10
140 PRINT CHR$(19);"SCORE:";RIGHT$("000"+STR$(SCORE),3)
```

**Standard**: Most common format for simple games

### Variation 2: Four-Digit Score (0-9999)
```basic
100 SCORE=0
110 PRINT CHR$(19);"SCORE:";RIGHT$("0000"+STR$(SCORE),4)
```

**Use case**: Longer games, higher scoring systems

### Variation 3: Five-Digit Score (0-99999)
```basic
100 SCORE=0
110 PRINT CHR$(19);"SCORE:";RIGHT$("00000"+STR$(SCORE),5)
```

**Use case**: Arcade-style games with escalating bonuses

### Variation 4: Combined HUD Line
```basic
100 SCORE=0:LIVES=3
110 PRINT CHR$(19);"SCORE:";RIGHT$("000"+STR$(SCORE),3);"  LIVES:";LIVES
```

**Advantage**: All HUD elements update together, no flicker

### Variation 5: Multiple HUD Lines
```basic
100 SCORE=0:LIVES=3:LEVEL=1
110 PRINT CHR$(19);"SCORE:";RIGHT$("000"+STR$(SCORE),3);"  LEVEL:";LEVEL
120 PRINT "LIVES:";LIVES;"  "
```

**Use case**: Complex HUD with multiple rows

### Variation 6: Right-Aligned Score
```basic
100 SCORE=0
110 PRINT CHR$(19);TAB(30);"SCORE:";RIGHT$("000"+STR$(SCORE),3)
```

**Use case**: Score in top-right corner

## Common Mistakes

- **Mistake 1**: Not using zero-padding
  - **Symptom**: Score jumps around (1, 10, 100 have different widths)
  - **Fix**: Use `RIGHT$("000"+STR$(SCORE),3)` not just `SCORE`

- **Mistake 2**: Forgetting CHR$(19)
  - **Symptom**: Score prints in random locations, screen fills with score lines
  - **Fix**: Always start with `PRINT CHR$(19);`

- **Mistake 3**: Not using semicolon after CHR$(19)
  - **Symptom**: Extra blank line before score
  - **Fix**: `PRINT CHR$(19);` not `PRINT CHR$(19)`

- **Mistake 4**: Wrong padding width
  - **Symptom**: Score overflows (999 becomes 9999, wraps to next line)
  - **Fix**: Match padding to max score: "000" for 0-999, "0000" for 0-9999

- **Mistake 5**: Multiple PRINT statements for HUD
  - **Symptom**: Flicker, tearing between updates
  - **Fix**: Combine all HUD elements in one PRINT

## Memory Usage

- **Variables**: SCORE (~2 bytes for integer)
- **String operations**: Temporary (~6 bytes during RIGHT$ operation)
- **Screen memory**: Fixed position, no additional memory

## Performance Tips

1. **Update only when score changes**:
   ```basic
   REM Good: Conditional update
   IF SCORE<>OLDSCORE THEN PRINT CHR$(19);"SCORE:";RIGHT$("000"+STR$(SCORE),3):OLDSCORE=SCORE

   REM Wasteful: Every frame
   PRINT CHR$(19);"SCORE:";RIGHT$("000"+STR$(SCORE),3)
   ```

2. **Cache formatted string** (for very frequent updates):
   ```basic
   SCOREDISPLAY$=RIGHT$("000"+STR$(SCORE),3)
   PRINT CHR$(19);"SCORE:";SCOREDISPLAY$
   ```

3. **Combine with game loop timing**:
   ```basic
   REM Update HUD once per game tick, not every input poll
   IF TI>=NEXTT THEN GOSUB UPDATE_HUD:NEXTT=NEXTT+3
   ```

## Integration Example

```basic
NEW
10 REM --- SCORE DISPLAY DEMO ---
20 PRINT CHR$(147)
30 SCORE=0:BONUS=10:COMBO=1

40 REM instructions
50 PRINT CHR$(19);"SCORE DISPLAY DEMO"
60 PRINT:PRINT "SPACE = +10  B = BONUS  C = COMBO"
70 PRINT "Q = QUIT"
80 FOR D=1 TO 120:NEXT D

90 REM main loop
100 GOSUB 1000  : REM update HUD
110 GET K$
120 IF K$="" THEN GOTO 100
130 IF K$=" " THEN SCORE=SCORE+10:GOTO 100
140 IF K$="B" THEN SCORE=SCORE+BONUS*10:GOTO 100
150 IF K$="C" THEN COMBO=COMBO+1:SCORE=SCORE+COMBO*5:GOTO 100
160 IF K$="Q" THEN GOTO 200
170 GOTO 100

1000 REM --- HUD UPDATE ---
1010 PRINT CHR$(19);"SCORE:";RIGHT$("00000"+STR$(SCORE),5)
1020 PRINT "BONUS:X";BONUS;"  COMBO:X";COMBO;"  "
1030 PRINT:PRINT "SPACE=+10  B=BONUS  C=COMBO  Q=QUIT"
1040 RETURN

200 REM --- END ---
210 PRINT CHR$(147);"FINAL SCORE: ";SCORE
220 END
```

## Score Formatting Reference

| Padding Pattern | Max Value | Example Output |
|----------------|-----------|----------------|
| `RIGHT$("000"+STR$(SCORE),3)` | 999 | 001, 042, 999 |
| `RIGHT$("0000"+STR$(SCORE),4)` | 9999 | 0001, 0042, 9999 |
| `RIGHT$("00000"+STR$(SCORE),5)` | 99999 | 00001, 00042, 99999 |
| `RIGHT$("000000"+STR$(SCORE),6)` | 999999 | 000001, 999999 |

## Advanced: Comma Separators

For very large scores, add comma separators:

```basic
1000 REM FORMAT SCORE WITH COMMAS
1010 S$=STR$(SCORE)
1020 L=LEN(S$)
1030 IF L<=3 THEN DISPLAY$=S$:GOTO 1080
1040 IF L<=6 THEN DISPLAY$=LEFT$(S$,L-3)+","+RIGHT$(S$,3):GOTO 1080
1050 IF L<=9 THEN DISPLAY$=LEFT$(S$,L-6)+","+MID$(S$,L-5,3)+","+RIGHT$(S$,3)
1080 PRINT CHR$(19);"SCORE:";DISPLAY$
1090 RETURN
```

**Result**: 1000 → "1,000", 50000 → "50,000", 1000000 → "1,000,000"

## Integration with Game Events

### Collision Scoring
```basic
2000 REM COLLISION CHECK
2010 HIT=PEEK(53279)
2020 IF HIT AND 1 THEN SCORE=SCORE+50:GOSUB 3000
2030 RETURN

3000 REM HUD UPDATE
3010 PRINT CHR$(19);"SCORE:";RIGHT$("0000"+STR$(SCORE),4)
3020 RETURN
```

### Timed Bonus
```basic
2000 REM LEVEL COMPLETE
2010 BONUS=TIMELEFT*10
2020 FOR I=1 TO BONUS STEP 10
2030 SCORE=SCORE+10
2040 PRINT CHR$(19);"SCORE:";RIGHT$("0000"+STR$(SCORE),4);"  BONUS:";BONUS-I
2050 FOR D=1 TO 2:NEXT D
2060 NEXT I
2070 RETURN
```

**Effect**: Count-up animation for bonus points

### Combo Multiplier
```basic
1000 REM ENEMY HIT
1010 COMBO=COMBO+1
1020 POINTS=BASE*COMBO
1030 SCORE=SCORE+POINTS
1040 PRINT CHR$(19);"SCORE:";RIGHT$("0000"+STR$(SCORE),4);"  X";COMBO
1050 COMBOTIME=60  : REM reset combo timer
1060 RETURN

2000 REM UPDATE
2010 IF COMBOTIME>0 THEN COMBOTIME=COMBOTIME-1
2020 IF COMBOTIME=0 THEN COMBO=1
2030 RETURN
```

**Feature**: Multiplier that decays over time

## See Also

- [Lives Display](lives-display.md) - Displaying player lives
- [Timer Display](timer-display.md) - Countdown timers
- [Input-Update-Draw](../game-loops/input-update-draw.md) - HUD in draw phase
- **Lessons**: 29 (Score & Timer), 32 (Circuit Run), 48 (Cosmic Clash)
- **Vault**: [HUD Design](/vault/hud)

## Quick Reference Card

```basic
REM Score display pattern
SCORE=0                                    : REM initialize
PRINT CHR$(19);"SCORE:";RIGHT$("000"+STR$(SCORE),3)

REM Common formats
RIGHT$("000"+STR$(SCORE),3)               : REM 000-999
RIGHT$("0000"+STR$(SCORE),4)              : REM 0000-9999
RIGHT$("00000"+STR$(SCORE),5)             : REM 00000-99999

REM Update on scoring event
SCORE=SCORE+points
PRINT CHR$(19);"SCORE:";RIGHT$("000"+STR$(SCORE),3)
```

## HUD Position Reference

```basic
REM Top-left (home)
PRINT CHR$(19);"SCORE:";SCORE

REM Top-right (TAB to column)
PRINT CHR$(19);TAB(30);"SCORE:";SCORE

REM Second line
PRINT CHR$(19)  : REM home
PRINT           : REM down one line
PRINT "SCORE:";SCORE

REM Specific position (using cursor positioning)
PRINT CHR$(19)  : REM home
FOR I=1 TO 5:PRINT:NEXT  : REM down 5 lines
PRINT "SCORE:";SCORE
```

## Best Practices

1. **Always use fixed width**
   - Zero-pad scores to prevent width changes
   - Keeps HUD stable and professional

2. **Update in one place**
   - Centralize HUD updates in a subroutine
   - Easier to modify layout later

3. **Combine HUD elements**
   - Print all HUD info in one PRINT statement
   - Prevents flicker and tearing

4. **Use appropriate padding**
   - Match padding to expected max score
   - Don't over-pad (wastes screen space)

5. **Clear trailing spaces**
   - Add spaces after dynamic-width elements
   - `PRINT "SCORE:";SCORE;"  "` clears old characters

---

**Status**: Phase 2 Pattern
**Last Updated**: 2025-01-15
**Source**: Code Like It's 198x - C64 BASIC Course
