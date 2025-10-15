# Sprite Movement

**Category**: Sprites
**Difficulty**: Beginner
**Appears in**: Lessons 26, 27, 28, 29, 31, 32, 40, 48, 56
**Prerequisites**: [Sprite Initialization](sprite-initialization.md)

## Overview

Move hardware sprites smoothly by updating their position registers in a loop, using velocity variables to control speed and direction, and clamping values to keep sprites on-screen.

## The Pattern

```basic
REM --- SPRITE MOVEMENT LOOP ---
100 X=100:Y=120                   : REM initial position
110 VX=2:VY=0                     : REM velocity (2 pixels right per frame)
120 REM main loop
130 X=X+VX:Y=Y+VY                 : REM update position
140 IF X<24 THEN X=24             : REM clamp left edge
150 IF X>255 THEN X=255           : REM clamp right edge
160 IF Y<50 THEN Y=50             : REM clamp top edge
170 IF Y>229 THEN Y=229           : REM clamp bottom edge
180 POKE 53248,X:POKE 53249,Y    : REM write to registers
190 FOR D=1 TO 20:NEXT D          : REM delay for smooth motion
200 GOTO 130
```

## Parameters

| Variable | Type | Purpose | Typical Range |
|----------|------|---------|---------------|
| `X` | Integer | Sprite X position | 24-255 (or 0-320 with high bit) |
| `Y` | Integer | Sprite Y position | 50-229 |
| `VX` | Integer | X velocity (speed & direction) | -8 to +8 |
| `VY` | Integer | Y velocity (speed & direction) | -8 to +8 |
| `D` | Integer | Delay loop counter | 1-100 (higher = slower) |

## How It Works

### Step 1: Set Initial Position
```basic
X=100:Y=120
```
Start the sprite at a known location. Typical playfield: X=24-255, Y=50-229.

### Step 2: Define Velocity
```basic
VX=2:VY=0
```
Velocity controls both speed and direction:
- Positive = right/down
- Negative = left/up
- Zero = no movement on that axis

### Step 3: Update Position
```basic
X=X+VX:Y=Y+VY
```
Add velocity to position each frame. This creates smooth motion.

### Step 4: Clamp to Screen Bounds
```basic
IF X<24 THEN X=24
IF X>255 THEN X=255
```
Prevent sprite from disappearing off-screen edges.

**Visible playfield**:
- Left edge: ~24
- Right edge: ~255 (or 320 with high bit)
- Top edge: ~50
- Bottom edge: ~229

### Step 5: Write to Hardware
```basic
POKE 53248,X:POKE 53249,Y
```
Update VIC-II registers to move the sprite instantly.

### Step 6: Delay (Optional)
```basic
FOR D=1 TO 20:NEXT D
```
Slow down the loop to make motion readable. Lower = faster, higher = slower.

## Variations

### Variation 1: Keyboard-Controlled Movement
```basic
100 X=100:Y=120:SPEED=3
110 GET K$
120 IF K$="W" THEN Y=Y-SPEED
130 IF K$="S" THEN Y=Y+SPEED
140 IF K$="A" THEN X=X-SPEED
150 IF K$="D" THEN X=X+SPEED
160 IF X<24 THEN X=24
170 IF X>255 THEN X=255
180 IF Y<50 THEN Y=50
190 IF Y<229 THEN Y=229
200 POKE 53248,X:POKE 53249,Y
210 GOTO 110
```

### Variation 2: Joystick-Controlled Movement
```basic
100 X=100:Y=120:SPEED=2
110 J=PEEK(56320)                : REM read joystick port 2
120 IF (J AND 1)=0 THEN Y=Y-SPEED : REM up
130 IF (J AND 2)=0 THEN Y=Y+SPEED : REM down
140 IF (J AND 4)=0 THEN X=X-SPEED : REM left
150 IF (J AND 8)=0 THEN X=X+SPEED : REM right
160 IF X<24 THEN X=24
170 IF X>255 THEN X=255
180 IF Y<50 THEN Y=50
190 IF Y>229 THEN Y=229
200 POKE 53248,X:POKE 53249,Y
210 GOTO 110
```

### Variation 3: Bouncing Motion
```basic
100 X=100:Y=120:VX=3:VY=2
110 X=X+VX:Y=Y+VY
120 IF X<24 OR X>255 THEN VX=-VX  : REM bounce horizontally
130 IF Y<50 OR Y>229 THEN VY=-VY  : REM bounce vertically
140 POKE 53248,X:POKE 53249,Y
150 FOR D=1 TO 15:NEXT D
160 GOTO 110
```

### Variation 4: Circular Motion
```basic
100 CX=140:CY=140:RADIUS=50:ANGLE=0
110 X=CX+INT(COS(ANGLE)*RADIUS)
120 Y=CY+INT(SIN(ANGLE)*RADIUS)
130 POKE 53248,X:POKE 53249,Y
140 ANGLE=ANGLE+0.1
150 IF ANGLE>6.28 THEN ANGLE=0    : REM 2*PI
160 FOR D=1 TO 10:NEXT D
170 GOTO 110
```

