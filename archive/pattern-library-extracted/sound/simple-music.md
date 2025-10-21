# Simple Music

**Category**: Sound
**Difficulty**: Intermediate
**Appears in**: Lessons 7, 8, 23, 24, 32, 40, 48
**Prerequisites**: [SID Initialization](sid-initialization.md), [Sound Effects](sound-effects.md)

## Overview

Create simple melodies and background music loops by sequencing notes through DATA arrays and timing loops. Essential for title screens, gameplay themes, and victory jingles that bring your games to life.

## The Pattern

```basic
REM --- SIMPLE MELODY PLAYER ---
10 POKE 54295,15:POKE 54296,0         : REM init SID
20 DIM NOTE(7)
30 FOR I=0 TO 7:READ NOTE(I):NEXT I
40 DATA 34,38,43,45,51,57,64,68       : REM C,D,E,F,G,A,B,C scale
50 FOR I=0 TO 7
60 POKE 54272,NOTE(I):POKE 54273,0
70 POKE 54275,17:POKE 54276,240
80 POKE 54277,17                       : REM triangle + gate
90 FOR D=1 TO 60:NEXT D                : REM note duration
100 POKE 54277,16                      : REM gate off
110 FOR D=1 TO 10:NEXT D               : REM note gap
120 NEXT I
```

## Parameters

| Variable | Type | Purpose | Values |
|----------|------|---------|--------|
| `NOTE()` | Array | Frequency values | 17-120 typical |
| Duration | Integer | How long note plays | 40-120 |
| Gap | Integer | Silence between notes | 5-20 |
| Waveform | Integer | Tone character | 17,33,65 |

## How It Works

### Step 1: Initialize Note Array
```basic
DIM NOTE(7)
FOR I=0 TO 7:READ NOTE(I):NEXT I
DATA 34,38,43,45,51,57,64,68
```
- Store frequencies in array
- One value per note
- Use DATA for easy editing

### Step 2: Loop Through Notes
```basic
FOR I=0 TO 7
  POKE 54272,NOTE(I):POKE 54273,0
```
- Iterate through melody
- Set frequency for each note
- Low byte usually 0 for simplicity

### Step 3: Gate On
```basic
POKE 54277,17
```
- Start the note playing
- Triangle wave (16) + gate (1)

### Step 4: Note Duration
```basic
FOR D=1 TO 60:NEXT D
```
- Controls note length
- 60 = medium length (~0.6 seconds)
- Longer = slower tempo

### Step 5: Gate Off + Gap
```basic
POKE 54277,16
FOR D=1 TO 10:NEXT D
```
- Stop note cleanly
- Brief silence between notes
- Creates articulation

## Variations

### Variation 1: Background Loop
```basic
100 REM LOOPING THEME
110 DIM THEME(15)
120 FOR I=0 TO 15:READ THEME(I):NEXT I
130 DATA 51,51,57,51,68,64,51,51,57,51,76,68
140 DATA 51,51,102,85,68,64,57,90,90,85,68,76,68,0
150 LOOP=1
160 WHILE LOOP
170 FOR I=0 TO 23
180 IF THEME(I)=0 THEN NEXT I:GOTO 160
190 POKE 54272,THEME(I):POKE 54273,0
200 POKE 54277,17
210 FOR D=1 TO 40:NEXT D
220 POKE 54277,16
230 FOR D=1 TO 5:NEXT D
240 NEXT I
250 GET K$:IF K$<>"" THEN LOOP=0
260 WEND
```

**Feature**: Continuous background music with escape

### Variation 2: Note + Duration Array
```basic
100 REM RHYTHM CONTROL
110 DIM NOTE(7),DUR(7)
120 FOR I=0 TO 7:READ NOTE(I),DUR(I):NEXT I
130 DATA 34,60,34,60,38,60,34,60
140 DATA 43,60,43,120,38,120,0,60
150 FOR I=0 TO 7
160 IF NOTE(I)=0 THEN FOR D=1 TO DUR(I):NEXT D:GOTO 210
170 POKE 54272,NOTE(I):POKE 54273,0
180 POKE 54277,17
190 FOR D=1 TO DUR(I):NEXT D
200 POKE 54277,16
210 NEXT I
```

