# RESTORE Pattern

**Category**: Data & Levels
**Difficulty**: Beginner
**Appears in**: Lessons 23, 24, 52, 56
**Prerequisites**: [READ/DATA Pattern](read-data-pattern.md)

## Overview

Reposition the DATA pointer to reread existing DATA statements or jump to specific DATA blocks. Essential for level selection, rereading music sequences, and accessing structured data without duplicating it.

## The Pattern

```basic
REM --- BASIC RESTORE PATTERN ---
10 RESTORE 1000
20 FOR I=0 TO 3
30 READ NOTE(I)
40 NEXT I
50 REM ... later, play again
60 RESTORE 1000
70 FOR I=0 TO 3
80 READ NOTE(I)
90 PRINT NOTE(I)
100 NEXT I

1000 DATA 34,38,43,45
```

## Parameters

| Element | Type | Purpose | Values |
|---------|------|---------|--------|
| `RESTORE` | Statement | Reset DATA pointer | Line number or empty |
| Line number | Integer | Target DATA line | Any line with DATA |
| No argument | - | Reset to first DATA | `RESTORE` alone |

## How It Works

### Step 1: RESTORE to Line
```basic
RESTORE 9000
```
- Sets DATA pointer to line 9000
- Next READ starts from that DATA statement
- Can jump to any line number

### Step 2: READ Normally
```basic
FOR I=0 TO 5
  READ ITEM$(I)
NEXT I
```
- READ proceeds sequentially from RESTORE point
- Pointer advances through DATA as normal

### Step 3: RESTORE Again
```basic
RESTORE 9000
```
- Resets pointer back to same line
- Can reread same DATA multiple times
- No limit on RESTORE calls

## Variations

### Variation 1: Reread Same Data
```basic
100 REM PLAY MELODY TWICE
110 FOR PASS=1 TO 2
120 RESTORE 1000
130 FOR I=0 TO 7:READ NOTE(I):NEXT I
140 GOSUB 2000  : REM play notes
150 NEXT PASS
160 END

1000 DATA 34,38,43,45,51,57,64,68
```

**Use case**: Looping music, repeated patterns

### Variation 2: Level Selection
```basic
100 INPUT "LEVEL (1-3)";LEVEL
110 IF LEVEL=1 THEN RESTORE 9000
120 IF LEVEL=2 THEN RESTORE 9100
130 IF LEVEL=3 THEN RESTORE 9200
140 FOR R=0 TO 9:FOR C=0 TO 17
150 READ MAP(R,C)
160 NEXT C:NEXT R

9000 REM LEVEL 1
9010 DATA 1,1,1,1,...
9100 REM LEVEL 2
9110 DATA 1,1,1,1,...
9200 REM LEVEL 3
9210 DATA 1,1,1,1,...
```

**Use case**: Jump directly to level data

### Variation 3: Scanning with Sentinel
```basic
100 REM FIND LEVEL IN LIST
110 RESTORE 9000
120 READ ID:IF ID=0 THEN RETURN
130 IF ID=TARGET THEN 160
140 FOR SK=1 TO 10:READ D$:NEXT SK  : REM skip this level
150 GOTO 120
160 REM found it, now read level data
170 READ TITLE$,ROWS,COLS
180 FOR R=1 TO ROWS:READ MAP$(R):NEXT R

9000 DATA 1,"LEVEL ONE",6,18
9010 DATA "##################"
9020 REM ...
9030 DATA 2,"LEVEL TWO",8,20
9040 REM ...
9050 DATA 0,"END",0,0
```

**Feature**: Dynamic level search

### Variation 4: Music Sequence Player
```basic
100 RESTORE 5000
110 READ CUE$
120 IF CUE$="TITLE" THEN RESTORE 5100:GOSUB 2000
130 IF CUE$="ACTION" THEN RESTORE 5200:GOSUB 2000
140 IF CUE$="VICTORY" THEN RESTORE 5300:GOSUB 2000

2000 REM PLAY SEQUENCE
2010 FOR I=1 TO 16
2020 READ FREQ
2030 IF FREQ=0 THEN RETURN
2040 POKE 54272,FREQ
2050 GOSUB 3000  : REM play note
2060 NEXT I
2070 RETURN

5000 DATA "TITLE"
5100 DATA 34,38,43,45,51,57,64,68,0
5200 DATA 51,51,64,64,76,76,85,85,0
5300 DATA 102,96,85,76,68,64,57,51,0
```

