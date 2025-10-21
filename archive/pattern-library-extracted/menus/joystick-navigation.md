# Joystick Navigation

**Category**: Menus
**Difficulty**: Beginner
**Appears in**: Lessons 51, 56
**Prerequisites**: [Joystick Reading](../input/joystick-reading.md), [Menu System](menu-system.md)

## Overview

Implement arcade-style menu navigation using joystick input with fire button selection. Provides responsive control with proper debouncing to prevent accidental double-selections and rapid scrolling.

## The Pattern

```basic
REM --- JOYSTICK MENU NAVIGATION ---
10 SEL=1:MAXOPT=3:LASTJ=255
20 J=PEEK(56320)
30 IF J=LASTJ THEN GOTO 20  : REM debounce: wait for change
40 LASTJ=J
50 REM navigation
60 IF (J AND 1)=0 THEN SEL=SEL-1:IF SEL<1 THEN SEL=MAXOPT
70 IF (J AND 2)=0 THEN SEL=SEL+1:IF SEL>MAXOPT THEN SEL=1
80 REM selection
90 IF (J AND 16)=0 THEN GOSUB 1000
100 GOSUB 500  : REM redraw
110 GOTO 20
```

## Parameters

| Variable | Type | Purpose | Values |
|----------|------|---------|--------|
| `J` | Integer | Joystick state | 0-255 (bit pattern) |
| `LASTJ` | Integer | Previous joystick state | For debouncing |
| `SEL` | Integer | Current selection | 1 to MAXOPT |
| Port address | Constant | `56320` (port 2) | Hardware register |

## How It Works

### Step 1: Read Joystick Port
```basic
J=PEEK(56320)
```
- Port 2 (standard): `56320`
- Port 1 (player 2): `56321`
- Returns bit pattern (0=pressed, 1=released)

### Step 2: Debounce Check
```basic
IF J=LASTJ THEN GOTO 20
LASTJ=J
```
- Only process when state changes
- Prevents rapid-fire scrolling
- Store current state for next check

### Step 3: Check Directions
```basic
IF (J AND 1)=0 THEN SEL=SEL-1  : REM up
IF (J AND 2)=0 THEN SEL=SEL+1  : REM down
```
- Bit 0 (value 1): Up
- Bit 1 (value 2): Down
- Active low: 0=pressed, 1=released

### Step 4: Check Fire Button
```basic
IF (J AND 16)=0 THEN GOSUB 1000
```
- Bit 4 (value 16): Fire button
- Call selection handler

### Step 5: Wrap Selection
```basic
IF SEL<1 THEN SEL=MAXOPT
IF SEL>MAXOPT THEN SEL=1
```
Circular navigation at bounds

## Variations

### Variation 1: Basic Vertical Navigation
```basic
100 J=PEEK(56320):LASTJ=J
110 IF (J AND 1)=0 THEN SEL=SEL-1:IF SEL<1 THEN SEL=MAXOPT
120 IF (J AND 2)=0 THEN SEL=SEL+1:IF SEL>MAXOPT THEN SEL=1
130 IF (J AND 16)=0 THEN GOSUB ACTION(SEL)
140 FOR D=1 TO 10:NEXT D  : REM simple delay debounce
150 GOTO 100
```

**Use case**: Quick implementation, no state tracking

### Variation 2: With Fire Button Debouncing
```basic
100 J=PEEK(56320)
110 IF (J AND 1)=0 THEN SEL=SEL-1:IF SEL<1 THEN SEL=MAXOPT:FOR D=1 TO 15:NEXT
120 IF (J AND 2)=0 THEN SEL=SEL+1:IF SEL>MAXOPT THEN SEL=1:FOR D=1 TO 15:NEXT
130 IF (J AND 16)=0 AND CANFIRE THEN GOSUB ACTION(SEL):CANFIRE=0
140 IF (J AND 16)<>0 THEN CANFIRE=1  : REM released
150 GOTO 100
```

**Feature**: Prevents double-selection, allows hold-to-scroll

### Variation 3: Horizontal Menu (Left/Right)
```basic
100 J=PEEK(56320)
110 IF J=LASTJ THEN GOTO 100
120 LASTJ=J
130 IF (J AND 4)=0 THEN SEL=SEL-1:IF SEL<1 THEN SEL=MAXOPT       : REM left
140 IF (J AND 8)=0 THEN SEL=SEL+1:IF SEL>MAXOPT THEN SEL=1      : REM right
150 IF (J AND 16)=0 THEN GOSUB ACTION(SEL)
160 GOTO 100
```

