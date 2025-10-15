# Keyboard Navigation

**Category**: Menus
**Difficulty**: Beginner
**Appears in**: Lessons 51, 52, 56
**Prerequisites**: [Keyboard Polling](../input/keyboard-polling.md), [Menu System](menu-system.md)

## Overview

Implement responsive keyboard-based menu navigation using non-blocking GET input with support for WASD, cursor keys, and selection keys. Essential for accessible menu systems that feel responsive and professional.

## The Pattern

```basic
REM --- KEYBOARD MENU NAVIGATION ---
10 SEL=1:MAXOPT=3
20 GET K$:IF K$="" THEN GOTO 20
30 REM navigation
40 IF K$="W" OR K$=CHR$(145) THEN SEL=SEL-1:IF SEL<1 THEN SEL=MAXOPT
50 IF K$="S" OR K$=CHR$(17) THEN SEL=SEL+1:IF SEL>MAXOPT THEN SEL=1
60 REM selection
70 IF K$=CHR$(13) OR K$=" " THEN GOSUB 1000  : REM select
80 IF K$="Q" THEN END
90 GOSUB 500  : REM redraw
100 GOTO 20
```

## Parameters

| Variable | Type | Purpose | Values |
|----------|------|---------|--------|
| `K$` | String | Key pressed | Single character |
| `SEL` | Integer | Current selection | 1 to MAXOPT |
| `MAXOPT` | Integer | Number of options | Menu item count |
| `CHR$(145)` | String | Cursor up | Cursor control |
| `CHR$(17)` | String | Cursor down | Cursor control |
| `CHR$(13)` | String | Return key | Selection |

## How It Works

### Step 1: Non-Blocking Input
```basic
GET K$:IF K$="" THEN GOTO 20
```
- `GET` reads one key without blocking
- Returns empty string if no key pressed
- Loop back immediately if no input

### Step 2: Check Multiple Keys
```basic
IF K$="W" OR K$=CHR$(145) THEN SEL=SEL-1
```
- Support both WASD and cursor keys
- Players choose their preferred control scheme
- `OR` allows either key to work

### Step 3: Update Selection
```basic
SEL=SEL-1:IF SEL<1 THEN SEL=MAXOPT
```
- Modify selection based on direction
- Wrap at boundaries for circular navigation

### Step 4: Selection Keys
```basic
IF K$=CHR$(13) OR K$=" " THEN GOSUB 1000
```
- RETURN or SPACE to select
- SPACE more comfortable for menus
- Both common conventions

## Variations

### Variation 1: WASD Only
```basic
100 GET K$
110 IF K$="W" THEN SEL=SEL-1:IF SEL<1 THEN SEL=MAXOPT
120 IF K$="S" THEN SEL=SEL+1:IF SEL>MAXOPT THEN SEL=1
130 IF K$=" " THEN GOSUB ACTION(SEL)
140 GOTO 100
```

**Use case**: Simple, modern control scheme

### Variation 2: Cursor Keys Only
```basic
100 GET K$
110 IF K$=CHR$(145) THEN SEL=SEL-1:IF SEL<1 THEN SEL=MAXOPT  : REM up
120 IF K$=CHR$(17) THEN SEL=SEL+1:IF SEL>MAXOPT THEN SEL=1   : REM down
130 IF K$=CHR$(13) THEN GOSUB ACTION(SEL)  : REM return
140 GOTO 100
```

**Use case**: Traditional C64 feel

### Variation 3: Number Key Selection
```basic
100 GET K$
110 REM navigation
120 IF K$="W" OR K$=CHR$(145) THEN GOSUB NAV_UP
130 IF K$="S" OR K$=CHR$(17) THEN GOSUB NAV_DOWN
140 REM direct selection
150 IF K$>="1" AND K$<="9" THEN N=VAL(K$):IF N<=MAXOPT THEN SEL=N:GOSUB ACTION(N)
160 REM confirm
170 IF K$=CHR$(13) THEN GOSUB ACTION(SEL)
180 GOTO 100
```

**Feature**: Type number for instant selection

### Variation 4: Arrow Keys (Left/Right)
```basic
100 GET K$
110 REM horizontal navigation
120 IF K$="A" OR K$=CHR$(157) THEN SEL=SEL-1:IF SEL<1 THEN SEL=MAXOPT     : REM left
130 IF K$="D" OR K$=CHR$(29) THEN SEL=SEL+1:IF SEL>MAXOPT THEN SEL=1      : REM right
140 IF K$=CHR$(13) THEN GOSUB ACTION(SEL)
150 GOTO 100
```

**Use case**: Horizontal tab bar menus

