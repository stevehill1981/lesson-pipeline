# Basic State Machine

**Category**: State Machines
**Difficulty**: Intermediate
**Appears in**: Lessons 41, 48, 56
**Prerequisites**: [Basic Game Loop](../game-loops/basic-game-loop.md), [Input-Update-Draw](../game-loops/input-update-draw.md)

## Overview

Use a single numeric variable to control program flow through distinct game modes (title, play, game over) without messy GOTO chains. State machines turn arcade-style progression into clean, maintainable code.

## The Pattern

```basic
REM --- BASIC STATE MACHINE ---
10 STATE=0:LAST=-1               : REM 0=title, 1=play, 2=game over
20 GET K$
30 IF STATE<>LAST THEN GOSUB 500 : REM redraw only when state changes
40 ON STATE+1 GOSUB 1000,2000,3000
50 LAST=STATE
60 GOTO 20

500 REM --- STATE DRAWER ---
510 IF STATE=0 THEN GOSUB 800    : REM draw title
520 IF STATE=1 THEN GOSUB 850    : REM draw play field
530 IF STATE=2 THEN GOSUB 900    : REM draw game over
540 RETURN

800 REM --- TITLE SCREEN ---
810 PRINT CHR$(147);"*** GAME TITLE ***"
820 PRINT:PRINT "SPACE = START  Q = QUIT"
830 RETURN

850 REM --- PLAY SCREEN ---
860 PRINT CHR$(147);"GAME STARTING..."
870 RETURN

900 REM --- GAME OVER SCREEN ---
910 PRINT CHR$(147);"GAME OVER"
920 PRINT "SPACE = RESTART  Q = QUIT"
930 RETURN

1000 REM === TITLE STATE ===
1010 IF K$=" " THEN STATE=1:LIVES=3:SCORE=0
1020 IF K$="Q" THEN END
1030 RETURN

2000 REM === PLAY STATE ===
2010 REM ... game logic ...
2020 IF LIVES<=0 THEN STATE=2
2030 RETURN

3000 REM === GAME OVER STATE ===
3010 IF K$=" " THEN STATE=0      : REM restart
3020 IF K$="Q" THEN END
3030 RETURN
```

## Parameters

| Variable | Type | Purpose | Typical Values |
|----------|------|---------|----------------|
| `STATE` | Integer | Current game mode | 0-5 (varies by game) |
| `LAST` | Integer | Previous state | -1 initially, then tracks STATE |
| `K$` | String | Input buffer | Keyboard character |

## How It Works

### Step 1: Initialize State System
```basic
10 STATE=0:LAST=-1
```
- `STATE=0` starts at title screen
- `LAST=-1` forces first draw (STATE≠LAST)

### Step 2: Main Loop Checks for State Change
```basic
30 IF STATE<>LAST THEN GOSUB 500
```
Only redraw screen when state changes—prevents flicker and wasted cycles.

### Step 3: Dispatch to Current State Handler
```basic
40 ON STATE+1 GOSUB 1000,2000,3000
```
Routes control to appropriate state logic without IF chains.

### Step 4: Update State Tracking
```basic
50 LAST=STATE
```
Record current state so next frame knows if redraw is needed.

### Step 5: State Handlers Modify STATE
```basic
1010 IF K$=" " THEN STATE=1
```
Changing `STATE` triggers transition on next loop iteration.

## Variations

### Variation 1: Three-State Game (Minimal)
```basic
10 STATE=0:LAST=-1:LIVES=3:SCORE=0
20 GET K$
30 IF STATE<>LAST THEN GOSUB 500
40 ON STATE+1 GOSUB 1000,2000,3000
50 LAST=STATE
60 GOTO 20

1000 REM TITLE
1010 IF K$=" " THEN STATE=1
1020 RETURN

2000 REM PLAY
2010 SCORE=SCORE+1
2020 IF SCORE>100 THEN STATE=2
2030 RETURN

3000 REM WIN
3010 IF K$=" " THEN STATE=0:SCORE=0
3020 RETURN
```