**Use case**: Tab bar, horizontal option select

### Variation 4: Both Ports (Two Players)
```basic
100 J1=PEEK(56321):J2=PEEK(56320)
110 REM player 1 (port 1)
120 IF (J1 AND 1)=0 THEN SEL=SEL-1:IF SEL<1 THEN SEL=MAXOPT
130 IF (J1 AND 2)=0 THEN SEL=SEL+1:IF SEL>MAXOPT THEN SEL=1
140 IF (J1 AND 16)=0 THEN GOSUB ACTION(SEL)
150 REM player 2 (port 2) - same controls
160 IF (J2 AND 1)=0 THEN SEL=SEL-1:IF SEL<1 THEN SEL=MAXOPT
170 IF (J2 AND 2)=0 THEN SEL=SEL+1:IF SEL>MAXOPT THEN SEL=1
180 IF (J2 AND 16)=0 THEN GOSUB ACTION(SEL)
190 GOTO 100
```

**Feature**: Either player can navigate menu

### Variation 5: Combined Keyboard and Joystick
```basic
100 GET K$:J=PEEK(56320)
110 REM keyboard input
120 IF K$="W" OR K$=CHR$(145) THEN SEL=SEL-1:IF SEL<1 THEN SEL=MAXOPT
130 IF K$="S" OR K$=CHR$(17) THEN SEL=SEL+1:IF SEL>MAXOPT THEN SEL=1
140 IF K$=" " OR K$=CHR$(13) THEN GOSUB ACTION(SEL)
150 REM joystick input (with debounce)
160 IF J<>LASTJ THEN GOSUB 2000:LASTJ=J
170 GOTO 100

2000 REM JOYSTICK HANDLER
2010 IF (J AND 1)=0 THEN SEL=SEL-1:IF SEL<1 THEN SEL=MAXOPT
2020 IF (J AND 2)=0 THEN SEL=SEL+1:IF SEL>MAXOPT THEN SEL=1
2030 IF (J AND 16)=0 THEN GOSUB ACTION(SEL)
2040 RETURN
```

**Advantage**: Maximum accessibility, player choice

### Variation 6: Diagonal Support (Grid Menu)
```basic
100 J=PEEK(56320)
110 IF J=LASTJ THEN GOTO 100
120 LASTJ=J
130 REM vertical navigation
140 IF (J AND 1)=0 THEN ROW=ROW-1:IF ROW<1 THEN ROW=MAXROW
150 IF (J AND 2)=0 THEN ROW=ROW+1:IF ROW>MAXROW THEN ROW=1
160 REM horizontal navigation
170 IF (J AND 4)=0 THEN COL=COL-1:IF COL<1 THEN COL=MAXCOL
180 IF (J AND 8)=0 THEN COL=COL+1:IF COL>MAXCOL THEN COL=1
190 SEL=(ROW-1)*MAXCOL+COL  : REM calculate linear index
200 IF (J AND 16)=0 THEN GOSUB ACTION(SEL)
210 GOTO 100
```

**Use case**: Grid-based option selection

## Common Mistakes

- **Mistake 1**: Not debouncing
  - **Symptom**: Selection scrolls too fast, double-selections
  - **Fix**: Check `IF J<>LASTJ` or add delay

- **Mistake 2**: Testing for =1 instead of =0
  - **Symptom**: Inverted controls (movement when released)
  - **Fix**: Remember active low: `(J AND bit)=0`

- **Mistake 3**: Forgetting parentheses in AND test
  - **Symptom**: Wrong order of operations, buggy detection
  - **Fix**: Always use `(J AND bit)=0` not `J AND bit=0`

- **Mistake 4**: Wrong port address
  - **Symptom**: No joystick response
  - **Fix**: Port 2=56320 (standard), Port 1=56321

- **Mistake 5**: No fire button debounce
  - **Symptom**: One press selects multiple times
  - **Fix**: Use CANFIRE flag or state tracking

## Memory Usage

- **Variables**: J, LASTJ (~4 bytes)
- **Optional**: CANFIRE for button debounce (~2 bytes)
- **Minimal**: PEEK is built-in, no overhead