### Variation 5: With Debouncing
```basic
100 GET K$
110 IF K$<>"" AND LASTKEY$=K$ AND KEYDELAY>0 THEN K$="":KEYDELAY=KEYDELAY-1:GOTO 100
120 IF K$<>"" AND K$<>LASTKEY$ THEN KEYDELAY=10:LASTKEY$=K$
130 IF K$="W" OR K$=CHR$(145) THEN SEL=SEL-1:IF SEL<1 THEN SEL=MAXOPT
140 IF K$="S" OR K$=CHR$(17) THEN SEL=SEL+1:IF SEL>MAXOPT THEN SEL=1
150 IF K$=CHR$(13) THEN GOSUB ACTION(SEL)
160 GOTO 100
```

**Feature**: Prevents accidental double-presses

### Variation 6: Multi-Key Buffer
```basic
100 GET K$:IF K$<>"" THEN KEYBUF$=KEYBUF$+K$
110 IF KEYBUF$="" THEN GOTO 100
120 K$=LEFT$(KEYBUF$,1):KEYBUF$=RIGHT$(KEYBUF$,LEN(KEYBUF$)-1)
130 REM process K$
140 IF K$="W" THEN SEL=SEL-1:IF SEL<1 THEN SEL=MAXOPT
150 IF K$="S" THEN SEL=SEL+1:IF SEL>MAXOPT THEN SEL=1
160 GOTO 100
```

**Advanced**: Buffers rapid keypresses

## Common Mistakes

- **Mistake 1**: Using INPUT instead of GET
  - **Symptom**: Menu blocks, can't animate
  - **Fix**: Always use GET for menus

- **Mistake 2**: Not handling empty GET
  - **Symptom**: Loop runs wild when no key pressed
  - **Fix**: Check `IF K$="" THEN GOTO loop`

- **Mistake 3**: Forgetting cursor key codes
  - **Symptom**: Cursor keys don't work
  - **Fix**: Use `CHR$(145)` for up, `CHR$(17)` for down

- **Mistake 4**: Not supporting both WASD and cursors
  - **Symptom**: Limited accessibility
  - **Fix**: Use OR: `IF K$="W" OR K$=CHR$(145)`

- **Mistake 5**: Case-sensitive key checks
  - **Symptom**: Only lowercase works
  - **Fix**: Check both: `IF K$="W" OR K$="w"`

## Memory Usage

- **Variables**: K$, LASTKEY$ (~4 bytes)
- **Optional**: KEYBUF$ for buffering (~20 bytes)
- **Minimal**: GET is built-in, no overhead

## Performance Tips

1. **Check most common keys first**:
   ```basic
   REM Good: Check frequent keys first
   IF K$=" " THEN GOSUB SELECT
   IF K$="W" THEN SEL=SEL-1
   IF K$="S" THEN SEL=SEL+1

   REM Less optimal: Rare keys first
   IF K$="Q" THEN END
   IF K$="W" THEN SEL=SEL-1
   ```

2. **Combine related checks**:
   ```basic
   REM Good: One line per direction
   IF K$="W" OR K$=CHR$(145) THEN SEL=SEL-1:IF SEL<1 THEN SEL=MAXOPT

   REM Verbose: Multiple lines
   IF K$="W" THEN SEL=SEL-1
   IF K$=CHR$(145) THEN SEL=SEL-1
   IF SEL<1 THEN SEL=MAXOPT
   ```

3. **Skip redraw if no change**:
   ```basic
   IF K$="" THEN GOTO loop
   REM only redraw if key was pressed
   ```

## Integration Example

