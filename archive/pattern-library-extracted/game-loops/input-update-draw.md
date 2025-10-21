# Input-Update-Draw Cycle

**Category**: Game Loops
**Difficulty**: Beginner
**Appears in**: Lessons 24, 32, 40, 48, 56
**Prerequisites**: [Basic Game Loop](basic-game-loop.md)

## Overview

Organize game logic into three distinct phases—Input, Update, and Draw—to create clean, maintainable, and bug-free game code. This separation of concerns is the foundation of professional game architecture.

## The Pattern

```basic
REM --- INPUT-UPDATE-DRAW CYCLE ---
100 REM main loop
110 GOSUB 1000  : REM INPUT: read controls
120 GOSUB 2000  : REM UPDATE: apply game logic
130 GOSUB 3000  : REM DRAW: render to screen
140 GOTO 110

1000 REM === INPUT PHASE ===
1010 REM read player controls, store in variables
1020 GET K$:VX=0:VY=0
1030 IF K$="W" THEN VY=-3
1040 IF K$="S" THEN VY=3
1050 RETURN

2000 REM === UPDATE PHASE ===
2010 REM apply velocity, check collisions, update score
2020 X=X+VX:Y=Y+VY
2030 IF X<24 THEN X=24
2040 GOSUB 2100  : REM collision check
2050 RETURN

3000 REM === DRAW PHASE ===
3010 REM write to screen/sprites only
3020 POKE 53248,X:POKE 53249,Y
3030 PRINT CHR$(19);"SCORE:";SCORE
3040 RETURN
```

## The Three Phases

### INPUT Phase (Lines 1000+)

**Purpose**: Read player controls and store intent

**Do**:
- Read keyboard (`GET K$`)
- Read joystick (`PEEK(56320)`)
- Set velocity variables (`VX`, `VY`)
- Detect button presses
- Store input flags (`FIRE=1`)

**Don't**:
- Move sprites/characters
- Update game state
- Draw anything
- Check collisions

**Example**:
```basic
1000 REM --- INPUT ---
1010 GET K$:J=PEEK(56320)
1020 VX=0:VY=0:FIRE=0
1030 IF K$="W" OR (J AND 1)=0 THEN VY=-3
1040 IF K$="S" OR (J AND 2)=0 THEN VY=3
1050 IF K$="A" OR (J AND 4)=0 THEN VX=-3
1060 IF K$="D" OR (J AND 8)=0 THEN VX=3
1070 IF K$=" " OR (J AND 16)=0 THEN FIRE=1
1080 RETURN
```

### UPDATE Phase (Lines 2000+)

**Purpose**: Apply game logic and change state

**Do**:
- Apply velocity to position
- Move enemies (AI)
- Check collisions
- Update score
- Spawn/destroy objects
- Check win/lose conditions
- Update timers

**Don't**:
- Read input (already done)
- POKE sprites
- PRINT to screen
- Use delay loops

**Example**:
```basic
2000 REM --- UPDATE ---
2010 REM player movement
2020 X=X+VX:Y=Y+VY
2030 IF X<24 THEN X=24
2040 IF X>255 THEN X=255
2050 REM enemy AI
2060 EX=EX+EVX
2070 IF EX<24 OR EX>255 THEN EVX=-EVX
2080 REM collision detection
2090 C=PEEK(53279)  : REM clear
2100 HIT=PEEK(53279)
2110 IF HIT THEN GOSUB 2200  : REM handle collision
2120 REM check win condition
2130 IF SCORE>=1000 THEN WIN=1
2140 RETURN

2200 REM --- COLLISION HANDLER ---
2210 LIVES=LIVES-1
2220 X=120:Y=120  : REM respawn
2230 IF LIVES<=0 THEN GAMEOVER=1
2240 RETURN
```

### DRAW Phase (Lines 3000+)

**Purpose**: Render current state to screen

**Do**:
- POKE sprite positions
- PRINT HUD (score, lives, etc.)
- Update screen memory
- POKE colors
- Add delay (frame timing)