**Use case**: Music cues by name

### Variation 5: Reset to Beginning
```basic
100 REM READ ALL DATA
110 FOR I=0 TO 99
120 READ DATA$(I)
130 IF DATA$(I)="END" THEN 160
140 NEXT I
150 END

160 REM START OVER
170 RESTORE
180 GOTO 110

1000 DATA "SWORD","SHIELD","POTION"
1010 DATA "KEY","TORCH","ROPE"
1020 DATA "END"
```

**Feature**: RESTORE with no argument = first DATA

### Variation 6: Dialogue System
```basic
100 INPUT "ROOM";ROOM
110 RESTORE 9000+(ROOM-1)*10
120 FOR I=0 TO 4
130 READ DIALOG$(I)
140 NEXT I
150 GOSUB 2000  : REM display dialogue

9000 REM ROOM 1 DIALOGUE
9010 DATA "Welcome, traveler."
9020 DATA "Watch your step."
9030 DATA "Danger lurks ahead."
9040 DATA "",""
9100 REM ROOM 2 DIALOGUE
9110 DATA "The air grows cold."
9120 DATA "You hear whispers."
9130 DATA "","",""
```

**Use case**: Room-specific text

## Common Mistakes

- **Mistake 1**: RESTORE without line number in wrong place
  - **Symptom**: DATA pointer goes to first DATA, not intended block
  - **Fix**: Always specify line number: `RESTORE 9000`

- **Mistake 2**: Wrong line number
  - **Symptom**: Reading wrong data or crash
  - **Fix**: Use line numbers of actual DATA statements

- **Mistake 3**: Not RESTORE before rereading
  - **Symptom**: `?OUT OF DATA ERROR`
  - **Fix**: Always RESTORE before second READ pass

- **Mistake 4**: RESTORE inside READ loop
  - **Symptom**: Infinite loop, same data forever
  - **Fix**: RESTORE before loop, not inside

- **Mistake 5**: Forgetting DATA pointer advances
  - **Symptom**: Reading wrong values after RESTORE
  - **Fix**: RESTORE resets pointer, but READ still advances it

## Memory Usage

- **RESTORE**: No memory overhead
- **DATA statements**: Stored in program text
- **Pointer**: Internal, no cost
- **Efficient**: Reuse DATA without duplication

## Integration Example

```basic
NEW
10 REM === RESTORE DEMO ===
20 GOSUB 9000  : REM init
30 PRINT CHR$(147)
40 PRINT "RESTORE PATTERN DEMO"
50 PRINT:PRINT "1 = PLAY SCALE"
60 PRINT "2 = PLAY ARPEGGIO"
70 PRINT "3 = PLAY MELODY"
80 PRINT "4 = REPLAY LAST"
90 PRINT "Q = QUIT"
100 GET K$:IF K$="" THEN 100
110 IF K$="Q" THEN END
120 IF K$="1" THEN LASTSONG=1:GOSUB 1000
130 IF K$="2" THEN LASTSONG=2:GOSUB 1100
140 IF K$="3" THEN LASTSONG=3:GOSUB 1200
150 IF K$="4" THEN ON LASTSONG GOSUB 1000,1100,1200
160 GOTO 100

1000 REM --- PLAY SCALE ---
1010 RESTORE 5000
1020 PRINT CHR$(19);"PLAYING: SCALE"
1030 FOR I=1 TO 8
1040 READ FREQ
1050 GOSUB 2000
1060 NEXT I
1070 RETURN

1100 REM --- PLAY ARPEGGIO ---
1110 RESTORE 5010
1120 PRINT CHR$(19);"PLAYING: ARPEGGIO"
1130 FOR I=1 TO 6
1140 READ FREQ
1150 GOSUB 2000
1160 NEXT I
1170 RETURN

1200 REM --- PLAY MELODY ---
1210 RESTORE 5020
1220 PRINT CHR$(19);"PLAYING: MELODY"
1230 FOR I=1 TO 12
1240 READ FREQ
1250 IF FREQ=0 THEN FOR D=1 TO 30:NEXT D:GOTO 1270
1260 GOSUB 2000
1270 NEXT I
1280 RETURN

2000 REM --- PLAY NOTE ---
2010 POKE 54272,FREQ:POKE 54273,0
2020 POKE 54277,17
2030 FOR D=1 TO 40:NEXT D
2040 POKE 54277,16
2050 FOR D=1 TO 5:NEXT D
2060 RETURN

5000 DATA 34,38,43,45,51,57,64,68
5010 DATA 51,64,76,51,64,76
5020 DATA 51,51,57,64,0,64,68,76,0,76,68,64

9000 REM --- INIT ---
9010 POKE 54295,15:POKE 54296,0
9020 POKE 54275,17:POKE 54276,240
9030 LASTSONG=0
9040 RETURN
```

