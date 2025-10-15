# Parameter Passing

**Category**: Library Structure
**Difficulty**: Intermediate
**Appears in**: Lessons 49, 50, 51, 56
**Prerequisites**: [Library Initialization](library-initialization.md), [Subroutine Dispatch](subroutine-dispatch.md)

## Overview

Share data between main code and library routines using global variables, arrays, or dedicated parameter variables. Enables reusable functions that accept inputs and return outputs without hard-coding values.

## The Pattern

```basic
REM --- PARAMETER PASSING ---
100 PARAM1=10:PARAM2=20      : REM set input parameters
110 GOSUB LIB(ADD_FUNC)      : REM call function
120 PRINT "RESULT:";RESULT   : REM use output

1000 REM --- ADD FUNCTION ---
1010 REM Inputs: PARAM1, PARAM2
1020 REM Output: RESULT
1030 RESULT=PARAM1+PARAM2
1040 RETURN
```

## Parameters

| Variable | Type | Purpose | Convention |
|----------|------|---------|------------|
| `PARAM1-9` | Any | Input parameters | Set before GOSUB |
| `RESULT` | Any | Return value | Read after RETURN |
| `ERR` | Integer | Error flag | 0=success, 1+=error |
| Globals | Any | Shared state | Document clearly |

## How It Works

### Step 1: Set Input Parameters
```basic
PARAM1=10
PARAM2=20
```
- Assign values to parameter variables
- Before calling routine
- Multiple parameters possible

### Step 2: Call Routine
```basic
GOSUB LIB(ADD_FUNC)
```
- Routine reads PARAM1, PARAM2
- Performs operation
- Stores result

### Step 3: Write Output
```basic
REM In routine:
RESULT=PARAM1+PARAM2
```
- Routine assigns to output variable
- Convention: RESULT for single output
- Can use multiple output variables

### Step 4: Read Result
```basic
REM After RETURN:
PRINT "RESULT:";RESULT
```
- Main code reads output variable
- Use immediately or store
- Check error flag if needed

## Variations

### Variation 1: Single Parameter
```basic
100 X=42
110 GOSUB LIB(DOUBLE_FUNC)
120 PRINT "DOUBLED:";X

1000 REM DOUBLE VALUE
1010 REM Input/Output: X
1020 X=X*2
1030 RETURN
```

**Feature**: In-place modification

### Variation 2: Multiple Returns
```basic
100 X=5:Y=3
110 GOSUB LIB(MINMAX_FUNC)
120 PRINT "MIN:";MINVAL;" MAX:";MAXVAL

1000 REM FIND MIN AND MAX
1010 REM Inputs: X, Y
1020 REM Outputs: MINVAL, MAXVAL
1030 IF X<Y THEN MINVAL=X:MAXVAL=Y ELSE MINVAL=Y:MAXVAL=X
1040 RETURN
```

**Use case**: Multiple outputs

### Variation 3: Array Parameters
```basic
100 DIM DATA(9)
110 FOR I=0 TO 9:DATA(I)=I*10:NEXT I
120 GOSUB LIB(SUM_ARRAY)
130 PRINT "SUM:";RESULT

1000 REM SUM ARRAY
1010 REM Input: DATA() array (0-9)
1020 REM Output: RESULT
1030 RESULT=0
1040 FOR I=0 TO 9:RESULT=RESULT+DATA(I):NEXT I
1050 RETURN
```

**Feature**: Pass arrays by reference

### Variation 4: With Error Handling
```basic
100 DENOM=0
110 GOSUB LIB(DIVIDE_FUNC)
120 IF ERR THEN PRINT "ERROR: ";ERRMSG$:GOTO 100
130 PRINT "RESULT:";RESULT

1000 REM SAFE DIVIDE
1010 REM Inputs: PARAM1, PARAM2
1020 REM Outputs: RESULT, ERR, ERRMSG$
1030 ERR=0:ERRMSG$=""
1040 IF PARAM2=0 THEN ERR=1:ERRMSG$="DIV BY ZERO":RETURN
1050 RESULT=PARAM1/PARAM2
1060 RETURN
```

**Feature**: Error reporting

### Variation 5: Optional Parameters
```basic
100 TEXT$="HELLO"
110 COL=0              : REM 0 = use default
120 GOSUB LIB(PRINT_TEXT)

1000 REM PRINT TEXT
1010 REM Input: TEXT$, COL (0=default)
1020 IF COL=0 THEN COL=14  : REM default color
1030 POKE 646,COL
1040 PRINT TEXT$
1050 RETURN
```

**Use case**: Default values