**Don't**:
- Change game state
- Process input
- Move objects
- Check collisions

**Example**:
```basic
3000 REM --- DRAW ---
3010 REM update sprite positions
3020 POKE 53248,X:POKE 53249,Y
3030 POKE 53250,EX:POKE 53251,EY
3040 REM draw HUD
3050 PRINT CHR$(19);  : REM home cursor
3060 PRINT "SCORE:";SCORE;"  LIVES:";LIVES;"  "
3070 REM frame delay
3080 FOR D=1 TO 15:NEXT D
3090 RETURN
```

## Why Separate Phases?

### Advantage 1: Clarity
Each phase has one responsibility:
- Input = **what the player wants**
- Update = **what changed**
- Draw = **show the current state**

### Advantage 2: Easier Debugging
```basic
110 GOSUB 1000:PRINT "I";
120 GOSUB 2000:PRINT "U";
130 GOSUB 3000:PRINT "D";
```
If loop stops, you know which phase crashed.

### Advantage 3: Maintainability
Want to add a new enemy? Only touch UPDATE.
Want to change controls? Only touch INPUT.
Want better graphics? Only touch DRAW.

### Advantage 4: Pause is Easy
```basic
110 GOSUB 1000
120 IF PAUSE THEN GOTO 110  : REM skip update/draw
130 GOSUB 2000
140 GOSUB 3000
```

## Common Mistakes

- **Mistake 1**: Moving sprites in INPUT
  - **Symptom**: Hard to track state changes
  - **Fix**: Input sets `VX/VY`, Update applies them

- **Mistake 2**: Reading keyboard in UPDATE
  - **Symptom**: Logic spread across phases
  - **Fix**: All input in INPUT phase

- **Mistake 3**: Checking collisions in DRAW
  - **Symptom**: Display code changes game state
  - **Fix**: Collisions belong in UPDATE

- **Mistake 4**: Drawing before updating
  - **Symptom**: Display lags one frame
  - **Fix**: INPUT → UPDATE → DRAW (always this order)

- **Mistake 5**: Delay loop in UPDATE
  - **Symptom**: Jerky, inconsistent timing
  - **Fix**: Delays belong in DRAW (or frame timing)

## What Goes Where?

| Task | Phase | Why |
|------|-------|-----|
| `GET K$` | Input | Reading controls |
| `VX=-3` | Input | Storing player intent |
| `X=X+VX` | Update | Applying velocity |
| `IF X<24 THEN X=24` | Update | Game logic (clamping) |
| `HIT=PEEK(53279)` | Update | Collision check |
| `LIVES=LIVES-1` | Update | Changing state |
| `POKE 53248,X` | Draw | Rendering sprite |
| `PRINT "SCORE:"` | Draw | Displaying HUD |
| `FOR D=1 TO 15:NEXT` | Draw | Frame timing |

## Integration Example

