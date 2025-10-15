# Sprite Initialization

**Category**: Sprites
**Difficulty**: Beginner
**Appears in**: Lessons 25, 26, 28, 29, 32, 40, 48, 56
**Prerequisites**: Understanding of POKE/PEEK, memory addressing

## Overview

Initialize a C64 hardware sprite by defining its shape data, setting up the sprite pointer, choosing a color, positioning it on screen, and enabling it in the VIC-II chip.

## The Pattern

```basic
REM --- SPRITE 0 INITIALIZATION ---
100 FOR I=832 TO 894:POKE I,255:NEXT I  : REM sprite shape data
110 POKE 2040,13                         : REM sprite pointer (832/64=13)
120 POKE 53287,1                         : REM sprite color (white)
130 POKE 53248,120:POKE 53249,100       : REM position X,Y
140 POKE 53269,1                         : REM enable sprite 0
```

## Parameters

| Variable/Address | Type | Purpose | Range/Values |
|-----------------|------|---------|--------------|
| `832-894` | Memory | Sprite 0 shape data (block 13) | 63 bytes used |
| `2040` | Memory | Sprite 0 pointer | 0-255 (block number) |
| `53287` | Memory | Sprite 0 color register | 0-15 (C64 colors) |
| `53248` | Memory | Sprite 0 X position (low byte) | 0-255 |
| `53249` | Memory | Sprite 0 Y position | 0-250 |
| `53269` | Memory | Sprite enable register | Bit 0 = sprite 0 |

## How It Works

### Step 1: Define Sprite Shape Data
Sprites are 24×21 pixels, stored as 63 bytes (3 bytes per row × 21 rows). Each bit represents a pixel:
- `255` = `11111111` in binary = 8 solid pixels
- `170` = `10101010` in binary = checkerboard pattern
- `0` = `00000000` in binary = transparent

**Memory blocks**: Sprite data must start at multiples of 64. Common locations:
- Block 13 (832-894): Sprite 0 default
- Block 14 (896-958): Sprite 1 default
- Blocks 192-255: Safe area in upper memory

### Step 2: Set Sprite Pointer
The sprite pointer tells VIC-II where to find the sprite data:
```basic
POKE 2040, 13  : REM 832 / 64 = 13
```

**Sprite pointers**: `2040-2047` for sprites 0-7

### Step 3: Choose Color
Each sprite has one foreground color (background is transparent):
```basic
POKE 53287, 1  : REM White
```

**Common colors**: 0=black, 1=white, 2=red, 5=green, 6=blue, 7=yellow

### Step 4: Position Sprite
Set X and Y coordinates (top-left of screen ≈ 24,50):
```basic
POKE 53248, 120  : REM X position
POKE 53249, 100  : REM Y position
```

**Coordinates**: X can extend beyond 255 using X-high bit register `53264`

### Step 5: Enable Sprite
Turn on sprite 0 by setting bit 0 in the enable register:
```basic
POKE 53269, 1  : REM Enable sprite 0 (bit 0 = 1)
```

**Enable multiple sprites**: Use OR logic: `3` = sprites 0+1, `7` = sprites 0+1+2

## Variations

### Variation 1: Custom Shape Data
Instead of solid block, define custom sprite:
```basic
100 REM --- SMILEY FACE ---
110 DATA 0,126,0,1,255,128,3,255,192
120 DATA 7,129,224,7,0,224,15,36,240
130 DATA 15,36,240,15,0,240,15,36,240
140 DATA 15,102,240,7,195,224,7,129,224
150 DATA 3,255,192,1,255,128,0,126,0
160 DATA 0,0,0,0,0,0,0,0,0
170 DATA 0,0,0,0,0,0,0,0,0
180 FOR I=0 TO 62:READ B:POKE 832+I,B:NEXT
```