**Use case**: Simplest possible state machine for demos

### Variation 2: With Initialization Per State
```basic
10 STATE=0:LAST=-1:INIT=0
20 GET K$
30 IF STATE<>LAST THEN GOSUB 500:INIT=0
40 IF INIT=0 THEN GOSUB 600:INIT=1
50 ON STATE+1 GOSUB 1000,2000,3000
60 LAST=STATE
70 GOTO 20

600 REM --- STATE INITIALIZER ---
610 IF STATE=0 THEN GOTO 640      : REM title needs no init
620 IF STATE=1 THEN GOSUB 800     : REM setup game variables
630 IF STATE=2 THEN GOSUB 850     : REM calculate final score
640 RETURN

800 REM --- INIT PLAY STATE ---
810 LIVES=3:SCORE=0:LEVEL=1
820 X=120:Y=120:VX=0:VY=0
830 RETURN

850 REM --- INIT GAME OVER STATE ---
860 HIGHSCORE=SCORE
870 RETURN
```

**Advantage**: Separates initialization from ongoing logic

### Variation 3: Pause State
```basic
10 STATE=0:LAST=-1:SAVEDSTATE=0
20 GET K$
30 IF K$="P" AND STATE=1 THEN SAVEDSTATE=STATE:STATE=3:K$=""
40 IF STATE<>LAST THEN GOSUB 500
50 ON STATE+1 GOSUB 1000,2000,3000,4000
60 LAST=STATE
70 GOTO 20

4000 REM === PAUSE STATE ===
4010 IF K$="P" THEN STATE=SAVEDSTATE
4020 RETURN
```

**Feature**: Saves play state and returns to it

### Variation 4: Sub-States (Nested)
```basic
2000 REM === PLAY STATE ===
2010 ON PHASE+1 GOSUB 2100,2200,2300
2020 IF LIVES<=0 THEN STATE=2
2030 RETURN

2100 REM PHASE 0: GET READY
2110 TIMER=TIMER-1
2120 IF TIMER<=0 THEN PHASE=1:TIMER=180
2130 RETURN

2200 REM PHASE 1: MAIN GAMEPLAY
2210 GOSUB 5000  : REM player input
2220 GOSUB 6000  : REM update enemies
2230 IF SCORE>=1000 THEN PHASE=2
2240 RETURN

2300 REM PHASE 2: LEVEL COMPLETE
2310 PRINT "LEVEL COMPLETE!";
2320 FOR D=1 TO 100:NEXT D
2330 STATE=0     : REM back to title or next level
2340 RETURN
```

**Use case**: Complex states with internal progression

### Variation 5: Key Buffer Pattern
```basic
10 STATE=0:LAST=-1:KEY$=""
20 GET K$:IF K$<>"" THEN KEY$=K$
30 IF STATE<>LAST THEN GOSUB 500
40 ON STATE+1 GOSUB 1000,2000,3000
50 LAST=STATE
60 KEY$=""                        : REM clear after handling
70 GOTO 20

1000 REM TITLE
1010 IF KEY$=" " THEN STATE=1:KEY$=""
1020 IF KEY$="Q" THEN END
1030 RETURN
```

**Advantage**: Captures input even if GET misses it in one frame

### Variation 6: State Names Array
```basic
10 DIM STATE$(3)
20 STATE$(0)="TITLE":STATE$(1)="PLAY"
30 STATE$(2)="GAME OVER":STATE$(3)="PAUSE"
40 STATE=0:LAST=-1
50 REM ... main loop ...
200 PRINT CHR$(19);"MODE: ";STATE$(STATE)
```

**Use case**: Debugging and HUD display

## Common Mistakes

- **Mistake 1**: Forgetting LAST=-1 initialization
  - **Symptom**: First screen never draws
  - **Fix**: Set `LAST=-1` so `STATE<>LAST` is true first time

- **Mistake 2**: Changing STATE inside state drawer
  - **Symptom**: Infinite redraw loop
  - **Fix**: Only change STATE in state handlers, not drawer

