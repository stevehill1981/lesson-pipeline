# Error Handling

**Category**: Error Handling
**Difficulty**: Advanced
**Appears in**: Lesson 59
**Prerequisites**: [Basic Game Loop](../game-loops/basic-game-loop.md), [State Machine](../state-machines/basic-state-machine.md)

## Overview

Trap and recover from runtime errors using C64 BASIC V2's ON ERROR GOTO handler, examine error codes with ERR and ERL, and gracefully resume execution to prevent program crashes during disk I/O, invalid input, or resource exhaustion.

## The Pattern

```basic
REM --- ERROR HANDLER SETUP ---
10 ON ERROR GOTO 9000       : REM trap errors
20 REM ... main program ...

9000 REM --- ERROR HANDLER ---
9010 PRINT "ERROR";ERR;"AT LINE";ERL
9020 IF ERR=5 THEN PRINT "ILLEGAL QUANTITY"
9030 IF ERR=13 THEN PRINT "TYPE MISMATCH"
9040 RESUME NEXT            : REM continue after error
```

## Parameters

| Variable | Type | Purpose | Values |
|----------|------|---------|--------|
| `ERR` | Integer | Last error code | 0-255 (see error codes below) |
| `ERL` | Integer | Line where error occurred | Line number |
| `ON ERROR GOTO` | Statement | Install error trap | Line number of handler |
| `RESUME` | Statement | Continue execution | Current line |
| `RESUME NEXT` | Statement | Skip error line | Next line after error |

## How It Works

### Step 1: Install Error Handler
```basic
10 ON ERROR GOTO 9000
```
- Intercepts all runtime errors
- Jumps to line 9000 instead of crashing
- Remains active until program ends
- Only one handler active at a time

### Step 2: Error Occurs
```basic
100 X=PEEK(99999)           : REM causes error
```
- BASIC detects illegal operation
- Instead of `?ILLEGAL QUANTITY ERROR`
- Jumps to error handler
- Sets ERR and ERL variables

### Step 3: Handler Examines Error
```basic
9000 PRINT "ERROR";ERR;"AT LINE";ERL
9010 IF ERR=5 THEN PRINT "ILLEGAL QUANTITY"
```
- ERR contains error code (5 = illegal quantity)
- ERL contains line number (100)
- Handler can diagnose and respond

### Step 4: Resume Execution
```basic
9020 RESUME NEXT            : REM skip error line
```
- `RESUME` - retry same line
- `RESUME NEXT` - continue with next line
- `RESUME line` - jump to specific line

## Variations

### Variation 1: Defensive File I/O
```basic
10 ON ERROR GOTO 9000
20 OPEN 1,8,2,"SCORES,S,R"
30 FOR I=1 TO 5
40 INPUT#1,NAME$(I),SC(I)
50 NEXT I
60 CLOSE 1
70 PRINT "SCORES LOADED"
80 END

9000 REM ERROR HANDLER
9010 IF ERR=4 THEN PRINT "FILE NOT FOUND":GOTO 9100
9020 IF ERR=24 THEN PRINT "DISK ERROR":GOTO 9100
9030 PRINT "ERROR";ERR;"AT";ERL
9100 CLOSE 1                : REM cleanup
9110 REM use default scores
9120 FOR I=1 TO 5:NAME$(I)="---":SC(I)=0:NEXT I
9130 RESUME 70              : REM continue program
```

**Use case**: Graceful file load failure

### Variation 2: Input Validation
```basic
10 ON ERROR GOTO 9000
20 INPUT "AGE";A
30 IF A<1 OR A>120 THEN ERR=5:GOTO 9000
40 PRINT "AGE:";A
50 END

9000 REM INPUT ERROR
9010 PRINT "INVALID INPUT"
9020 RESUME 20              : REM re-prompt
```

**Feature**: Retry on bad input

### Variation 3: Resource Exhaustion
```basic
10 ON ERROR GOTO 9000
20 DIM DATA(1000)           : REM might be too big
30 PRINT "ALLOCATED OK"
40 END

9000 REM MEMORY ERROR
9010 IF ERR=10 THEN PRINT "OUT OF MEMORY":GOTO 9100
9020 PRINT "ERROR";ERR
9030 END
9100 REM use smaller array
9110 DIM DATA(100)
9120 PRINT "USING SMALLER ARRAY"
9130 RESUME 30
```

