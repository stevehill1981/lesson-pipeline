# Lives Display

**Category**: HUD (Heads-Up Display)
**Difficulty**: Beginner
**Appears in**: Lessons 32, 40, 48, 56
**Prerequisites**: [Score Display](score-display.md)

## Overview

Display player lives (health, attempts, continues) as a numeric counter or graphical representation, updating on damage events and triggering game over when depleted.

## The Pattern

```basic
REM --- LIVES DISPLAY ---
10 LIVES=3
20 PRINT CHR$(19);"LIVES:";LIVES
30 REM ... game logic ...
40 REM on collision/damage
50 LIVES=LIVES-1
60 IF LIVES<0 THEN LIVES=0
70 PRINT CHR$(19);"LIVES:";LIVES
80 IF LIVES=0 THEN GOTO 1000  : REM game over
```

## Parameters

| Variable | Type | Purpose | Typical Range |
|----------|------|---------|---------------|
| `LIVES` | Integer | Remaining lives/health | 0-9 (single digit) or 0-99 |
| `MAXLIVES` | Integer | Starting lives | 3-5 typically |
| `DAMAGE` | Integer | Damage per hit | 1 or variable |

## How It Works

### Step 1: Initialize Lives
```basic
LIVES=3
```
Standard starting value (arcade convention: 3 lives)

### Step 2: Display Lives
```basic
PRINT CHR$(19);"LIVES:";LIVES
```
- `CHR$(19)` homes cursor
- Shows current life count

### Step 3: Decrement on Damage
```basic
LIVES=LIVES-1
IF LIVES<0 THEN LIVES=0
```
- Subtract damage amount
- Clamp to zero (prevent negative display)

### Step 4: Check Game Over
```basic
IF LIVES=0 THEN GOTO GAMEOVER
```
or
```basic
IF LIVES<=0 THEN STATE=2  : REM game over state
```

## Variations

### Variation 1: Simple Numeric Counter
```basic
100 LIVES=3
110 PRINT CHR$(19);"LIVES:";LIVES
120 REM game loop
130 IF HIT THEN LIVES=LIVES-1
140 PRINT CHR$(19);"LIVES:";LIVES
150 IF LIVES<=0 THEN GOTO 1000
```

**Standard**: Most common, easiest to implement

### Variation 2: Combined with Score
```basic
100 LIVES=3:SCORE=0
110 PRINT CHR$(19);"SCORE:";RIGHT$("000"+STR$(SCORE),3);"  LIVES:";LIVES
120 REM on hit
130 LIVES=LIVES-1
140 PRINT CHR$(19);"SCORE:";RIGHT$("000"+STR$(SCORE),3);"  LIVES:";LIVES
```

**Advantage**: All HUD elements update together

### Variation 3: Hearts/Icons Display
```basic
100 LIVES=3
110 HEARTS$=CHR$(83)  : REM heart character
120 PRINT CHR$(19);"LIVES:";
130 FOR I=1 TO LIVES:PRINT HEARTS$;:NEXT I
140 PRINT "   "  : REM clear old hearts
```

**Visual**: Graphical representation (♥♥♥)

### Variation 4: Variable Damage
```basic
100 LIVES=5
110 REM different damage amounts
120 IF ENEMY_TYPE=1 THEN DAMAGE=1
130 IF ENEMY_TYPE=2 THEN DAMAGE=2
140 LIVES=LIVES-DAMAGE
150 IF LIVES<0 THEN LIVES=0
160 PRINT CHR$(19);"LIVES:";LIVES
```

**Use case**: Different hazards deal different damage

### Variation 5: Lives as Health Bar
```basic
100 MAXLIVES=10:LIVES=MAXLIVES
110 PRINT CHR$(19);"HEALTH:[";
120 FILLED=INT(LIVES*10/MAXLIVES)
130 FOR I=1 TO 10
140 IF I<=FILLED THEN PRINT CHR$(160); ELSE PRINT " ";
150 NEXT I
160 PRINT "]"
```

**Visual**: Progress bar [██████    ]

### Variation 6: Invincibility Frames
```basic
100 LIVES=3:INVINCIBLE=0
110 REM on hit
120 IF INVINCIBLE>0 THEN GOTO 200  : REM can't take damage
130 LIVES=LIVES-1:INVINCIBLE=60     : REM 1 second immunity
140 PRINT CHR$(19);"LIVES:";LIVES
200 REM update
210 IF INVINCIBLE>0 THEN INVINCIBLE=INVINCIBLE-1
```

**Feature**: Brief immunity after taking damage

## Common Mistakes

- **Mistake 1**: Allowing negative lives
  - **Symptom**: Lives display shows -1, -2, etc.
  - **Fix**: Always clamp: `IF LIVES<0 THEN LIVES=0`

