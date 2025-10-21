# Subroutine Dispatch

**Category**: Library Structure
**Difficulty**: Intermediate
**Appears in**: Lessons 49, 51, 56
**Prerequisites**: [Library Initialization](library-initialization.md)

## Overview

Call library routines dynamically by index using stored line numbers in an array. Enables flexible function calls, menu systems, state machines, and data-driven behavior without hard-coding GOSUB targets.

## The Pattern

```basic
REM --- SUBROUTINE DISPATCH ---
100 CHOICE=3                 : REM select function
110 GOSUB LIB(CHOICE)        : REM dispatch to it

REM or inline:
200 INPUT "FUNCTION (1-5)";F
210 IF F<1 OR F>5 THEN 200
220 GOSUB LIB(F)
```

## Parameters

| Variable | Type | Purpose | Typical Values |
|----------|------|---------|----------------|
| `LIB()` | Array | Function table | Line numbers |
| Index | Integer | Function ID | 1 to array size |
| `L` or `F` | Integer | Temp for line number | Copy of LIB(I) |

## How It Works

### Step 1: Select Function
```basic
CHOICE=3
```
- Determine which function to call
- From user input, game logic, or data
- Must be valid index (1 to array size)

### Step 2: Look Up Line Number
```basic
L=LIB(CHOICE)
```
- Optional: Copy to temp variable
- LIB(CHOICE) contains target line number
- Direct or indirect dispatch

### Step 3: GOSUB to Target
```basic
GOSUB L
```
- Jumps to that line number
- Executes routine
- Returns to next line after GOSUB

### Step 4: Routine Executes
```basic
1200 REM LIBRARY ROUTINE
1210 REM ... code ...
1220 RETURN
```
- Runs independently
- RETURNs to caller
- No knowledge of how it was called

## Variations

### Variation 1: Direct Dispatch
```basic
100 INPUT "CHOICE";C
110 GOSUB LIB(C)
```

**Simplest**: One line dispatch

### Variation 2: Menu Dispatch
```basic
100 REM MENU LOOP
110 GET K$:IF K$="" THEN 110
120 IF K$="W" THEN SEL=SEL-1:IF SEL<1 THEN SEL=MAXOPT
130 IF K$="S" THEN SEL=SEL+1:IF SEL>MAXOPT THEN SEL=1
140 IF K$=CHR$(13) THEN GOSUB ACTION(SEL)
150 GOTO 110

REM ACTION() is dispatch table like LIB()
```

**Use case**: Interactive menus

### Variation 3: State Machine Dispatch
```basic
100 REM GAME LOOP
110 ON STATE+1 GOSUB 1000,2000,3000,4000
120 GOTO 110

REM Or with array:
110 GOSUB STATEHANDLER(STATE)
```

**Feature**: State-driven game flow

### Variation 4: Validated Dispatch
```basic
100 INPUT "FUNCTION";F
110 IF F<1 OR F>LIBCOUNT THEN PRINT "INVALID":GOTO 100
120 PRINT "CALLING: ";LIBNAME$(F)
130 GOSUB LIB(F)
140 PRINT "RETURNED"
```

**Feature**: Bounds checking and feedback

### Variation 5: Indirect Dispatch (Function Pointer)
```basic
100 REM SET CALLBACK
110 CALLBACK=LIB(5)  : REM store function pointer

200 REM LATER: TRIGGER CALLBACK
210 IF SCORE MOD 100=0 THEN GOSUB CALLBACK
```

**Use case**: Event handlers, callbacks

### Variation 6: Chained Dispatch
```basic
100 REM EXECUTE SEQUENCE
110 FOR I=1 TO 5
120 PRINT "STEP ";I
130 GOSUB LIB(I)
140 NEXT I
```

**Feature**: Run multiple functions in order

## Common Mistakes

- **Mistake 1**: Index out of bounds
  - **Symptom**: `?ILLEGAL QUANTITY ERROR` or wrong routine
  - **Fix**: Validate: `IF F<1 OR F>MAX THEN...`

