# Library Initialization

**Category**: Library Structure
**Difficulty**: Intermediate
**Appears in**: Lessons 49, 50, 51, 56
**Prerequisites**: [READ/DATA Pattern](../data/read-data-pattern.md)

## Overview

Create a reusable collection of utility routines organized in a table for easy dispatch. Libraries bundle common functionality (screen effects, sound, input, HUD) that can be copied between projects and called by index rather than hard-coded line numbers.

## The Pattern

```basic
REM --- LIBRARY INITIALIZATION ---
100 GOSUB 9000               : REM init library once at startup

9000 REM --- LIBRARY INIT ---
9010 DIM LIB(10)
9020 DATA 1000,2000,3000,4000,5000
9030 FOR I=1 TO 5:READ LIB(I):NEXT I
9040 RETURN

REM --- LIBRARY ROUTINES ---
1000 REM CLEAR SCREEN
1010 PRINT CHR$(147):RETURN

2000 REM DRAW BORDER
2010 REM ... border code
2020 RETURN

3000 REM PLAY BEEP
3010 REM ... sound code
3020 RETURN
```

## Parameters

| Variable | Type | Purpose | Typical Values |
|----------|------|---------|----------------|
| `LIB()` | Array | Line number table | Routine entry points |
| DATA | Statement | Routine addresses | Line numbers 1000-9000 |
| Index | Integer | Library function ID | 1 to array size |

## How It Works

### Step 1: Declare Library Table
```basic
DIM LIB(10)
```
- Array holds line numbers of library routines
- Size = number of library functions
- One-time allocation

### Step 2: Load Entry Points
```basic
DATA 1000,2000,3000,4000,5000
FOR I=1 TO 5:READ LIB(I):NEXT I
```
- DATA contains line numbers of each routine
- READ fills table during initialization
- Order defines library function IDs

### Step 3: Call by Index
```basic
GOSUB LIB(3)              : REM call function 3
```
- Index selects which routine
- GOSUB jumps to that line number
- Routine RETURNs to caller

### Step 4: Each Routine Self-Contained
```basic
3000 REM PLAY BEEP
3010 POKE 54272,80:POKE 54273,0
3020 POKE 54277,17
3030 FOR D=1 TO 50:NEXT D
3040 POKE 54277,16
3050 RETURN
```
- Complete functionality in one block
- RETURN at end
- No dependencies on caller state

## Variations

### Variation 1: Named Constants
```basic
100 REM DEFINE LIBRARY CONSTANTS
110 LIB_CLEAR=1
120 LIB_BORDER=2
130 LIB_BEEP=3
140 LIB_STARS=4
150 LIB_HUD=5
160 GOSUB 9000

REM Later in code:
1000 GOSUB LIB(LIB_CLEAR)
1010 GOSUB LIB(LIB_STARS)
1020 GOSUB LIB(LIB_HUD)
```

**Feature**: Self-documenting code, easier maintenance

### Variation 2: With Routine Names
```basic
9000 REM --- LIBRARY INIT ---
9010 DIM LIB(5),LIBNAME$(5)
9020 DATA 1000,"CLEAR SCREEN"
9030 DATA 2000,"DRAW BORDER"
9040 DATA 3000,"PLAY BEEP"
9050 DATA 4000,"STARFIELD"
9060 DATA 5000,"UPDATE HUD"
9070 FOR I=1 TO 5
9080 READ LIB(I),LIBNAME$(I)
9090 NEXT I
9100 RETURN

REM Show library menu:
2000 FOR I=1 TO 5
2010 PRINT I;":";LIBNAME$(I)
2020 NEXT I
```

**Feature**: Display available functions

### Variation 3: Category Organization
```basic
9000 REM --- LIBRARY INIT ---
9010 DIM SCREEN_LIB(5),SOUND_LIB(5),INPUT_LIB(5)
9020 REM Screen routines
9030 DATA 1000,1100,1200,1300,1400
9040 FOR I=1 TO 5:READ SCREEN_LIB(I):NEXT I
9050 REM Sound routines
9060 DATA 2000,2100,2200,2300,2400
9070 FOR I=1 TO 5:READ SOUND_LIB(I):NEXT I
9080 REM Input routines
9090 DATA 3000,3100,3200,3300,3400
9100 FOR I=1 TO 5:READ INPUT_LIB(I):NEXT I
9110 RETURN

REM Call by category:
GOSUB SCREEN_LIB(1)
GOSUB SOUND_LIB(2)
```