**Use case**: Fallback for memory limits

### Variation 4: Disk Status Check
```basic
10 ON ERROR GOTO 9000
20 OPEN 15,8,15             : REM command channel
30 OPEN 1,8,2,"@0:SAVE,S,W": REM overwrite
40 PRINT#1,"DATA"
50 CLOSE 1
60 CLOSE 15
70 PRINT "SAVED"
80 END

9000 REM DISK ERROR
9010 CLOSE 1:CLOSE 15
9020 IF ERR=4 THEN PRINT "DEVICE NOT PRESENT"
9030 IF ERR=24 THEN GOSUB 9500  : REM check status
9040 RESUME 70

9500 REM READ DISK STATUS
9510 OPEN 15,8,15
9520 INPUT#15,EN,EM$,ET,ES
9530 CLOSE 15
9540 PRINT "DISK:";EN;EM$
9550 RETURN
```

**Feature**: Detailed disk error reporting

### Variation 5: Error Logging
```basic
10 DIM ERRLOG$(10),ERRLINE(10)
20 ERRCOUNT=0
30 ON ERROR GOTO 9000
40 REM ... main program ...

9000 REM ERROR LOGGER
9010 IF ERRCOUNT<10 THEN ERRLOG$(ERRCOUNT)=STR$(ERR):ERRLINE(ERRCOUNT)=ERL:ERRCOUNT=ERRCOUNT+1
9020 RESUME NEXT

9500 REM PRINT ERROR LOG
9510 PRINT "ERRORS ENCOUNTERED:"
9520 FOR I=0 TO ERRCOUNT-1
9530 PRINT I+1;": ERR";ERRLOG$(I);"LINE";ERRLINE(I)
9540 NEXT I
9550 RETURN
```

**Use case**: Debug mode error tracking

### Variation 6: Graceful Shutdown
```basic
10 ON ERROR GOTO 9000
20 REM ... main program ...

9000 REM CRITICAL ERROR
9010 PRINT CHR$(147);"FATAL ERROR"
9020 PRINT "CODE:";ERR
9030 PRINT "LINE:";ERL
9040 GOSUB 9500              : REM save state
9050 PRINT "STATE SAVED"
9060 PRINT "PRESS KEY TO EXIT"
9070 GET K$:IF K$="" THEN 9070
9080 END

9500 REM EMERGENCY SAVE
9510 REM save player position, score, etc.
9520 RETURN
```

**Feature**: Save before crash

## Common Mistakes

- **Mistake 1**: Forgetting ON ERROR GOTO
  - **Symptom**: Program still crashes on errors
  - **Fix**: Install handler early (line 10-50)

- **Mistake 2**: Handler causes error
  - **Symptom**: Infinite loop, system hangs
  - **Fix**: Keep handler simple, no PEEK/POKE/file ops

- **Mistake 3**: Not closing files in handler
  - **Symptom**: Files left open, disk corruption
  - **Fix**: CLOSE all files before RESUME

- **Mistake 4**: RESUME wrong location
  - **Symptom**: Repeats error forever
  - **Fix**: Use RESUME NEXT or RESUME to safe line

- **Mistake 5**: Ignoring ERR value
  - **Symptom**: Same handler for all errors
  - **Fix**: Check ERR and handle appropriately

## Memory Usage

- **Error handler**: ~50-200 bytes depending on complexity
- **ERR/ERL**: System variables (no cost)
- **Error logging**: Arrays for tracking (~100 bytes)
- **Minimal overhead**: Handler only runs when error occurs

## Integration Example