### Variation 5: High-Resolution X (Beyond 255)
```basic
100 X=300:Y=120:VX=3
110 X=X+VX
120 IF X<0 THEN X=0:VX=-VX
130 IF X>340 THEN X=340:VX=-VX
140 REM handle X high bit
150 IF X>255 THEN POKE 53264,1:POKE 53248,X-256 ELSE POKE 53264,0:POKE 53248,X
160 POKE 53249,Y
170 FOR D=1 TO 15:NEXT D
180 GOTO 110
```

## Common Mistakes

- **Mistake 1**: Forgetting to clamp positions
  - **Symptom**: Sprite disappears off-screen or wraps strangely
  - **Fix**: Always check bounds after updating position

- **Mistake 2**: Too much speed
  - **Symptom**: Sprite moves too fast to see or control
  - **Fix**: Keep speed 1-5 pixels per frame. Use delay loops.

- **Mistake 3**: Integer overflow
  - **Symptom**: Position wraps to negative or jumps
  - **Fix**: Clamp *after* adding velocity, not before

- **Mistake 4**: No delay loop
  - **Symptom**: Sprite moves incredibly fast
  - **Fix**: Add `FOR D=1 TO N:NEXT D` where N=10-50

- **Mistake 5**: Velocity resets each frame
  - **Symptom**: Sprite doesn't accelerate or maintain momentum
  - **Fix**: Keep VX/VY variables outside the loop

## Memory Usage

- **Variables**: X, Y, VX, VY (4 integers = ~20 bytes)
- **Registers**: 53248 (X), 53249 (Y), 53264 (X-high bit if needed)
- **Per frame**: 2-3 POKEs (instant hardware update)

## Performance Tips

1. **Minimize POKEs per frame**:
   ```basic
   REM Bad: POKE every time
   IF K$="W" THEN POKE 53249,Y-SPEED
   IF K$="S" THEN POKE 53249,Y+SPEED

   REM Good: Update variable, POKE once
   IF K$="W" THEN Y=Y-SPEED
   IF K$="S" THEN Y=Y+SPEED
   POKE 53249,Y
   ```

2. **Precompute bounds**:
   ```basic
   XMIN=24:XMAX=255:YMIN=50:YMAX=229
   IF X<XMIN THEN X=XMIN
   ```

3. **Cache register addresses**:
   ```basic
   SPR0X=53248:SPR0Y=53249
   POKE SPR0X,X:POKE SPR0Y,Y
   ```

## Integration Example

```basic
NEW
10 REM --- SPRITE MOVEMENT DEMO ---
20 PRINT CHR$(147)
30 GOSUB 9000                     : REM initialize sprite
40 X=100:Y=120:SPEED=3
50 REM main game loop
60 GOSUB 1000                     : REM input
70 GOSUB 2000                     : REM update
80 GOSUB 3000                     : REM draw
90 GOTO 50

1000 REM --- INPUT ---
1010 GET K$
1020 VX=0:VY=0
1030 IF K$="W" THEN VY=-SPEED
1040 IF K$="S" THEN VY=SPEED
1050 IF K$="A" THEN VX=-SPEED
1060 IF K$="D" THEN VX=SPEED
1070 RETURN

2000 REM --- UPDATE POSITION ---
2010 X=X+VX:Y=Y+VY
2020 IF X<24 THEN X=24
2030 IF X>255 THEN X=255
2040 IF Y<50 THEN Y=50
2050 IF Y>229 THEN Y=229
2060 RETURN

3000 REM --- DRAW ---
3010 POKE 53248,X:POKE 53249,Y
3020 FOR D=1 TO 15:NEXT D
3030 RETURN

9000 REM --- INIT SPRITE ---
9010 FOR I=832 TO 894:POKE I,255:NEXT I
9020 POKE 2040,13:POKE 53287,7:POKE 53269,1
9030 RETURN
```

## See Also

- [Sprite Initialization](sprite-initialization.md) - Setting up sprites
- [Sprite Collision](sprite-collision.md) - Detecting collisions during movement
- [Sprite Animation](sprite-animation.md) - Cycling frames while moving
- **Lessons**: 26 (Sprite Motion), 27 (Velocity), 31 (AI Movement)
- **Vault**: [Smooth Motion Techniques](/vault/smooth-motion)

## Quick Reference Card

```basic
REM Basic movement pattern
X=X+VX:Y=Y+VY                     : REM update
IF X<24 THEN X=24                 : REM clamp left
IF X>255 THEN X=255               : REM clamp right
IF Y<50 THEN Y=50                 : REM clamp top
IF Y>229 THEN Y=229               : REM clamp bottom
POKE 53248,X:POKE 53249,Y        : REM write to hardware
```

## Sprite Position Register Map

| Register | Sprite | Axis | Range |
|----------|--------|------|-------|
| 53248 | 0 | X | 0-255 (low byte) |
| 53249 | 0 | Y | 0-250 |
| 53250 | 1 | X | 0-255 |
| 53251 | 1 | Y | 0-250 |
| 53252 | 2 | X | 0-255 |
| 53253 | 2 | Y | 0-250 |
| ... | ... | ... | ... |
| 53264 | - | X high bits | 8 bits for sprites 0-7 |
