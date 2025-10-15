# Keyboard Polling

**Category**: Input
**Difficulty**: Beginner
**Appears in**: Lessons 25, 26, 27, 32, 40, 51, 56
**Prerequisites**: None (fundamental pattern)

## Overview

Read keyboard input non-blocking using `GET` to check if a key is pressed each frame, allowing smooth gameplay without waiting for player input.

## The Pattern

```basic
REM --- KEYBOARD POLLING ---
100 GET K$                        : REM check keyboard
110 IF K$="" THEN GOTO 200       : REM no key pressed, skip
120 IF K$="W" THEN Y=Y-SPEED     : REM move up
130 IF K$="S" THEN Y=Y+SPEED     : REM move down
140 IF K$="A" THEN X=X-SPEED     : REM move left
150 IF K$="D" THEN X=X+SPEED     : REM move right
200 REM continue game logic...
```

## Parameters

| Variable | Type | Purpose | Values |
|----------|------|---------|--------|
| `K$` | String | Last key pressed | "" = none, or single character |
| `SPEED` | Integer | Movement speed | 1-8 pixels per frame |
| `X`, `Y` | Integer | Position to update | Game-specific |

## How It Works

### Step 1: Poll Keyboard
```basic
GET K$
```
`GET` reads one character from the keyboard buffer **without waiting**:
- If a key is pressed: `K$` contains the character
- If no key is pressed: `K$` is empty string `""`

**Important**: `GET` is non-blocking (unlike `INPUT` which waits)

### Step 2: Check for Empty
```basic
IF K$="" THEN GOTO 200
```
Skip input processing if no key was pressed. Game continues running smoothly.

### Step 3: Test for Specific Keys
```basic
IF K$="W" THEN Y=Y-SPEED
IF K$="S" THEN Y=Y+SPEED
```
Compare `K$` against expected keys and take action.

**Common keys**:
- WASD: Movement (W=up, A=left, S=down, D=right)
- SPACE: Fire/jump
- RETURN: Select/confirm
- Q: Quit
- P: Pause

### Step 4: Continue Game
The loop continues immediately after checking input, keeping the game responsive.

## Variations

### Variation 1: WASD Movement (Classic)
```basic
100 GET K$
110 IF K$="W" THEN Y=Y-3
120 IF K$="S" THEN Y=Y+3
130 IF K$="A" THEN X=X-3
140 IF K$="D" THEN X=X+3
150 REM clamp positions...
```

### Variation 2: Arrow Keys
```basic
100 GET K$
110 IF K$=CHR$(145) THEN Y=Y-3  : REM cursor up
120 IF K$=CHR$(17) THEN Y=Y+3   : REM cursor down
130 IF K$=CHR$(157) THEN X=X-3  : REM cursor left
140 IF K$=CHR$(29) THEN X=X+3   : REM cursor right
```

### Variation 3: Velocity-Based (Smoother)
```basic
100 GET K$:VX=0:VY=0             : REM reset velocity
110 IF K$="W" THEN VY=-3
120 IF K$="S" THEN VY=3
130 IF K$="A" THEN VX=-3
140 IF K$="D" THEN VX=3
150 X=X+VX:Y=Y+VY                : REM apply velocity
```

### Variation 4: Multiple Actions
```basic
100 GET K$
110 IF K$="W" THEN Y=Y-SPEED
120 IF K$="S" THEN Y=Y+SPEED
130 IF K$="A" THEN X=X-SPEED
140 IF K$="D" THEN X=X+SPEED
150 IF K$=" " THEN GOSUB FIRE    : REM space = shoot
160 IF K$="P" THEN PAUSE=1-PAUSE : REM toggle pause
170 IF K$="Q" THEN END           : REM quit game
```

### Variation 5: Menu Navigation
```basic
100 GET K$:IF K$="" THEN RETURN
110 IF K$="W" OR K$=CHR$(145) THEN SEL=SEL-1  : REM up
120 IF K$="S" OR K$=CHR$(17) THEN SEL=SEL+1   : REM down
130 IF SEL<1 THEN SEL=MAXOPTIONS
140 IF SEL>MAXOPTIONS THEN SEL=1
150 IF K$=CHR$(13) OR K$=" " THEN GOSUB ACTION(SEL)  : REM select
```

### Variation 6: Input Buffering (One Key Per Frame)
```basic
100 GET K$
110 IF K$<>"" THEN LASTKEY$=K$   : REM store key
120 IF LASTKEY$="W" THEN Y=Y-3:LASTKEY$=""
130 IF LASTKEY$="S" THEN Y=Y+3:LASTKEY$=""
```

## Common Mistakes

- **Mistake 1**: Using `INPUT` instead of `GET`
  - **Symptom**: Game freezes waiting for input
  - **Fix**: Always use `GET` for real-time games

- **Mistake 2**: Not checking for empty string
  - **Symptom**: Logic errors when no key pressed
  - **Fix**: Always test `IF K$="" THEN...`

- **Mistake 3**: Forgetting to declare K$ as string
  - **Symptom**: Syntax error or wrong variable type
  - **Fix**: Use `$` suffix: `K$` not `K`