```basic
NEW
10 REM --- KEYBOARD MENU DEMO ---
20 GOSUB 9000  : REM init
30 SEL=1:RUNNING=1

40 REM main menu loop
50 PRINT CHR$(147);"KEYBOARD MENU DEMO":PRINT
60 GOSUB 1000  : REM draw menu
70 PRINT:PRINT "CONTROLS:"
80 PRINT "W/UP ARROW   = UP"
90 PRINT "S/DOWN ARROW = DOWN"
100 PRINT "SPACE/RETURN = SELECT"
110 PRINT "1-3          = DIRECT SELECT"
120 PRINT "Q            = QUIT"

130 REM input loop
140 GET K$:IF K$="" THEN GOTO 140
150 REM navigation
160 IF K$="W" OR K$="w" OR K$=CHR$(145) THEN GOSUB 2000
170 IF K$="S" OR K$="s" OR K$=CHR$(17) THEN GOSUB 2100
180 REM selection
190 IF K$=CHR$(13) OR K$=" " THEN GOSUB 2200
200 REM direct selection
210 IF K$>="1" AND K$<="3" THEN N=VAL(K$):SEL=N:GOSUB 2200
220 REM quit
230 IF K$="Q" OR K$="q" THEN RUNNING=0
240 IF RUNNING THEN GOTO 50 ELSE GOTO 300

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
2220 PRINT:PRINT "PRESS ANY KEY TO CONTINUE"
2230 GET K$:IF K$="" THEN 2230
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

## Key Code Reference

| Key | Standard | Alternative | CHR$ Code |
|-----|----------|-------------|-----------|
| Up | W | Cursor Up | CHR$(145) |
| Down | S | Cursor Down | CHR$(17) |
| Left | A | Cursor Left | CHR$(157) |
| Right | D | Cursor Right | CHR$(29) |
| Select | Space | Return | CHR$(13) |
| Cancel | Q | Run/Stop | CHR$(3) |

## Cursor Control Codes

```basic
REM Cursor movement
CHR$(17)  : REM Cursor down
CHR$(145) : REM Cursor up
CHR$(29)  : REM Cursor right
CHR$(157) : REM Cursor left
CHR$(19)  : REM Cursor home (top-left)
CHR$(147) : REM Clear screen and home
```

## Input Response Patterns

### Immediate Response
```basic
100 GET K$
110 IF K$<>"" THEN GOSUB HANDLE_KEY
120 GOTO 100
```

### Delayed Response (Debounce)
```basic
100 GET K$
110 IF K$="" THEN DELAY=0:GOTO 100
120 IF DELAY>0 THEN DELAY=DELAY-1:GOTO 100
130 DELAY=10
140 GOSUB HANDLE_KEY
150 GOTO 100
```

### Repeat After Hold
```basic
100 GET K$
110 IF K$="" THEN HOLDTIME=0:LASTKEY$="":GOTO 100
120 IF K$=LASTKEY$ THEN HOLDTIME=HOLDTIME+1 ELSE HOLDTIME=0:LASTKEY$=K$
130 IF HOLDTIME=0 OR HOLDTIME>20 THEN GOSUB HANDLE_KEY
140 GOTO 100
```

## See Also

- [Joystick Navigation](joystick-navigation.md) - Joystick menu control
- [Menu System](menu-system.md) - Complete menu pattern
- [Keyboard Polling](../input/keyboard-polling.md) - General keyboard input
- **Lessons**: 51 (Menus & Options), 52 (Multiple Levels)
- **Vault**: [Keyboard Hardware](/vault/keyboard)

## Quick Reference Card

```basic
REM Keyboard navigation pattern
GET K$:IF K$="" THEN GOTO loop

REM Navigation (support both WASD and cursors)
IF K$="W" OR K$=CHR$(145) THEN SEL=SEL-1:IF SEL<1 THEN SEL=MAX
IF K$="S" OR K$=CHR$(17) THEN SEL=SEL+1:IF SEL>MAX THEN SEL=1

REM Selection (support both SPACE and RETURN)
IF K$=" " OR K$=CHR$(13) THEN GOSUB ACTION(SEL)

REM Quit
IF K$="Q" THEN END
```

## Accessibility Features

### Case-Insensitive Input
```basic
K$=K$  : REM K$ is already uppercase from GET on C64
REM But if needed, check both:
IF K$="W" OR K$="w" THEN SEL=SEL-1
```

### Alternative Keys
```basic
REM Support multiple control schemes
IF K$="W" OR K$=CHR$(145) OR K$="I" THEN SEL=SEL-1  : REM W, up arrow, or I
IF K$="S" OR K$=CHR$(17) OR K$="K" THEN SEL=SEL+1   : REM S, down arrow, or K
```

### Help Display
```basic
1000 REM SHOW CONTROLS
1010 PRINT:PRINT "CONTROLS:"
1020 PRINT "  W or UP    - Move up"
1030 PRINT "  S or DOWN  - Move down"
1040 PRINT "  SPACE/RET  - Select"
1050 PRINT "  1-9        - Direct select"
1060 PRINT "  Q          - Quit"
1070 RETURN
```

## Best Practices

1. **Always use GET, never INPUT**
   - Menus must be responsive
   - INPUT blocks all execution

2. **Support multiple key options**
   - WASD and cursor keys
   - SPACE and RETURN for selection
   - Broader accessibility

3. **Check for empty string**
   - Prevents wasted CPU cycles
   - Clean loop structure

4. **Provide visual feedback**
   - Highlight moves immediately
   - Sound on selection optional

5. **Handle case sensitivity**
   - C64 GET returns uppercase by default
   - Check both cases if needed

---

**Status**: Phase 2 Pattern
**Last Updated**: 2025-01-15
**Source**: Code Like It's 198x - C64 BASIC Course
