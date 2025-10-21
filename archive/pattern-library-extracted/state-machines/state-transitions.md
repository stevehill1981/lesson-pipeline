# State Transitions

**Category**: State Machines
**Difficulty**: Intermediate
**Appears in**: Lessons 41, 48, 56
**Prerequisites**: [Basic State Machine](basic-state-machine.md)

## Overview

Manage clean transitions between game states by resetting variables, initializing state-specific data, and avoiding stale information from previous modes. Proper transitions are what separate professional games from buggy prototypes.

## The Pattern

```basic
REM --- STATE TRANSITION PATTERN ---
1000 REM === TITLE STATE ===
1010 IF KEY$=" " THEN STATE=1:GAMEINIT=0:KEY$=""
1020 RETURN

2000 REM === PLAY STATE ===
2010 IF GAMEINIT=0 THEN GOSUB 2500:GAMEINIT=1
2020 REM ... game logic ...
2030 IF LIVES<=0 THEN STATE=2:GAMEOVER_INIT=0
2040 RETURN

2500 REM --- INITIALIZE PLAY STATE ---
2510 LIVES=3:SCORE=0:LEVEL=1
2520 X=120:Y=120:VX=0:VY=0
2530 TI$="000000"
2540 RETURN

3000 REM === GAME OVER STATE ===
3010 IF GAMEOVER_INIT=0 THEN GOSUB 3500:GAMEOVER_INIT=1
3020 IF KEY$=" " THEN STATE=0
3030 RETURN

3500 REM --- INITIALIZE GAME OVER STATE ---
3510 IF SCORE>HIGHSCORE THEN HIGHSCORE=SCORE
3520 GOSUB 4000  : REM insert into high score table
3530 RETURN
```

## Parameters

| Variable | Type | Purpose | Typical Values |
|----------|------|---------|----------------|
| `STATE` | Integer | Current state | 0-5 |
| `GAMEINIT` | Integer | Play state initialized flag | 0 or 1 |
| `GAMEOVER_INIT` | Integer | Game over initialized flag | 0 or 1 |
| `SAVEDSTATE` | Integer | State backup (for pause) | Previous STATE value |

## How It Works

### Step 1: Trigger Transition
```basic
1010 IF KEY$=" " THEN STATE=1:GAMEINIT=0
```
- Change `STATE` to trigger transition
- Clear initialization flag so new state can set up

### Step 2: Detect First Frame of New State
```basic
2010 IF GAMEINIT=0 THEN GOSUB 2500:GAMEINIT=1
```
- Check if state needs initialization
- Call initializer once
- Set flag to prevent repeated initialization

### Step 3: Initialize State-Specific Data
```basic
2510 LIVES=3:SCORE=0:LEVEL=1
2520 X=120:Y=120:VX=0:VY=0
```
- Reset all variables this state needs
- Prevents stale data from previous run

### Step 4: State Runs Normally
```basic
2020 REM ... game logic ...
```
After initialization, state handler runs every frame

### Step 5: Transition Out When Conditions Met
```basic
2030 IF LIVES<=0 THEN STATE=2:GAMEOVER_INIT=0
```
- Check exit condition
- Set new STATE
- Clear next state's init flag

## Variations

### Variation 1: Simple Transition (No Init Flags)
```basic
1000 REM TITLE
1010 IF KEY$=" " THEN GOSUB 2500:STATE=1
1020 RETURN

2500 REM RESET FOR NEW GAME
2510 LIVES=3:SCORE=0:X=120:Y=120
2520 TI$="000000"
2530 RETURN
```

**Advantage**: Simpler, explicit initialization
**Disadvantage**: Initialization happens in transition, not first frame

### Variation 2: Single Init Flag Pattern
```basic
10 STATE=0:LAST=-1:INIT=0
20 GET K$
30 IF STATE<>LAST THEN INIT=0     : REM clear flag on state change
40 IF INIT=0 THEN GOSUB 500:INIT=1
50 ON STATE+1 GOSUB 1000,2000,3000
60 LAST=STATE
70 GOTO 20

500 REM --- UNIVERSAL INITIALIZER ---
510 IF STATE=0 THEN RETURN        : REM title needs no init
520 IF STATE=1 THEN GOSUB 2500    : REM init play
530 IF STATE=2 THEN GOSUB 3500    : REM init game over
540 RETURN
```

**Advantage**: One flag for all states
**Trade-off**: Requires dispatch to specific initializers

### Variation 3: Inline Transition Reset
```basic
1010 IF KEY$=" " THEN STATE=1:LIVES=3:SCORE=0:TI$="000000"
```

**Use case**: Simple games where initialization is 1-2 lines