- **Mistake 4**: Case sensitivity
  - **Symptom**: Only responds to uppercase or lowercase
  - **Fix**: Test both `IF K$="w" OR K$="W"` or normalize input

- **Mistake 5**: Checking same key multiple times
  - **Symptom**: First check "consumes" the key
  - **Fix**: Use `ELSE IF` or store `K$` in variable

## Memory Usage

- **Variables**: K$ (string variable, ~3 bytes)
- **Registers**: None (uses BASIC I/O)
- **Buffer**: 10-character keyboard buffer (system)

## Performance Tips

1. **Check most common keys first**:
   ```basic
   REM Good: WASD before rare keys
   IF K$="W" THEN ...
   IF K$="A" THEN ...
   IF K$="Q" THEN END  : REM quit last
   ```

2. **Use GOTO to skip processing**:
   ```basic
   GET K$:IF K$="" THEN GOTO 200
   REM ... input checks ...
   200 REM continue
   ```

3. **Store K$ if checking multiple times**:
   ```basic
   GET K$
   KEY$=K$  : REM preserve original
   IF KEY$="W" THEN ...
   IF KEY$=" " THEN ...
   ```

## Integration Example

```basic
NEW
10 REM --- KEYBOARD MOVEMENT DEMO ---
20 PRINT CHR$(147)
30 GOSUB 9000                     : REM init sprite
40 X=120:Y=120:SPEED=3
50 REM main game loop
60 GOSUB 1000                     : REM input
70 GOSUB 2000                     : REM update
80 GOSUB 3000                     : REM draw
90 GOTO 50

1000 REM --- INPUT ---
1010 GET K$:IF K$="" THEN RETURN
1020 IF K$="W" THEN Y=Y-SPEED
1030 IF K$="S" THEN Y=Y+SPEED
1040 IF K$="A" THEN X=X-SPEED
1050 IF K$="D" THEN X=X+SPEED
1060 IF K$=" " THEN GOSUB 5000   : REM fire
1070 IF K$="Q" THEN END
1080 RETURN

2000 REM --- UPDATE ---
2010 IF X<24 THEN X=24
2020 IF X>255 THEN X=255
2030 IF Y<50 THEN Y=50
2040 IF Y>229 THEN Y=229
2050 RETURN

3000 REM --- DRAW ---
3010 POKE 53248,X:POKE 53249,Y
3020 FOR D=1 TO 15:NEXT D
3030 RETURN

5000 REM --- FIRE ---
5010 PRINT CHR$(7);               : REM beep
5020 RETURN

9000 REM --- INIT SPRITE ---
9010 FOR I=832 TO 894:POKE I,255:NEXT I
9020 POKE 2040,13:POKE 53287,7:POKE 53269,1
9030 RETURN
```

## Special Keys Reference

| Key | Character | CHR$ Code | Common Use |
|-----|-----------|-----------|------------|
| SPACE | " " | 32 | Fire, jump, select |
| RETURN | - | 13 | Confirm, select |
| Cursor Up | ↑ | 145 | Menu up |
| Cursor Down | ↓ | 17 | Menu down |
| Cursor Left | ← | 157 | Menu/move left |
| Cursor Right | → | 29 | Menu/move right |
| F1 | - | 133 | Help, special |
| F3 | - | 134 | Special action |
| F5 | - | 135 | Special action |
| F7 | - | 136 | Special action |
| ESC (RUN/STOP) | - | 3 | Pause, quit |

## See Also

- [Joystick Reading](joystick-reading.md) - Alternative input method
- [Diagonal Movement](diagonal-movement.md) - Combining key presses
- [Sprite Movement](../sprites/sprite-movement.md) - Using input for movement
- **Lessons**: 25-27 (Input basics), 51 (Menu navigation)
- **Vault**: [Input Handling Deep Dive](/vault/input-handling)

## Quick Reference Card

```basic
REM Keyboard polling pattern
GET K$                            : REM non-blocking read
IF K$="" THEN GOTO skip          : REM no key pressed
IF K$="W" THEN Y=Y-SPEED         : REM check keys
IF K$="S" THEN Y=Y+SPEED
IF K$="A" THEN X=X-SPEED
IF K$="D" THEN X=X+SPEED
skip:
REM continue...
```

## WASD vs Arrow Keys

**WASD Advantages**:
- Natural hand position for typing
- Allows right hand on joystick/mouse
- International standard for PC games

**Arrow Keys Advantages**:
- Dedicated cursor keys on C64
- Familiar from BASIC programming
- Clear directional intent

**Both**:
```basic
IF K$="W" OR K$=CHR$(145) THEN Y=Y-SPEED
```

## Input State Machine

```basic
REM Track input mode
100 INPUTMODE=0  : REM 0=game, 1=menu, 2=pause
110 GET K$:IF K$="" THEN GOTO 200
120 IF INPUTMODE=0 THEN GOSUB 1000  : REM game input
130 IF INPUTMODE=1 THEN GOSUB 2000  : REM menu input
140 IF INPUTMODE=2 THEN GOSUB 3000  : REM pause input
200 REM continue...
```