- **Mistake 3**: Not resetting variables on state transition
  - **Symptom**: Stale data from previous game
  - **Fix**: Reset LIVES, SCORE, etc. when entering play state

- **Mistake 4**: Using IF chains instead of ON...GOSUB
  - **Symptom**: Code becomes messy with 5+ states
  - **Fix**: Always use `ON STATE+1 GOSUB` for dispatching

- **Mistake 5**: Drawing every frame regardless of state change
  - **Symptom**: Terrible flicker, wasted cycles
  - **Fix**: Always check `IF STATE<>LAST` before redrawing

## Memory Usage

- **Variables**: STATE, LAST (~4 bytes)
- **Additional**: INIT, SAVEDSTATE if used (~4 bytes)
- **Code**: Minimal overhead (dispatch is fast)

## Performance Tips

1. **Minimize state drawer work**:
   ```basic
   REM Good: Only clear and setup essentials
   510 IF STATE=1 THEN PRINT CHR$(147):"READY":RETURN

   REM Bad: Drawing full screen every transition
   510 IF STATE=1 THEN FOR R=1 TO 100:PRINT R:NEXT
   ```

2. **Cache state-specific data**:
   ```basic
   REM Initialize play state once
   2010 IF PLAYINIT=0 THEN GOSUB 2500:PLAYINIT=1
   ```

3. **Use ON...GOSUB not IF chains**:
   ```basic
   REM Fast: Direct dispatch
   ON STATE+1 GOSUB 1000,2000,3000

   REM Slow: Sequential checks
   IF STATE=0 THEN GOSUB 1000
   IF STATE=1 THEN GOSUB 2000
   IF STATE=2 THEN GOSUB 3000
   ```

## Integration Example

```basic
NEW
10 REM --- COMPLETE STATE MACHINE GAME ---
20 STATE=0:LAST=-1:KEY$=""
30 LIVES=3:SCORE=0:HIGHSCORE=0
40 TI$="000000"
50 REM main loop
60 GET K$:IF K$<>"" THEN KEY$=K$
70 IF STATE<>LAST THEN GOSUB 500
80 ON STATE+1 GOSUB 1000,2000,3000
90 LAST=STATE:KEY$=""
100 GOTO 60

500 REM --- STATE DRAWER ---
510 IF STATE=0 THEN GOSUB 800
520 IF STATE=1 THEN GOSUB 850
530 IF STATE=2 THEN GOSUB 900
540 RETURN

800 REM --- DRAW TITLE ---
810 PRINT CHR$(147)
820 PRINT "*** SPACE PATROL ***";:PRINT
830 PRINT "SPACE = START  H = HIGH SCORE  Q = QUIT"
840 IF HIGHSCORE>0 THEN PRINT:PRINT "BEST: ";HIGHSCORE
850 RETURN

850 REM --- DRAW PLAY FIELD ---
860 PRINT CHR$(147)
870 PRINT "MISSION ACTIVE";:PRINT
880 RETURN

900 REM --- DRAW GAME OVER ---
910 PRINT CHR$(147)
920 PRINT "MISSION FAILED";:PRINT
930 PRINT "YOUR SCORE: ";SCORE
940 IF SCORE>HIGHSCORE THEN HIGHSCORE=SCORE:PRINT "NEW RECORD!"
950 PRINT:PRINT "SPACE = RETRY  Q = QUIT"
960 RETURN

1000 REM === TITLE STATE ===
1010 IF KEY$=" " THEN STATE=1:LIVES=3:SCORE=0:TI$="000000"
1020 IF KEY$="H" THEN GOSUB 4000
1030 IF KEY$="Q" THEN END
1040 RETURN

2000 REM === PLAY STATE ===
2010 REM simple score timer
2020 IF TI>60 THEN SCORE=SCORE+10:TI$="000000"
2030 REM simulate damage
2040 IF KEY$="H" THEN LIVES=LIVES-1
2050 IF KEY$="P" THEN STATE=0      : REM pause = back to title
2060 REM check game over
2070 IF LIVES<=0 THEN STATE=2
2080 REM update HUD
2090 PRINT CHR$(19);"SCORE: ";SCORE;"  LIVES: ";LIVES;"   "
2100 RETURN

3000 REM === GAME OVER STATE ===
3010 IF KEY$=" " THEN STATE=0
3020 IF KEY$="Q" THEN END
3030 RETURN

4000 REM --- SHOW HIGH SCORE ---
4010 PRINT CHR$(147);"HIGH SCORE: ";HIGHSCORE
4020 PRINT:PRINT "PRESS ANY KEY"
4030 GET K$:IF K$="" THEN 4030
4040 GOSUB 800  : REM redraw title
4050 RETURN
```

