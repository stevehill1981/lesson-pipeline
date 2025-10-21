# Menu System

**Category**: Menus
**Difficulty**: Intermediate
**Appears in**: Lessons 51, 52, 56
**Prerequisites**: [Basic State Machine](../state-machines/basic-state-machine.md), [ON...GOTO Dispatch](../state-machines/on-goto-dispatch.md)

## Overview

Build interactive menu systems using arrays to store menu items and actions, with cursor highlighting and dispatch to handler routines. Essential for title screens, options, pause menus, and level selection.

## The Pattern

```basic
REM --- MENU SYSTEM ---
10 DIM ITEM$(3),ACTION(3)
20 DATA "START GAME",1000,"OPTIONS",2000,"QUIT",3000
30 FOR I=1 TO 3:READ ITEM$(I):READ ACTION(I):NEXT I
40 SEL=1:MAXOPT=3

50 REM menu loop
60 PRINT CHR$(147);"MAIN MENU":PRINT
70 GOSUB 1000  : REM draw menu
80 GET K$:IF K$="" THEN GOTO 80
90 IF K$="W" THEN GOSUB 1100  : REM move up
100 IF K$="S" THEN GOSUB 1200  : REM move down
110 IF K$=CHR$(13) THEN GOSUB ACTION(SEL)  : REM select
120 GOTO 60

1000 REM --- DRAW MENU ---
1010 FOR I=1 TO MAXOPT
1020 IF I=SEL THEN PRINT CHR$(18);"> ";ITEM$(I);CHR$(146) ELSE PRINT "  ";ITEM$(I)
1030 NEXT I
1040 RETURN

1100 REM --- MOVE UP ---
1110 SEL=SEL-1:IF SEL<1 THEN SEL=MAXOPT
1120 RETURN

1200 REM --- MOVE DOWN ---
1210 SEL=SEL+1:IF SEL>MAXOPT THEN SEL=1
1220 RETURN
```

## Parameters

| Variable | Type | Purpose | Typical Values |
|----------|------|---------|----------------|
| `ITEM$()` | String array | Menu item labels | "START", "OPTIONS", "QUIT" |
| `ACTION()` | Integer array | Handler line numbers | 1000, 2000, 3000 |
| `SEL` | Integer | Current selection | 1 to MAXOPT |
| `MAXOPT` | Integer | Number of menu items | 2-10 |

## How It Works

### Step 1: Define Menu Data
```basic
10 DIM ITEM$(3),ACTION(3)
20 DATA "START GAME",1000,"OPTIONS",2000,"QUIT",3000
30 FOR I=1 TO 3:READ ITEM$(I):READ ACTION(I):NEXT I
```
- Store labels and handler line numbers in parallel arrays
- Load from DATA for easy modification

### Step 2: Initialize Selection
```basic
40 SEL=1:MAXOPT=3
```
- SEL tracks current highlighted item
- MAXOPT defines bounds

### Step 3: Draw Menu with Highlight
```basic
1010 FOR I=1 TO MAXOPT
1020 IF I=SEL THEN PRINT CHR$(18);"> ";ITEM$(I);CHR$(146) ELSE PRINT "  ";ITEM$(I)
1030 NEXT I
```
- `CHR$(18)` turns on reverse video (highlight)
- `CHR$(146)` turns off reverse video
- `"> "` adds cursor indicator

### Step 4: Navigate
```basic
1100 REM MOVE UP
1110 SEL=SEL-1:IF SEL<1 THEN SEL=MAXOPT  : REM wrap to bottom
1120 RETURN

1200 REM MOVE DOWN
1210 SEL=SEL+1:IF SEL>MAXOPT THEN SEL=1  : REM wrap to top
1220 RETURN
```
Wrapping creates circular navigation

### Step 5: Execute Selection
```basic
110 IF K$=CHR$(13) THEN GOSUB ACTION(SEL)
```
Dispatch to handler stored in ACTION() array

## Variations

### Variation 1: Simple 3-Option Menu
```basic
10 DIM ITEM$(3),ACTION(3)
20 ITEM$(1)="PLAY":ACTION(1)=2000
30 ITEM$(2)="OPTIONS":ACTION(2)=3000
40 ITEM$(3)="QUIT":ACTION(3)=4000
50 SEL=1:MAXOPT=3
60 GOSUB 1000  : REM draw
70 GET K$:IF K$="" THEN 70
80 IF K$="W" THEN SEL=SEL-1:IF SEL<1 THEN SEL=3:GOSUB 1000
90 IF K$="S" THEN SEL=SEL+1:IF SEL>3 THEN SEL=1:GOSUB 1000
100 IF K$=CHR$(13) THEN GOSUB ACTION(SEL)
110 GOTO 60
```

