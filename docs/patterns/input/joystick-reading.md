# Joystick Reading

**Category**: Input
**Difficulty**: Beginner
**Appears in**: Lessons 27, 32, 40, 51, 56
**Prerequisites**: Understanding of PEEK, bitwise AND

## Overview

Read Atari-standard joystick input from C64 control ports using memory-mapped registers and bit masking to detect directional movement and fire button presses.

## The Pattern

```basic
REM --- JOYSTICK PORT 2 ---
100 J=PEEK(56320)                 : REM read joystick port 2
110 IF (J AND 1)=0 THEN Y=Y-SPEED : REM up
120 IF (J AND 2)=0 THEN Y=Y+SPEED : REM down
130 IF (J AND 4)=0 THEN X=X-SPEED : REM left
140 IF (J AND 8)=0 THEN X=X+SPEED : REM right
150 IF (J AND 16)=0 THEN GOSUB FIRE : REM fire button
```

## Parameters

| Address/Variable | Type | Purpose | Values |
|-----------------|------|---------|--------|
| `56320` | Register | Joystick port 2 | 0-255 (bit pattern) |
| `56321` | Register | Joystick port 1 | 0-255 (bit pattern) |
| `J` | Variable | Joystick state | 0-255 |
| `SPEED` | Integer | Movement speed | 1-8 pixels |

## How It Works

### Step 1: Read Joystick Register
```basic
J=PEEK(56320)
```
Read the hardware register for joystick port 2:
- Port 1 (less common): `PEEK(56321)`
- Port 2 (standard): `PEEK(56320)`

**Bit pattern** (0 = pressed, 1 = released):
```
Bit 0 (1):   Up
Bit 1 (2):   Down
Bit 2 (4):   Left
Bit 3 (8):   Right
Bit 4 (16):  Fire button
Bits 5-7:    Unused
```

### Step 2: Test Individual Bits
```basic
IF (J AND 1)=0 THEN...
```
Use bitwise `AND` to isolate each direction:
- `(J AND 1)=0`: Up pressed
- `(J AND 2)=0`: Down pressed
- `(J AND 4)=0`: Left pressed
- `(J AND 8)=0`: Right pressed
- `(J AND 16)=0`: Fire pressed

**Why "=0"?** C64 joystick bits are **active low** (0=pressed, 1=released)

### Step 3: Take Action
```basic
IF (J AND 1)=0 THEN Y=Y-SPEED
```
Move sprite/character based on direction detected.

## Variations

### Variation 1: Basic Movement
```basic
100 J=PEEK(56320)
110 IF (J AND 1)=0 THEN Y=Y-3   : REM up
120 IF (J AND 2)=0 THEN Y=Y+3   : REM down
130 IF (J AND 4)=0 THEN X=X-3   : REM left
140 IF (J AND 8)=0 THEN X=X+3   : REM right
150 REM clamp X, Y...
```

### Variation 2: Fire Button
```basic
100 J=PEEK(56320)
110 REM movement...
120 IF (J AND 16)=0 THEN GOSUB 5000  : REM fire
```

### Variation 3: Velocity-Based
```basic
100 J=PEEK(56320):VX=0:VY=0
110 IF (J AND 1)=0 THEN VY=-3
120 IF (J AND 2)=0 THEN VY=3
130 IF (J AND 4)=0 THEN VX=-3
140 IF (J AND 8)=0 THEN VX=3
150 X=X+VX:Y=Y+VY
```

### Variation 4: Menu Navigation
```basic
100 J=PEEK(56320)
110 IF (J AND 1)=0 THEN SEL=SEL-1:GOSUB REDRAW  : REM up
120 IF (J AND 2)=0 THEN SEL=SEL+1:GOSUB REDRAW  : REM down
130 IF SEL<1 THEN SEL=MAXOPT
140 IF SEL>MAXOPT THEN SEL=1
150 IF (J AND 16)=0 THEN GOSUB ACTION(SEL)      : REM select
160 FOR D=1 TO 10:NEXT D  : REM debounce delay
```

