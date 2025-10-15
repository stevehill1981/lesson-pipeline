# Disk Operations

**Category**: File I/O
**Difficulty**: Advanced
**Appears in**: Lessons 43, 47
**Prerequisites**: [Save High Scores](save-high-scores.md), [Error Handling](../errors/error-handling.md)

## Overview

Control the 1541 disk drive using the command channel (channel 15) to read disk status, display directory listings, scratch files, rename files, format disks, and diagnose errors for robust disk-based game features.

## The Pattern

```basic
REM --- READ DISK STATUS ---
10 OPEN 15,8,15             : REM command channel
20 INPUT#15,EN,EM$,ET,ES    : REM error num, msg, track, sector
30 PRINT EN;EM$
40 CLOSE 15

REM --- SEND DISK COMMAND ---
100 OPEN 15,8,15,"S0:OLDFILE": REM scratch (delete) file
110 CLOSE 15
```

## Parameters

| Channel | Purpose | Usage |
|---------|---------|-------|
| 15 | Command channel | Send commands, read status |
| 0 | Load | LOAD "filename",8 |
| 1 | Save | SAVE "filename",8 |
| 2-14 | Data | OPEN for sequential/relative files |

**Command channel syntax**:
```
OPEN 15,8,15[,"command"]
```

## How It Works

### Step 1: Open Command Channel
```basic
10 OPEN 15,8,15
```
- File number 15 (conventional)
- Device 8 (disk drive)
- Channel 15 (command/status)
- Leave open to monitor status

### Step 2: Read Disk Status
```basic
20 INPUT#15,EN,EM$,ET,ES
```
- EN = error number (0-99)
- EM$ = error message string
- ET = track where error occurred
- ES = sector where error occurred

**Common status codes**:
- 00 = OK
- 62 = FILE NOT FOUND
- 63 = FILE EXISTS
- 73 = DISK FULL

### Step 3: Send Commands
```basic
100 OPEN 15,8,15,"S0:FILENAME"
```
- Opens channel with command
- Command executes immediately
- Check status with INPUT#15

### Step 4: Close Channel
```basic CLOSE 15
```
- Releases command channel
- Can reopen as needed

## Variations

### Variation 1: Directory Listing
```basic
10 OPEN 1,8,0,"$"           : REM open directory
20 GET#1,A$,A$              : REM skip load address
30 IF ST<>0 THEN 80         : REM check status
40 GET#1,L$,H$              : REM line link
50 IF L$+H$=CHR$(0)+CHR$(0) THEN 80
60 GET#1,N$,N$              : REM block count
70 PRINT#1;:GOTO 30         : REM print line, loop
80 CLOSE 1
```

**Feature**: Show disk contents

### Variation 2: Check Before Save
```basic
10 ON ERROR GOTO 9000
20 REM CHECK IF FILE EXISTS
30 OPEN 15,8,15
40 OPEN 1,8,0,"SCORES"      : REM try to open
50 CLOSE 1
60 INPUT#15,EN,EM$,ET,ES
70 CLOSE 15
80 IF EN=0 THEN PRINT "FILE EXISTS - OVERWRITE?":INPUT A$:IF A$<>"Y" THEN RETURN
90 REM PROCEED WITH SAVE
100 OPEN 1,8,2,"@0:SCORES,S,W"
110 REM ... write data ...
120 CLOSE 1
130 RETURN

9000 REM ERROR (FILE NOT FOUND = OK TO SAVE)
9010 CLOSE 1:CLOSE 15
9020 RESUME 100
```

**Use case**: Confirm overwrite

### Variation 3: Scratch (Delete) Files
```basic
10 OPEN 15,8,15,"S0:OLDFILE": REM scratch file
20 INPUT#15,EN,EM$
30 IF EN=0 THEN PRINT "DELETED"
40 IF EN=62 THEN PRINT "FILE NOT FOUND"
50 CLOSE 15
```

**Feature**: Delete files

### Variation 4: Rename Files
```basic
10 OPEN 15,8,15,"R0:NEWNAME=OLDNAME"
20 INPUT#15,EN,EM$
30 IF EN=0 THEN PRINT "RENAMED"
40 IF EN=62 THEN PRINT "FILE NOT FOUND"
50 CLOSE 15
```

**Feature**: Rename files

