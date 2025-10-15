# ON...GOTO Dispatch

**Category**: State Machines
**Difficulty**: Beginner
**Appears in**: Lessons 41, 48, 51, 52, 56
**Prerequisites**: None (foundational pattern)

## Overview

Use `ON...GOSUB` and `ON...GOTO` to route program control based on a numeric variable without chains of IF statements. This is C64 BASIC's built-in pattern for efficient state machines, menu systems, and dispatchers.

## The Pattern

```basic
REM --- ON...GOSUB DISPATCH ---
10 STATE=0                       : REM 0=title, 1=play, 2=game over
20 GET K$
30 ON STATE+1 GOSUB 1000,2000,3000
40 GOTO 20

1000 REM === STATE 0: TITLE ===
1010 IF K$=" " THEN STATE=1
1020 RETURN

2000 REM === STATE 1: PLAY ===
2010 IF K$="Q" THEN STATE=2
2020 RETURN

3000 REM === STATE 2: GAME OVER ===
3010 IF K$=" " THEN STATE=0
3020 RETURN
```

## Parameters

| Variable | Type | Purpose | Typical Values |
|----------|------|---------|----------------|
| `STATE` | Integer | Selector value | 0 to N-1 (where N=number of states) |
| Expression | Integer | `STATE+1` or other | 1 to N (ON needs 1-based index) |

**Critical**: `ON` requires 1-based indexing (1, 2, 3, ...), so use `STATE+1` when STATE is 0-based.

## How It Works

### Step 1: Numeric Selector
```basic
STATE=0
```
State is a number (typically 0, 1, 2, ...)

### Step 2: ON...GOSUB Evaluates Expression
```basic
ON STATE+1 GOSUB 1000,2000,3000
```
- Evaluates `STATE+1` (if STATE=0, result is 1)
- Routes to Nth line number in list
- `1` → `1000`, `2` → `2000`, `3` → `3000`

### Step 3: Handler Executes and Returns
```basic
1000 REM handler code
1010 RETURN
```
After RETURN, execution continues at line 40

### Step 4: Out-of-Range Behavior
```basic
ON 5 GOSUB 1000,2000,3000
```
If value > number of targets, BASIC skips the statement (no error!)

## Variations

### Variation 1: ON...GOTO (No Return)
```basic
10 STATE=0
20 GET K$
30 ON STATE+1 GOTO 1000,2000,3000

1000 REM TITLE
1010 IF K$=" " THEN STATE=1
1020 GOTO 20

2000 REM PLAY
2010 IF K$="Q" THEN STATE=2
2020 GOTO 20

3000 REM GAME OVER
3010 IF K$=" " THEN STATE=0
3020 GOTO 20
```

**Difference**: `GOTO` doesn't return, must manually loop back
**Use case**: Flat state machine without subroutine overhead

### Variation 2: Menu Dispatch
```basic
100 REM MENU SYSTEM
110 SEL=1:MAXOPT=4
120 PRINT CHR$(147);"1. NEW GAME"
130 PRINT "2. LOAD GAME"
140 PRINT "3. OPTIONS"
150 PRINT "4. QUIT"
160 GET K$
170 IF K$="1" THEN SEL=1
180 IF K$="2" THEN SEL=2
190 IF K$="3" THEN SEL=3
200 IF K$="4" THEN SEL=4
210 IF K$=CHR$(13) THEN ON SEL GOSUB 2000,3000,4000,5000
220 GOTO 160

2000 REM NEW GAME
2010 PRINT "STARTING NEW GAME...":FOR D=1 TO 100:NEXT D
2020 RETURN

3000 REM LOAD GAME
3010 PRINT "LOADING...":FOR D=1 TO 100:NEXT D
3020 RETURN

4000 REM OPTIONS
4010 PRINT "OPTIONS MENU":FOR D=1 TO 100:NEXT D
4020 RETURN

5000 REM QUIT
5010 PRINT "GOODBYE":END
```