## State Diagram

```
     TITLE (0)
      /   \
  SPACE    Q
    /       \
   /        END
  v
 PLAY (1)
  |  \
  |   P (pause)
  |    \
  |    TITLE
  |
LIVES=0
  |
  v
GAME OVER (2)
  |  \
SPACE Q
  |    \
  v    END
TITLE
```

## See Also

- [State Transitions](state-transitions.md) - Managing state changes safely
- [ON...GOTO Dispatch](on-goto-dispatch.md) - Alternative dispatch pattern
- [Basic Game Loop](../game-loops/basic-game-loop.md) - Foundation for state machines
- **Lessons**: 41 (Finite State Fun), 48 (Cosmic Clash), 56 (Galactic Miner)
- **Vault**: [Game States](/vault/game-states)

## Quick Reference Card

```basic
REM Basic state machine pattern
STATE=0:LAST=-1                   : REM init (0=title,1=play,2=over)
GET K$
IF STATE<>LAST THEN GOSUB DRAWER  : REM redraw when changed
ON STATE+1 GOSUB S0,S1,S2        : REM dispatch to handlers
LAST=STATE                        : REM track for next frame
GOTO loop
```

## State Handler Checklist

### Each State Handler Should:
- **Read input** - Check K$ for relevant keys
- **Update state** - Advance internal logic
- **Change STATE** - Transition when conditions met
- **RETURN** - Always return to main loop

### Each State Handler Should NOT:
- **Draw screens** - That's the state drawer's job
- **Change LAST** - Main loop handles that
- **Loop forever** - Must return each frame

## Best Practices

1. **One responsibility per state**
   - Title: Wait for start, show instructions
   - Play: Game logic, collisions, scoring
   - Game Over: Show results, wait for restart

2. **Clean transitions**
   ```basic
   REM Good: Reset everything when entering play
   1010 IF KEY$=" " THEN STATE=1:LIVES=3:SCORE=0:TI$="000000"

   REM Bad: Forget to reset, carry over stale data
   1010 IF KEY$=" " THEN STATE=1
   ```

3. **Consistent state numbering**
   ```
   0 = Title/Attract
   1 = Play
   2 = Game Over
   3 = Pause (if needed)
   4+ = Special states (cutscenes, shops, etc.)
   ```

4. **Comment state purposes**
   ```basic
   10 REM STATE: 0=title, 1=play, 2=game over, 3=pause, 4=win
   ```

## Debugging States

Add trace output:
```basic
60 PRINT CHR$(19);TAB(30);"STATE:";STATE;"   "
```

Or toggle debug mode:
```basic
10 DEBUG=0
20 IF K$="*" THEN DEBUG=1-DEBUG:K$=""
30 IF DEBUG THEN PRINT CHR$(19);TAB(20);"S:";STATE;" L:";LAST;"   "
```

## Commercial Game Examples

Many C64 classics used this exact pattern:
- **Bruce Lee** - Title → Play → Win/Lose → Title
- **Impossible Mission** - Title → Play → Search → Puzzle → Win
- **Paradroid** - Title → Play → Transfer → Result → Play

The state machine was the backbone of arcade-style progression.

---

**Status**: Phase 2 Pattern
**Last Updated**: 2025-01-15
**Source**: Code Like It's 198x - C64 BASIC Course