### Variation 6: Context Object Pattern
```basic
100 REM Setup sprite context
110 SPR_X=100:SPR_Y=200:SPR_VX=2:SPR_VY=1:SPR_NUM=0
120 GOSUB LIB(UPDATE_SPRITE)

1000 REM UPDATE SPRITE
1010 REM Context: SPR_X, SPR_Y, SPR_VX, SPR_VY, SPR_NUM
1020 SPR_X=SPR_X+SPR_VX
1030 SPR_Y=SPR_Y+SPR_VY
1040 POKE 53248+SPR_NUM*2,SPR_X
1050 POKE 53249+SPR_NUM*2,SPR_Y
1060 RETURN
```

**Feature**: Related data grouped

## Common Mistakes

- **Mistake 1**: Not setting parameters before call
  - **Symptom**: Function uses old/garbage values
  - **Fix**: Always set inputs before GOSUB

- **Mistake 2**: Reusing parameter names
  - **Symptom**: Functions interfere with each other
  - **Fix**: Use unique names or save/restore

- **Mistake 3**: Forgetting to read output
  - **Symptom**: Results ignored or lost
  - **Fix**: Immediately use or store after RETURN

- **Mistake 4**: Not documenting parameters
  - **Symptom**: Confusion about what to pass
  - **Fix**: REM comment listing inputs/outputs

- **Mistake 5**: Side effects on globals
  - **Symptom**: Unexpected variable changes
  - **Fix**: Document all modified variables

## Memory Usage

- **Parameter variables**: ~5 bytes each
- **Minimal overhead**: Just variable storage
- **Shared memory**: Same variables for all calls
- **No stack**: BASIC doesn't copy parameters

## Integration Example

```basic
NEW
10 REM === PARAMETER DEMO ===
20 GOSUB 9000               : REM init library
30 GOSUB 100                : REM test routines
40 END

100 REM --- TEST SUITE ---
110 PRINT CHR$(147);"PARAMETER PASSING DEMO"
120 PRINT
130 GOSUB 200               : REM test addition
140 GOSUB 300               : REM test string
150 GOSUB 400               : REM test array
160 PRINT:PRINT "ALL TESTS COMPLETE"
170 RETURN

200 REM --- TEST ADDITION ---
210 PRINT "TEST: ADDITION"
220 PARAM1=15:PARAM2=27
230 GOSUB LIB(LIB_ADD)
240 PRINT PARAM1;"+";PARAM2;"=";RESULT
250 IF RESULT<>42 THEN PRINT "FAIL!" ELSE PRINT "PASS"
260 PRINT
270 RETURN

300 REM --- TEST STRING ---
310 PRINT "TEST: UPPERCASE"
320 TEXT$="hello world"
330 GOSUB LIB(LIB_UPPER)
340 PRINT "INPUT: hello world"
350 PRINT "OUTPUT:";TEXT$
360 IF TEXT$<>"HELLO WORLD" THEN PRINT "FAIL!" ELSE PRINT "PASS"
370 PRINT
380 RETURN

400 REM --- TEST ARRAY SUM ---
410 PRINT "TEST: ARRAY SUM"
420 DIM DATA(4)
430 FOR I=0 TO 4:DATA(I)=(I+1)*10:NEXT I
440 COUNT=5
450 GOSUB LIB(LIB_SUMARRAY)
460 PRINT "ARRAY: 10,20,30,40,50"
470 PRINT "SUM:";RESULT
480 IF RESULT<>150 THEN PRINT "FAIL!" ELSE PRINT "PASS"
490 PRINT
500 RETURN

9000 REM === LIBRARY INIT ===
9010 LIB_ADD=1:LIB_UPPER=2:LIB_SUMARRAY=3
9020 DIM LIB(3)
9030 DATA 1000,1100,1200
9040 FOR I=1 TO 3:READ LIB(I):NEXT I
9050 RETURN

REM === LIBRARY ROUTINES ===
1000 REM --- ADD TWO NUMBERS ---
1010 REM Inputs: PARAM1, PARAM2
1020 REM Output: RESULT
1030 RESULT=PARAM1+PARAM2
1040 RETURN

1100 REM --- UPPERCASE STRING ---
1110 REM Input/Output: TEXT$
1120 FOR I=1 TO LEN(TEXT$)
1130 C=ASC(MID$(TEXT$,I,1))
1140 IF C>=97 AND C<=122 THEN C=C-32
1150 MID$(TEXT$,I,1)=CHR$(C)
1160 NEXT I
1170 RETURN

1200 REM --- SUM ARRAY ---
1210 REM Inputs: DATA() array, COUNT
1220 REM Output: RESULT
1230 RESULT=0
1240 FOR I=0 TO COUNT-1
1250 RESULT=RESULT+DATA(I)
1260 NEXT I
1270 RETURN
```

## Parameter Conventions