### Variation 5: Both Ports (Two Players)
```basic
100 J1=PEEK(56321)  : REM player 1 (port 1)
110 J2=PEEK(56320)  : REM player 2 (port 2)
120 IF (J1 AND 1)=0 THEN Y1=Y1-3
130 IF (J1 AND 2)=0 THEN Y1=Y1+3
140 IF (J2 AND 1)=0 THEN Y2=Y2-3
150 IF (J2 AND 2)=0 THEN Y2=Y2+3
```

### Variation 6: Keyboard or Joystick
```basic
100 GET K$:J=PEEK(56320)
110 VX=0:VY=0
120 IF K$="W" OR (J AND 1)=0 THEN VY=-3
130 IF K$="S" OR (J AND 2)=0 THEN VY=3
140 IF K$="A" OR (J AND 4)=0 THEN VX=-3
150 IF K$="D" OR (J AND 8)=0 THEN VX=3
160 X=X+VX:Y=Y+VY
```

## Common Mistakes

- **Mistake 1**: Testing for "=1" instead of "=0"
  - **Symptom**: Movement when joystick released, not pressed
  - **Fix**: Remember bits are active low: `(J AND 1)=0`

- **Mistake 2**: Forgetting parentheses around AND
  - **Symptom**: Wrong order of operations, incorrect detection
  - **Fix**: Always use `(J AND bit)=0` not `J AND bit=0`

- **Mistake 3**: Wrong port address
  - **Symptom**: No response to joystick
  - **Fix**: Port 1=56321, Port 2=56320 (port 2 is standard)

- **Mistake 4**: Not debouncing fire button
  - **Symptom**: One press fires multiple times
  - **Fix**: Add delay or check for release before next press

- **Mistake 5**: Checking multiple bits with single AND
  - **Symptom**: Diagonal detection doesn't work as expected
  - **Fix**: Check each direction separately

## Memory Usage

- **Registers**: 56320 (port 2), 56321 (port 1) - read-only
- **Variables**: J (joystick state, ~2 bytes)
- **No CPU overhead**: Direct hardware read

## Performance Tips

1. **Read once per frame**:
   ```basic
   REM Good: Read once, test multiple times
   J=PEEK(56320)
   IF (J AND 1)=0 THEN...
   IF (J AND 2)=0 THEN...

   REM Bad: Read for every test
   IF (PEEK(56320) AND 1)=0 THEN...
   IF (PEEK(56320) AND 2)=0 THEN...
   ```

2. **Cache port address**:
   ```basic
   JOY2=56320
   J=PEEK(JOY2)
   ```

3. **Use bit constants**:
   ```basic
   UP=1:DOWN=2:LEFT=4:RIGHT=8:FIRE=16
   IF (J AND UP)=0 THEN Y=Y-SPEED
   ```

4. **Combine with delay**:
   ```basic
   J=PEEK(56320)
   IF (J AND 16)=0 THEN GOSUB FIRE:FOR D=1 TO 30:NEXT D
   ```

## Integration Example

```basic
NEW
10 REM --- JOYSTICK MOVEMENT DEMO ---
20 PRINT CHR$(147)
30 GOSUB 9000                     : REM init sprite
40 X=120:Y=120:SPEED=3
50 REM main game loop
60 GOSUB 1000                     : REM input
70 GOSUB 2000                     : REM update
80 GOSUB 3000                     : REM draw
90 GOTO 50

1000 REM --- JOYSTICK INPUT ---
1010 J=PEEK(56320):VX=0:VY=0
1020 IF (J AND 1)=0 THEN VY=-SPEED
1030 IF (J AND 2)=0 THEN VY=SPEED
1040 IF (J AND 4)=0 THEN VX=-SPEED
1050 IF (J AND 8)=0 THEN VX=SPEED
1060 IF (J AND 16)=0 THEN GOSUB 5000  : REM fire
1070 X=X+VX:Y=Y+VY
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
5020 REM fire bullet logic...
5030 RETURN

9000 REM --- INIT SPRITE ---
9010 FOR I=832 TO 894:POKE I,255:NEXT I
9020 POKE 2040,13:POKE 53287,7:POKE 53269,1
9030 RETURN
```