## Performance Tips

1. **Read once per frame**:
   ```basic
   REM Good: Read once, use multiple times
   J=PEEK(56320)
   IF (J AND 1)=0 THEN ...
   IF (J AND 2)=0 THEN ...

   REM Bad: Multiple reads
   IF (PEEK(56320) AND 1)=0 THEN ...
   IF (PEEK(56320) AND 2)=0 THEN ...
   ```

2. **Simple debounce first**:
   ```basic
   REM Fast: State comparison
   IF J<>LASTJ THEN process

   REM Slower: Delay loop
   FOR D=1 TO 15:NEXT D
   ```

3. **Skip if no change**:
   ```basic
   J=PEEK(56320)
   IF J=255 AND LASTJ=255 THEN GOTO loop  : REM neutral, skip
   ```

## Integration Example

```basic
NEW
10 REM --- JOYSTICK MENU DEMO ---
20 GOSUB 9000  : REM init
30 SEL=1:LASTJ=255:CANFIRE=1

40 REM main menu loop
50 PRINT CHR$(147);"JOYSTICK MENU DEMO":PRINT
60 GOSUB 1000  : REM draw menu
70 PRINT:PRINT "USE JOYSTICK IN PORT 2:"
80 PRINT "  UP/DOWN  - Navigate"
90 PRINT "  FIRE     - Select"
100 PRINT:PRINT "PRESS Q ON KEYBOARD TO QUIT"

110 REM input loop
120 GET K$:IF K$="Q" OR K$="q" THEN GOTO 300
130 J=PEEK(56320)
140 REM skip if no change
150 IF J=LASTJ THEN GOTO 120
160 LASTJ=J
170 REM navigation
180 IF (J AND 1)=0 THEN GOSUB 2000  : REM up
190 IF (J AND 2)=0 THEN GOSUB 2100  : REM down
200 REM selection
210 IF (J AND 16)=0 AND CANFIRE THEN GOSUB 2200:CANFIRE=0
220 IF (J AND 16)<>0 THEN CANFIRE=1
230 GOTO 40

1000 REM --- DRAW MENU ---
1010 FOR I=1 TO MAXOPT
1020 IF I=SEL THEN PRINT CHR$(18);"  > ";ITEM$(I);CHR$(146)
1030 IF I<>SEL THEN PRINT "    ";ITEM$(I)
1040 NEXT I
1050 RETURN

2000 REM --- MOVE UP ---
2010 SEL=SEL-1
2020 IF SEL<1 THEN SEL=MAXOPT
2030 RETURN

2100 REM --- MOVE DOWN ---
2110 SEL=SEL+1
2120 IF SEL>MAXOPT THEN SEL=1
2130 RETURN

2200 REM --- SELECT OPTION ---
2210 PRINT CHR$(147);"YOU SELECTED: ";ITEM$(SEL)
2220 PRINT:PRINT "RELEASE FIRE BUTTON TO CONTINUE"
2230 J=PEEK(56320):IF (J AND 16)=0 THEN 2230
2240 RETURN

300 REM --- EXIT ---
310 PRINT CHR$(147);"GOODBYE!"
320 END

9000 REM --- INIT MENU ---
9010 DIM ITEM$(3)
9020 ITEM$(1)="START GAME"
9030 ITEM$(2)="OPTIONS"
9040 ITEM$(3)="QUIT"
9050 MAXOPT=3
9060 RETURN
```

## Joystick Bit Reference

| Direction | Bit | Value | Test |
|-----------|-----|-------|------|
| Up | 0 | 1 | `(J AND 1)=0` |
| Down | 1 | 2 | `(J AND 2)=0` |
| Left | 2 | 4 | `(J AND 4)=0` |
| Right | 3 | 8 | `(J AND 8)=0` |
| Fire | 4 | 16 | `(J AND 16)=0` |

## Port Addresses

| Port | Address | Use |
|------|---------|-----|
| Port 1 | 56321 ($DC00) | Player 2 or alternative |
| Port 2 | 56320 ($DC01) | Standard, Player 1 |

## Debouncing Strategies

### State Comparison (Recommended)
```basic
J=PEEK(56320)
IF J=LASTJ THEN GOTO loop
LASTJ=J
REM process input
```