### Convention 1: PARAM1-9 for Inputs
```basic
PARAM1=value1:PARAM2=value2
GOSUB function
```

### Convention 2: RESULT for Output
```basic
GOSUB function
PRINT RESULT
```

### Convention 3: ERR for Error Flag
```basic
GOSUB function
IF ERR THEN PRINT "ERROR"
```

### Convention 4: Prefix for Context
```basic
SPR_X=100:SPR_Y=200
GOSUB update_sprite
```

### Convention 5: Arrays Passed by Name
```basic
REM DATA() is global
COUNT=10
GOSUB process_array
```

## Parameter Documentation Template

```basic
XXXX REM --- FUNCTION NAME ---
XXXX+10 REM Purpose: Brief description
XXXX+20 REM
XXXX+30 REM Inputs:
XXXX+40 REM   PARAM1 (type) - description
XXXX+50 REM   PARAM2 (type) - description
XXXX+60 REM
XXXX+70 REM Outputs:
XXXX+80 REM   RESULT (type) - description
XXXX+90 REM   ERR (int) - 0=OK, 1=error
XXXX+100 REM
XXXX+110 REM Side effects:
XXXX+120 REM   Modifies: variable list
XXXX+130 REM   Calls: other functions
XXXX+140 REM
XXXX+150 REM ... actual code ...
XXXX+990 RETURN
```

## Performance Tips

1. **Minimize parameter count**:
   ```basic
   REM Good: Use context variables
   SPR_NUM=0
   GOSUB update_sprite

   REM Slower: Many parameters
   PARAM1=X:PARAM2=Y:PARAM3=VX:PARAM4=VY:PARAM5=NUM
   GOSUB update_sprite
   ```

2. **Reuse parameter slots**:
   ```basic
   REM Good: Same PARAM1 for multiple functions
   PARAM1=10:GOSUB func1
   PARAM1=20:GOSUB func2

   REM Wasteful: Different variable per function
   FUNC1_P1=10:GOSUB func1
   FUNC2_P1=20:GOSUB func2
   ```

3. **Cache frequently accessed parameters**:
   ```basic
   REM Good: Cache in local variable
   X=PARAM1:Y=PARAM2
   FOR I=1 TO 100:A=X+Y:NEXT

   REM Slower: Repeated array access
   FOR I=1 TO 100:A=PARAM1+PARAM2:NEXT
   ```

## See Also

- [Library Initialization](library-initialization.md) - Setting up library
- [Subroutine Dispatch](subroutine-dispatch.md) - Calling routines
- [READ/DATA Pattern](../data/read-data-pattern.md) - Loading parameters
- **Lessons**: 49 (Libraries), 50 (Title Screens), 51 (Menus)
- **Vault**: [BASIC Variables](/vault/basic-variables)

## Quick Reference Card

```basic
REM Parameter passing patterns

REM Simple input/output:
PARAM1=value
GOSUB function
PRINT RESULT

REM Multiple parameters:
PARAM1=val1:PARAM2=val2:PARAM3=val3
GOSUB function

REM With error handling:
GOSUB function
IF ERR THEN PRINT ERRMSG$

REM In-place modification:
X=10
GOSUB function  : REM modifies X
PRINT X

REM Array parameter:
DIM DATA(9)
COUNT=10
GOSUB process_array

REM Function template:
1000 REM FUNCTION
1010 REM Inputs: PARAM1, PARAM2
1020 REM Output: RESULT
1030 RESULT=PARAM1+PARAM2
1040 RETURN
```

## Parameter Patterns

| Pattern | Syntax | Use Case |
|---------|--------|----------|
| Single value | `PARAM1=X` | Simple functions |
| Multiple values | `PARAM1=X:PARAM2=Y` | Complex operations |
| In-place | `X=10:GOSUB:PRINT X` | Modify variable |
| Array | `COUNT=10:GOSUB` | Process collection |
| Context | `SPR_X=100:SPR_Y=200` | Related data |
| Error flag | `IF ERR THEN...` | Error handling |

## Best Practices

1. **Document all parameters**
   - List inputs at routine start
   - List outputs
   - Note side effects

2. **Use consistent naming**
   - PARAM1-9 for general inputs
   - RESULT for single output
   - ERR for error status
   - PREFIX_ for context groups

3. **Check parameter validity**
   - Validate before use
   - Set ERR flag on error
   - Provide error messages

4. **Minimize side effects**
   - Only modify output variables
   - Document global changes
   - Restore temporary variables

5. **Keep parameters simple**
   - Fewer parameters = easier to use
   - Group related data
   - Use defaults when possible

---

**Status**: Phase 3 Pattern
**Last Updated**: 2025-01-15
**Source**: Code Like It's 198x - C64 BASIC Course
