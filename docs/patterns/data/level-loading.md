# Level Loading

**Category**: Data & Levels
**Difficulty**: Intermediate
**Appears in**: Lessons 21, 23, 24, 52, 56
**Prerequisites**: [READ/DATA Pattern](read-data-pattern.md)

## Overview

Load complete level data including maps, enemy positions, spawn points, and metadata from structured DATA blocks. Supports multiple levels, level selection, and progressive difficulty by organizing all level content into reusable loader routines.

## The Pattern

```basic
REM --- LEVEL LOADER ---
100 LEVEL=1
110 GOSUB 5000               : REM load level data
120 GOSUB 6000               : REM draw level
130 REM gameplay here

5000 REM --- LOAD LEVEL DATA ---
5010 IF LEVEL=1 THEN RESTORE 9000
5020 IF LEVEL=2 THEN RESTORE 9100
5030 IF LEVEL=3 THEN RESTORE 9200
5040 FOR R=0 TO 9
5050 FOR C=0 TO 17
5060 READ MAP(R,C)
5070 NEXT C
5080 NEXT R
5090 FOR I=0 TO 3:READ EX(I),EY(I):NEXT I
5100 READ TITLE$,DMG,BONUS,SPEED
5110 RETURN

9000 REM === LEVEL 1 DATA ===
9010 DATA 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
9020 REM ... map rows
9030 DATA 2,1,14,8,0,0,0,0    : REM enemies
9040 DATA "DUSTY HALL",1,100,1
```

## Parameters

| Variable | Type | Purpose | Typical Values |
|----------|------|---------|----------------|
| `LEVEL` | Integer | Current level number | 1-99 |
| `MAP(R,C)` | 2D Array | Tile data | 0-3 (floor, wall, exit, hazard) |
| `EX(I),EY(I)` | Arrays | Enemy positions | Map coordinates |
| `TITLE$` | String | Level name | Display text |
| `DMG,BONUS,SPEED` | Integers | Level rules | Difficulty parameters |

## How It Works

### Step 1: Select Level DATA Block
```basic
IF LEVEL=1 THEN RESTORE 9000
IF LEVEL=2 THEN RESTORE 9100
```
- RESTORE sets DATA pointer to level's starting line
- Each level has dedicated DATA block
- Simple, fast lookup

### Step 2: Load Map Grid
```basic
FOR R=0 TO 9
  FOR C=0 TO 17
    READ MAP(R,C)
  NEXT C
NEXT R
```
- Nested loops match 2D array structure
- Reads tile-by-tile, row-by-row
- Fills entire map array

### Step 3: Load Entity Data
```basic
FOR I=0 TO 3:READ EX(I),EY(I):NEXT I
```
- Enemy positions follow map data
- Parallel arrays for X,Y coordinates
- 0,0 = empty slot

### Step 4: Load Metadata
```basic
READ TITLE$,DMG,BONUS,SPEED
```
- Level name for display
- Rule parameters for difficulty
- All level-specific settings

## Variations

### Variation 1: Scanning Loader (Unknown Level Count)
```basic
5000 REM --- SCAN FOR LEVEL ---
5010 RESTORE 9000
5020 READ ID:IF ID=0 THEN RETURN
5030 IF ID>MAXLEVEL THEN MAXLEVEL=ID
5040 READ ROWS:READ TITLE$
5050 IF ID=LEVEL THEN 5100
5060 FOR SK=1 TO ROWS+2:READ D$:NEXT SK
5070 GOTO 5020
5100 FOR R=1 TO ROWS:READ MAP$(R):NEXT R
5110 READ SPAWNX,SPAWNY
5120 RETURN

9000 DATA 1,6,"LEVEL ONE"
9010 DATA "##################"
9020 REM ... more rows
9030 DATA 24,18
9040 DATA 2,8,"LEVEL TWO"
9050 REM ...
9060 DATA 0,0,"END"
```

**Feature**: Flexible level count, skip unwanted levels