**Feature**: Variable note lengths and rests

### Variation 3: Two Voice Harmony
```basic
100 REM TWO VOICE HARMONY
110 DIM MEL(7),BAS(7)
120 FOR I=0 TO 7:READ MEL(I),BAS(I):NEXT I
130 DATA 51,34,57,38,64,43,68,45,76,51,85,57,96,64,102,68
140 FOR I=0 TO 7
150 POKE 54272,MEL(I):POKE 54273,0   : REM voice 1
160 POKE 54279,BAS(I):POKE 54280,0   : REM voice 2
170 POKE 54277,17:POKE 54284,17
180 FOR D=1 TO 60:NEXT D
190 POKE 54277,16:POKE 54284,16
200 FOR D=1 TO 10:NEXT D
210 NEXT I
```

**Feature**: Melody + bass line simultaneously

### Variation 4: Victory Fanfare
```basic
100 REM VICTORY JINGLE
110 DIM N(11)
120 FOR I=0 TO 11:READ N(I):NEXT I
130 DATA 51,51,51,68,85,85,85,102,102,85,68,51
140 POKE 54275,9:POKE 54276,240       : REM bright envelope
150 FOR I=0 TO 11
160 POKE 54272,N(I):POKE 54273,0
170 POKE 54277,33                     : REM sawtooth
180 DUR=80
190 IF I>=9 THEN DUR=120               : REM longer ending
200 FOR D=1 TO DUR:NEXT D
210 POKE 54277,32
220 FOR D=1 TO 5:NEXT D
230 NEXT I
```

**Use case**: Level complete celebration

### Variation 5: Arpeggio Pattern
```basic
100 REM ARPEGGIO
110 DIM CHORD(2)
120 CHORD(0)=51:CHORD(1)=64:CHORD(2)=76  : REM C major (G,C,E)
130 FOR R=1 TO 8                          : REM repeat 8 times
140 FOR I=0 TO 2
150 POKE 54272,CHORD(I):POKE 54273,0
160 POKE 54277,65                         : REM pulse wave
170 FOR D=1 TO 20:NEXT D
180 POKE 54277,64
190 NEXT I
200 NEXT R
```

**Feature**: Rapid note cycling for chords

### Variation 6: Percussion Track
```basic
100 REM DRUM BEAT
110 DIM DRUM(7)
120 FOR I=0 TO 7:READ DRUM(I):NEXT I
130 DATA 20,0,20,40,20,0,40,20
140 POKE 54275,0:POKE 54276,0           : REM instant attack
150 FOR I=0 TO 7
160 IF DRUM(I)=0 THEN FOR D=1 TO 30:NEXT D:GOTO 210
170 POKE 54272,DRUM(I):POKE 54273,255
180 POKE 54277,129                      : REM noise
190 FOR D=1 TO 15:NEXT D
200 POKE 54277,128
210 NEXT I
```

**Use case**: Simple rhythm track with noise channel

## Common Mistakes

- **Mistake 1**: Not using DATA for notes
  - **Symptom**: Hard to edit melody, cluttered code
  - **Fix**: Store frequencies in DATA, load to array

- **Mistake 2**: Music blocking gameplay
  - **Symptom**: Game freezes during song
  - **Fix**: Play music in title screen or use shorter loops

- **Mistake 3**: Notes too fast or too slow
  - **Symptom**: Melody unrecognizable
  - **Fix**: Duration of 40-80 for medium tempo

- **Mistake 4**: No gap between notes
  - **Symptom**: Notes blend together
  - **Fix**: Gate off + short delay (5-10) between notes

- **Mistake 5**: Wrong octave frequencies
  - **Symptom**: Melody too high or too low
  - **Fix**: Use values 34-68 for middle octave

## Memory Usage

- **Note array**: 8-32 bytes typical
- **Duration array**: Optional, same size as notes
- **Code**: 20-40 lines for player routine

## Musical Scale Reference

### C Major Scale (Middle Octave)
```basic
REM Note frequencies (high byte)
C  = 34
D  = 38
E  = 43
F  = 45
G  = 51
A  = 57
B  = 64
C+ = 68  : REM octave higher
```

