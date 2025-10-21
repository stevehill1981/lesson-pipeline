# Sprite Collision Detection

**Category**: Sprites
**Difficulty**: Beginner
**Appears in**: Lessons 28, 29, 31, 32, 40, 48, 56
**Prerequisites**: [Sprite Initialization](sprite-initialization.md), [Sprite Movement](sprite-movement.md)

## Overview

Detect when sprites collide with each other or with background graphics using the VIC-II's hardware collision registers. No manual distance calculations needed—the chip does the work instantly.

## The Pattern

```basic
REM --- SPRITE-SPRITE COLLISION ---
100 C=PEEK(53279)                 : REM clear previous collision
110 REM ... move sprites ...
120 HIT=PEEK(53279)               : REM read collision register
130 IF HIT THEN PRINT "COLLISION!":POKE 53280,2
```

## Parameters

| Address/Variable | Type | Purpose | Values |
|-----------------|------|---------|--------|
| `53278` | Register | Sprite-background collision | 8 bits (sprites 0-7) |
| `53279` | Register | Sprite-sprite collision | 8 bits (sprites 0-7) |
| `HIT` | Variable | Collision flag/value | 0 = none, 1-255 = collision |

## How It Works

### Step 1: Clear Previous Collision
```basic
C=PEEK(53279)
```
Reading the collision register **clears** it. Do this once at the start of each frame to get fresh collision data.

### Step 2: Move Sprites
```basic
POKE 53248,X0:POKE 53249,Y0
POKE 53250,X1:POKE 53251,Y1
```
Update sprite positions as normal. The VIC-II automatically detects collisions as sprites move.

### Step 3: Check Collision
```basic
HIT=PEEK(53279)
IF HIT THEN PRINT "COLLISION!"
```
- `HIT=0`: No collision
- `HIT>0`: Collision occurred (bit pattern shows which sprites)

**Collision bits**:
- Bit 0 (value 1): Sprite 0 collided
- Bit 1 (value 2): Sprite 1 collided
- Bit 2 (value 4): Sprite 2 collided
- etc.

### Two Collision Types

**Sprite-Sprite** (`53279`): Detects when sprites overlap each other
**Sprite-Background** (`53278`): Detects when sprite overlaps non-zero screen data

## Variations

### Variation 1: Sprite-Sprite Collision (Two Sprites)
```basic
NEW
10 PRINT CHR$(147)
20 REM setup two sprites
30 FOR I=832 TO 894:POKE I,255:NEXT I   : REM sprite 0
40 FOR I=896 TO 958:POKE I,170:NEXT I   : REM sprite 1 (checkerboard)
50 POKE 2040,13:POKE 2041,14
60 POKE 53269,3                          : REM enable both
70 POKE 53287,2:POKE 53288,7            : REM red and yellow
80 X0=60:Y0=120:VX0=2
90 X1=220:Y1=120:VX1=-2
100 C=PEEK(53279)                        : REM clear collisions
110 REM main loop
120 POKE 53248,X0:POKE 53249,Y0
130 POKE 53250,X1:POKE 53251,Y1
140 FOR D=1 TO 20:NEXT D
150 X0=X0+VX0:IF X0<24 OR X0>255 THEN VX0=-VX0
160 X1=X1+VX1:IF X1<24 OR X1>255 THEN VX1=-VX1
170 HIT=PEEK(53279)
180 IF HIT THEN PRINT CHR$(19);"COLLISION!":POKE 53280,2:GOTO 200
190 GOTO 120
200 END
```

### Variation 2: Sprite-Background Collision (Player vs. Walls)
```basic
NEW
10 PRINT CHR$(147)
20 REM draw walls
30 FOR I=0 TO 39:POKE 1024+I,160:POKE 1024+40*24+I,160:NEXT I  : REM top/bottom
40 FOR I=0 TO 24:POKE 1024+I*40,160:POKE 1024+I*40+39,160:NEXT I : REM left/right
50 REM setup player sprite
60 FOR I=832 TO 894:POKE I,255:NEXT I
70 POKE 2040,13:POKE 53287,7:POKE 53269,1
80 X=120:Y=120:SPEED=3
90 C=PEEK(53278)                         : REM clear collisions
100 REM game loop
110 GET K$
120 OX=X:OY=Y                            : REM save old position
130 IF K$="W" THEN Y=Y-SPEED
140 IF K$="S" THEN Y=Y+SPEED
150 IF K$="A" THEN X=X-SPEED
160 IF K$="D" THEN X=X+SPEED
170 POKE 53248,X:POKE 53249,Y
180 HIT=PEEK(53278)
190 IF HIT THEN X=OX:Y=OY:PRINT CHR$(7);  : REM undo move + beep
200 GOTO 100
```

