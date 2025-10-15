# Diagonal Movement

**Category**: Input
**Difficulty**: Intermediate
**Appears in**: Lessons 27, 32, 40, 48, 56
**Prerequisites**: [Keyboard Polling](keyboard-polling.md) or [Joystick Reading](joystick-reading.md)

## Overview

Enable smooth diagonal movement by combining horizontal and vertical input, using velocity variables to accumulate direction changes before applying them to position.

## The Pattern

```basic
REM --- DIAGONAL MOVEMENT ---
100 VX=0:VY=0                     : REM reset velocity
110 GET K$
120 IF K$="W" THEN VY=-SPEED     : REM up
130 IF K$="S" THEN VY=SPEED      : REM down
140 IF K$="A" THEN VX=-SPEED     : REM left
150 IF K$="D" THEN VX=SPEED      : REM right
160 X=X+VX:Y=Y+VY                : REM apply both velocities
```

## Parameters

| Variable | Type | Purpose | Typical Range |
|----------|------|---------|---------------|
| `VX` | Integer | Horizontal velocity | -8 to +8 |
| `VY` | Integer | Vertical velocity | -8 to +8 |
| `X`, `Y` | Integer | Position | 24-255, 50-229 |
| `SPEED` | Integer | Movement speed | 1-5 pixels |

## How It Works

### Step 1: Reset Velocity
```basic
VX=0:VY=0
```
Start each frame with no movement. This prevents momentum from previous frames.

### Step 2: Accumulate Directions
```basic
IF K$="W" THEN VY=-SPEED
IF K$="A" THEN VX=-SPEED
```
Multiple directions can be set in the same frame:
- Pressing W alone: `VX=0, VY=-SPEED` (straight up)
- Pressing W+A together: `VX=-SPEED, VY=-SPEED` (diagonal up-left)

### Step 3: Apply Combined Velocity
```basic
X=X+VX:Y=Y+VY
```
Move in both directions at once, creating diagonal motion.

**Key Insight**: By using separate `VX` and `VY` variables, you can combine horizontal and vertical movement naturally.

## Variations

### Variation 1: Keyboard Diagonal
```basic
100 VX=0:VY=0
110 GET K$:IF K$="" THEN GOTO 200
120 IF K$="W" THEN VY=-3
130 IF K$="S" THEN VY=3
140 IF K$="A" THEN VX=-3
150 IF K$="D" THEN VX=3
160 X=X+VX:Y=Y+VY
200 REM continue...
```

**Problem**: `GET` only returns one key, so diagonals require holding one key while tapping another.

### Variation 2: Joystick Diagonal (Natural)
```basic
100 J=PEEK(56320):VX=0:VY=0
110 IF (J AND 1)=0 THEN VY=-3     : REM up
120 IF (J AND 2)=0 THEN VY=3      : REM down
130 IF (J AND 4)=0 THEN VX=-3     : REM left
140 IF (J AND 8)=0 THEN VX=3      : REM right
150 X=X+VX:Y=Y+VY
```

**Advantage**: Joystick can detect multiple directions simultaneously, making diagonals smooth.

### Variation 3: 8-Direction Movement
```basic
100 J=PEEK(56320):VX=0:VY=0
110 IF (J AND 1)=0 THEN VY=-3
120 IF (J AND 2)=0 THEN VY=3
130 IF (J AND 4)=0 THEN VX=-3
140 IF (J AND 8)=0 THEN VX=3
150 REM normalize diagonal speed
160 IF VX<>0 AND VY<>0 THEN VX=VX*0.7:VY=VY*0.7
170 X=X+VX:Y=Y+VY
```

**Improvement**: Diagonals move at same speed as cardinal directions (prevents faster diagonal movement).

### Variation 4: Keyboard with Key State Tracking
```basic
100 GET K$
110 IF K$="W" THEN KW=1
120 IF K$="S" THEN KS=1
130 IF K$="A" THEN KA=1
140 IF K$="D" THEN KD=1
150 VX=0:VY=0
160 IF KW THEN VY=-3
170 IF KS THEN VY=3
180 IF KA THEN VX=-3
190 IF KD THEN VX=3
200 X=X+VX:Y=Y+VY
210 REM clear states after delay
220 KW=0:KS=0:KA=0:KD=0
```