### Fire Button Flag
```basic
IF (J AND 16)=0 AND CANFIRE THEN action:CANFIRE=0
IF (J AND 16)<>0 THEN CANFIRE=1
```

### Delay Loop (Simple)
```basic
IF (J AND 1)=0 THEN action:FOR D=1 TO 15:NEXT D
```

### Frame Counter
```basic
IF (J AND 16)=0 THEN FIRETIME=0
FIRETIME=FIRETIME+1
IF FIRETIME=1 THEN action
```

## Example Values

| Joystick State | Decimal | Binary | Meaning |
|---------------|---------|--------|---------|
| Neutral | 255 | 11111111 | Nothing pressed |
| Up | 254 | 11111110 | Up only |
| Down | 253 | 11111101 | Down only |
| Left | 251 | 11111011 | Left only |
| Right | 247 | 11110111 | Right only |
| Fire | 239 | 11101111 | Fire only |
| Up+Fire | 238 | 11101110 | Up and fire |
| Up+Right | 246 | 11110110 | Diagonal |

## See Also

- [Keyboard Navigation](keyboard-navigation.md) - Keyboard menu control
- [Menu System](menu-system.md) - Complete menu pattern
- [Joystick Reading](../input/joystick-reading.md) - General joystick input
- [Diagonal Movement](../input/diagonal-movement.md) - Joystick movement patterns
- **Lessons**: 51 (Menus & Options), 56 (Galactic Miner)
- **Vault**: [Joystick Hardware](/vault/joysticks)

## Quick Reference Card

```basic
REM Joystick menu navigation
J=PEEK(56320)                             : REM read port 2
IF J=LASTJ THEN GOTO loop                 : REM debounce
LASTJ=J

REM Navigation (active low: 0=pressed)
IF (J AND 1)=0 THEN SEL=SEL-1:IF SEL<1 THEN SEL=MAX
IF (J AND 2)=0 THEN SEL=SEL+1:IF SEL>MAX THEN SEL=1

REM Selection with debounce
IF (J AND 16)=0 AND CANFIRE THEN GOSUB ACTION(SEL):CANFIRE=0
IF (J AND 16)<>0 THEN CANFIRE=1
```

## Arcade-Style Feel

### Rapid Navigation with Hold
```basic
100 J=PEEK(56320)
110 IF (J AND 1)=0 THEN UPHOLD=UPHOLD+1 ELSE UPHOLD=0
120 IF (J AND 2)=0 THEN DOWNHOLD=DOWNHOLD+1 ELSE DOWNHOLD=0
130 REM first press or after hold threshold
140 IF UPHOLD=1 OR UPHOLD>20 THEN SEL=SEL-1:IF SEL<1 THEN SEL=MAX
150 IF DOWNHOLD=1 OR DOWNHOLD>20 THEN SEL=SEL+1:IF SEL>MAX THEN SEL=1
160 IF (J AND 16)=0 AND CANFIRE THEN GOSUB SELECT:CANFIRE=0
170 IF (J AND 16)<>0 THEN CANFIRE=1
180 GOTO 100
```

**Effect**: Initial response, then rapid repeat after hold

### Analog-Style Speed
```basic
100 J=PEEK(56320)
110 SPEED=1
120 IF (J AND 16)=0 THEN SPEED=3  : REM hold fire for fast scroll
130 IF (J AND 1)=0 THEN FOR I=1 TO SPEED:SEL=SEL-1:IF SEL<1 THEN SEL=MAX:NEXT
140 IF (J AND 2)=0 THEN FOR I=1 TO SPEED:SEL=SEL+1:IF SEL>MAX THEN SEL=1:NEXT
```

**Feature**: Fire button modifies scroll speed

## Best Practices

1. **Always debounce**
   - Compare with last state or use delays
   - Prevents unintended rapid selection

2. **Remember active low**
   - 0=pressed, 1=released
   - Test with `(J AND bit)=0`

3. **Read once per frame**
   - Store in variable
   - Use for all checks

4. **Support port 2 primarily**
   - Standard C64 convention
   - Port 2 easier to reach

5. **Combine with keyboard**
   - Maximum accessibility
   - Player choice

---

**Status**: Phase 2 Pattern
**Last Updated**: 2025-01-15
**Source**: Code Like It's 198x - C64 BASIC Course
