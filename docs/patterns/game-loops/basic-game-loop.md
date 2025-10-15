# Basic Game Loop

**Category**: Game Loops
**Difficulty**: Beginner
**Appears in**: Lessons 24, 32, 40, 48, 56
**Prerequisites**: [Keyboard Polling](../input/keyboard-polling.md), [Sprite Movement](../sprites/sprite-movement.md)

## Overview

Create a continuous game loop that processes input, updates game state, and draws graphics each frame. This is the fundamental structure that makes games interactive and brings all patterns together.

## The Pattern

```basic
REM --- BASIC GAME LOOP ---
100 REM initialize game
110 X=120:Y=120:SCORE=0:LIVES=3
120 REM main loop
130 GOSUB 1000  : REM input
140 GOSUB 2000  : REM update
150 GOSUB 3000  : REM draw
160 GOTO 130

1000 REM --- INPUT ---
1010 GET K$
1020 IF K$="W" THEN VY=-3
1030 IF K$="S" THEN VY=3
1040 IF K$="A" THEN VX=-3
1050 IF K$="D" THEN VX=3
1060 RETURN

2000 REM --- UPDATE ---
2010 X=X+VX:Y=Y+VY
2020 IF X<24 THEN X=24
2030 IF X>255 THEN X=255
2040 RETURN

3000 REM --- DRAW ---
3010 POKE 53248,X:POKE 53249,Y
3020 FOR D=1 TO 15:NEXT D
3030 RETURN
```

## Parameters

| Variable | Type | Purpose | Typical Values |
|----------|------|---------|----------------|
| `X`, `Y` | Integer | Game state (position, score, etc.) | Game-specific |
| `VX`, `VY` | Integer | Temporary state (velocity) | -8 to +8 |
| `D` | Integer | Delay counter | 1-50 |

## How It Works

### Step 1: Initialize
```basic
100 X=120:Y=120:SCORE=0:LIVES=3
```
Set up initial game state before entering the loop.

### Step 2: Input Phase
```basic
130 GOSUB 1000
```
Read player input (keyboard/joystick). Store state in variables.

### Step 3: Update Phase
```basic
140 GOSUB 2000
```
Apply game logic:
- Move objects
- Check collisions
- Update score
- Check win/lose conditions

### Step 4: Draw Phase
```basic
150 GOSUB 3000
```
Render everything to screen:
- Update sprites
- Draw HUD
- Display messages

### Step 5: Loop
```basic
160 GOTO 130
```
Return to input phase. Repeat forever (or until game over).

## Variations

### Variation 1: Minimal Loop (No Subroutines)
```basic
100 X=120:Y=120
110 REM main loop
120 GET K$
130 IF K$="W" THEN Y=Y-3
140 IF K$="S" THEN Y=Y+3
150 IF K$="A" THEN X=X-3
160 IF K$="D" THEN X=X+3
170 POKE 53248,X:POKE 53249,Y
180 FOR D=1 TO 15:NEXT D
190 GOTO 120
```

**Use case**: Tiny demos, simple tests

### Variation 2: With Frame Timing
```basic
100 GOSUB 9000  : REM init
110 TI$="000000":NEXTT=0:FRAMETIME=3
120 REM main loop
130 IF TI<NEXTT THEN GOTO 120  : REM wait for next frame
140 GOSUB 1000  : REM input
150 GOSUB 2000  : REM update
160 GOSUB 3000  : REM draw
170 NEXTT=NEXTT+FRAMETIME
180 IF NEXTT<TI THEN NEXTT=TI+FRAMETIME  : REM catchup
190 GOTO 120
```

**Advantage**: Consistent frame rate (20 FPS with FRAMETIME=3)

### Variation 3: With Pause
```basic
100 GOSUB 9000  : REM init
110 PAUSE=0
120 REM main loop
130 GOSUB 1000  : REM input (always check for pause key)
140 IF PAUSE THEN GOTO 120  : REM skip update/draw
150 GOSUB 2000  : REM update
160 GOSUB 3000  : REM draw
170 GOTO 120

1000 REM --- INPUT ---
1010 GET K$
1020 IF K$="P" THEN PAUSE=1-PAUSE:RETURN
1030 IF PAUSE THEN RETURN  : REM ignore other input while paused
1040 REM ... normal input ...
1050 RETURN
```