- **Mistake 2**: Not checking game over immediately
  - **Symptom**: Player continues playing at 0 lives
  - **Fix**: Check `IF LIVES<=0` right after decrementing

- **Mistake 3**: Checking LIVES=0 instead of LIVES<=0
  - **Symptom**: Multi-damage hit can skip game over (3→0 works, 3→-1 doesn't)
  - **Fix**: Use `IF LIVES<=0` not `IF LIVES=0`

- **Mistake 4**: Not updating HUD after damage
  - **Symptom**: Lives counter doesn't reflect damage
  - **Fix**: Update HUD immediately after LIVES=LIVES-1

- **Mistake 5**: Forgetting to reset lives on new game
  - **Symptom**: New game starts with 0 lives
  - **Fix**: Reset `LIVES=3` when entering play state

## Memory Usage

- **Variables**: LIVES, MAXLIVES (~4 bytes)
- **Optional**: INVINCIBLE, DAMAGE (~4 bytes)
- **Screen**: Single digit or short string

## Performance Tips

1. **Only update on change**:
   ```basic
   REM Good: Update when lives change
   IF LIVES<>OLDLIVES THEN GOSUB UPDATE_HUD:OLDLIVES=LIVES

   REM Wasteful: Every frame
   GOSUB UPDATE_HUD
   ```

2. **Combine damage and update**:
   ```basic
   REM Efficient: One subroutine
   2000 REM TAKE DAMAGE
   2010 LIVES=LIVES-DAMAGE
   2020 IF LIVES<0 THEN LIVES=0
   2030 GOSUB UPDATE_HUD
   2040 IF LIVES<=0 THEN STATE=2
   2050 RETURN
   ```

3. **Cache invincibility check**:
   ```basic
   REM Fast: Single check
   IF INVINCIBLE=0 AND HIT THEN GOSUB TAKE_DAMAGE
   ```

## Integration Example

```basic
NEW
10 REM --- LIVES DISPLAY DEMO ---
20 PRINT CHR$(147)
30 LIVES=3:MAXLIVES=3:SCORE=0:INVINCIBLE=0

40 REM instructions
50 GOSUB 1000  : REM draw HUD
60 PRINT:PRINT "CONTROLS:"
70 PRINT "H = TAKE 1 DAMAGE"
80 PRINT "B = TAKE 2 DAMAGE"
90 PRINT "L = GAIN 1 LIFE"
100 PRINT "Q = QUIT"
110 PRINT:PRINT "INVINCIBILITY: 1 SEC AFTER HIT"

120 REM main loop
130 GOSUB 1000  : REM update HUD
140 IF INVINCIBLE>0 THEN INVINCIBLE=INVINCIBLE-1
150 GET K$
160 IF K$="" THEN GOTO 130
170 IF K$="H" THEN GOSUB 2000  : REM damage 1
180 IF K$="B" THEN GOSUB 2100  : REM damage 2
190 IF K$="L" THEN GOSUB 2200  : REM gain life
200 IF K$="Q" THEN GOTO 300
210 IF LIVES<=0 THEN GOTO 400
220 GOTO 130

1000 REM --- HUD UPDATE ---
1010 PRINT CHR$(19);"SCORE:";RIGHT$("000"+STR$(SCORE),3);
1020 PRINT "  LIVES:";LIVES;"  ";
1030 IF INVINCIBLE>0 THEN PRINT "[SAFE]    "; ELSE PRINT "          ";
1040 RETURN

2000 REM --- TAKE 1 DAMAGE ---
2010 IF INVINCIBLE>0 THEN RETURN  : REM immune
2020 LIVES=LIVES-1
2030 IF LIVES<0 THEN LIVES=0
2040 INVINCIBLE=60  : REM 1 second immunity
2050 RETURN

2100 REM --- TAKE 2 DAMAGE ---
2110 IF INVINCIBLE>0 THEN RETURN
2120 LIVES=LIVES-2
2130 IF LIVES<0 THEN LIVES=0
2140 INVINCIBLE=60
2150 RETURN

2200 REM --- GAIN LIFE ---
2210 IF LIVES<MAXLIVES THEN LIVES=LIVES+1
2220 RETURN

300 REM --- QUIT ---
310 PRINT CHR$(147);"EXITED WITH ";LIVES;" LIVES"
320 END

400 REM --- GAME OVER ---
410 PRINT CHR$(147);"GAME OVER!"
420 PRINT:PRINT "FINAL SCORE: ";SCORE
430 END
```

## Lives Display Formats

| Format | Code | Example |
|--------|------|---------|
| Simple number | `PRINT "LIVES:";LIVES` | LIVES:3 |
| Padded number | `PRINT "LIVES:";RIGHT$("00"+STR$(LIVES),2)` | LIVES:03 |
| Hearts | `FOR I=1 TO LIVES:PRINT CHR$(83);:NEXT` | ♥♥♥ |
| Dots | `FOR I=1 TO LIVES:PRINT ".";:NEXT` | ... |
| Health bar | `FOR I=1 TO 10:IF I<=LIVES THEN PRINT "#"; ELSE PRINT "-";:NEXT` | ###------- |

## Integration with Collision System

```basic
2000 REM COLLISION CHECK
2010 C=PEEK(53279)  : REM clear collision register
2020 HIT=PEEK(53279)
2030 IF HIT=0 THEN RETURN
2040 REM process collision
2050 IF INVINCIBLE>0 THEN RETURN  : REM can't take damage
2060 LIVES=LIVES-1
2070 IF LIVES<0 THEN LIVES=0
2080 INVINCIBLE=60
2090 GOSUB 3000  : REM update HUD
2100 IF LIVES<=0 THEN STATE=2  : REM game over
2110 RETURN
```

## Power-Up: Extra Life

```basic
2000 REM PICKUP EXTRA LIFE
2010 IF TILE$="L" THEN GOSUB 2100
2020 RETURN

2100 REM GRANT EXTRA LIFE
2110 IF LIVES<MAXLIVES THEN LIVES=LIVES+1
2120 SCORE=SCORE+100  : REM bonus points too
2130 GOSUB 3000  : REM update HUD
2140 REM play sound
2150 POKE 54296,15:POKE 54273,20:POKE 54272,100
2160 FOR D=1 TO 10:NEXT D
2170 POKE 54273,0
2180 RETURN
```

## Damage Feedback

### Visual Feedback
```basic
2000 REM TAKE DAMAGE
2010 LIVES=LIVES-1
2020 IF LIVES<0 THEN LIVES=0
2030 REM flash screen
2040 FOR I=1 TO 3
2050 POKE 53280,2  : REM red border
2060 FOR D=1 TO 5:NEXT D
2070 POKE 53280,0  : REM black border
2080 FOR D=1 TO 5:NEXT D
2090 NEXT I
2100 GOSUB UPDATE_HUD
2110 RETURN
```

### Audio Feedback
```basic
2000 REM DAMAGE SOUND
2010 POKE 54296,15       : REM volume max
2020 POKE 54277,0        : REM attack
2030 POKE 54278,240      : REM decay
2040 POKE 54273,30       : REM frequency high
2050 POKE 54272,0        : REM frequency low
2060 FOR D=1 TO 20:NEXT D
2070 POKE 54273,0        : REM silence
2080 RETURN
```

## See Also

- [Score Display](score-display.md) - Displaying player score
- [Timer Display](timer-display.md) - Countdown timers
- [Sprite Collision](../sprites/sprite-collision.md) - Detecting damage events
- **Lessons**: 32 (Circuit Run), 48 (Cosmic Clash), 56 (Galactic Miner)
- **Vault**: [HUD Design](/vault/hud)

## Quick Reference Card

```basic
REM Lives display pattern
LIVES=3                                    : REM initialize
PRINT CHR$(19);"LIVES:";LIVES             : REM display

REM Take damage
LIVES=LIVES-1
IF LIVES<0 THEN LIVES=0
PRINT CHR$(19);"LIVES:";LIVES
IF LIVES<=0 THEN GOTO GAMEOVER            : REM check game over

REM Invincibility frames
IF INVINCIBLE=0 AND HIT THEN LIVES=LIVES-1:INVINCIBLE=60
IF INVINCIBLE>0 THEN INVINCIBLE=INVINCIBLE-1
```

## Game Over Conditions

```basic
REM Immediate game over
IF LIVES<=0 THEN STATE=2

REM Delayed game over (animation)
IF LIVES<=0 THEN GAMEOVER_TIMER=120
IF GAMEOVER_TIMER>0 THEN GAMEOVER_TIMER=GAMEOVER_TIMER-1
IF GAMEOVER_TIMER=1 THEN STATE=2

REM Game over with continue
IF LIVES<=0 AND CONTINUES>0 THEN GOSUB CONTINUE_SCREEN
IF LIVES<=0 AND CONTINUES=0 THEN STATE=2
```

## Best Practices

1. **Always clamp lives to zero**
   - Prevents negative display
   - Keeps game over logic simple

2. **Use invincibility frames**
   - Prevents instant multi-hit deaths
   - Makes game feel fair

3. **Update HUD immediately after damage**
   - Player sees consequences right away
   - No confusion about current state

4. **Combine lives check with state transition**
   - Clean separation of concerns
   - Game over logic in one place

5. **Reset lives on new game**
   - Always restore to MAXLIVES
   - Include in play state initialization

---

**Status**: Phase 2 Pattern
**Last Updated**: 2025-01-15
**Source**: Code Like It's 198x - C64 BASIC Course
