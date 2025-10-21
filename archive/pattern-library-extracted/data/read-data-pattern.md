# READ/DATA Pattern

**Category**: Data & Levels
**Difficulty**: Beginner
**Appears in**: Lessons 14, 21, 23, 24, 42, 52, 56
**Prerequisites**: None

## Overview

Load structured game data from DATA statements into arrays using READ commands. Essential for maps, enemy positions, level metadata, frequency tables, and any content that should be separated from code logic.

## The Pattern

```basic
REM --- BASIC READ/DATA PATTERN ---
10 DIM ITEM$(3)
20 FOR I=0 TO 3
30 READ ITEM$(I)
40 NEXT I
50 DATA "START GAME","OPTIONS","HIGH SCORES","QUIT"
```

## Parameters

| Element | Type | Purpose | Typical Values |
|---------|------|---------|----------------|
| `DIM` | Statement | Declare array size | Match DATA count |
| `READ` | Statement | Get next DATA value | Advances pointer |
| `DATA` | Statement | Store values | Strings or numbers |
| Loop index | Integer | Iterate through items | 0 to array size |

## How It Works

### Step 1: Declare Array
```basic
DIM ITEM$(3)
```
- Size array to hold all DATA values
- String arrays use `$` suffix
- Index 0 to 3 = 4 items total

### Step 2: Loop Through DATA
```basic
FOR I=0 TO 3
  READ ITEM$(I)
NEXT I
```
- `READ` gets next DATA value sequentially
- Stores in array at index I
- Pointer advances automatically

### Step 3: Store DATA
```basic
DATA "START GAME","OPTIONS","HIGH SCORES","QUIT"
```
- Values separated by commas
- Strings in quotes, numbers without
- Can span multiple DATA lines

## Variations

### Variation 1: Numeric Array
```basic
100 DIM NOTE(7)
110 FOR I=0 TO 7:READ NOTE(I):NEXT I
120 DATA 34,38,43,45,51,57,64,68
```

**Use case**: Frequency tables, coordinates, scores

### Variation 2: Multiple Parallel Arrays
```basic
100 DIM NAME$(4),SCORE(4)
110 FOR I=0 TO 4
120 READ NAME$(I),SCORE(I)
130 NEXT I
140 DATA "ACE",500,"JOE",450,"SAM",400,"ANN",350,"BOB",300
```

**Feature**: Related data in sync

### Variation 3: 2D Map Data
```basic
100 DIM MAP(9,17)
110 FOR R=0 TO 9
120 FOR C=0 TO 17
130 READ MAP(R,C)
140 NEXT C
150 NEXT R
160 DATA 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
170 DATA 1,0,0,0,0,3,0,0,0,0,0,0,3,0,0,0,0,1
180 REM ... more rows
```

**Use case**: Tile maps, game boards

### Variation 4: Mixed Data Types
```basic
100 DIM EX(3),EY(3)
110 READ TITLE$,DMG,BONUS,SPEED
120 FOR I=0 TO 3:READ EX(I),EY(I):NEXT I
130 DATA "DUSTY HALL",1,100,1
140 DATA 0,5,0,8,1,2,5,7
```

**Feature**: Level metadata + arrays

### Variation 5: Sentinel-Terminated
```basic
100 DIM ITEM$(99)
110 COUNT=0
120 READ ITEM$
130 IF ITEM$="END" THEN 160
140 ITEM$(COUNT)=ITEM$:COUNT=COUNT+1
150 GOTO 120
160 REM COUNT now holds actual item count
170 DATA "SWORD","SHIELD","POTION","KEY","END"
```

**Feature**: Unknown data length

### Variation 6: Structured Records
```basic
100 DIM ID(9),ROWS(9),TITLE$(9)
110 FOR L=0 TO 9
120 READ ID(L)
130 IF ID(L)=0 THEN 170  : REM end marker
140 READ ROWS(L),TITLE$(L)
150 NEXT L
160 DATA 1,6,"LEVEL ONE"
170 DATA 2,8,"LEVEL TWO"
180 DATA 0,0,"END"
```

**Use case**: Level headers with variable data

## Common Mistakes

- **Mistake 1**: Array too small for DATA
  - **Symptom**: `?OUT OF DATA ERROR` or overwrite
  - **Fix**: `DIM` size must match or exceed DATA count

- **Mistake 2**: Reading beyond DATA
  - **Symptom**: `?OUT OF DATA ERROR IN line`
  - **Fix**: Count DATA items, match loop bounds

- **Mistake 3**: Type mismatch
  - **Symptom**: `?TYPE MISMATCH ERROR`
  - **Fix**: String DATA needs string variable (with `$`)

- **Mistake 4**: Forgot DIM
  - **Symptom**: Only first 11 items load (default array size)
  - **Fix**: Always `DIM` arrays before READ

- **Mistake 5**: DATA pointer not reset
  - **Symptom**: Second read gets wrong data
  - **Fix**: Use `RESTORE` before rereading

## Memory Usage

- **Arrays**: Size × bytes per element
  - Integer: 5 bytes each
  - String: 3 bytes + length
- **DATA statements**: Stored in program text
- **Efficient**: DATA uses less memory than equivalent string literals

## Integration Example