### Variation 4: With Game States
```basic
100 GOSUB 9000  : REM init
110 STATE=0  : REM 0=title, 1=play, 2=game over
120 REM main loop
130 ON STATE+1 GOSUB 1000,2000,3000  : REM dispatch to state
140 GOTO 120

1000 REM --- TITLE STATE ---
1010 GET K$
1020 IF K$=" " THEN STATE=1:GOSUB 5000  : REM start game
1030 RETURN

2000 REM --- PLAY STATE ---
2010 GOSUB 6000  : REM input
2020 GOSUB 7000  : REM update
2030 GOSUB 8000  : REM draw
2040 IF LIVES<=0 THEN STATE=2  : REM game over
2050 RETURN

3000 REM --- GAME OVER STATE ---
3010 GET K$
3020 IF K$=" " THEN STATE=0:GOSUB 5000  : REM back to title
3030 IF K$="Q" THEN END
3040 RETURN
```

### Variation 5: With Delta Time
```basic
100 GOSUB 9000  : REM init
110 TI$="000000":LASTT=0
120 REM main loop
130 NOWT=TI
140 DELTA=NOWT-LASTT
150 LASTT=NOWT
160 GOSUB 1000  : REM input
170 GOSUB 2000  : REM update (uses DELTA)
180 GOSUB 3000  : REM draw
190 GOTO 120

2000 REM --- UPDATE WITH DELTA ---
2010 X=X+VX*DELTA/60  : REM scale by time
2020 Y=Y+VY*DELTA/60
2030 RETURN
```

**Advantage**: Frame-rate independent movement

### Variation 6: Fixed Update, Variable Draw
```basic
100 GOSUB 9000  : REM init
110 TI$="000000":NEXTT=0:UPDATETIME=3
120 REM main loop
130 GOSUB 1000  : REM input (always responsive)
140 IF TI>=NEXTT THEN GOSUB 2000:NEXTT=NEXTT+UPDATETIME  : REM fixed update
150 GOSUB 3000  : REM draw (variable rate)
160 GOTO 120
```

**Advantage**: Consistent physics, smooth rendering

## Common Mistakes

- **Mistake 1**: Forgetting to loop
  - **Symptom**: Program runs once and stops
  - **Fix**: Always `GOTO` back to loop start

- **Mistake 2**: Drawing before updating
  - **Symptom**: Display lags one frame behind input
  - **Fix**: Input → Update → Draw (in that order)

- **Mistake 3**: No delay in loop
  - **Symptom**: Game runs insanely fast
  - **Fix**: Add delay loop or frame timing

- **Mistake 4**: Clearing screen every frame
  - **Symptom**: Terrible flicker
  - **Fix**: Only redraw what changed, or use sprites

- **Mistake 5**: Input blocking the loop
  - **Symptom**: Game freezes waiting for key
  - **Fix**: Use `GET` not `INPUT`

## Memory Usage

- **Loop overhead**: Minimal (~10 bytes for GOTO/GOSUB)
- **Variables**: Game state (varies by game)
- **Stack**: 3 GOSUB levels (safe, ~24 bytes)

## Performance Tips

1. **Minimize work in loop**:
   ```basic
   REM Bad: Complex calculation every frame
   120 X=X+SIN(ANGLE)*SPEED*COS(DIR)

   REM Good: Precalculate
   110 VX=SIN(ANGLE)*SPEED*COS(DIR)
   120 X=X+VX
   ```

2. **Use subroutines for organization**:
   ```basic
   REM Readable, maintainable
   130 GOSUB 1000:GOSUB 2000:GOSUB 3000
   ```

3. **Skip unnecessary updates**:
   ```basic
   140 IF PAUSE OR GAMEOVER THEN GOTO 120
   150 GOSUB 2000  : REM only update if playing
   ```

4. **Cache frequently used values**:
   ```basic
   100 SPR0X=53248:SPR0Y=53249
   3010 POKE SPR0X,X:POKE SPR0Y,Y
   ```

## Integration Example