## Joystick Register Reference

| Address | Port | Purpose | Bit Pattern |
|---------|------|---------|-------------|
| 56321 | Port 1 | Player 1 (less common) | Bits 0-4 |
| 56320 | Port 2 | Player 2 (standard) | Bits 0-4 |

### Bit Mapping (Both Ports)

| Bit | Value | Direction/Button | Test |
|-----|-------|------------------|------|
| 0 | 1 | Up | `(J AND 1)=0` |
| 1 | 2 | Down | `(J AND 2)=0` |
| 2 | 4 | Left | `(J AND 4)=0` |
| 3 | 8 | Right | `(J AND 8)=0` |
| 4 | 16 | Fire | `(J AND 16)=0` |
| 5-7 | - | Unused | - |

### Example Values

| Joystick State | Value | Binary | Meaning |
|---------------|-------|--------|---------|
| Neutral | 255 | 11111111 | Nothing pressed |
| Up | 254 | 11111110 | Up pressed |
| Down | 253 | 11111101 | Down pressed |
| Left | 251 | 11111011 | Left pressed |
| Right | 247 | 11110111 | Right pressed |
| Fire | 239 | 11101111 | Fire pressed |
| Up+Fire | 238 | 11101110 | Up and fire |
| Up+Right | 246 | 11110110 | Diagonal |

## See Also

- [Keyboard Polling](keyboard-polling.md) - Alternative input method
- [Diagonal Movement](diagonal-movement.md) - Handling combined directions
- [Sprite Movement](../sprites/sprite-movement.md) - Using joystick for sprites
- **Lessons**: 27 (Joystick basics), 51 (Menu with joystick)
- **Vault**: [Joystick Hardware Deep Dive](/vault/joystick-hardware)

## Quick Reference Card

```basic
REM Joystick pattern (port 2)
J=PEEK(56320)                     : REM read port
IF (J AND 1)=0 THEN Y=Y-SPEED    : REM up
IF (J AND 2)=0 THEN Y=Y+SPEED    : REM down
IF (J AND 4)=0 THEN X=X-SPEED    : REM left
IF (J AND 8)=0 THEN X=X+SPEED    : REM right
IF (J AND 16)=0 THEN GOSUB FIRE  : REM fire
```

## Debouncing Fire Button

```basic
REM Prevent rapid-fire
100 J=PEEK(56320)
110 IF (J AND 16)=0 AND CANFIRE THEN GOSUB 5000:CANFIRE=0
120 IF (J AND 16)<>0 THEN CANFIRE=1  : REM button released
```

## Two-Player Pattern

```basic
100 REM --- TWO PLAYER INPUT ---
110 J1=PEEK(56321):J2=PEEK(56320)
120 IF (J1 AND 1)=0 THEN Y1=Y1-3
130 IF (J1 AND 2)=0 THEN Y1=Y1+3
140 IF (J1 AND 4)=0 THEN X1=X1-3
150 IF (J1 AND 8)=0 THEN X1=X1+3
160 IF (J1 AND 16)=0 THEN GOSUB 5000  : REM P1 fire
170 IF (J2 AND 1)=0 THEN Y2=Y2-3
180 IF (J2 AND 2)=0 THEN Y2=Y2+3
190 IF (J2 AND 4)=0 THEN X2=X2-3
200 IF (J2 AND 8)=0 THEN X2=X2+3
210 IF (J2 AND 16)=0 THEN GOSUB 6000  : REM P2 fire
```

## Active Low Explanation

C64 joysticks use **active low** logic:
- **Bit=1 (255)**: Switch open, nothing pressed
- **Bit=0**: Switch closed, button/direction pressed

This is why we test `(J AND bit)=0` not `(J AND bit)=1`.

**Example**: Up pressed
- Binary: `11111110`
- Decimal: `254`
- Test: `(254 AND 1)=0` → True