### Variation 5: Initialize (Format) Disk
```basic
10 PRINT "FORMAT DISK? (ERASES ALL!)"
20 INPUT A$:IF A$<>"YES" THEN RETURN
30 PRINT "DISK NAME";:INPUT N$
40 PRINT "DISK ID (2 CHARS)";:INPUT ID$
50 PRINT "FORMATTING..."
60 OPEN 15,8,15,"N0:"+N$+","+ID$
70 REM WAIT FOR COMPLETION
80 INPUT#15,EN,EM$
90 IF EN>0 AND EN<20 THEN 80: REM still working
100 IF EN=0 THEN PRINT "FORMATTED!"
110 IF EN<>0 THEN PRINT "ERROR:";EN;EM$
120 CLOSE 15
```

**Feature**: Format new disk

### Variation 6: Validate Disk
```basic
10 PRINT "VALIDATING..."
20 OPEN 15,8,15,"V0"        : REM validate drive 0
30 REM WAIT FOR COMPLETION
40 INPUT#15,EN,EM$
50 IF EN>0 AND EN<20 THEN 40
60 IF EN=0 THEN PRINT "DISK OK"
70 IF EN<>0 THEN PRINT "ERRORS FOUND:";EN;EM$
80 CLOSE 15
```

**Feature**: Check disk integrity

## Common Mistakes

- **Mistake 1**: Not checking status after commands
  - **Symptom**: Silent failures
  - **Fix**: INPUT#15 after every command

- **Mistake 2**: Leaving channel 15 open
  - **Symptom**: Commands don't work
  - **Fix**: CLOSE 15 when done

- **Mistake 3**: Wrong command syntax
  - **Symptom**: Error 30-32 (syntax error)
  - **Fix**: Check DOS manual for exact format

- **Mistake 4**: Not handling "disk full"
  - **Symptom**: Data lost, game freezes
  - **Fix**: Check EN=72 before writing

- **Mistake 5**: Format without confirmation
  - **Symptom**: User loses all data!
  - **Fix**: Require "YES" (not just "Y")

## Memory Usage

- **Command channel**: ~50 bytes
- **Directory buffer**: 1 sector (256 bytes)
- **Status variables**: ~20 bytes (EN, EM$, ET, ES)
- **Minimal overhead**: Safe to use throughout game

## Integration Example