**Trade-off**: More complex but allows simultaneous key detection for keyboard.

### Variation 5: Constrained Diagonal (Grid-Based)
```basic
100 J=PEEK(56320):VX=0:VY=0
110 IF (J AND 1)=0 THEN VY=-8     : REM up (grid size)
120 IF (J AND 2)=0 THEN VY=8      : REM down
130 IF (J AND 4)=0 THEN VX=-8     : REM left
140 IF (J AND 8)=0 THEN VX=8      : REM right
150 REM only allow one direction
160 IF VX<>0 AND VY<>0 THEN VY=0  : REM prefer horizontal
170 X=X+VX:Y=Y+VY
```

**Use case**: Grid-based games where diagonal movement isn't allowed (Rogue-likes, puzzles).

### Variation 6: Analog Speed (Variable Velocity)
```basic
100 J=PEEK(56320):VX=0:VY=0:SPEED=3
110 IF (J AND 16)=0 THEN SPEED=6  : REM hold fire for turbo
120 IF (J AND 1)=0 THEN VY=-SPEED
130 IF (J AND 2)=0 THEN VY=SPEED
140 IF (J AND 4)=0 THEN VX=-SPEED
150 IF (J AND 8)=0 THEN VX=SPEED
160 X=X+VX:Y=Y+VY
```

**Feature**: Fire button modifies speed (run vs walk).

## Common Mistakes

- **Mistake 1**: Not resetting velocity each frame
  - **Symptom**: Movement accelerates infinitely
  - **Fix**: Always start with `VX=0:VY=0`

- **Mistake 2**: Applying position before accumulating all directions
  - **Symptom**: Only one direction works per frame
  - **Fix**: Set all velocities first, then apply at end

- **Mistake 3**: Diagonal speed faster than cardinal
  - **Symptom**: Diagonal movement is √2 times faster
  - **Fix**: Multiply by 0.7 when both VX and VY are non-zero

- **Mistake 4**: Using GET for diagonals
  - **Symptom**: Can't press two keys at once
  - **Fix**: Use joystick or keyboard state tracking

- **Mistake 5**: Forgetting to clamp after diagonal movement
  - **Symptom**: Sprite goes off-screen diagonally
  - **Fix**: Always clamp X and Y after applying velocity

## Memory Usage

- **Variables**: VX, VY (2 integers, ~8 bytes)
- **Additional**: Speed constants, key states (optional)
- **No overhead**: Velocity calculations are instant

## Performance Tips

1. **Integer-only math**:
   ```basic
   REM Good: Integer operations
   VX=-3:VY=-3

   REM Slow: Floating point
   VX=-3.5:VY=-3.5
   ```

2. **Normalize diagonals efficiently**:
   ```basic
   REM Fast approximation (×0.7)
   IF VX<>0 AND VY<>0 THEN VX=INT(VX*7/10):VY=INT(VY*7/10)
   ```

3. **Skip velocity checks if zero**:
   ```basic
   IF VX=0 AND VY=0 THEN GOTO 200  : REM skip update
   X=X+VX:Y=Y+VY
   ```

## Integration Example

```basic
NEW
10 REM --- DIAGONAL MOVEMENT DEMO ---
20 PRINT CHR$(147)
30 GOSUB 9000                     : REM init sprite
40 X=120:Y=120:SPEED=3
50 REM main game loop
60 GOSUB 1000                     : REM input
70 GOSUB 2000                     : REM update
80 GOSUB 3000                     : REM draw
90 GOTO 50

1000 REM --- INPUT (JOYSTICK) ---
1010 J=PEEK(56320):VX=0:VY=0
1020 IF (J AND 1)=0 THEN VY=-SPEED
1030 IF (J AND 2)=0 THEN VY=SPEED
1040 IF (J AND 4)=0 THEN VX=-SPEED
1050 IF (J AND 8)=0 THEN VX=SPEED
1060 REM normalize diagonal speed
1070 IF VX<>0 AND VY<>0 THEN VX=INT(VX*7/10):VY=INT(VY*7/10)
1080 X=X+VX:Y=Y+VY
1090 RETURN

2000 REM --- UPDATE (CLAMP) ---
2010 IF X<24 THEN X=24
2020 IF X>255 THEN X=255
2030 IF Y<50 THEN Y=50
2040 IF Y>229 THEN Y=229
2050 RETURN

3000 REM --- DRAW ---
3010 POKE 53248,X:POKE 53249,Y
3020 FOR D=1 TO 15:NEXT D
3030 RETURN

9000 REM --- INIT SPRITE ---
9010 FOR I=832 TO 894:POKE I,255:NEXT I
9020 POKE 2040,13:POKE 53287,7:POKE 53269,1
9030 RETURN
```