## RESTORE Calculation Patterns

### Pattern 1: Fixed Offset
```basic
REM Each level is 100 lines apart
RESTORE 9000+(LEVEL-1)*100
```

### Pattern 2: Variable Offset
```basic
REM Levels vary in size
RESTORE LEVELSTART(LEVEL)

REM At init:
LEVELSTART(1)=9000
LEVELSTART(2)=9150
LEVELSTART(3)=9350
```

### Pattern 3: Computed Jump
```basic
REM Calculate from level properties
LINENUM=9000+LEVEL*50+DIFFICULTY*10
RESTORE LINENUM
```

## Performance Tips

1. **RESTORE is fast**:
   ```basic
   REM No performance penalty
   RESTORE 9000
   RESTORE 9000
   RESTORE 9000  : REM all instant
   ```

2. **Cache line numbers**:
   ```basic
   REM Good: Store in array
   LEVELDATA(1)=9000
   LEVELDATA(2)=9100
   RESTORE LEVELDATA(LEVEL)

   REM Works but harder to maintain:
   IF LEVEL=1 THEN RESTORE 9000
   IF LEVEL=2 THEN RESTORE 9100
   ```

3. **Organize DATA blocks**:
   ```basic
   REM Good: Regular spacing
   9000 REM LEVEL 1
   9100 REM LEVEL 2
   9200 REM LEVEL 3

   REM Harder: Irregular
   9000 REM LEVEL 1
   9137 REM LEVEL 2
   9284 REM LEVEL 3
   ```

## See Also

- [READ/DATA Pattern](read-data-pattern.md) - Basic DATA reading
- [Level Loading](level-loading.md) - Using RESTORE for levels
- [Simple Music](../sound/simple-music.md) - Looping with RESTORE
- **Lessons**: 23 (Memory Games III), 24 (Terminal Tangle), 52 (Multiple Levels)
- **Vault**: [BASIC Commands](/vault/basic-commands)

## Quick Reference Card

```basic
REM RESTORE pattern
RESTORE line_number    : REM jump to specific DATA
READ variable          : REM read from that point

REM Reread same data
RESTORE 9000
FOR I=0 TO 10:READ D(I):NEXT I
RESTORE 9000
FOR I=0 TO 10:READ D(I):NEXT I  : REM reads same values

REM Level selection
IF LEVEL=1 THEN RESTORE 9000
IF LEVEL=2 THEN RESTORE 9100
FOR R=0 TO 9:FOR C=0 TO 17:READ MAP(R,C):NEXT C:NEXT R

REM Reset to beginning
RESTORE                : REM no argument = first DATA
```

## RESTORE Behavior

| Statement | Effect |
|-----------|--------|
| `RESTORE` | Reset to first DATA in program |
| `RESTORE 1000` | Set pointer to line 1000 |
| `RESTORE variable` | Set pointer to value in variable |
| Multiple RESTOREs | Each resets pointer independently |

## Scanning Algorithm

```basic
REM Standard pattern for finding specific data
RESTORE start_line
READ id
IF id=END_MARKER THEN not_found
IF id=TARGET THEN found
REM skip this record
FOR I=1 TO record_size:READ dummy:NEXT I
GOTO scan_loop
```

## Best Practices

1. **Document DATA structure**
   - Comment what each block contains
   - Note how many items to skip
   - Explain sentinel values

2. **Use meaningful line numbers**
   - 9000, 9100, 9200 = levels
   - 5000, 5100, 5200 = music
   - Pattern makes debugging easier

3. **RESTORE before every read sequence**
   - Don't assume pointer position
   - Explicit is better than implicit
   - Prevents "out of data" surprises

4. **Validate line numbers**
   - Ensure target line exists
   - Has DATA statement
   - Not empty or commented

5. **Consider sentinel values**
   - 0, "END", -1 to mark end
   - Allows variable-length data
   - Safer than counting

---

**Status**: Phase 3 Pattern
**Last Updated**: 2025-01-15
**Source**: Code Like It's 198x - C64 BASIC Course