```basic
NEW
10 REM === DISK TOOLS ===
20 GOSUB 100                : REM main menu
30 END

100 REM --- MAIN MENU ---
110 PRINT CHR$(147);"DISK TOOLS"
120 PRINT:PRINT "1. DISK STATUS"
130 PRINT "2. DIRECTORY"
140 PRINT "3. SCRATCH FILE"
150 PRINT "4. RENAME FILE"
160 PRINT "5. VALIDATE"
170 PRINT "0. EXIT"
180 PRINT:INPUT "CHOICE";C$
190 IF C$="0" THEN RETURN
200 C=VAL(C$)
210 IF C<1 OR C>5 THEN 110
220 ON C GOSUB 1000,2000,3000,4000,5000
230 GOTO 110

1000 REM --- DISK STATUS ---
1010 PRINT CHR$(147);"DISK STATUS"
1020 PRINT
1030 OPEN 15,8,15
1040 INPUT#15,EN,EM$,ET,ES
1050 CLOSE 15
1060 PRINT "CODE:";EN
1070 PRINT "MSG: ";EM$
1080 IF EN<>0 THEN PRINT "TRACK:";ET;" SECTOR:";ES
1090 PRINT:PRINT "PRESS KEY"
1100 GET K$:IF K$="" THEN 1100
1110 RETURN

2000 REM --- DIRECTORY ---
2010 PRINT CHR$(147);"DIRECTORY"
2020 PRINT
2030 OPEN 1,8,0,"$"
2040 GET#1,A$,A$             : REM skip load address
2050 REM HEADER LINE
2060 GET#1,L$,H$
2070 IF L$+H$=CHR$(0)+CHR$(0) THEN 2160
2080 GET#1,BL,BH             : REM blocks
2090 GET#1,A$                : REM first char
2100 IF A$<>CHR$(34) THEN 2090: REM find quote
2110 GET#1,A$:PRINT A$;      : REM disk name
2120 IF A$<>CHR$(34) THEN 2110
2130 PRINT:PRINT
2140 REM FILE LINES
2150 GET#1,L$,H$
2160 IF L$+H$=CHR$(0)+CHR$(0) THEN 2230
2170 GET#1,BL,BH
2180 PRINT BL+BH*256;        : REM blocks
2190 GET#1,A$
2200 IF A$=CHR$(0) THEN 2220
2210 PRINT A$;:GOTO 2190
2220 PRINT:GOTO 2150
2230 CLOSE 1
2240 PRINT:PRINT "PRESS KEY"
2250 GET K$:IF K$="" THEN 2250
2260 RETURN

3000 REM --- SCRATCH FILE ---
3010 PRINT CHR$(147);"SCRATCH FILE"
3020 PRINT:INPUT "FILENAME";F$
3030 IF F$="" THEN RETURN
3040 PRINT "DELETE ";F$;" ?"
3050 INPUT "YES TO CONFIRM";A$
3060 IF A$<>"YES" THEN RETURN
3070 PRINT "DELETING..."
3080 OPEN 15,8,15,"S0:"+F$
3090 INPUT#15,EN,EM$
3100 CLOSE 15
3110 IF EN=0 THEN PRINT "DELETED"
3120 IF EN=62 THEN PRINT "NOT FOUND"
3130 IF EN<>0 AND EN<>62 THEN PRINT "ERROR";EN;EM$
3140 PRINT:PRINT "PRESS KEY"
3150 GET K$:IF K$="" THEN 3150
3160 RETURN

4000 REM --- RENAME FILE ---
4010 PRINT CHR$(147);"RENAME FILE"
4020 PRINT:INPUT "OLD NAME";O$
4030 IF O$="" THEN RETURN
4040 INPUT "NEW NAME";N$
4050 IF N$="" THEN RETURN
4060 PRINT "RENAMING..."
4070 OPEN 15,8,15,"R0:"+N$+"="+O$
4080 INPUT#15,EN,EM$
4090 CLOSE 15
4100 IF EN=0 THEN PRINT "RENAMED"
4110 IF EN=62 THEN PRINT "OLD FILE NOT FOUND"
4120 IF EN=63 THEN PRINT "NEW NAME EXISTS"
4130 IF EN<>0 AND EN<>62 AND EN<>63 THEN PRINT "ERROR";EN;EM$
4140 PRINT:PRINT "PRESS KEY"
4150 GET K$:IF K$="" THEN 4150
4160 RETURN

5000 REM --- VALIDATE DISK ---
5010 PRINT CHR$(147);"VALIDATE DISK"
5020 PRINT
5030 PRINT "THIS MAY TAKE A MINUTE"
5040 PRINT:PRINT "VALIDATING..."
5050 OPEN 15,8,15,"V0"
5060 REM WAIT FOR COMPLETION
5070 INPUT#15,EN,EM$
5080 IF EN>0 AND EN<20 THEN PRINT ".";:GOTO 5070
5090 CLOSE 15
5100 PRINT:IF EN=0 THEN PRINT "DISK OK"
5110 IF EN<>0 THEN PRINT "ERROR";EN;EM$
5120 PRINT:PRINT "PRESS KEY"
5130 GET K$:IF K$="" THEN 5130
5140 RETURN
```

## DOS Command Reference

### File Commands
```basic
REM Scratch (delete) file
OPEN 15,8,15,"S0:FILENAME"

REM Rename file
OPEN 15,8,15,"R0:NEWNAME=OLDNAME"

REM Copy file
OPEN 15,8,15,"C0:NEWFILE=OLDFILE"
```

### Disk Commands
```basic
REM Initialize (format) disk
OPEN 15,8,15,"N0:DISKNAME,ID"

REM Validate disk
OPEN 15,8,15,"V0"

REM Read disk name/ID
OPEN 15,8,15,"I0"
INPUT#15,EN,EM$
```

### Channel Commands
```basic
REM Block allocate
OPEN 15,8,15,"B-A:0,"+CHR$(T)+CHR$(S)

REM Block read
OPEN 15,8,15,"B-R:0,"+CHR$(T)+CHR$(S)

REM Block write
OPEN 15,8,15,"B-W:0,"+CHR$(T)+CHR$(S)
```

## Error Code Reference