```basic
NEW
10 REM === ERROR HANDLING DEMO ===
20 ON ERROR GOTO 9000
30 GOSUB 9500               : REM init
40 GOSUB 100                : REM main menu
50 END

100 REM --- MAIN MENU ---
110 PRINT CHR$(147);"ERROR DEMO"
120 PRINT:PRINT "1. ILLEGAL QUANTITY"
130 PRINT "2. TYPE MISMATCH"
140 PRINT "3. OUT OF MEMORY"
150 PRINT "4. DIVISION BY ZERO"
160 PRINT "5. FILE ERROR"
170 PRINT "6. SHOW LOG"
180 PRINT "0. EXIT"
190 PRINT:INPUT "CHOICE";C$
200 IF C$="0" THEN RETURN
210 C=VAL(C$)
220 IF C<1 OR C>6 THEN 110
230 ON C GOSUB 1000,2000,3000,4000,5000,6000
240 GOTO 110

1000 REM TEST ILLEGAL QUANTITY
1010 PRINT CHR$(147);"ILLEGAL QUANTITY TEST"
1020 PRINT "POKE 99999,0"
1030 POKE 99999,0           : REM error!
1040 PRINT "SHOULD NOT PRINT"
1050 RETURN

2000 REM TEST TYPE MISMATCH
2010 PRINT CHR$(147);"TYPE MISMATCH TEST"
2020 PRINT "A$=5"
2030 A$=5                   : REM error!
2040 PRINT "SHOULD NOT PRINT"
2050 RETURN

3000 REM TEST OUT OF MEMORY
3010 PRINT CHR$(147);"OUT OF MEMORY TEST"
3020 PRINT "DIM DATA(99999)"
3030 DIM DATA(99999)        : REM error!
3040 PRINT "SHOULD NOT PRINT"
3050 RETURN

4000 REM TEST DIVISION BY ZERO
4010 PRINT CHR$(147);"DIVISION BY ZERO TEST"
4020 PRINT "X=10/0"
4030 X=10/0                 : REM error!
4040 PRINT "SHOULD NOT PRINT"
4050 RETURN

5000 REM TEST FILE ERROR
5010 PRINT CHR$(147);"FILE ERROR TEST"
5020 PRINT "OPEN NONEXISTENT FILE"
5030 OPEN 1,8,0,"NOFILE,S,R": REM error!
5040 PRINT "SHOULD NOT PRINT"
5050 CLOSE 1
5060 RETURN

6000 REM SHOW ERROR LOG
6010 PRINT CHR$(147);"ERROR LOG"
6020 IF ERRCOUNT=0 THEN PRINT "NO ERRORS":GOTO 6090
6030 FOR I=0 TO ERRCOUNT-1
6040 PRINT I+1;": ERR";ERRLOG(I);
6050 PRINT "LINE";ERRLINE(I);
6060 PRINT ERRNAME$(ERRLOG(I))
6070 NEXT I
6080 PRINT:PRINT ERRCOUNT;"ERRORS LOGGED"
6090 PRINT:PRINT "PRESS KEY"
6100 GET K$:IF K$="" THEN 6100
6110 RETURN

9000 REM === ERROR HANDLER ===
9010 PRINT CHR$(147);"ERROR CAUGHT!"
9020 PRINT "CODE:";ERR
9030 PRINT "LINE:";ERL
9040 PRINT "TYPE:";ERRNAME$(ERR)
9050 PRINT
9060 REM LOG ERROR
9070 IF ERRCOUNT<20 THEN ERRLOG(ERRCOUNT)=ERR:ERRLINE(ERRCOUNT)=ERL:ERRCOUNT=ERRCOUNT+1
9080 PRINT "PRESS KEY TO CONTINUE"
9090 GET K$:IF K$="" THEN 9090
9100 RESUME NEXT

9500 REM === INIT ===
9510 DIM ERRLOG(20),ERRLINE(20)
9520 DIM ERRNAME$(15)
9530 ERRCOUNT=0
9540 REM
9550 REM LOAD ERROR NAMES
9560 FOR I=0 TO 15:READ ERRNAME$(I):NEXT I
9570 RETURN
9580 REM
9590 DATA "NONE","NEXT WITHOUT FOR","SYNTAX"
9600 DATA "RETURN WITHOUT GOSUB","OUT OF DATA"
9610 DATA "ILLEGAL QUANTITY","OVERFLOW"
9620 DATA "OUT OF MEMORY","UNDEFINED STATEMENT"
9630 DATA "BAD SUBSCRIPT","REDIM'D ARRAY"
9640 DATA "DIVISION BY ZERO","ILLEGAL DIRECT"
9650 DATA "TYPE MISMATCH","STRING TOO LONG"
9660 DATA "FILE ERROR"
```

## C64 Error Codes