- **Mistake 2**: Library not initialized
  - **Symptom**: `?ILLEGAL QUANTITY ERROR` on array access
  - **Fix**: Call init routine before any dispatch

- **Mistake 3**: Forgetting ON offset
  - **Symptom**: `ON STATE GOSUB` misses first state
  - **Fix**: Use `ON STATE+1 GOSUB` for 0-based states

- **Mistake 4**: Routine doesn't RETURN
  - **Symptom**: Execution continues into next routine
  - **Fix**: Every routine must end with RETURN

- **Mistake 5**: Modifying LIB() array
  - **Symptom**: Dispatch goes to wrong place
  - **Fix**: LIB() is read-only after init

## Memory Usage

- **Dispatch table**: Already allocated during init
- **Temp variables**: ~2 bytes (L, F, etc.)
- **No overhead**: Native BASIC operation
- **Efficient**: Direct jump, no searching

## Integration Example

```basic
NEW
10 REM === DISPATCH DEMO ===
20 GOSUB 9000               : REM init library
30 GOSUB 100                : REM main menu
40 END

100 REM --- MAIN MENU ---
110 PRINT CHR$(147);"UTILITY MENU"
120 PRINT
130 FOR I=1 TO LIBCOUNT
140 PRINT I;": ";LIBNAME$(I)
150 NEXT I
160 PRINT
170 INPUT "SELECT (1-";LIBCOUNT;")";CHOICE
180 IF CHOICE<1 OR CHOICE>LIBCOUNT THEN 170
190 PRINT CHR$(147)
200 GOSUB LIB(CHOICE)       : REM DISPATCH
210 PRINT:PRINT "PRESS ANY KEY"
220 GET K$:IF K$="" THEN 220
230 GOTO 110

9000 REM --- LIBRARY INIT ---
9010 LIBCOUNT=5
9020 DIM LIB(LIBCOUNT),LIBNAME$(LIBCOUNT)
9030 FOR I=1 TO LIBCOUNT
9040 READ LIB(I),LIBNAME$(I)
9050 NEXT I
9060 RETURN

9100 DATA 1000,"CLEAR SCREEN"
9110 DATA 1100,"DRAW BORDER"
9120 DATA 1200,"STARFIELD"
9130 DATA 1300,"PLAY TONE"
9140 DATA 1400,"SHOW INFO"

REM === LIBRARY ROUTINES ===
1000 REM CLEAR SCREEN
1010 PRINT CHR$(147)
1020 RETURN

1100 REM DRAW BORDER
1110 POKE 53280,0:POKE 53281,0
1120 FOR I=0 TO 39
1130 POKE 1024+I,160:POKE 1024+24*40+I,160
1140 NEXT I
1150 RETURN

1200 REM STARFIELD
1210 FOR I=1 TO 100
1220 X=INT(RND(1)*40):Y=INT(RND(1)*25)
1230 POKE 1024+Y*40+X,46
1240 NEXT I
1250 RETURN

1300 REM PLAY TONE
1310 POKE 54295,15:POKE 54272,80:POKE 54273,0
1320 POKE 54277,17
1330 FOR D=1 TO 60:NEXT D
1340 POKE 54277,16
1350 RETURN

1400 REM SHOW INFO
1410 PRINT "RETROLIB V1.0"
1420 PRINT "5 FUNCTIONS LOADED"
1430 RETURN
```

## Dispatch Patterns

### Pattern 1: User Selection
```basic
INPUT "FUNCTION";F
IF F>=1 AND F<=MAX THEN GOSUB LIB(F)
```

### Pattern 2: Sequential Execution
```basic
FOR I=1 TO COUNT
  GOSUB LIB(I)
  NEXT I
```

### Pattern 3: Conditional Dispatch
```basic
IF SCORE>100 THEN GOSUB LIB(BONUS_FUNC)
IF LIVES<2 THEN GOSUB LIB(WARNING_FUNC)
```

### Pattern 4: Data-Driven
```basic
FOR I=0 TO 10:READ ACTION:NEXT I
GOSUB LIB(ACTION)
```

### Pattern 5: State-Based
```basic
GOSUB LIB(STATE_HANDLER(CURRENT_STATE))
```