```basic
NEW
10 REM --- MAP LOADER DEMO ---
20 PRINT CHR$(147)
30 GOSUB 1000  : REM load map
40 GOSUB 2000  : REM draw map
50 GOSUB 3000  : REM load enemies
60 PRINT "MAP LOADED"
70 PRINT "TITLE: ";TITLE$
80 PRINT "ENEMIES: ";ENEMYCOUNT
90 END

1000 REM --- LOAD MAP DATA ---
1010 DIM MAP(9,17)
1020 FOR R=0 TO 9
1030 FOR C=0 TO 17
1040 READ MAP(R,C)
1050 NEXT C
1060 NEXT R
1070 READ TITLE$
1080 RETURN

2000 REM --- DRAW MAP ---
2010 SCREEN=1024:COLOR=55296
2020 FOR R=0 TO 9
2030 FOR C=0 TO 17
2040 LOC=SCREEN+(R+5)*40+(C+11)
2050 VAL=MAP(R,C)
2060 CHAR=32:COL=1
2070 IF VAL=1 THEN CHAR=160:COL=0
2080 IF VAL=2 THEN CHAR=42:COL=7
2090 IF VAL=3 THEN CHAR=120:COL=2
2100 POKE LOC,CHAR
2110 POKE COLOR+(R+5)*40+(C+11),COL
2120 NEXT C
2130 NEXT R
2140 RETURN

3000 REM --- LOAD ENEMIES ---
3010 DIM EX(3),EY(3)
3020 ENEMYCOUNT=0
3030 FOR I=0 TO 3
3040 READ EX(I),EY(I)
3050 IF EX(I)+EY(I)>0 THEN ENEMYCOUNT=ENEMYCOUNT+1
3060 NEXT I
3070 RETURN

9000 REM === MAP DATA ===
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
9120 DATA "COBWEB CONTROL"
9130 REM === ENEMY DATA ===
9140 DATA 2,1,14,8,5,3,0,0
```

## DATA Organization Strategies

### Strategy 1: Group by Type
```basic
REM Map data
9000 DATA 1,1,1,...
REM Enemy data
9100 DATA 2,5,4,8,...
REM Metadata
9200 DATA "LEVEL 1",100,3
```

### Strategy 2: Sequential Records
```basic
REM Each level is one block
9000 DATA 1,"LEVEL ONE",6
9010 DATA 1,1,1,1,1,1
9020 DATA 1,0,0,0,0,1
```

### Strategy 3: Inline Comments
```basic
9000 DATA 1,1,1  : REM top wall
9010 DATA 1,0,1  : REM left, floor, right
9020 DATA 1,1,1  : REM bottom wall
```

## Performance Tips

1. **Load once at init**:
   ```basic
   REM Good: Load at start
   1000 GOSUB 9000:RETURN

   REM Bad: Reread every frame
   ```

2. **Use RESTORE for rereading**:
   ```basic
   REM Reset pointer to reuse DATA
   RESTORE 9000
   FOR I=0 TO 10:READ D(I):NEXT
   ```

3. **Pre-calculate array size**:
   ```basic
   REM Exact size, no waste
   DIM MAP(9,17)  : REM 10 rows, 18 cols
   ```

4. **Batch related data**:
   ```basic
   REM Good: One loop for related items
   FOR I=0 TO 3:READ X(I),Y(I),TYPE(I):NEXT

   REM Slower: Separate loops
   ```

## See Also

- [Level Loading](level-loading.md) - Complete level loading system
- [RESTORE Pattern](restore-pattern.md) - Repositioning DATA pointer
- [Menu System](../menus/menu-system.md) - Uses DATA for menu items
- **Lessons**: 14 (Building Worlds), 21 (Rule Tables), 23 (Dialogue Data)
- **Vault**: [Data Structures](/vault/data-structures)

## Quick Reference Card

```basic
REM READ/DATA pattern
DIM array_name(size)
FOR I=0 TO size
  READ array_name(I)
  NEXT I
DATA value1,value2,value3,...

REM Mixed types
READ string$,number1,number2
DATA "TEXT",42,100

REM 2D arrays
FOR R=0 TO rows
  FOR C=0 TO cols
    READ MAP(R,C)
    NEXT C
  NEXT R

REM Reset pointer
RESTORE line_number
```

## DATA Statement Syntax

```basic
REM Basic form
DATA value1,value2,value3

REM Strings with spaces (quotes required)
DATA "HELLO WORLD","PRESS SPACE"

REM Numbers (no quotes)
DATA 42,100,255

REM Mixed (comma-separated)
DATA "LEVEL 1",100,3,5.5

REM Multiple per line (readability)
DATA 1,1,1,1,1,1,1,1
```

## Best Practices

1. **Comment your DATA**
   - Explain what each block represents
   - Note format: "row,col,type" etc.

2. **Organize DATA at end**
   - Lines 9000+ by convention
   - Groups related data together

3. **Validate after READ**
   - Check ranges: `IF X<0 OR X>MAX THEN...`
   - Sentinel values for end detection

4. **Match DIM to DATA count**
   - Count DATA items carefully
   - Too small = error, too large = waste

5. **Use meaningful line numbers**
   - 9000 = maps
   - 9100 = enemies
   - 9200 = metadata
   - Easy to RESTORE to specific sections

---

**Status**: Phase 3 Pattern
**Last Updated**: 2025-01-15
**Source**: Code Like It's 198x - C64 BASIC Course
