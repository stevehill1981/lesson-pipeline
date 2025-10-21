# Save High Scores

**Category**: File I/O
**Difficulty**: Advanced
**Appears in**: Lessons 43, 47
**Prerequisites**: [Error Handling](../errors/error-handling.md), [READ/DATA Pattern](../data/read-data-pattern.md)

## Overview

Persist high score data to disk using sequential file operations (OPEN, PRINT#, INPUT#, CLOSE) to save player names and scores between game sessions, providing permanent record-keeping on the 1541 disk drive.

## The Pattern

```basic
REM --- SAVE SCORES ---
10 OPEN 1,8,2,"SCORES,S,W" : REM sequential write
20 FOR I=1 TO 5
30 PRINT#1,NAME$(I);",";SC(I)
40 NEXT I
50 CLOSE 1
60 PRINT "SCORES SAVED"

REM --- LOAD SCORES ---
100 OPEN 1,8,2,"SCORES,S,R": REM sequential read
110 FOR I=1 TO 5
120 INPUT#1,NAME$(I),SC(I)
130 NEXT I
140 CLOSE 1
150 PRINT "SCORES LOADED"
```

## Parameters

| Command | Purpose | Syntax |
|---------|---------|--------|
| `OPEN` | Open file | `OPEN file#, device, channel, "filename,S,W/R"` |
| `PRINT#` | Write data | `PRINT#file#, data [; data...]` |
| `INPUT#` | Read data | `INPUT#file#, var [, var...]` |
| `CLOSE` | Close file | `CLOSE file#` |

**File parameters**:
- `file#`: Logical file number (1-255)
- `device`: 8 = disk drive
- `channel`: 2 = data channel
- `S`: Sequential file
- `W`: Write mode
- `R`: Read mode

## How It Works

### Step 1: Open File for Writing
```basic
10 OPEN 1,8,2,"SCORES,S,W"
```
- File number 1 (arbitrary)
- Device 8 (disk drive)
- Channel 2 (data)
- "SCORES" = filename
- S = sequential
- W = write mode (creates/overwrites)

### Step 2: Write Data
```basic
20 FOR I=1 TO 5
30 PRINT#1,NAME$(I);",";SC(I)
40 NEXT I
```
- PRINT#1 writes to file
- Comma-separated values (CSV format)
- Each line: "NAME,SCORE"
- Semicolons prevent extra spaces

### Step 3: Close File
```basic
50 CLOSE 1
```
- Flushes buffer to disk
- Finalizes file
- **CRITICAL**: Always close or data lost!

### Step 4: Read Back Data
```basic
100 OPEN 1,8,2,"SCORES,S,R"
110 FOR I=1 TO 5
120 INPUT#1,NAME$(I),SC(I)
130 NEXT I
140 CLOSE 1
```
- Open for read (R)
- INPUT#1 reads from file
- Matches write format
- Close when done

## Variations

### Variation 1: Save with Error Handling
```basic
10 ON ERROR GOTO 9000
20 OPEN 1,8,2,"@0:SCORES,S,W"  : REM @0: overwrites
30 FOR I=1 TO 5
40 PRINT#1,NAME$(I);",";SC(I)
50 NEXT I
60 CLOSE 1
70 PRINT "SAVED!"
80 END

9000 REM ERROR HANDLER
9010 PRINT "SAVE FAILED: ERR";ERR
9020 CLOSE 1
9030 RESUME 80
```

**Feature**: Graceful error recovery

### Variation 2: Load with Defaults
```basic
10 ON ERROR GOTO 9000
20 GOSUB 100                : REM try load
30 END

100 REM --- LOAD SCORES ---
110 OPEN 1,8,2,"SCORES,S,R"
120 FOR I=1 TO 5
130 INPUT#1,NAME$(I),SC(I)
140 NEXT I
150 CLOSE 1
160 PRINT "LOADED!"
170 RETURN

9000 REM FILE NOT FOUND
9010 IF ERR=4 THEN GOSUB 8000:RESUME 170
9020 PRINT "ERROR";ERR:CLOSE 1:RESUME 170

8000 REM INIT DEFAULTS
8010 FOR I=1 TO 5
8020 NAME$(I)="---"
8030 SC(I)=(6-I)*1000       : REM 5000,4000,3000...
8040 NEXT I
8050 RETURN
```

**Use case**: First run without file

### Variation 3: Check Before Overwrite
```basic
10 INPUT "SAVE SCORES (Y/N)";A$
20 IF A$<>"Y" THEN RETURN
30 PRINT "SAVING..."
40 OPEN 1,8,2,"@0:SCORES,S,W"
50 FOR I=1 TO 5
60 PRINT#1,NAME$(I);",";SC(I)
70 NEXT I
80 CLOSE 1
90 PRINT "SAVED!"
```

**Feature**: User confirmation

### Variation 4: Timestamped Saves
```basic
10 REM BUILD FILENAME WITH DATE
20 TI$="000000"             : REM reset clock
30 REM ... play game ...
40 T$=TI$
50 FN$="SCORE"+LEFT$(T$,4)  : REM SCOREHHMM
60 PRINT "SAVING TO ";FN$
70 OPEN 1,8,2,"@0:"+FN$+",S,W"
80 FOR I=1 TO 5
90 PRINT#1,NAME$(I);",";SC(I)
100 NEXT I
110 CLOSE 1
```

**Use case**: Multiple save files

### Variation 5: Append Mode (Sequential Add)
```basic
10 REM LOAD EXISTING
20 ON ERROR GOTO 100
30 OPEN 1,8,2,"SCORES,S,R"
40 FOR I=1 TO 5:INPUT#1,N$(I),S(I):NEXT I
50 CLOSE 1
60 REM
70 REM ADD NEW SCORE
100 N$(6)=NEWNAME$:S(6)=NEWSCORE
110 REM
120 REM SORT (BUBBLE)
130 FOR I=1 TO 6
140 FOR J=I+1 TO 6
150 IF S(J)>S(I) THEN N$=N$(I):N$(I)=N$(J):N$(J)=N$:T=S(I):S(I)=S(J):S(J)=T
160 NEXT J:NEXT I
170 REM
180 REM SAVE TOP 5
190 OPEN 1,8,2,"@0:SCORES,S,W"
200 FOR I=1 TO 5:PRINT#1,N$(I);",";S(I):NEXT I
210 CLOSE 1
```

**Feature**: Add and re-sort scores

### Variation 6: Save Game State
```basic
10 REM SAVE COMPLETE STATE
20 OPEN 1,8,2,"@0:SAVE,S,W"
30 PRINT#1,LEVEL
40 PRINT#1,SCORE
50 PRINT#1,LIVES
60 PRINT#1,PX;",";PY
70 FOR I=0 TO 9
80 PRINT#1,EX(I);",";EY(I);",";EACTIVE(I)
90 NEXT I
100 CLOSE 1
110 PRINT "GAME SAVED"

200 REM LOAD GAME STATE
210 OPEN 1,8,2,"SAVE,S,R"
220 INPUT#1,LEVEL
230 INPUT#1,SCORE
240 INPUT#1,LIVES
250 INPUT#1,PX,PY
260 FOR I=0 TO 9
270 INPUT#1,EX(I),EY(I),EACTIVE(I)
280 NEXT I
290 CLOSE 1
300 PRINT "GAME LOADED"
```

**Use case**: Save/resume game

## Common Mistakes

- **Mistake 1**: Not closing file
  - **Symptom**: Data not written, file corrupted
  - **Fix**: Always CLOSE before END or error

- **Mistake 2**: Wrong file mode
  - **Symptom**: Can't read W file, can't write R file
  - **Fix**: W for save, R for load

- **Mistake 3**: Mismatched PRINT# and INPUT#
  - **Symptom**: TYPE MISMATCH or wrong data
  - **Fix**: Write and read in same order/format

- **Mistake 4**: Not using @0: to overwrite
  - **Symptom**: "FILE EXISTS" error
  - **Fix**: Use "@0:FILENAME" to replace

- **Mistake 5**: Spaces in PRINT# output
  - **Symptom**: Extra spaces corrupt data
  - **Fix**: Use semicolons: `PRINT#1,A;",";B` not `PRINT#1,A,",",B`

## Memory Usage

- **File buffer**: ~256 bytes (1 sector)
- **Channel overhead**: ~50 bytes
- **Open files**: Use file numbers 1-127
- **Max open files**: Limited by RAM (~10 typical)

**Best practice**: Open, write/read, close immediately

## Integration Example

```basic
NEW
10 REM === HIGH SCORE DEMO ===
20 DIM NAME$(5),SC(5)
30 GOSUB 9000               : REM init
40 GOSUB 100                : REM main menu
50 END

100 REM --- MAIN MENU ---
110 PRINT CHR$(147);"HIGH SCORE MANAGER"
120 PRINT:PRINT "1. VIEW SCORES"
130 PRINT "2. ADD SCORE"
140 PRINT "3. SAVE TO DISK"
150 PRINT "4. LOAD FROM DISK"
160 PRINT "0. EXIT"
170 PRINT:INPUT "CHOICE";C$
180 IF C$="0" THEN RETURN
190 C=VAL(C$)
200 IF C<1 OR C>4 THEN 110
210 ON C GOSUB 1000,2000,3000,4000
220 GOTO 110

1000 REM --- VIEW SCORES ---
1010 PRINT CHR$(147);"HIGH SCORES"
1020 PRINT
1030 FOR I=1 TO 5
1040 PRINT I;". ";NAME$(I);
1050 PRINT TAB(20);SC(I)
1060 NEXT I
1070 PRINT:PRINT "PRESS KEY"
1080 GET K$:IF K$="" THEN 1080
1090 RETURN

2000 REM --- ADD SCORE ---
2010 PRINT CHR$(147);"ADD SCORE"
2020 PRINT:INPUT "NAME";N$
2030 INPUT "SCORE";S
2040 REM
2050 REM INSERT AND SORT
2060 NAME$(6)=N$:SC(6)=S
2070 FOR I=1 TO 6
2080 FOR J=I+1 TO 6
2090 IF SC(J)>SC(I) THEN N$=NAME$(I):NAME$(I)=NAME$(J):NAME$(J)=N$:T=SC(I):SC(I)=SC(J):SC(J)=T
2100 NEXT J:NEXT I
2110 REM
2120 PRINT "SCORE ADDED!"
2130 PRINT:PRINT "PRESS KEY"
2140 GET K$:IF K$="" THEN 2140
2150 RETURN

3000 REM --- SAVE TO DISK ---
3010 PRINT CHR$(147);"SAVING..."
3020 ON ERROR GOTO 3500
3030 OPEN 1,8,2,"@0:SCORES,S,W"
3040 FOR I=1 TO 5
3050 PRINT#1,NAME$(I);",";SC(I)
3060 NEXT I
3070 CLOSE 1
3080 PRINT "SAVED!"
3090 PRINT:PRINT "PRESS KEY"
3100 GET K$:IF K$="" THEN 3100
3110 RETURN
3500 REM SAVE ERROR
3510 PRINT "SAVE FAILED: ERR";ERR
3520 CLOSE 1
3530 PRINT:PRINT "PRESS KEY"
3540 GET K$:IF K$="" THEN 3540
3550 RESUME 3110

4000 REM --- LOAD FROM DISK ---
4010 PRINT CHR$(147);"LOADING..."
4020 ON ERROR GOTO 4500
4030 OPEN 1,8,2,"SCORES,S,R"
4040 FOR I=1 TO 5
4050 INPUT#1,NAME$(I),SC(I)
4060 NEXT I
4070 CLOSE 1
4080 PRINT "LOADED!"
4090 PRINT:PRINT "PRESS KEY"
4100 GET K$:IF K$="" THEN 4100
4110 RETURN
4500 REM LOAD ERROR
4510 IF ERR=4 THEN PRINT "FILE NOT FOUND":GOTO 4530
4520 PRINT "LOAD FAILED: ERR";ERR
4530 CLOSE 1
4540 PRINT:PRINT "PRESS KEY"
4550 GET K$:IF K$="" THEN 4550
4560 RESUME 4110

9000 REM === INIT DEFAULTS ===
9010 FOR I=1 TO 5
9020 NAME$(I)="---"
9030 SC(I)=(6-I)*1000       : REM 5000,4000,3000,2000,1000
9040 NEXT I
9050 RETURN
```

## File Format Examples

### CSV Format (Recommended)
```
NAME1,5000
NAME2,4500
NAME3,4000
NAME4,3500
NAME5,3000
```

**Code**:
```basic
PRINT#1,NAME$(I);",";SC(I)
INPUT#1,NAME$(I),SC(I)
```

### Space-Delimited
```
NAME1 5000
NAME2 4500
```

**Code**:
```basic
PRINT#1,NAME$(I);" ";SC(I)
INPUT#1,NAME$(I),SC(I)
```

### One-Per-Line
```
NAME1
5000
NAME2
4500
```

**Code**:
```basic
PRINT#1,NAME$(I)
PRINT#1,SC(I)
INPUT#1,NAME$(I)
INPUT#1,SC(I)
```

## Disk Commands

### Overwrite File
```basic
OPEN 1,8,2,"@0:SCORES,S,W"  : REM @0: replaces
```

### Scratch (Delete) File
```basic
OPEN 15,8,15,"S0:SCORES"    : REM command channel
CLOSE 15
```

### Read Disk Status
```basic
OPEN 15,8,15                : REM command channel
INPUT#15,EN,EM$,ET,ES       : REM error number, message, track, sector
PRINT EN;EM$
CLOSE 15
```

## Best Practices

1. **Always use error handling**:
   ```basic
   10 ON ERROR GOTO 9000
   20 OPEN 1,8,2,"SCORES,S,W"
   ```

2. **Close in error handler**:
   ```basic
   9000 CLOSE 1             : REM cleanup
   9010 PRINT "ERROR";ERR
   ```

3. **Use @0: to overwrite**:
   ```basic
   OPEN 1,8,2,"@0:SCORES,S,W"
   ```

4. **Validate after load**:
   ```basic
   INPUT#1,N$,S
   IF S<0 OR S>999999 THEN S=0
   ```

5. **Keep format simple**:
   ```basic
   REM Good: CSV
   PRINT#1,A;",";B;",";C

   REM Complex: Avoid
   PRINT#1,"NAME=";A;" SCORE=";B
   ```

## Save/Load Checklist

- [ ] Arrays dimensioned (DIM NAME$(5), SC(5))
- [ ] Error handler installed (ON ERROR GOTO)
- [ ] File opened correctly (OPEN 1,8,2,...)
- [ ] Write/read format matches
- [ ] File closed (CLOSE 1)
- [ ] Error handler closes file
- [ ] Tested with missing file
- [ ] Tested with disk full
- [ ] Tested with disk removed

## See Also

- [Disk Operations](disk-operations.md) - Advanced disk commands
- [Error Handling](../errors/error-handling.md) - Trap file errors
- [READ/DATA Pattern](../data/read-data-pattern.md) - Alternative to disk
- **Lessons**: 43 (Shooting Stars), 47 (Saving Scores)
- **Vault**: [1541 Commands](/vault/1541-commands), [Sequential Files](/vault/seq-files)

## Quick Reference Card

```basic
REM High score save/load pattern

REM SAVE
10 ON ERROR GOTO 9000
20 OPEN 1,8,2,"@0:SCORES,S,W"
30 FOR I=1 TO 5
40 PRINT#1,NAME$(I);",";SC(I)
50 NEXT I
60 CLOSE 1
70 PRINT "SAVED!"

REM LOAD
100 ON ERROR GOTO 9000
110 OPEN 1,8,2,"SCORES,S,R"
120 FOR I=1 TO 5
130 INPUT#1,NAME$(I),SC(I)
140 NEXT I
150 CLOSE 1
160 PRINT "LOADED!"

REM ERROR HANDLER
9000 PRINT "ERROR";ERR
9010 CLOSE 1
9020 RESUME 170

REM Key points:
- Device 8 = disk drive
- Channel 2 = data
- S = sequential
- W = write, R = read
- @0: = overwrite
- Always CLOSE!
- Always error trap!
- Use semicolons in PRINT#
- Match write/read format

REM Common errors:
ERR=4   FILE NOT FOUND
ERR=24  DISK ERROR (check status)
```

---

**Status**: Phase 4 Pattern
**Last Updated**: 2025-01-15
**Source**: Code Like It's 198x - C64 BASIC Course