### Variation 2: Menu with Descriptions
```basic
10 DIM ITEM$(3),DESC$(3),ACTION(3)
20 DATA "PLAY","Begin your adventure",2000
30 DATA "LOAD","Continue saved game",3000
40 DATA "QUIT","Exit to BASIC",4000
50 FOR I=1 TO 3
60 READ ITEM$(I):READ DESC$(I):READ ACTION(I)
70 NEXT I

1000 REM DRAW WITH DESCRIPTIONS
1010 FOR I=1 TO 3
1020 IF I=SEL THEN PRINT CHR$(18);" ";ITEM$(I);CHR$(146) ELSE PRINT " ";ITEM$(I)
1030 NEXT I
1040 PRINT:PRINT DESC$(SEL)  : REM show description of selected
1050 RETURN
```

### Variation 3: Numbered Menu
```basic
1000 REM DRAW NUMBERED MENU
1010 FOR I=1 TO MAXOPT
1020 IF I=SEL THEN PRINT CHR$(18);I;". ";ITEM$(I);CHR$(146) ELSE PRINT I;". ";ITEM$(I)
1030 NEXT I
1040 RETURN

80 REM NUMBER KEY SELECTION
90 IF K$>="1" AND K$<="9" THEN N=VAL(K$):IF N<=MAXOPT THEN SEL=N:GOSUB ACTION(SEL)
```

### Variation 4: Toggle Options Menu
```basic
10 DIM ITEM$(3),VALUE(3),VALUENAME$(3,2)
20 REM Setup toggle options
30 ITEM$(1)="SOUND":VALUE(1)=1
40 VALUENAME$(1,0)="OFF":VALUENAME$(1,1)="ON"
50 ITEM$(2)="DIFFICULTY":VALUE(2)=0
60 VALUENAME$(2,0)="EASY":VALUENAME$(2,1)="HARD"

1000 REM DRAW TOGGLES
1010 FOR I=1 TO MAXOPT
1020 V$=VALUENAME$(I,VALUE(I))
1030 IF I=SEL THEN PRINT CHR$(18);ITEM$(I);": ";V$;CHR$(146) ELSE PRINT ITEM$(I);": ";V$
1040 NEXT I
1050 RETURN

1300 REM TOGGLE VALUE
1310 VALUE(SEL)=1-VALUE(SEL)  : REM flip 0<->1
1320 GOSUB 1000  : REM redraw
1330 RETURN
```

### Variation 5: Horizontal Menu (Tab Bar)
```basic
1000 REM DRAW HORIZONTAL
1010 FOR I=1 TO MAXOPT
1020 IF I=SEL THEN PRINT CHR$(18);" ";ITEM$(I);" ";CHR$(146);
1030 IF I<>SEL THEN PRINT "  ";ITEM$(I);"  ";
1040 NEXT I
1050 PRINT
1060 RETURN

1100 REM MOVE LEFT
1110 SEL=SEL-1:IF SEL<1 THEN SEL=MAXOPT
1120 RETURN

1200 REM MOVE RIGHT
1210 SEL=SEL+1:IF SEL>MAXOPT THEN SEL=1
1220 RETURN
```

### Variation 6: Hierarchical Menu (Sub-Menus)
```basic
10 DIM MAINITEM$(3),SUBMENU(3)
20 MAINITEM$(1)="GAME":SUBMENU(1)=1
30 MAINITEM$(2)="SETTINGS":SUBMENU(2)=2
40 MAINITEM$(3)="QUIT":SUBMENU(3)=0
50 CURMENU=0:SEL=1

1000 REM DISPATCH BY MENU LEVEL
1010 IF CURMENU=0 THEN GOSUB 2000  : REM main menu
1020 IF CURMENU=1 THEN GOSUB 3000  : REM game submenu
1030 IF CURMENU=2 THEN GOSUB 4000  : REM settings submenu
1040 RETURN

1300 REM SELECT ACTION
1310 IF CURMENU=0 THEN CURMENU=SUBMENU(SEL):SEL=1:RETURN
1320 REM handle submenu selection
1330 RETURN
```

## Common Mistakes

- **Mistake 1**: Not wrapping selection at bounds
  - **Symptom**: SEL goes negative or beyond MAXOPT
  - **Fix**: Always check `IF SEL<1 THEN SEL=MAXOPT`

- **Mistake 2**: Forgetting to redraw after selection change
  - **Symptom**: Highlight doesn't move
  - **Fix**: Call draw routine after changing SEL