## Performance Tips

1. **Cache frequently used indices**:
   ```basic
   REM Good: Use constants
   CLEAR_FUNC=1:BORDER_FUNC=2
   GOSUB LIB(CLEAR_FUNC)

   REM Slower: Recompute each time
   GOSUB LIB(INSTR("CLEAR",FUNCNAME$))
   ```

2. **Validate once, use many**:
   ```basic
   REM Good: Validate at input
   INPUT F:IF F<1 OR F>MAX THEN INPUT F
   FOR I=1 TO 10:GOSUB LIB(F):NEXT

   REM Wasteful: Validate every call
   FOR I=1 TO 10
     IF F>=1 AND F<=MAX THEN GOSUB LIB(F)
     NEXT
   ```

3. **Use ON...GOSUB for small fixed sets**:
   ```basic
   REM Fast: Direct dispatch
   ON STATE+1 GOSUB 1000,2000,3000

   REM Slower: Array lookup
   GOSUB STATES(STATE)
   ```

## Advanced Dispatch

### Dispatch with Return Values
```basic
100 RESULT=0              : REM global for return value
110 GOSUB LIB(FUNC)
120 PRINT "RESULT:";RESULT

1000 REM FUNCTION THAT RETURNS
1010 RESULT=42
1020 RETURN
```

### Dispatch with Parameters
```basic
100 PARAM1=10:PARAM2=20  : REM set parameters
110 GOSUB LIB(ADD_FUNC)
120 PRINT "SUM:";RESULT

1000 REM ADD FUNCTION
1010 RESULT=PARAM1+PARAM2
1020 RETURN
```

### Nested Dispatch
```basic
100 GOSUB LIB(MAIN_FUNC)

1000 REM MAIN CALLS HELPER
1010 GOSUB LIB(HELPER_FUNC)
1020 RETURN

1100 REM HELPER
1110 PRINT "HELPER"
1120 RETURN
```

## See Also

- [Library Initialization](library-initialization.md) - Setting up dispatch tables
- [Parameter Passing](parameter-passing.md) - Sharing data with routines
- [ON...GOTO Dispatch](../state-machines/on-goto-dispatch.md) - State machine variant
- [Menu System](../menus/menu-system.md) - Menu-driven dispatch
- **Lessons**: 49 (Libraries), 51 (Menus & Options)
- **Vault**: [Structured Programming](/vault/structured-programming)

## Quick Reference Card

```basic
REM Subroutine dispatch pattern

REM Direct dispatch:
GOSUB LIB(index)

REM With validation:
INPUT F
IF F>=1 AND F<=MAX THEN GOSUB LIB(F)

REM Menu dispatch:
IF KEY$=CHR$(13) THEN GOSUB ACTION(SEL)

REM State dispatch:
ON STATE+1 GOSUB handler1,handler2,handler3

REM Callback dispatch:
CALLBACK=LIB(5)
IF EVENT THEN GOSUB CALLBACK
```

## Dispatch Table Types

| Type | Example | Use Case |
|------|---------|----------|
| Library | `LIB(F)` | Utility functions |
| Actions | `ACTION(SEL)` | Menu selections |
| States | `STATE_HANDLER(S)` | Game states |
| Events | `ON_EVENT(E)` | Event handlers |
| Callbacks | `CALLBACK` | Stored function pointer |

## Best Practices

1. **Always validate index**
   - Check bounds before dispatch
   - Provide meaningful error messages
   - Handle invalid input gracefully

2. **Use meaningful names**
   - `LIB(CLEAR_FUNC)` not `LIB(1)`
   - Constants make code self-documenting
   - Easier to reorder functions

3. **Document dispatch tables**
   - Comment what each index does
   - List valid range
   - Note any dependencies

4. **Keep routines independent**
   - Don't assume call order
   - Use parameters for inputs
   - Return via RETURN only

5. **Consider error handling**
   - What if routine fails?
   - Set error flags
   - Allow caller to check

---

**Status**: Phase 3 Pattern
**Last Updated**: 2025-01-15
**Source**: Code Like It's 198x - C64 BASIC Course