```basic
NEW
10 REM --- COMPLETE GAME LOOP ---
20 GOSUB 9000  : REM init
30 REM game variables
40 X=120:Y=120:SCORE=0:LIVES=3
50 EX=220:EY=120:EVX=-2
60 TI$="000000":NEXTT=0:FRAMETIME=3
70 REM main loop
80 IF TI<NEXTT THEN GOTO 80  : REM frame timing
90 GOSUB 1000  : REM input
100 GOSUB 2000  : REM update
110 GOSUB 3000  : REM draw
120 NEXTT=NEXTT+FRAMETIME
130 IF NEXTT<TI THEN NEXTT=TI+FRAMETIME
140 GOTO 80

1000 REM --- INPUT ---
1010 GET K$:VX=0:VY=0
1020 IF K$="W" THEN VY=-3
1030 IF K$="S" THEN VY=3
1040 IF K$="A" THEN VX=-3
1050 IF K$="D" THEN VX=3
1060 IF K$="Q" THEN END
1070 RETURN

2000 REM --- UPDATE ---
2010 X=X+VX:Y=Y+VY
2020 IF X<24 THEN X=24
2030 IF X>255 THEN X=255
2040 IF Y<50 THEN Y=50
2050 IF Y>229 THEN Y=229
2060 REM enemy AI
2070 EX=EX+EVX
2080 IF EX<24 OR EX>255 THEN EVX=-EVX
2090 REM collision
2100 C=PEEK(53279)  : REM clear
2110 HIT=PEEK(53279)
2120 IF HIT THEN LIVES=LIVES-1:X=120:Y=120
2130 IF LIVES<=0 THEN PRINT "GAME OVER":END
2140 RETURN

3000 REM --- DRAW ---
3010 POKE 53248,X:POKE 53249,Y
3020 POKE 53250,EX:POKE 53251,EY
3030 PRINT CHR$(19);"SCORE:";SCORE;"  LIVES:";LIVES;"  "
3040 RETURN

9000 REM --- INIT ---
9010 PRINT CHR$(147)
9020 REM setup player sprite
9030 FOR I=832 TO 894:POKE I,255:NEXT I
9040 POKE 2040,13:POKE 53287,7:POKE 53269,1
9050 REM setup enemy sprite
9060 FOR I=896 TO 958:POKE I,170:NEXT I
9070 POKE 2041,14:POKE 53288,2
9080 POKE 53269,3  : REM enable both sprites
9090 RETURN
```

## Frame Timing Explained

### The Problem
Without timing, BASIC runs as fast as possible (inconsistent speed).

### The Solution
Use jiffy clock (`TI`) to limit frame rate:

```basic
110 TI$="000000":NEXTT=0:FRAMETIME=3
120 IF TI<NEXTT THEN GOTO 120  : REM wait
130 REM ... game logic ...
140 NEXTT=NEXTT+FRAMETIME
```

**Frame rates**:
- `FRAMETIME=1`: 60 FPS (too fast for BASIC)
- `FRAMETIME=3`: 20 FPS (smooth)
- `FRAMETIME=5`: 12 FPS (slower paced)

### Catchup Logic
```basic
IF NEXTT<TI THEN NEXTT=TI+FRAMETIME
```
Prevents spiral of death if frame takes too long.

## See Also

- [Input-Update-Draw](input-update-draw.md) - Detailed phase breakdown
- [Frame Timing](frame-timing.md) ⏳ - Advanced timing techniques
- [Keyboard Polling](../input/keyboard-polling.md) - Input phase
- [Sprite Movement](../sprites/sprite-movement.md) - Update phase
- **Lessons**: 24, 32, 40, 48, 56 (All mini-games)
- **Vault**: [Game Loop Architecture](/vault/game-loop)

## Quick Reference Card

```basic
REM Basic game loop structure
100 GOSUB 9000  : REM init
110 REM main loop
120 GOSUB 1000  : REM input
130 GOSUB 2000  : REM update
140 GOSUB 3000  : REM draw
150 GOTO 120
```

## Game Loop Phases

| Phase | Purpose | Example Tasks |
|-------|---------|---------------|
| **Input** | Read controls | GET K$, PEEK joystick, check buttons |
| **Update** | Game logic | Move objects, collisions, scoring, AI |
| **Draw** | Render | POKE sprites, print HUD, update screen |

## Common Game Loop Patterns

### Arcade Style (Fast Action)
```basic
120 GET K$  : REM responsive input
130 GOSUB UPDATE
140 GOSUB DRAW
150 FOR D=1 TO 10:NEXT D  : REM brief delay
160 GOTO 120
```

### Turn-Based (Wait for Input)
```basic
120 GET K$:IF K$="" THEN 120  : REM wait for key
130 GOSUB PROCESS_MOVE
140 GOSUB ENEMY_TURN
150 GOSUB DRAW
160 GOTO 120
```

### Scrolling Game (Timed Updates)
```basic
120 GET K$  : REM always read input
130 IF TI>=NEXTT THEN GOSUB UPDATE:NEXTT=NEXTT+3
140 GOSUB DRAW
150 GOTO 120
```

## Exit Conditions

Always provide a way out:

```basic
1010 IF K$="Q" THEN GOTO 5000  : REM quit
...
5000 REM --- CLEANUP ---
5010 PRINT CHR$(147);"THANKS FOR PLAYING!"
5020 PRINT "FINAL SCORE:";SCORE
5030 END
```

Or use game state:

```basic
140 IF LIVES<=0 OR ESCAPED THEN STATE=2  : REM game over
```

## Debugging Game Loops

Add trace output:

```basic
120 GOSUB 1000:PRINT "I";  : REM input
130 GOSUB 2000:PRINT "U";  : REM update
140 GOSUB 3000:PRINT "D";  : REM draw
150 GOTO 120
```

Output shows loop running: `IUDIUDIUDIUD...`

If it stops, you found the hang!