```basic
NEW
10 REM --- INPUT-UPDATE-DRAW DEMO ---
20 GOSUB 9000  : REM init
30 X=120:Y=120:SCORE=0:LIVES=3:GAMEOVER=0
40 REM main loop
50 IF GAMEOVER THEN GOTO 500
60 GOSUB 1000  : REM input
70 GOSUB 2000  : REM update
80 GOSUB 3000  : REM draw
90 GOTO 50

1000 REM === INPUT PHASE ===
1010 GET K$:VX=0:VY=0:FIRE=0
1020 IF K$="W" THEN VY=-3
1030 IF K$="S" THEN VY=3
1040 IF K$="A" THEN VX=-3
1050 IF K$="D" THEN VX=3
1060 IF K$=" " THEN FIRE=1
1070 IF K$="Q" THEN GAMEOVER=1
1080 RETURN

2000 REM === UPDATE PHASE ===
2010 REM apply player movement
2020 X=X+VX:Y=Y+VY
2030 IF X<24 THEN X=24
2040 IF X>255 THEN X=255
2050 IF Y<50 THEN Y=50
2060 IF Y>229 THEN Y=229
2070 REM fire bullet
2080 IF FIRE AND CANFIRE THEN GOSUB 2200:CANFIRE=0
2090 IF FIRE=0 THEN CANFIRE=1
2100 REM update bullet
2110 IF BULLETACTIVE THEN BY=BY-5
2120 IF BY<0 THEN BULLETACTIVE=0
2130 REM check for score
2140 IF INT(RND(1)*100)=0 THEN SCORE=SCORE+10
2150 RETURN

2200 REM --- FIRE BULLET ---
2210 BULLETACTIVE=1
2220 BX=X:BY=Y
2230 PRINT CHR$(7);  : REM beep
2240 RETURN

3000 REM === DRAW PHASE ===
3010 REM player sprite
3020 POKE 53248,X:POKE 53249,Y
3030 REM bullet sprite
3040 IF BULLETACTIVE THEN POKE 53250,BX:POKE 53251,BY
3050 REM HUD
3060 PRINT CHR$(19);  : REM home
3070 PRINT "SCORE:";SCORE;"  LIVES:";LIVES;"     "
3080 REM frame delay
3090 FOR D=1 TO 15:NEXT D
3100 RETURN

500 REM --- GAME OVER ---
510 PRINT CHR$(147);"GAME OVER"
520 PRINT "FINAL SCORE:";SCORE
530 END

9000 REM --- INIT ---
9010 PRINT CHR$(147)
9020 FOR I=832 TO 894:POKE I,255:NEXT I
9030 POKE 2040,13:POKE 53287,7
9040 FOR I=896 TO 958:POKE I,170:NEXT I
9050 POKE 2041,14:POKE 53288,2
9060 POKE 53269,3  : REM enable sprites
9070 RETURN
```

## Advanced: Sub-Phases

For complex games, split phases further:

```basic
2000 REM === UPDATE PHASE ===
2010 GOSUB 2100  : REM update player
2020 GOSUB 2200  : REM update enemies
2030 GOSUB 2300  : REM update bullets
2040 GOSUB 2400  : REM check collisions
2050 GOSUB 2500  : REM check win/lose
2060 RETURN

3000 REM === DRAW PHASE ===
3010 GOSUB 3100  : REM draw sprites
3020 GOSUB 3200  : REM draw HUD
3030 GOSUB 3300  : REM draw effects
3040 FOR D=1 TO 15:NEXT D
3050 RETURN
```

## See Also

- [Basic Game Loop](basic-game-loop.md) - Overall loop structure
- [Frame Timing](frame-timing.md) ⏳ - Controlling frame rate
- [Keyboard Polling](../input/keyboard-polling.md) - Input phase details
- [Sprite Collision](../sprites/sprite-collision.md) - Update phase details
- **Lessons**: 32 (Circuit Run), 40 (Cosmic Clash), 48 (Scroll Runner)
- **Vault**: [Clean Code Architecture](/vault/clean-architecture)

## Quick Reference Card

```basic
REM Input-Update-Draw pattern
110 GOSUB 1000  : REM INPUT:  read controls
120 GOSUB 2000  : REM UPDATE: game logic
130 GOSUB 3000  : REM DRAW:   render
140 GOTO 110

1000 REM INPUT: GET/PEEK only
2000 REM UPDATE: move, collide, score
3000 REM DRAW: POKE/PRINT only
```

## Phase Checklist

### Before Adding Code, Ask:

**Does this read player input?** → INPUT phase
**Does this change game state?** → UPDATE phase
**Does this write to screen?** → DRAW phase

### Red Flags (Code Smell):

- `POKE` in INPUT phase → Move to DRAW
- `GET K$` in UPDATE phase → Move to INPUT
- Collision check in DRAW phase → Move to UPDATE
- Position change in DRAW phase → Move to UPDATE

## Professional Pattern

Commercial C64 games follow this:

**INPUT**: Poll hardware, buffer commands
**UPDATE**: Physics, AI, rules, state transitions
**DRAW**: Sprites, scrolling, HUD, effects

Even in BASIC, this architecture scales to complex games!