### Variation 2: Compressed String Maps
```basic
5000 REM --- STRING MAP LOADER ---
5010 RESTORE 9000+(LEVEL-1)*10
5020 READ TITLE$,ROWS,COLS
5030 FOR R=0 TO ROWS-1
5040 READ ROW$
5050 FOR C=0 TO COLS-1
5060 MAP(R,C)=ASC(MID$(ROW$,C+1,1))-48
5070 NEXT C
5080 NEXT R
5090 RETURN

9000 DATA "LEVEL 1",10,18
9010 DATA "111111111111111111"
9020 DATA "100000300000030001"
9030 REM ... ASCII digit strings
```

**Use case**: Compact storage, easier editing

### Variation 3: Progressive Difficulty
```basic
5000 REM --- DIFFICULTY SCALING ---
5010 GOSUB 5100              : REM load base level
5020 DMG=DMG*DIFFICULTY
5030 SPEED=SPEED*DIFFICULTY
5040 BONUS=INT(BONUS/DIFFICULTY)
5050 RETURN

5100 REM --- BASE LEVEL LOAD ---
5110 RESTORE 9000+(LEVEL-1)*50
5120 REM ... standard load
5130 RETURN
```

**Feature**: Same levels, scaled difficulty

### Variation 4: Multi-Room Loader
```basic
5000 REM --- ROOM LOADER ---
5010 RESTORE 9000
5020 FOR SKIP=1 TO ROOM-1
5030 FOR R=0 TO 9:FOR C=0 TO 17:READ D:NEXT C:NEXT R
5040 FOR I=0 TO 3:READ DX,DY:NEXT I
5050 READ D$,D1,D2,D3
5060 NEXT SKIP
5070 REM now load target room
5080 FOR R=0 TO 9:FOR C=0 TO 17:READ MAP(R,C):NEXT C:NEXT R
5090 FOR I=0 TO 3:READ EX(I),EY(I):NEXT I
5100 READ TITLE$,RULEDMG,RULEBONUS,RULESPEED
5110 RETURN
```

**Use case**: Multiple rooms per level

### Variation 5: With Spawn Reset
```basic
5000 REM --- LEVEL INIT ---
5010 GOSUB 5100              : REM load data
5020 PX=SPAWNX:PY=SPAWNY     : REM reset player
5030 FOR I=0 TO 3            : REM reset enemies
5040 IF EX(I)+EY(I)>0 THEN POKE SCREEN+(EY(I)+5)*40+(EX(I)+11),81
5050 NEXT I
5060 LIVES=3:SCORE=0:STEP=0  : REM reset game state
5070 RETURN
```

**Feature**: Complete level initialization

### Variation 6: With Dialogue Loading
```basic
5000 REM --- FULL LEVEL LOAD ---
5010 GOSUB 5100              : REM map
5020 GOSUB 5200              : REM enemies
5030 GOSUB 5300              : REM metadata
5040 GOSUB 5400              : REM dialogue
5050 RETURN

5400 REM --- LOAD DIALOGUE ---
5410 FOR I=0 TO 4:READ DIALOG$(I):NEXT I
5420 READ MUSIC$
5430 RETURN

9030 DATA "Systems rebooting...","Dust curls.","","",""
9040 DATA "LOOP1"
```

**Feature**: Rich level content

## Common Mistakes

- **Mistake 1**: Wrong RESTORE line number
  - **Symptom**: Loading wrong level or crash
  - **Fix**: Calculate carefully: `9000+(LEVEL-1)*100`

- **Mistake 2**: Forgetting to DIM arrays
  - **Symptom**: Only 11 items load
  - **Fix**: `DIM MAP(9,17),EX(3),EY(3)` at start

- **Mistake 3**: Mismatched DATA count
  - **Symptom**: `?OUT OF DATA ERROR`
  - **Fix**: Count READ statements vs DATA items

- **Mistake 4**: Not resetting game state
  - **Symptom**: Previous level's enemies remain
  - **Fix**: Clear all game variables in loader

- **Mistake 5**: Hard-coded level count
  - **Symptom**: Can't add levels easily
  - **Fix**: Use sentinel values or MAXLEVEL variable

## Memory Usage

- **Map array**: 10×18×5 = 900 bytes typical
- **Enemy arrays**: 4×5×2 = 40 bytes
- **Metadata**: ~50 bytes
- **Total per level**: ~1KB in arrays, rest in DATA

## Integration Example