**Use case**: Action dispatcher (player selects, RETURN triggers)

### Variation 3: Sub-Dispatch (Nested)
```basic
2000 REM === PLAY STATE ===
2010 ON PHASE+1 GOSUB 2100,2200,2300
2020 RETURN

2100 REM PHASE 0: GET READY
2110 PRINT "READY..."
2120 RETURN

2200 REM PHASE 1: PLAYING
2210 PRINT "PLAYING..."
2220 RETURN

2300 REM PHASE 2: LEVEL DONE
2310 PRINT "COMPLETE!"
2320 RETURN
```

**Use case**: Hierarchical states (main state contains sub-phases)

### Variation 4: Computed Dispatch
```basic
100 INDEX=INT(RND(1)*3)+1      : REM random 1-3
110 ON INDEX GOSUB 1000,2000,3000
120 GOTO 100

1000 PRINT "OPTION A":RETURN
2000 PRINT "OPTION B":RETURN
3000 PRINT "OPTION C":RETURN
```

**Use case**: Random events, AI behavior selection

### Variation 5: Safe Dispatch (Clamping)
```basic
10 STATE=0:MAXSTATE=2
20 IF STATE<0 THEN STATE=0
30 IF STATE>MAXSTATE THEN STATE=MAXSTATE
40 ON STATE+1 GOSUB 1000,2000,3000
50 GOTO 20
```

**Safety**: Prevents invalid state values from skipping dispatch

### Variation 6: Fallback Handler
```basic
10 STATE=0
20 ON STATE+1 GOSUB 1000,2000,3000
30 IF STATE>2 THEN GOSUB 9000      : REM error handler
40 GOTO 20

9000 REM INVALID STATE
9010 PRINT "ERROR: STATE=";STATE
9020 STATE=0
9030 RETURN
```

**Safety**: Catch out-of-range states

## Common Mistakes

- **Mistake 1**: Forgetting +1 for 0-based states
  - **Symptom**: First state never runs
  - **Fix**: Use `ON STATE+1` not `ON STATE`

- **Mistake 2**: Wrong number of targets
  - **Symptom**: Some states silently ignored
  - **Fix**: Count targets, match to max STATE value

- **Mistake 3**: Using ON...GOTO without loop-back
  - **Symptom**: Program falls through and stops
  - **Fix**: Each GOTO handler must return to dispatch

- **Mistake 4**: Computed value out of range
  - **Symptom**: Dispatch skipped silently
  - **Fix**: Add range check or fallback handler

- **Mistake 5**: Missing RETURN in GOSUB handler
  - **Symptom**: Program continues into next handler
  - **Fix**: Every GOSUB handler must end with RETURN

## Comparison to IF Chains

### IF Chain Approach
```basic
10 IF STATE=0 THEN GOSUB 1000
20 IF STATE=1 THEN GOSUB 2000
30 IF STATE=2 THEN GOSUB 3000
40 GOTO 10
```

**Problems**:
- Checks every condition (3 evaluations)
- Longer code
- Harder to maintain with many states

### ON...GOSUB Approach
```basic
10 ON STATE+1 GOSUB 1000,2000,3000
20 GOTO 10
```

**Advantages**:
- One evaluation, direct jump
- Compact, readable
- Easy to add states (just append to list)

## Performance Tips

1. **ON...GOSUB is faster than IF chains**:
   ```basic
   REM Fast: Direct dispatch
   ON STATE+1 GOSUB 1000,2000,3000

   REM Slow: Sequential checks
   IF STATE=0 THEN GOSUB 1000
   IF STATE=1 THEN GOSUB 2000
   IF STATE=2 THEN GOSUB 3000
   ```

2. **Keep handlers at predictable line numbers**:
   ```basic
   REM Good: Regular intervals
   ON STATE+1 GOSUB 1000,2000,3000,4000

   REM Also fine: Whatever's convenient
   ON STATE+1 GOSUB 1000,1500,2000,3000
   ```