| Code | Error | Cause |
|------|-------|-------|
| 0 | None | (no error) |
| 1 | NEXT WITHOUT FOR | Loop structure broken |
| 2 | SYNTAX | Invalid BASIC syntax |
| 3 | RETURN WITHOUT GOSUB | No matching GOSUB |
| 4 | OUT OF DATA | READ beyond DATA |
| 5 | ILLEGAL QUANTITY | Invalid numeric value |
| 6 | OVERFLOW | Number too large |
| 7 | OUT OF MEMORY | Heap exhausted |
| 8 | UNDEF'D STATEMENT | GOTO nonexistent line |
| 9 | BAD SUBSCRIPT | Array index out of bounds |
| 10 | REDIM'D ARRAY | DIM array twice |
| 11 | DIVISION BY ZERO | Divide by zero |
| 12 | ILLEGAL DIRECT | Command not allowed in direct mode |
| 13 | TYPE MISMATCH | String/number confusion |
| 14 | STRING TOO LONG | String >255 chars |
| 24 | FILE ERROR | Disk/device error |

## Error Handler Patterns

### Pattern 1: Retry
```basic
9000 IF ERR=24 THEN RESUME  : REM retry same line
```

### Pattern 2: Skip
```basic
9000 RESUME NEXT            : REM continue next line
```

### Pattern 3: Jump to Recovery
```basic
9000 IF ERR=4 THEN RESUME 8000  : REM use defaults
```

### Pattern 4: Log and Continue
```basic
9000 ERRCOUNT=ERRCOUNT+1:RESUME NEXT
```

### Pattern 5: Critical Shutdown
```basic
9000 GOSUB 9500:END         : REM save and quit
```

## Best Practices

1. **Install handler early**:
   ```basic
   10 ON ERROR GOTO 9000   : REM first executable line
   ```

2. **Keep handler simple**:
   ```basic
   9000 IF ERR=5 THEN RESUME 8000
   9010 IF ERR=24 THEN CLOSE 1:RESUME NEXT
   9020 PRINT "ERROR";ERR:END
   ```

3. **Clean up resources**:
   ```basic
   9000 CLOSE 1:CLOSE 15    : REM close files
   9010 POKE 53269,0        : REM disable sprites
   9020 RESUME NEXT
   ```

4. **Provide user feedback**:
   ```basic
   9000 PRINT "DISK ERROR - INSERT DISK"
   9010 PRINT "PRESS KEY WHEN READY"
   9020 GET K$:IF K$="" THEN 9020
   9030 RESUME
   ```

5. **Test error paths**:
   ```basic
   REM Deliberately cause errors during development
   100 IF DEBUG THEN ERR=5:GOTO 9000  : REM test handler
   ```

## See Also

- [Memory Checking](memory-checking.md) - Prevent memory errors
- [Disk Operations](../file-io/disk-operations.md) - Handle file errors
- [State Machine](../state-machines/basic-state-machine.md) - Recover to known state
- **Lesson**: 59 (When BASIC Breaks)
- **Vault**: [Error Codes](/vault/error-codes), [Defensive Programming](/vault/defensive)

## Quick Reference Card

```basic
REM Error handling pattern

REM 1. Install handler
10 ON ERROR GOTO 9000

REM 2. Handler
9000 PRINT "ERROR";ERR;"LINE";ERL
9010 IF ERR=5 THEN RESUME 8000     : REM use default
9020 IF ERR=24 THEN CLOSE 1:RESUME NEXT
9030 PRINT "FATAL":END

REM 3. Resume options
RESUME              : REM retry same line
RESUME NEXT         : REM skip to next line
RESUME line         : REM jump to specific line

REM Common error codes:
ERR=4   OUT OF DATA
ERR=5   ILLEGAL QUANTITY
ERR=7   OUT OF MEMORY
ERR=9   BAD SUBSCRIPT
ERR=11  DIVISION BY ZERO
ERR=13  TYPE MISMATCH
ERR=24  FILE ERROR

REM Handler rules:
- Install early (line 10-50)
- Keep simple (no complex ops)
- Clean up (close files)
- Choose resume point carefully
- Test error paths!
```

---

**Status**: Phase 4 Pattern
**Last Updated**: 2025-01-15
**Source**: Code Like It's 198x - C64 BASIC Course