**Use case**: Large libraries, logical grouping

### Variation 4: Version Tracking
```basic
9000 REM --- LIBRARY INIT ---
9010 LIBVER$="1.2.3":LIBDATE$="2025-01-15"
9020 PRINT "LOADING RETROLIB V";LIBVER$
9030 DIM LIB(10)
9040 DATA 1000,2000,3000,4000,5000
9050 FOR I=1 TO 5:READ LIB(I):NEXT I
9060 PRINT "LIBRARY READY"
9070 RETURN
```

**Feature**: Track library versions across projects

### Variation 5: Lazy Initialization
```basic
100 IF LIBINIT=0 THEN GOSUB 9000:LIBINIT=1

9000 REM --- LIBRARY INIT ---
9010 IF LIBINIT=1 THEN RETURN  : REM already done
9020 DIM LIB(5)
9030 DATA 1000,2000,3000,4000,5000
9040 FOR I=1 TO 5:READ LIB(I):NEXT I
9050 LIBINIT=1
9060 RETURN
```

**Feature**: Only init when first needed

### Variation 6: Multi-File Library
```basic
REM === MAIN PROGRAM ===
100 GOSUB 9000               : REM init library

REM (rest of game code)

REM === LIBRARY (lines 9000+) ===
9000 REM --- LIBRARY INIT ---
9010 DIM LIB(10)
9020 RESTORE 9100
9030 FOR I=1 TO 10:READ LIB(I):NEXT I
9040 RETURN

9100 DATA 10000,10100,10200,10300,10400
9110 DATA 10500,10600,10700,10800,10900

REM === LIBRARY ROUTINES (lines 10000+) ===
10000 REM CLEAR SCREEN
10010 PRINT CHR$(147):RETURN

10100 REM DRAW BORDER
10110 REM ... code
10120 RETURN
```

**Use case**: Separate library from game code

## Common Mistakes

- **Mistake 1**: Not initializing before use
  - **Symptom**: `?ILLEGAL QUANTITY ERROR` or `?UNDEF'D STATEMENT`
  - **Fix**: Always `GOSUB 9000` before calling library

- **Mistake 2**: Wrong index number
  - **Symptom**: Calling wrong routine or crash
  - **Fix**: Use named constants instead of magic numbers

- **Mistake 3**: Library routines share variables
  - **Symptom**: Unexpected side effects, data corruption
  - **Fix**: Use parameters or document shared globals

- **Mistake 4**: Forgetting RETURN
  - **Symptom**: Code falls through to next routine
  - **Fix**: Every routine must end with RETURN

- **Mistake 5**: Hard-coded line numbers in game
  - **Symptom**: Can't move library routines without breaking game
  - **Fix**: Always call via LIB() array

## Memory Usage

- **LIB() array**: 5 bytes per entry
- **Routine names**: ~3 bytes + length per name
- **Minimal overhead**: Just the dispatch table
- **Saves memory**: Reuse routines vs. duplicate code

## Integration Example