### Variation 4: Deferred Initialization
```basic
2000 REM PLAY STATE
2010 IF PHASE=0 THEN GOSUB 2500:PHASE=1:RETURN
2020 IF PHASE=1 THEN GOSUB 2600:PHASE=2:RETURN
2030 REM normal gameplay
2040 RETURN

2500 REM PHASE 0: SETUP
2510 LIVES=3:SCORE=0:PRINT "LOADING..."
2520 RETURN

2600 REM PHASE 1: COUNTDOWN
2610 FOR I=3 TO 1 STEP -1
2620 PRINT "STARTING IN ";I
2630 FOR D=1 TO 60:NEXT D
2640 NEXT I
2650 RETURN
```

**Use case**: Multi-step initialization (loading, countdown, etc.)

### Variation 5: Pause/Resume Pattern
```basic
1000 REM PLAY STATE
1010 IF KEY$="P" THEN SAVEDSTATE=STATE:STATE=3
1020 REM ... game logic ...
1030 RETURN

3000 REM PAUSE STATE
3010 PRINT CHR$(19);"*** PAUSED ***"
3020 IF KEY$="P" THEN STATE=SAVEDSTATE
3030 RETURN
```

**Feature**: Save and restore state without losing data

### Variation 6: Conditional Transitions
```basic
2000 REM PLAY STATE
2010 REM game logic
2020 IF SCORE>=1000 THEN STATE=4:RETURN    : REM win state
2030 IF LIVES<=0 THEN STATE=2:RETURN       : REM lose state
2040 IF KEY$="Q" THEN STATE=0:RETURN       : REM quit to title
2050 RETURN
```

**Pattern**: Multiple exit paths from one state

## Common Mistakes

- **Mistake 1**: Forgetting to clear init flags on transition
  - **Symptom**: New state never initializes
  - **Fix**: Always set `GAMEINIT=0` when changing STATE

- **Mistake 2**: Not resetting critical variables
  - **Symptom**: Second game starts with data from first game
  - **Fix**: Comprehensive reset in initialization routine

- **Mistake 3**: Initializing in wrong place
  - **Symptom**: Variables reset mid-game
  - **Fix**: Only initialize on first frame after transition

- **Mistake 4**: Transition and initialization in same frame
  - **Symptom**: Screen draws before data is ready
  - **Fix**: Check INIT flag before running state logic

- **Mistake 5**: Circular transitions
  - **Symptom**: States ping-pong endlessly
  - **Fix**: Clear input buffer after transition: `KEY$=""`

## Transition Checklist

When transitioning from State A to State B:

1. **Set new STATE value**
   ```basic
   STATE=1
   ```

2. **Clear destination init flag**
   ```basic
   GAMEINIT=0
   ```

3. **Clear input buffer**
   ```basic
   KEY$=""
   ```

4. **Optional: Save data**
   ```basic
   PREVSTATE=STATE
   ```

5. **Exit current handler**
   ```basic
   RETURN
   ```

## Memory Usage

- **Init flags**: ~2 bytes each (GAMEINIT, GAMEOVER_INIT, etc.)
- **Saved state**: ~2 bytes if pause feature used
- **Minimal overhead**: Flags only needed for states with complex setup

## Integration Example

```basic
NEW
10 REM --- TRANSITION DEMO ---
20 STATE=0:LAST=-1:KEY$=""
30 PLAYINIT=0:OVERINIT=0:PAUSESTATE=0
40 LIVES=3:SCORE=0:HIGHSCORE=500

50 REM main loop
60 GET K$:IF K$<>"" THEN KEY$=K$
70 IF STATE<>LAST THEN GOSUB 500
80 ON STATE+1 GOSUB 1000,2000,3000,4000
90 LAST=STATE
100 KEY$=""
110 GOTO 60

500 REM STATE DRAWER
510 IF STATE=0 THEN PRINT CHR$(147);"*** TITLE ***";:PRINT:PRINT "SPACE=START"
520 IF STATE=1 THEN PRINT CHR$(147);"INITIALIZING..."
530 IF STATE=2 THEN PRINT CHR$(147);"GAME OVER"
540 IF STATE=3 THEN PRINT CHR$(147);"*** PAUSED ***"
550 RETURN

1000 REM === TITLE STATE ===
1010 IF KEY$=" " THEN STATE=1:PLAYINIT=0:KEY$="":RETURN
1020 IF KEY$="Q" THEN END
1030 RETURN

2000 REM === PLAY STATE ===
2010 IF PLAYINIT=0 THEN GOSUB 2500:PLAYINIT=1:RETURN
2020 REM game loop
2030 IF KEY$="P" THEN PAUSESTATE=STATE:STATE=3:KEY$="":RETURN
2040 SCORE=SCORE+1
2050 IF KEY$="H" THEN LIVES=LIVES-1
2060 IF LIVES<=0 THEN STATE=2:OVERINIT=0:RETURN
2070 PRINT CHR$(19);"SCORE:";SCORE;" LIVES:";LIVES;"   "
2080 RETURN

2500 REM --- INIT PLAY ---
2510 PRINT "RESETTING GAME..."
2520 LIVES=3:SCORE=0:LEVEL=1
2530 X=120:Y=120:VX=0:VY=0
2540 TI$="000000"
2550 FOR D=1 TO 60:NEXT D
2560 PRINT CHR$(147);"READY!"
2570 RETURN

3000 REM === GAME OVER STATE ===
3010 IF OVERINIT=0 THEN GOSUB 3500:OVERINIT=1
3020 IF KEY$=" " THEN STATE=0:KEY$="":RETURN
3030 IF KEY$="Q" THEN END
3040 RETURN

3500 REM --- INIT GAME OVER ---
3510 IF SCORE>HIGHSCORE THEN HIGHSCORE=SCORE:PRINT "NEW RECORD!"
3520 PRINT "FINAL SCORE:";SCORE
3530 PRINT "BEST:";HIGHSCORE
3540 PRINT:PRINT "SPACE=RETRY  Q=QUIT"
3550 RETURN

4000 REM === PAUSE STATE ===
4010 PRINT "GAME PAUSED - P TO RESUME"
4020 IF KEY$="P" THEN STATE=PAUSESTATE:KEY$="":RETURN
4030 RETURN
```