```basic
NEW
10 REM === MULTI-LEVEL GAME ===
20 GOSUB 9500               : REM init arrays
30 LEVEL=1:STATE=0:LAST=-1
40 REM main state machine
50 GET K$:IF K$<>"" THEN KEY$=K$
60 IF STATE<>LAST THEN GOSUB 500
70 ON STATE+1 GOSUB 1000,2000,3000
80 LAST=STATE:KEY$=""
90 GOTO 50

500 REM --- STATE DRAWER ---
510 IF STATE=0 THEN GOSUB 4000  : REM title
520 IF STATE=1 THEN GOSUB 4100  : REM gameplay init
530 IF STATE=2 THEN GOSUB 4200  : REM game over
540 RETURN

1000 REM --- TITLE STATE ---
1010 IF KEY$=" " THEN STATE=1
1020 RETURN

2000 REM --- GAMEPLAY STATE ---
2010 IF GAMEINIT=0 THEN GOSUB 5000:GAMEINIT=1
2020 GOSUB 2100             : REM input
2030 GOSUB 2200             : REM update
2040 GOSUB 2300             : REM draw
2050 IF LEVELCOMPLETE THEN LEVEL=LEVEL+1:GAMEINIT=0:GOSUB 5000
2060 IF LIVES<=0 THEN STATE=2
2070 RETURN

2100 REM --- INPUT ---
2110 REM player movement
2120 RETURN

2200 REM --- UPDATE ---
2210 REM game logic
2220 RETURN

2300 REM --- DRAW ---
2310 PRINT CHR$(19);"LEVEL:";LEVEL;" LIVES:";LIVES;" SCORE:";SCORE
2320 RETURN

3000 REM --- GAME OVER STATE ---
3010 IF KEY$="R" THEN LEVEL=1:STATE=0:GAMEINIT=0
3020 RETURN

4000 REM --- DRAW TITLE ---
4010 PRINT CHR$(147);"DUNGEON CRAWLER"
4020 PRINT:PRINT "PRESS SPACE TO START"
4030 RETURN

4100 REM --- GAMEPLAY SCREEN ---
4110 PRINT CHR$(147)
4120 GOSUB 6000             : REM draw level
4130 RETURN

4200 REM --- GAME OVER SCREEN ---
4210 PRINT CHR$(147);"GAME OVER"
4220 PRINT:PRINT "FINAL LEVEL:";LEVEL
4230 PRINT "FINAL SCORE:";SCORE
4240 PRINT:PRINT "R = RESTART"
4250 RETURN

5000 REM --- LOAD LEVEL ---
5010 IF LEVEL=1 THEN RESTORE 9000
5020 IF LEVEL=2 THEN RESTORE 9100
5030 IF LEVEL=3 THEN RESTORE 9200
5040 IF LEVEL>3 THEN LEVEL=1:RESTORE 9000
5050 FOR R=0 TO 9
5060 FOR C=0 TO 17
5070 READ MAP(R,C)
5080 NEXT C
5090 NEXT R
5100 FOR I=0 TO 3:READ EX(I),EY(I):NEXT I
5110 READ TITLE$,RULEDMG(LEVEL),RULEBONUS(LEVEL),RULESPEED(LEVEL)
5120 PX=11:PY=5            : REM reset spawn
5130 LEVELCOMPLETE=0
5140 RETURN

6000 REM --- DRAW LEVEL ---
6010 SCREEN=1024:COLOR=55296
6020 FOR R=0 TO 9
6030 FOR C=0 TO 17
6040 LOC=SCREEN+(R+5)*40+(C+11)
6050 VAL=MAP(R,C)
6060 CHAR=32:COL=1
6070 IF VAL=1 THEN CHAR=160:COL=0
6080 IF VAL=2 THEN CHAR=42:COL=7
6090 IF VAL=3 THEN CHAR=120:COL=2
6100 POKE LOC,CHAR
6110 POKE COLOR+(R+5)*40+(C+11),COL
6120 NEXT C
6130 NEXT R
6140 RETURN

9500 REM --- INIT ARRAYS ---
9510 DIM MAP(9,17),EX(3),EY(3)
9520 DIM RULEDMG(3),RULEBONUS(3),RULESPEED(3)
9530 SCREEN=1024:COLOR=55296
9540 RETURN

9000 REM === LEVEL 1 ===
9010 DATA 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
9020 DATA 1,0,0,0,0,3,0,0,0,0,0,0,3,0,0,0,0,1
9030 DATA 1,0,1,1,0,1,0,1,1,1,1,0,1,1,0,1,0,1
9040 DATA 1,0,1,0,0,1,0,0,0,0,1,0,0,1,0,1,0,1
9050 DATA 1,0,1,0,1,1,1,1,0,0,1,0,1,1,0,1,0,1
9060 DATA 1,0,0,0,0,0,0,1,0,1,1,0,0,0,0,1,0,1
9070 DATA 1,0,1,1,1,1,0,1,0,0,0,1,1,1,0,1,0,1
9080 DATA 1,0,0,0,0,1,0,1,1,1,0,0,0,1,0,0,0,1
9090 DATA 1,0,1,1,0,1,0,0,0,1,1,1,0,1,1,1,0,1
9100 DATA 1,0,0,1,0,2,0,1,0,0,0,0,0,0,3,0,0,1
9110 DATA 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
9120 DATA 2,1,14,8,5,3,0,0
9130 DATA "COBWEB CONTROL",1,100,1

9100 REM === LEVEL 2 ===
9110 DATA 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
9120 REM ... different map
9130 DATA 3,2,15,7,6,4,0,0
9140 DATA "TOXIC CHAMBER",2,150,2

9200 REM === LEVEL 3 ===
9210 DATA 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
9220 REM ... different map
9230 DATA 4,3,12,6,8,5,7,2
9240 DATA "CRYSTAL CAVERN",3,200,3
```