- **Mistake 3**: Not clearing screen before redraw
  - **Symptom**: Old menu items visible
  - **Fix**: `PRINT CHR$(147)` before redraw

- **Mistake 4**: Using blocking INPUT instead of GET
  - **Symptom**: Can't animate, menu feels sluggish
  - **Fix**: Always use GET in menu loop

- **Mistake 5**: Not handling empty ACTION() entries
  - **Symptom**: GOSUB to line 0 crashes
  - **Fix**: Check `IF ACTION(SEL)>0 THEN GOSUB ACTION(SEL)`

## Memory Usage

- **Arrays**: ITEM$() and ACTION() (~40 bytes per item)
- **Variables**: SEL, MAXOPT (~4 bytes)
- **Optional**: DESC$(), VALUE() for enhanced menus

## Performance Tips

1. **Redraw only when needed**:
   ```basic
   REM Good: Redraw only on selection change
   IF LASTSEL<>SEL THEN GOSUB DRAW_MENU:LASTSEL=SEL

   REM Wasteful: Redraw every frame
   GOSUB DRAW_MENU
   ```

2. **Pre-format menu text**:
   ```basic
   REM Setup once
   9000 FOR I=1 TO MAXOPT
   9010 FORMATTED$(I)="  "+ITEM$(I)
   9020 NEXT I

   REM Draw fast
   1010 FOR I=1 TO MAXOPT
   1020 IF I=SEL THEN PRINT CHR$(18);LEFT$(FORMATTED$(I),1);">"+RIGHT$(FORMATTED$(I),LEN(FORMATTED$(I))-2);CHR$(146)
   1030 IF I<>SEL THEN PRINT FORMATTED$(I)
   1040 NEXT I
   ```

3. **Cache menu dimensions**:
   ```basic
   9000 MAXOPT=3:MENUX=10:MENUY=5
   ```

## Integration Example

```basic
NEW
10 REM --- COMPLETE MENU SYSTEM ---
20 GOSUB 9000  : REM init
30 STATE=0  : REM 0=main menu, 1=playing

40 REM title screen
50 IF STATE=0 THEN GOSUB 1000:GOTO 40
60 IF STATE=1 THEN GOSUB 5000:GOTO 60  : REM game loop

1000 REM === MAIN MENU STATE ===
1010 PRINT CHR$(147);"SPACE QUEST":PRINT
1020 GOSUB 2000  : REM draw menu
1030 GET K$:IF K$="" THEN RETURN
1040 IF K$="W" OR K$=CHR$(145) THEN GOSUB 2100  : REM up
1050 IF K$="S" OR K$=CHR$(17) THEN GOSUB 2200  : REM down
1060 IF K$=CHR$(13) OR K$=" " THEN GOSUB 2300  : REM select
1070 RETURN

2000 REM --- DRAW MENU ---
2010 FOR I=1 TO MAXOPT
2020 PRINT TAB(12);
2030 IF I=SEL THEN PRINT CHR$(18);" ";ITEM$(I);" ";CHR$(146) ELSE PRINT "  ";ITEM$(I);"  "
2040 NEXT I
2050 PRINT:PRINT TAB(10);"W/S=MOVE  RETURN=SELECT"
2060 RETURN

2100 REM --- MOVE UP ---
2110 SEL=SEL-1
2120 IF SEL<1 THEN SEL=MAXOPT
2130 RETURN

2200 REM --- MOVE DOWN ---
2210 SEL=SEL+1
2220 IF SEL>MAXOPT THEN SEL=1
2230 RETURN

2300 REM --- EXECUTE SELECTION ---
2310 IF ACTION(SEL)=0 THEN RETURN  : REM no action
2320 GOSUB ACTION(SEL)
2330 RETURN

3000 REM --- START GAME ---
3010 STATE=1  : REM switch to game
3020 PRINT CHR$(147);"LOADING..."
3030 FOR D=1 TO 120:NEXT D
3040 RETURN

4000 REM --- OPTIONS ---
4010 PRINT CHR$(147);"OPTIONS":PRINT
4020 PRINT "SOUND: ON"
4030 PRINT "DIFFICULTY: NORMAL"
4040 PRINT:PRINT "PRESS ANY KEY"
4050 GET K$:IF K$="" THEN 4050
4060 RETURN

5000 REM --- HIGH SCORES ---
5010 PRINT CHR$(147);"HIGH SCORES":PRINT
5020 PRINT "1. ACE    600"
5030 PRINT "2. JAX    480"
5040 PRINT "3. MIN    360"
5050 PRINT:PRINT "PRESS ANY KEY"
5060 GET K$:IF K$="" THEN 5060
5070 RETURN

6000 REM --- QUIT ---
6010 PRINT CHR$(147);"THANKS FOR PLAYING!"
6020 END

9000 REM --- INIT MENU DATA ---
9010 DIM ITEM$(4),ACTION(4)
9020 DATA "START GAME",3000
9030 DATA "OPTIONS",4000
9040 DATA "HIGH SCORES",5000
9050 DATA "QUIT",6000
9060 FOR I=1 TO 4
9070 READ ITEM$(I):READ ACTION(I)
9080 NEXT I
9090 SEL=1:MAXOPT=4
9100 RETURN
```