| Code | Meaning | Action |
|------|---------|--------|
| 00 | OK | No error |
| 01 | SCRATCHED FILES | Number deleted |
| 20-29 | BUSY | Wait for completion |
| 62 | FILE NOT FOUND | Check filename |
| 63 | FILE EXISTS | Use @0: to overwrite |
| 64 | FILE TYPE MISMATCH | Wrong file type |
| 65 | NO BLOCK | Can't allocate |
| 66 | ILLEGAL TRACK/SECTOR | Hardware error |
| 67 | ILLEGAL SYSTEM T/S | Reserved track |
| 70 | NO CHANNEL | Too many files open |
| 71 | DIR ERROR | Directory damaged |
| 72 | DISK FULL | No free blocks |
| 73 | CBM DOS V2.6 1541 | Power on/init message |
| 74 | DRIVE NOT READY | No disk or door open |

## Status Check Pattern

```basic
1000 REM --- CHECK DISK STATUS ---
1010 REM Output: EN (error number)
1020 REM Output: EM$ (error message)
1030 OPEN 15,8,15
1040 INPUT#15,EN,EM$,ET,ES
1050 CLOSE 15
1060 RETURN

REM USE IT
100 GOSUB 1000
110 IF EN<>0 AND EN<>73 THEN PRINT "ERROR:";EM$:STOP
120 REM ... proceed ...
```

## Best Practices

1. **Always check status**:
   ```basic
   OPEN 15,8,15,"S0:FILE"
   INPUT#15,EN,EM$
   IF EN<>0 THEN PRINT EM$
   CLOSE 15
   ```

2. **Handle "disk full"**:
   ```basic
   INPUT#15,EN,EM$
   IF EN=72 THEN PRINT "DISK FULL":STOP
   ```

3. **Confirm destructive operations**:
   ```basic
   INPUT "DELETE FILE - TYPE YES";A$
   IF A$<>"YES" THEN RETURN
   ```

4. **Use conventional file numbers**:
   ```basic
   OPEN 15,8,15     : REM always 15 for commands
   OPEN 1,8,2,...   : REM 1-14 for data
   ```

5. **Close before reopening**:
   ```basic
   CLOSE 15
   OPEN 15,8,15,"NEW COMMAND"
   ```

## Directory Parsing

**Directory structure**:
```
$0000: Load address (low, high)
$0002: Line link (0,0 = end)
$0004: Block count (low, high)
$0006: Filename + type (null terminated)
...repeat for each file...
```

**Simple directory reader**:
```basic
10 OPEN 1,8,0,"$"
20 GET#1,A$,A$              : REM skip address
30 GET#1,L$,H$              : REM line link
40 IF L$+H$=CHR$(0)+CHR$(0) THEN 80
50 GET#1,BL,BH:PRINT BL+BH*256;: REM blocks
60 GET#1,A$:IF A$<>CHR$(0) THEN PRINT A$;:GOTO 60
70 PRINT:GOTO 30
80 CLOSE 1
```

## See Also

- [Save High Scores](save-high-scores.md) - Sequential file I/O
- [Error Handling](../errors/error-handling.md) - Trap disk errors
- [Menu System](../menus/menu-system.md) - File selection menus
- **Lessons**: 43 (Shooting Stars), 47 (Saving Scores)
- **Vault**: [1541 DOS](/vault/1541-dos), [Disk Commands](/vault/disk-commands)

## Quick Reference Card

```basic
REM Disk operations patterns

REM Read status
OPEN 15,8,15
INPUT#15,EN,EM$,ET,ES
CLOSE 15
PRINT EN;EM$

REM Send command
OPEN 15,8,15,"COMMAND"
INPUT#15,EN,EM$
IF EN<>0 THEN PRINT EM$
CLOSE 15

REM Common commands:
S0:FILE         Scratch (delete) file
R0:NEW=OLD      Rename file
C0:NEW=OLD      Copy file
N0:NAME,ID      Format disk
V0              Validate disk
I0              Initialize drive

REM Directory listing:
OPEN 1,8,0,"$"
REM ... parse directory ...
CLOSE 1

REM Error codes:
00 = OK
62 = FILE NOT FOUND
63 = FILE EXISTS
72 = DISK FULL
73 = DOS READY
74 = DRIVE NOT READY

REM Best practices:
- Always check status
- Close channel 15
- Confirm destructive ops
- Handle disk full
- Use file #15 for commands
```

---

**Status**: Phase 4 Pattern
**Last Updated**: 2025-01-15
**Source**: Code Like It's 198x - C64 BASIC Course