### Variation 2: Multiple Sprites
Initialize sprites 0 and 1:
```basic
100 REM --- TWO SPRITES ---
110 FOR I=832 TO 894:POKE I,255:NEXT    : REM sprite 0 data
120 FOR I=896 TO 958:POKE I,170:NEXT    : REM sprite 1 data (checkerboard)
130 POKE 2040,13:POKE 2041,14            : REM pointers
140 POKE 53287,2:POKE 53288,7            : REM colors (red, yellow)
150 POKE 53248,60:POKE 53249,120         : REM sprite 0 position
160 POKE 53250,220:POKE 53251,120        : REM sprite 1 position
170 POKE 53269,3                          : REM enable both (bits 0 and 1)
```

### Variation 3: High-Resolution X Positioning
For X positions > 255, use the X-high bit register:
```basic
100 X=300  : REM target X position
110 IF X>255 THEN POKE 53264,1:X=X-256 ELSE POKE 53264,0
120 POKE 53248,X
```

## Common Mistakes

- **Mistake 1**: Forgetting to enable the sprite
  - **Symptom**: Sprite data defined but nothing appears on screen
  - **Fix**: Always `POKE 53269` with appropriate bit set

- **Mistake 2**: Wrong sprite pointer calculation
  - **Symptom**: Garbage sprite appears or crashes
  - **Fix**: Pointer = address / 64. For 832: `832/64=13`

- **Mistake 3**: Sprite data overlaps BASIC program
  - **Symptom**: Program crashes or sprite corrupts
  - **Fix**: Use blocks 13-14 (832-1023) or upper memory (49152+)

- **Mistake 4**: Y position too high
  - **Symptom**: Sprite disappears off bottom
  - **Fix**: Y range is 0-250 (approx). Keep visible: 50-200

## Memory Usage

- **Sprite data**: 64 bytes per sprite (63 used, 1 padding)
- **Pointers**: 1 byte per sprite (2040-2047)
- **Registers**: Color (1 byte), X/Y (2 bytes), enable (shared)
- **Total per sprite**: ~67 bytes + shape data

### Memory Map Reference

| Address | Purpose | Notes |
|---------|---------|-------|
| 832-894 | Sprite 0 data (block 13) | Default location |
| 896-958 | Sprite 1 data (block 14) | Default location |
| 2040-2047 | Sprite pointers 0-7 | Points to data block |
| 53248-53264 | Sprite X positions | Even addresses + high bits |
| 53249-53265 | Sprite Y positions | Odd addresses |
| 53269 | Sprite enable | 8 bits for 8 sprites |
| 53287-53294 | Sprite colors 0-7 | One color per sprite |

## Integration Example

```basic
NEW
10 REM --- PLAYER SPRITE SETUP ---
20 PRINT CHR$(147)
30 GOSUB 9000                    : REM initialize sprite
40 X=100:Y=120                   : REM starting position
50 POKE 53248,X:POKE 53249,Y    : REM update position
60 REM ... game loop ...
70 END

9000 REM --- SPRITE INITIALIZATION ---
9010 FOR I=832 TO 894:POKE I,255:NEXT I
9020 POKE 2040,13
9030 POKE 53287,7                : REM yellow
9040 POKE 53269,1                : REM enable
9050 RETURN
```

## See Also

- [Sprite Movement](sprite-movement.md) - Moving initialized sprites
- [Sprite Collision](sprite-collision.md) - Detecting collisions
- [Sprite Animation](sprite-animation.md) - Frame cycling
- **Lessons**: 25 (Sprite Primer), 26 (Sprite Motion), 28 (Collisions)
- **Vault**: [Sprite Deep Dive](/vault/sprite-deep-dive)

## Quick Reference Card

```basic
REM Sprite 0 setup (minimal)
FOR I=832 TO 894:POKE I,255:NEXT  : REM shape
POKE 2040,13                       : REM pointer
POKE 53287,C                       : REM color
POKE 53248,X:POKE 53249,Y         : REM position
POKE 53269,1                       : REM enable
```

## C64 Color Chart

| Value | Color | Value | Color |
|-------|-------|-------|-------|
| 0 | Black | 8 | Orange |
| 1 | White | 9 | Brown |
| 2 | Red | 10 | Light Red |
| 3 | Cyan | 11 | Dark Gray |
| 4 | Purple | 12 | Gray |
| 5 | Green | 13 | Light Green |
| 6 | Blue | 14 | Light Blue |
| 7 | Yellow | 15 | Light Gray |