3. **Minimize computation in expression**:
   ```basic
   REM Good: Simple addition
   ON STATE+1 GOSUB 1000,2000,3000

   REM Bad: Complex expression (slower)
   ON INT((STATE*2+PHASE)/FACTOR)+1 GOSUB 1000,2000,3000
   ```

## Memory Usage

- **No additional memory**: Uses built-in BASIC command
- **Code size**: Compact (one line vs. multiple IFs)
- **Execution**: Fast direct jump

## Integration Example

```basic
NEW
10 REM --- ON...GOSUB STATE MACHINE ---
20 PRINT CHR$(147)
30 STATE=0:SCORE=0:LIVES=3

40 REM main dispatch loop
50 GET K$
60 ON STATE+1 GOSUB 1000,2000,3000
70 GOTO 50

1000 REM === STATE 0: TITLE ===
1010 PRINT CHR$(19);"*** SPACE BATTLE ***"
1020 PRINT:PRINT "SPACE = START"
1030 PRINT "Q = QUIT"
1040 IF K$=" " THEN STATE=1:PRINT CHR$(147);"LAUNCHING...":FOR D=1 TO 60:NEXT
1050 IF K$="Q" THEN END
1060 RETURN

2000 REM === STATE 1: PLAY ===
2010 SCORE=SCORE+1
2020 IF K$="H" THEN LIVES=LIVES-1    : REM simulate hit
2030 IF LIVES<=0 THEN STATE=2:PRINT CHR$(147);"DESTROYED!"
2040 PRINT CHR$(19);"SCORE:";SCORE;"  LIVES:";LIVES;"   "
2050 RETURN

3000 REM === STATE 2: GAME OVER ===
3010 PRINT CHR$(19);"GAME OVER"
3020 PRINT "SCORE:";SCORE
3030 PRINT:PRINT "SPACE = RETRY  Q = QUIT"
3040 IF K$=" " THEN STATE=0:LIVES=3:SCORE=0:PRINT CHR$(147)
3050 IF K$="Q" THEN END
3060 RETURN
```

## Advanced: Dynamic Handler Tables

For games with many states, store line numbers in an array:

```basic
10 DIM HANDLER(10)
20 HANDLER(0)=1000:HANDLER(1)=2000:HANDLER(2)=3000
30 REM ... more handlers ...
40 STATE=0
50 GET K$
60 ON STATE+1 GOSUB HANDLER(0),HANDLER(1),HANDLER(2)
70 GOTO 50
```

**Trade-off**: More setup, but easier to modify at runtime

## ON...GOSUB vs ON...GOTO

| Feature | ON...GOSUB | ON...GOTO |
|---------|------------|-----------|
| **Returns** | Yes (RETURN) | No (must GOTO back) |
| **Stack usage** | Uses stack | No stack |
| **Typical use** | State machine | Flat state machine |
| **Code style** | Subroutines | Jump targets |
| **Nesting** | Supports nested calls | Flat only |

**Recommendation**: Use `ON...GOSUB` for state machines (cleaner, supports nesting)

## Debugging Dispatch

Add trace output:
```basic
60 PRINT CHR$(19);TAB(30);"STATE:";STATE;"   "
70 ON STATE+1 GOSUB 1000,2000,3000
```

Or conditional debug:
```basic
10 DEBUG=0
20 IF K$="*" THEN DEBUG=1-DEBUG:K$=""
60 IF DEBUG THEN PRINT "DISPATCH STATE";STATE
70 ON STATE+1 GOSUB 1000,2000,3000
```

## Range Checking Pattern