```basic
NEW
10 REM === RETRO GAME ENGINE ===
20 GOSUB 9000               : REM init library
30 GOSUB 100                : REM init game
40 GOSUB 200                : REM main loop
50 END

100 REM --- GAME INIT ---
110 GOSUB LIB(LIB_CLEAR)
120 GOSUB LIB(LIB_BORDER)
130 GOSUB LIB(LIB_STARS)
140 LIVES=3:SCORE=0:LEVEL=1
150 RETURN

200 REM --- MAIN LOOP ---
210 GET K$
220 IF K$="Q" THEN RETURN
230 GOSUB 300               : REM update game
240 GOSUB LIB(LIB_HUD)
250 GOTO 210

300 REM --- UPDATE GAME ---
310 SCORE=SCORE+10
320 IF SCORE MOD 100=0 THEN GOSUB LIB(LIB_BEEP)
330 RETURN

9000 REM === LIBRARY INIT ===
9010 REM Define constants
9020 LIB_CLEAR=1:LIB_BORDER=2:LIB_BEEP=3
9030 LIB_STARS=4:LIB_HUD=5
9040 REM Load table
9050 DIM LIB(10)
9060 DATA 1000,1100,1200,1300,1400
9070 FOR I=1 TO 5:READ LIB(I):NEXT I
9080 PRINT "LIBRARY LOADED"
9090 FOR D=1 TO 120:NEXT D
9100 RETURN

REM === LIBRARY ROUTINES ===
1000 REM --- CLEAR SCREEN ---
1010 PRINT CHR$(147)
1020 RETURN

1100 REM --- DRAW BORDER ---
1110 POKE 53280,0:POKE 53281,0
1120 FOR I=0 TO 39
1130 POKE 1024+I,160
1140 POKE 1024+24*40+I,160
1150 NEXT I
1160 FOR I=1 TO 23
1170 POKE 1024+I*40,160
1180 POKE 1024+I*40+39,160
1190 NEXT I
1200 RETURN

1200 REM --- PLAY BEEP ---
1210 POKE 54295,15:POKE 54296,0
1220 POKE 54272,80:POKE 54273,0
1230 POKE 54275,18:POKE 54276,240
1240 POKE 54277,17
1250 FOR D=1 TO 40:NEXT D
1260 POKE 54277,16
1270 RETURN

1300 REM --- STARFIELD ---
1310 FOR I=1 TO 50
1320 X=INT(RND(1)*40):Y=INT(RND(1)*25)
1330 POKE 1024+Y*40+X,46
1340 NEXT I
1350 RETURN

1400 REM --- UPDATE HUD ---
1410 PRINT CHR$(19);
1420 PRINT "SCORE:";RIGHT$("00000"+STR$(SCORE),5);
1430 PRINT "  LIVES:";LIVES;
1440 PRINT "  LVL:";LEVEL;"  ";
1450 RETURN
```

## Library Organization Strategies

### Strategy 1: By Function (Most Common)
```
1000-1999: Screen/Display
2000-2999: Sound/Music
3000-3999: Input/Controls
4000-4999: Game Logic
5000-5999: Utilities
```

### Strategy 2: By Complexity
```
1000-1999: Simple helpers
2000-2999: Medium complexity
3000-3999: Complex systems
```

### Strategy 3: By Frequency
```
1000-1999: Called every frame
2000-2999: Called occasionally
3000-3999: Init/cleanup only
```

## See Also

- [Subroutine Dispatch](subroutine-dispatch.md) - Calling library routines
- [Parameter Passing](parameter-passing.md) - Sharing data with library
- [Menu System](../menus/menu-system.md) - Uses dispatch pattern
- **Lessons**: 49 (Libraries), 50 (Title Screens), 51 (Menus)
- **Vault**: [Code Reuse](/vault/code-reuse)

## Quick Reference Card

```basic
REM Library initialization pattern
GOSUB 9000               : REM init once

9000 REM LIBRARY INIT
9010 DIM LIB(count)
9020 DATA line1,line2,line3,...
9030 FOR I=1 TO count:READ LIB(I):NEXT I
9040 RETURN

REM Call library routine:
GOSUB LIB(index)

REM Named constants (optional):
LIB_FUNC1=1:LIB_FUNC2=2:LIB_FUNC3=3

REM Library routine template:
1000 REM ROUTINE NAME
1010 REM ... code ...
1020 RETURN
```

## Library Routine Template

```basic
XXXX REM --- ROUTINE NAME ---
XXXX+10 REM Purpose: Brief description
XXXX+20 REM Inputs: Variable names
XXXX+30 REM Outputs: Variable names
XXXX+40 REM Side effects: What it changes
XXXX+50 REM ... actual code ...
XXXX+90 RETURN
```

## Best Practices

1. **Initialize once at startup**
   - Before any library calls
   - After RND seed, before game logic
   - Store in known line (9000 by convention)

2. **Use named constants**
   - `LIB_CLEAR=1` not magic numbers
   - Self-documenting code
   - Easy to reorder routines

3. **Keep routines independent**
   - Don't assume caller state
   - Document required variables
   - Return cleanly

4. **Organize by line number**
   - Consistent spacing (100 lines apart)
   - Group related functions
   - Leave room for expansion

5. **Document each routine**
   - REM comment at start
   - List inputs/outputs
   - Note side effects

---

**Status**: Phase 3 Pattern
**Last Updated**: 2025-01-15
**Source**: Code Like It's 198x - C64 BASIC Course