### Variation 3: Identify Which Sprite Collided
```basic
100 HIT=PEEK(53279)
110 IF HIT=0 THEN GOTO 200               : REM no collision
120 REM check individual sprites
130 IF (HIT AND 1) THEN PRINT "SPRITE 0 HIT"
140 IF (HIT AND 2) THEN PRINT "SPRITE 1 HIT"
150 IF (HIT AND 4) THEN PRINT "SPRITE 2 HIT"
160 IF (HIT AND 8) THEN PRINT "SPRITE 3 HIT"
```

### Variation 4: Damage on Collision
```basic
100 HIT=PEEK(53279)
110 IF HIT=0 THEN GOTO 200
120 LIVES=LIVES-1
130 PRINT CHR$(19);"LIVES:";LIVES
140 POKE 53280,2                         : REM flash border red
150 FOR D=1 TO 30:NEXT D                 : REM invincibility frames
160 POKE 53280,0                         : REM restore border
170 C=PEEK(53279)                        : REM clear collision
180 IF LIVES<=0 THEN PRINT "GAME OVER":END
```

### Variation 5: Collectible Items (Sprite-Sprite)
```basic
100 REM sprite 0 = player, sprite 1 = coin
110 HIT=PEEK(53279)
120 IF HIT=0 THEN GOTO 200
130 IF (HIT AND 3)=3 THEN GOSUB 5000     : REM both sprites involved
140 GOTO 200

5000 REM --- COLLECT COIN ---
5010 SCORE=SCORE+10
5020 POKE 53269,1                        : REM disable sprite 1 (coin)
5030 REM play sound effect
5040 PRINT CHR$(19);"SCORE:";SCORE
5050 RETURN
```

## Common Mistakes

- **Mistake 1**: Forgetting to clear collision register
  - **Symptom**: Collision flag stays set forever
  - **Fix**: `PEEK(53279)` at start of each frame

- **Mistake 2**: Checking collision before moving
  - **Symptom**: Always detects collision from previous frame
  - **Fix**: Clear → Move → Check (in that order)

- **Mistake 3**: Confusing sprite-sprite vs sprite-background
  - **Symptom**: Wrong collision type detected
  - **Fix**: 53279 = sprite-sprite, 53278 = sprite-background

- **Mistake 4**: Not handling continuous collision
  - **Symptom**: Collision triggers only once
  - **Fix**: Clear register each frame, or separate sprites after hit

- **Mistake 5**: Pixel-perfect collision too sensitive
  - **Symptom**: Collisions feel unfair
  - **Fix**: Add "grace period" or reduce sprite size slightly

## Memory Usage

- **Registers**: 2 bytes (53278, 53279) - read-only
- **Variables**: HIT, C (collision flags) - ~8 bytes
- **No CPU overhead**: Hardware detection is instant

## Performance Tips

1. **Clear only when needed**:
   ```basic
   REM Good: Clear once per frame
   C=PEEK(53279)
   REM ... game loop ...

   REM Bad: Clear every check
   IF PEEK(53279) THEN ...
   C=PEEK(53279)  : REM clears the flag you just checked!
   ```

2. **Batch collision checks**:
   ```basic
   HIT=PEEK(53279)
   IF HIT AND 1 THEN GOSUB 1000  : REM sprite 0
   IF HIT AND 2 THEN GOSUB 2000  : REM sprite 1
   ```

3. **Use bit masks efficiently**:
   ```basic
   PLAYER_BIT=1
   ENEMY_BITS=30  : REM bits 1-4 (sprites 1-4)
   IF HIT AND ENEMY_BITS THEN GOSUB DAMAGE
   ```