## Level Progression Patterns

### Pattern 1: Linear Progression
```basic
5000 LEVEL=LEVEL+1
5010 IF LEVEL>MAXLEVEL THEN STATE=4  : REM victory
5020 GOSUB 5100  : REM load next
```

### Pattern 2: Hub & Spoke
```basic
5000 REM Choose next level
5010 IF CHOICE=1 THEN LEVEL=10
5020 IF CHOICE=2 THEN LEVEL=20
5030 IF CHOICE=3 THEN LEVEL=30
5040 GOSUB 5100
```

### Pattern 3: Branching Paths
```basic
5000 IF SCORE>THRESHOLD THEN LEVEL=LEVEL+10 ELSE LEVEL=LEVEL+1
5010 GOSUB 5100
```

## See Also

- [READ/DATA Pattern](read-data-pattern.md) - Basic DATA loading
- [RESTORE Pattern](restore-pattern.md) - DATA pointer control
- [State Machines](../state-machines/basic-state-machine.md) - Level as state
- **Lessons**: 21 (Rule Tables), 24 (Terminal Tangle), 52 (Multiple Levels)
- **Vault**: [Level Design](/vault/level-design)

## Quick Reference Card

```basic
REM Level loader pattern
GOSUB 5000               : REM load level

5000 REM LOAD LEVEL
5010 IF LEVEL=1 THEN RESTORE 9000
5020 IF LEVEL=2 THEN RESTORE 9100
5030 FOR R=0 TO rows:FOR C=0 TO cols
5040   READ MAP(R,C)
5050   NEXT C:NEXT R
5060 FOR I=0 TO count:READ EX(I),EY(I):NEXT I
5070 READ TITLE$,param1,param2,param3
5080 RETURN

9000 REM LEVEL 1 DATA
9010 DATA ... map rows ...
9020 DATA ... entities ...
9030 DATA "TITLE",values...
```

## Best Practices

1. **Organize DATA clearly**
   - One level per block (9000, 9100, 9200...)
   - Comment each section
   - Consistent format across all levels

2. **Reset all game state**
   - Player position
   - Enemy positions
   - Score, lives, timers
   - Level-specific flags

3. **Validate level number**
   - Check bounds before RESTORE
   - Wrap or cap at max level
   - Handle invalid input gracefully

4. **Separate load from init**
   - Load: Read DATA into arrays
   - Init: Reset game variables
   - Draw: Render to screen
   - Three distinct phases

5. **Make levels easy to add**
   - Consistent DATA format
   - Self-documenting structure
   - Copy-paste friendly

---

**Status**: Phase 3 Pattern
**Last Updated**: 2025-01-15
**Source**: Code Like It's 198x - C64 BASIC Course