```basic
10 STATE=0:MINSTATE=0:MAXSTATE=2
50 GET K$
60 IF STATE<MINSTATE OR STATE>MAXSTATE THEN GOSUB 9000:GOTO 50
70 ON STATE+1 GOSUB 1000,2000,3000
80 GOTO 50

9000 REM ERROR: INVALID STATE
9010 PRINT "INVALID STATE:";STATE
9020 STATE=0
9030 RETURN
```

## See Also

- [Basic State Machine](basic-state-machine.md) - Complete state machine pattern
- [State Transitions](state-transitions.md) - Managing state changes
- **Lessons**: 41 (Finite State Fun), 51-52 (Menu systems)
- **Vault**: [ON Statement](/vault/on-statement)

## Quick Reference Card

```basic
REM ON...GOSUB dispatch
ON expr GOSUB line1,line2,line3

REM ON...GOTO dispatch
ON expr GOTO line1,line2,line3

REM Common pattern
ON STATE+1 GOSUB 1000,2000,3000  : REM +1 for 0-based STATE

REM Each GOSUB handler must RETURN
1000 REM handler code
1010 RETURN

REM Each GOTO handler must loop back
1000 REM handler code
1010 GOTO mainloop
```

## ON Statement Rules

1. **Expression must evaluate to integer**
   ```basic
   ON 1 GOSUB ...          : REM OK
   ON X+1 GOSUB ...        : REM OK
   ON INT(Y/2) GOSUB ...   : REM OK
   ```

2. **1-based indexing**
   ```basic
   ON 1 GOSUB 1000,2000    : REM goes to 1000
   ON 2 GOSUB 1000,2000    : REM goes to 2000
   ```

3. **Out of range = skip**
   ```basic
   ON 5 GOSUB 1000,2000    : REM skips (no error)
   ON 0 GOSUB 1000,2000    : REM skips
   ```

4. **Any number of targets**
   ```basic
   ON X GOSUB 1000,2000,3000,4000,5000,6000
   ```

## Menu System Example

```basic
NEW
10 REM --- MENU WITH ON...GOSUB ---
20 SEL=1:MAXOPT=3
30 PRINT CHR$(147);"MAIN MENU"
40 PRINT:PRINT "1. PLAY"
50 PRINT "2. OPTIONS"
60 PRINT "3. QUIT"
70 PRINT:PRINT "SELECT (1-3) AND PRESS RETURN"
80 GET K$
90 IF K$>="1" AND K$<="3" THEN SEL=VAL(K$)
100 IF K$=CHR$(13) THEN ON SEL GOSUB 2000,3000,4000
110 GOTO 80

2000 REM PLAY
2010 PRINT CHR$(147);"STARTING GAME..."
2020 FOR D=1 TO 120:NEXT D
2030 RETURN

3000 REM OPTIONS
3010 PRINT CHR$(147);"OPTIONS SCREEN"
3020 PRINT "(PLACEHOLDER)"
3030 PRINT:PRINT "PRESS ANY KEY"
3040 GET K$:IF K$="" THEN 3040
3050 RETURN

4000 REM QUIT
4010 PRINT CHR$(147);"GOODBYE!"
4020 END
```

## Best Practices

1. **Always document state values**
   ```basic
   10 REM STATE: 0=title, 1=play, 2=pause, 3=game over
   ```

2. **Use consistent spacing in dispatch**
   ```basic
   REM Good: Easy to read
   ON STATE+1 GOSUB 1000,2000,3000,4000

   REM Harder to parse
   ON STATE+1 GOSUB 1000,2000 ,3000, 4000
   ```

3. **Line up handlers at round numbers**
   ```basic
   1000 REM STATE 0
   2000 REM STATE 1
   3000 REM STATE 2
   ```

4. **Comment each handler**
   ```basic
   1000 REM === TITLE STATE ===
   2000 REM === PLAY STATE ===
   3000 REM === GAME OVER STATE ===
   ```

---

**Status**: Phase 2 Pattern
**Last Updated**: 2025-01-15
**Source**: Code Like It's 198x - C64 BASIC Course