## Integration Example

```basic
NEW
10 REM --- COLLISION GAME ---
20 PRINT CHR$(147)
30 GOSUB 9000                            : REM init sprites
40 X=100:Y=120:EX=220:EY=120
50 VX=0:VY=0:EVX=-2
60 LIVES=3:SCORE=0
70 REM main loop
80 C=PEEK(53279)                         : REM clear collisions
90 GOSUB 1000                            : REM input
100 GOSUB 2000                           : REM update
110 GOSUB 3000                           : REM collision check
120 GOSUB 4000                           : REM draw
130 GOTO 70

1000 REM --- INPUT ---
1010 GET K$:VX=0:VY=0
1020 IF K$="W" THEN VY=-3
1030 IF K$="S" THEN VY=3
1040 IF K$="A" THEN VX=-3
1050 IF K$="D" THEN VX=3
1060 RETURN

2000 REM --- UPDATE ---
2010 X=X+VX:Y=Y+VY
2020 EX=EX+EVX:IF EX<24 OR EX>255 THEN EVX=-EVX
2030 IF X<24 THEN X=24
2040 IF X>255 THEN X=255
2050 IF Y<50 THEN Y=50
2060 IF Y>229 THEN Y=229
2070 RETURN

3000 REM --- COLLISION CHECK ---
3010 HIT=PEEK(53279)
3020 IF HIT=0 THEN RETURN
3030 LIVES=LIVES-1
3040 PRINT CHR$(19);"LIVES:";LIVES
3050 POKE 53280,2:FOR D=1 TO 20:NEXT D:POKE 53280,0
3060 X=100:Y=120  : REM respawn player
3070 IF LIVES<=0 THEN PRINT "GAME OVER":END
3080 RETURN

4000 REM --- DRAW ---
4010 POKE 53248,X:POKE 53249,Y
4020 POKE 53250,EX:POKE 53251,EY
4030 FOR D=1 TO 15:NEXT D
4040 RETURN

9000 REM --- INIT SPRITES ---
9010 FOR I=832 TO 894:POKE I,255:NEXT I   : REM player
9020 FOR I=896 TO 958:POKE I,170:NEXT I   : REM enemy
9030 POKE 2040,13:POKE 2041,14
9040 POKE 53287,7:POKE 53288,2
9050 POKE 53269,3
9060 RETURN
```

## See Also

- [Sprite Initialization](sprite-initialization.md) - Setting up collision detection
- [Sprite Movement](sprite-movement.md) - Moving sprites to trigger collisions
- **Lessons**: 28 (Collisions), 29 (HUD + Collisions), 32 (Mini-Game)
- **Vault**: [Collision Deep Dive](/vault/collision-detection)

## Quick Reference Card

```basic
REM Collision detection pattern
C=PEEK(53279)                    : REM clear at frame start
REM ... move sprites ...
HIT=PEEK(53279)                  : REM check at frame end
IF HIT THEN GOSUB HANDLE_HIT
```

## Collision Register Reference

| Register | Detection Type | Bits | Cleared By |
|----------|---------------|------|------------|
| 53278 | Sprite-Background | 8 bits (sprites 0-7) | PEEK |
| 53279 | Sprite-Sprite | 8 bits (sprites 0-7) | PEEK |

## Bit Values for Collision Register

| Bit | Value | Sprite | Example Check |
|-----|-------|--------|---------------|
| 0 | 1 | 0 | `IF HIT AND 1` |
| 1 | 2 | 1 | `IF HIT AND 2` |
| 2 | 4 | 2 | `IF HIT AND 4` |
| 3 | 8 | 3 | `IF HIT AND 8` |
| 4 | 16 | 4 | `IF HIT AND 16` |
| 5 | 32 | 5 | `IF HIT AND 32` |
| 6 | 64 | 6 | `IF HIT AND 64` |
| 7 | 128 | 7 | `IF HIT AND 128` |

**Example**: `HIT=5` means sprites 0 and 2 collided (bits 0 and 2 set: 1+4=5)