### Common Intervals
```basic
REM Musical intervals
Unison:   0 steps (same note)
Third:    2 steps (C to E = 34 to 43)
Fifth:    4 steps (C to G = 34 to 51)
Octave:   7 steps (C to C = 34 to 68)
```

## Integration Example

```basic
NEW
10 REM --- MUSIC PLAYER DEMO ---
20 PRINT CHR$(147)
30 POKE 54295,15:POKE 54296,0
40 PRINT "MUSIC PLAYER"
50 PRINT:PRINT "1 = SCALE"
60 PRINT "2 = VICTORY"
70 PRINT "3 = ARPEGGIO"
80 PRINT "4 = BACKGROUND LOOP"
90 PRINT "Q = QUIT"
100 GET K$:IF K$="" THEN 100
110 IF K$="Q" THEN GOSUB 900:END
120 IF K$="1" THEN GOSUB 1000
130 IF K$="2" THEN GOSUB 1100
140 IF K$="3" THEN GOSUB 1200
150 IF K$="4" THEN GOSUB 1300
160 GOTO 100

900 REM --- SILENCE ---
910 POKE 54277,0:POKE 54295,0
920 RETURN

1000 REM --- SCALE ---
1010 DIM NOTE(7)
1020 FOR I=0 TO 7:READ NOTE(I):NEXT I
1030 DATA 34,38,43,45,51,57,64,68
1040 FOR I=0 TO 7
1050 POKE 54272,NOTE(I):POKE 54273,0
1060 POKE 54277,17
1070 FOR D=1 TO 60:NEXT D
1080 POKE 54277,16
1090 FOR D=1 TO 10:NEXT D
1100 NEXT I
1110 RETURN

1100 REM --- VICTORY FANFARE ---
1110 RESTORE 1115
1115 DATA 51,51,51,68,85,85,85,102
1120 FOR I=1 TO 8
1130 READ F
1140 POKE 54272,F:POKE 54273,0
1150 POKE 54277,33
1160 FOR D=1 TO 80:NEXT D
1170 POKE 54277,32
1180 FOR D=1 TO 5:NEXT D
1190 NEXT I
1200 RETURN

1200 REM --- ARPEGGIO ---
1210 FOR R=1 TO 4
1220 FOR F=51 TO 76 STEP 13
1230 POKE 54272,F:POKE 54273,0
1240 POKE 54277,65
1250 FOR D=1 TO 20:NEXT D
1260 POKE 54277,64
1270 NEXT F
1280 NEXT R
1290 RETURN

1300 REM --- BACKGROUND LOOP ---
1310 RESTORE 1315
1315 DATA 51,57,64,57,51,45,51,0
1320 FOR PASS=1 TO 4
1330 FOR I=1 TO 8
1340 READ F
1350 IF F=0 THEN FOR D=1 TO 40:NEXT D:NEXT I:GOTO 1400
1360 POKE 54272,F:POKE 54273,0
1370 POKE 54277,17
1380 FOR D=1 TO 40:NEXT D
1390 POKE 54277,16
1400 FOR D=1 TO 5:NEXT D
1410 NEXT I
1420 RESTORE 1315
1430 NEXT PASS
1440 RETURN
```

## Title Screen Integration

```basic
1000 REM --- TITLE STATE ---
1010 GOSUB 5000                      : REM play title music
1020 PRINT CHR$(147);"SPACE QUEST"
1030 PRINT:PRINT "PRESS SPACE TO START"
1040 GET K$:IF K$<>"" THEN RETURN
1050 GOTO 1040

5000 REM --- TITLE MUSIC ---
5010 IF MUSICPLAYED THEN RETURN      : REM play once
5020 DIM TITLE(15)
5030 FOR I=0 TO 15:READ TITLE(I):NEXT I
5040 DATA 51,57,64,68,76,68,64,57,51,45,43,38,34,38,43,51
5050 FOR I=0 TO 15
5060 POKE 54272,TITLE(I):POKE 54273,0
5070 POKE 54277,17
5080 FOR D=1 TO 50:NEXT D
5090 POKE 54277,16
5100 FOR D=1 TO 5:NEXT D
5110 NEXT I
5120 MUSICPLAYED=1
5130 RETURN
```