## Menu Layout Patterns

### Centered Vertical
```basic
1010 FOR I=1 TO MAXOPT
1020 PRINT TAB(15);
1030 IF I=SEL THEN PRINT CHR$(18);"> ";ITEM$(I);CHR$(146)
1040 IF I<>SEL THEN PRINT "  ";ITEM$(I)
1050 NEXT I
```

### Left-Aligned with Box
```basic
1010 PRINT "+------------------+"
1020 FOR I=1 TO MAXOPT
1030 IF I=SEL THEN PRINT CHR$(18);"| > ";ITEM$(I);CHR$(146);TAB(19);"|"
1040 IF I<>SEL THEN PRINT "|   ";ITEM$(I);TAB(19);"|"
1050 NEXT I
1060 PRINT "+------------------+"
```

### Grid Layout (2 columns)
```basic
1010 FOR R=1 TO INT((MAXOPT+1)/2)
1020 I1=R*2-1:I2=R*2
1030 IF I1=SEL THEN PRINT CHR$(18);"> ";ITEM$(I1);CHR$(146);TAB(20);
1040 IF I1<>SEL THEN PRINT "  ";ITEM$(I1);TAB(20);
1050 IF I2<=MAXOPT AND I2=SEL THEN PRINT CHR$(18);"> ";ITEM$(I2);CHR$(146)
1060 IF I2<=MAXOPT AND I2<>SEL THEN PRINT "  ";ITEM$(I2)
1070 IF I2>MAXOPT THEN PRINT
1080 NEXT R
```

## See Also

- [Keyboard Navigation](keyboard-navigation.md) - Keyboard input patterns
- [Joystick Navigation](joystick-navigation.md) - Joystick input patterns
- [Basic State Machine](../state-machines/basic-state-machine.md) - Menu as title state
- [ON...GOTO Dispatch](../state-machines/on-goto-dispatch.md) - Action dispatch
- **Lessons**: 51 (Menus & Options), 52 (Multiple Levels), 56 (Galactic Miner)
- **Vault**: [Menu Design](/vault/menus)

## Quick Reference Card

```basic
REM Menu system pattern
DIM ITEM$(n),ACTION(n)
FOR I=1 TO n:READ ITEM$(I):READ ACTION(I):NEXT
SEL=1:MAXOPT=n

REM Draw with highlight
FOR I=1 TO MAXOPT
  IF I=SEL THEN PRINT CHR$(18);"> ";ITEM$(I);CHR$(146)
  IF I<>SEL THEN PRINT "  ";ITEM$(I)
NEXT I

REM Navigate
IF K$="W" THEN SEL=SEL-1:IF SEL<1 THEN SEL=MAXOPT
IF K$="S" THEN SEL=SEL+1:IF SEL>MAXOPT THEN SEL=1

REM Execute
IF K$=CHR$(13) THEN GOSUB ACTION(SEL)
```

## Control Characters Reference

| Character | Code | Purpose |
|-----------|------|---------|
| Cursor Home | `CHR$(19)` | Move cursor to top-left |
| Cursor Up | `CHR$(145)` | Move cursor up one line |
| Cursor Down | `CHR$(17)` | Move cursor down one line |
| Return | `CHR$(13)` | Select/confirm |
| Reverse On | `CHR$(18)` | Start highlighted text |
| Reverse Off | `CHR$(146)` | End highlighted text |
| Clear Screen | `CHR$(147)` | Clear and home |

## Best Practices

1. **Always wrap selection**
   - Prevents out-of-bounds errors
   - Creates smooth circular navigation

2. **Use reverse video for highlight**
   - Clear visual feedback
   - Standard C64 convention

3. **Store actions in array**
   - Easy to modify menu structure
   - Clean dispatch with GOSUB ACTION(SEL)

4. **Redraw after selection change**
   - Keeps highlight visible
   - Prevents stale display

5. **Support both keyboard and joystick**
   - Broader accessibility
   - Arcade feel with joystick

---

**Status**: Phase 2 Pattern
**Last Updated**: 2025-01-15
**Source**: Code Like It's 198x - C64 BASIC Course