## Transition Timing

### Immediate Transition
```basic
IF LIVES<=0 THEN STATE=2:RETURN
```
Happens instantly, next frame runs new state

### Delayed Transition
```basic
IF LIVES<=0 THEN DEATHTIMER=60
IF DEATHTIMER>0 THEN DEATHTIMER=DEATHTIMER-1
IF DEATHTIMER=1 THEN STATE=2
```
Waits for animation/effect before transitioning

### Conditional Delay
```basic
IF LIVES<=0 AND EXPLODE_DONE THEN STATE=2
```
Wait for specific event (explosion animation completes)

## State Transition Table

| From | To | Trigger | Reset Variables | Special Actions |
|------|-----|---------|-----------------|-----------------|
| Title (0) | Play (1) | SPACE pressed | LIVES, SCORE, LEVEL, TI$ | Load level data |
| Play (1) | Game Over (2) | LIVES<=0 | None | Check high score |
| Play (1) | Pause (3) | P pressed | None | Save STATE |
| Pause (3) | Play (1) | P pressed | None | Restore STATE |
| Game Over (2) | Title (0) | SPACE pressed | OVERINIT flag | None |
| Any | Title (0) | Q pressed | All flags | Force clean state |

## Best Practices

### 1. Always Clear Input After Transition
```basic
REM Good: Clear so key doesn't carry to next state
IF KEY$=" " THEN STATE=1:KEY$="":RETURN

REM Bad: Space might trigger action in play state
IF KEY$=" " THEN STATE=1:RETURN
```

### 2. One RETURN Per Transition Frame
```basic
REM Good: Exit immediately after transition
IF LIVES<=0 THEN STATE=2:OVERINIT=0:RETURN

REM Bad: Continues executing, may cause issues
IF LIVES<=0 THEN STATE=2:OVERINIT=0
SCORE=SCORE+1  : REM still runs!
```

### 3. Separate Initialization from Logic
```basic
REM Good: Init once, then run normally
2010 IF PLAYINIT=0 THEN GOSUB 2500:PLAYINIT=1:RETURN
2020 REM normal game logic
2030 RETURN

REM Bad: Mixed init and logic
2010 IF PLAYINIT=0 THEN LIVES=3:SCORE=0:PLAYINIT=1
2020 SCORE=SCORE+1
```

### 4. Document State Flow
```basic
10 REM STATE FLOW:
11 REM 0 (TITLE) --> SPACE --> 1 (PLAY)
12 REM 1 (PLAY)  --> LIVES=0 --> 2 (OVER)
13 REM 1 (PLAY)  --> P KEY --> 3 (PAUSE)
14 REM 3 (PAUSE) --> P KEY --> 1 (PLAY)
15 REM 2 (OVER)  --> SPACE --> 0 (TITLE)
```

## See Also

- [Basic State Machine](basic-state-machine.md) - Foundation pattern
- [ON...GOTO Dispatch](on-goto-dispatch.md) - Alternative routing
- **Lessons**: 41 (Finite State Fun), 48 (Cosmic Clash), 56 (Galactic Miner)
- **Vault**: [Game States](/vault/game-states)

## Quick Reference Card

```basic
REM Transition pattern
REM In source state:
IF condition THEN STATE=newstate:INITFLAG=0:KEY$="":RETURN

REM In destination state:
IF INITFLAG=0 THEN GOSUB initializer:INITFLAG=1:RETURN
REM normal state logic
```

## Debugging Transitions

Add transition logging:
```basic
1010 IF KEY$=" " THEN PRINT "TITLE->PLAY":STATE=1:FOR D=1 TO 30:NEXT:KEY$=""
```

Or full trace mode:
```basic
10 TRACE=1
80 IF TRACE AND STATE<>LAST THEN PRINT "TRANSITION: ";LAST;" -> ";STATE:FOR D=1 TO 60:NEXT
```

---

**Status**: Phase 2 Pattern
**Last Updated**: 2025-01-15
**Source**: Code Like It's 198x - C64 BASIC Course