## Tempo Control

```basic
REM Tempo variations using duration
SLOW=120         : REM ~1.2 seconds per note
MEDIUM=60        : REM ~0.6 seconds per note
FAST=30          : REM ~0.3 seconds per note

REM Use in loop
FOR D=1 TO TEMPO:NEXT D
```

## Note Length Symbols

```basic
REM Musical note lengths (approximate)
WHOLE=240        : REM whole note (4 beats)
HALF=120         : REM half note (2 beats)
QUARTER=60       : REM quarter note (1 beat)
EIGHTH=30        : REM eighth note (1/2 beat)
SIXTEENTH=15     : REM sixteenth note (1/4 beat)
```

## Common Melody Patterns

### Rising Scale
```basic
DATA 34,38,43,45,51,57,64,68
```

### Falling Scale
```basic
DATA 68,64,57,51,45,43,38,34
```

### Twinkle Pattern
```basic
DATA 34,34,51,51,57,57,51,0,45,45,43,43,38,38,34,0
```

### March Pattern
```basic
DATA 34,34,34,38,43,43,43,45,51,51,51,0
```

## Performance Tips

1. **Preload note arrays at init**:
   ```basic
   REM At game start
   1000 DIM NOTE(15)
   1010 FOR I=0 TO 15:READ NOTE(I):NEXT I
   1020 DATA 34,38,43,...
   ```

2. **Use RESTORE for repeated playback**:
   ```basic
   5000 RESTORE 5010
   5010 DATA 51,57,64,68
   5020 FOR I=1 TO 4:READ F:...
   ```

3. **Check for interruption**:
   ```basic
   FOR I=0 TO 15
     POKE 54272,NOTE(I)
     FOR D=1 TO 60
       GET K$:IF K$<>"" THEN POKE 54277,16:RETURN
       NEXT D
     NEXT I
   ```

4. **Separate music from effects**:
   ```basic
   REM Use voice 1 for music
   REM Use voice 2 for effects
   REM Or stop music during action
   ```

## See Also

- [SID Initialization](sid-initialization.md) - Setting up the SID chip
- [Sound Effects](sound-effects.md) - Game event sounds
- [State Machines](../state-machines/basic-state-machine.md) - Title screen music
- **Lessons**: 7 (Sound Off), 8 (Typing Turmoil), 23 (Data Loading)
- **Vault**: [SID Chip](/vault/sid-chip)

## Quick Reference Card

```basic
REM Simple music pattern
DIM NOTE(count)
FOR I=0 TO count:READ NOTE(I):NEXT I
DATA freq1,freq2,freq3,...

FOR I=0 TO count
  POKE 54272,NOTE(I):POKE 54273,0
  POKE 54277,waveform+1       : REM gate on
  FOR D=1 TO duration:NEXT D
  POKE 54277,waveform         : REM gate off
  FOR D=1 TO gap:NEXT D
  NEXT I

REM Middle octave: C=34, D=38, E=43, F=45, G=51, A=57, B=64, C=68
```

## Waveform for Music

| Waveform | Value | Character | Best For |
|----------|-------|-----------|----------|
| Triangle | 16/17 | Smooth, flute-like | Melodies, bass |
| Sawtooth | 32/33 | Bright, buzzy | Leads, brass |
| Pulse | 64/65 | Square, hollow | Chip tunes, arpeggios |

## Best Practices

1. **Keep melodies simple**
   - 8-16 notes for loops
   - Recognizable patterns

2. **Use rests (0 frequency)**
   - Creates phrase separation
   - Prevents audio fatigue

3. **Match tempo to game pace**
   - Fast for action
   - Slow for strategy/puzzle

4. **Test melody recognition**
   - Can you hum it after hearing once?
   - Too complex = forgettable

5. **Provide escape from loops**
   - Check for keypress
   - Allow skipping long tunes

---

**Status**: Phase 2 Pattern
**Last Updated**: 2025-01-15
**Source**: Code Like It's 198x - C64 BASIC Course