## Diagonal Speed Normalization

### The Problem
Moving diagonally combines X and Y movement:
- Cardinal (X=3, Y=0): Distance = 3
- Diagonal (X=3, Y=3): Distance = √(3² + 3²) = 4.24 (41% faster!)

### The Solution
Multiply both velocities by 0.7 (≈1/√2):
```basic
IF VX<>0 AND VY<>0 THEN VX=INT(VX*7/10):VY=INT(VY*7/10)
```

### Before and After
| Direction | VX | VY | Distance | Normalized VX | Normalized VY | New Distance |
|-----------|----|----|----------|---------------|---------------|--------------|
| Right | 3 | 0 | 3.0 | 3 | 0 | 3.0 |
| Up | 0 | 3 | 3.0 | 0 | 3 | 3.0 |
| Up-Right | 3 | 3 | 4.24 | 2 | 2 | 2.83 |

Normalized diagonal is closer to cardinal (2.83 vs 3.0).

## 8-Direction Reference

```
      135°   90°   45°
          \  |  /
    180° —— ● —— 0°
          /  |  \
      225°  270°  315°

Cardinal:  0°, 90°, 180°, 270°
Diagonal: 45°, 135°, 225°, 315°
```

### Direction Combinations

| Keys/Joystick | VX | VY | Direction | Angle |
|--------------|----|----|-----------|-------|
| Right | +3 | 0 | East | 0° |
| Up+Right | +3 | -3 | Northeast | 45° |
| Up | 0 | -3 | North | 90° |
| Up+Left | -3 | -3 | Northwest | 135° |
| Left | -3 | 0 | West | 180° |
| Down+Left | -3 | +3 | Southwest | 225° |
| Down | 0 | +3 | South | 270° |
| Down+Right | +3 | +3 | Southeast | 315° |

## See Also

- [Keyboard Polling](keyboard-polling.md) - Reading keyboard input
- [Joystick Reading](joystick-reading.md) - Reading joystick input
- [Sprite Movement](../sprites/sprite-movement.md) - Applying diagonal movement to sprites
- **Lessons**: 27 (Movement with animation), 32 (Circuit Run game)
- **Vault**: [8-Way Movement Theory](/vault/8-way-movement)

## Quick Reference Card

```basic
REM Diagonal movement pattern
VX=0:VY=0                         : REM reset
J=PEEK(56320)                     : REM read joystick
IF (J AND 1)=0 THEN VY=-SPEED    : REM up
IF (J AND 2)=0 THEN VY=SPEED     : REM down
IF (J AND 4)=0 THEN VX=-SPEED    : REM left
IF (J AND 8)=0 THEN VX=SPEED     : REM right
IF VX<>0 AND VY<>0 THEN VX=INT(VX*7/10):VY=INT(VY*7/10)  : REM normalize
X=X+VX:Y=Y+VY                     : REM apply
```

## Tank Controls vs Free Movement

**Free Movement** (this pattern):
- Move in 8 directions independently
- Common in shooters, adventure games
- Example: Robotron, Berzerk

**Tank Controls** (rotation-based):
- Turn left/right, move forward
- Common in racing, some action games
- Example: Combat, early 3D games
- Requires rotation variable and direction

```basic
REM Tank controls (not diagonal movement)
IF K$="A" THEN ANGLE=ANGLE-5
IF K$="D" THEN ANGLE=ANGLE+5
IF K$="W" THEN X=X+COS(ANGLE)*SPEED:Y=Y+SIN(ANGLE)*SPEED
```
