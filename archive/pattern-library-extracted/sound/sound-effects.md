# Sound Effects

**Category**: Sound
**Difficulty**: Beginner
**Appears in**: Lessons 7, 8, 28, 32, 40, 48
**Prerequisites**: [SID Initialization](sid-initialization.md)

## Overview

Create immediate audio feedback for game events using the SID chip - success beeps, failure buzzes, collision sounds, pickups, and explosions. Sound effects make games feel responsive and polished.

## The Pattern

```basic
REM --- SUCCESS SOUND ---
400 POKE 54273,0:POKE 54272,80        : REM high pitch
410 POKE 54275,18:POKE 54276,240      : REM quick attack
420 POKE 54277,17                     : REM triangle + gate on
430 FOR D=1 TO 50:NEXT D              : REM short duration
440 POKE 54277,16                     : REM gate off
450 RETURN

REM --- FAILURE SOUND ---
500 POKE 54273,200:POKE 54272,20      : REM low pitch
510 POKE 54275,66:POKE 54276,32       : REM slower attack
520 POKE 54277,129                    : REM noise + gate on
530 FOR D=1 TO 80:NEXT D              : REM longer duration
540 POKE 54277,128                    : REM gate off
550 RETURN
```

## Parameters

| Variable | Type | Purpose | Typical Values |
|----------|------|---------|----------------|
| Frequency high | Integer | Pitch control | 20-120 |
| Frequency low | Integer | Fine tuning | Usually 0 |
| Attack/Decay | Integer | Envelope speed | 0-255 |
| Duration | Integer | Sound length | 20-200 |
| Waveform | Integer | Tone character | 17,33,65,129 |

## How It Works

### Step 1: Set Frequency
```basic
POKE 54273,0:POKE 54272,80
```
- High frequency = higher pitch
- 80 = pleasant success tone
- 20 = low failure/error tone

### Step 2: Configure Envelope
```basic
POKE 54275,18:POKE 54276,240
```
- Fast attack (18) for immediate response
- High sustain (240) for clear tone
- Quick sounds feel responsive

### Step 3: Gate On with Waveform
```basic
POKE 54277,17     : REM triangle + gate
```
- Waveform choice affects character
- Triangle (16): smooth, pleasant
- Noise (128): harsh, alarming

### Step 4: Duration Loop
```basic
FOR D=1 TO 50:NEXT D
```
- Controls how long sound plays
- 50 = quick beep (~0.5 seconds)
- Adjust for effect intensity

### Step 5: Gate Off
```basic
POKE 54277,16
```
- Always turn gate off
- Prevents continuous tone
- Cleans up for next sound

## Variations

### Variation 1: Pickup/Collection Sound
```basic
400 REM PICKUP SOUND
410 POKE 54272,100:POKE 54273,0
420 POKE 54275,0:POKE 54276,240
430 FOR P=100 TO 120 STEP 5
440 POKE 54272,P
450 POKE 54277,17
460 FOR D=1 TO 10:NEXT D
470 POKE 54277,16
480 NEXT P
490 RETURN
```

**Feature**: Rising pitch sweep for collectibles

### Variation 2: Explosion Sound
```basic
400 REM EXPLOSION
410 POKE 54275,0:POKE 54276,0
420 FOR F=255 TO 20 STEP -10
430 POKE 54272,F:POKE 54273,INT(RND(1)*256)
440 POKE 54277,129                : REM noise
450 FOR D=1 TO 5:NEXT D
460 POKE 54277,128
470 NEXT F
480 RETURN
```

**Feature**: Descending noise for explosions

### Variation 3: Hit/Damage Sound
```basic
400 REM HIT SOUND
410 POKE 54272,40:POKE 54273,0
420 POKE 54275,0:POKE 54276,240
430 POKE 54277,129                : REM noise + gate
440 FOR D=1 TO 30:NEXT D
450 POKE 54277,128
460 RETURN
```

**Use case**: Quick harsh noise for damage

### Variation 4: Jump/Bounce Sound
```basic
400 REM JUMP SOUND
410 FOR N=60 TO 90 STEP 10
420 POKE 54272,N:POKE 54273,0
430 POKE 54277,33                 : REM sawtooth + gate
440 FOR D=1 TO 8:NEXT D
450 POKE 54277,32
460 NEXT N
470 RETURN
```

**Feature**: Quick rising tone for jumps

### Variation 5: Menu Navigation Sound
```basic
400 REM MENU BEEP
410 POKE 54272,70:POKE 54273,0
420 POKE 54275,0:POKE 54276,240
430 POKE 54277,65                 : REM pulse + gate
440 FOR D=1 TO 15:NEXT D
450 POKE 54277,64
460 RETURN
```

**Use case**: Subtle beep for cursor movement

### Variation 6: Level Complete Jingle
```basic
400 REM VICTORY JINGLE
410 DIM N(4):N(0)=60:N(1)=72:N(2)=84:N(3)=96:N(4)=108
420 FOR I=0 TO 4
430 POKE 54272,N(I):POKE 54273,0
440 POKE 54277,17
450 FOR D=1 TO 40:NEXT D
460 POKE 54277,16
470 FOR D=1 TO 10:NEXT D
480 NEXT I
490 RETURN
```

**Feature**: Multi-note sequence for victory

## Common Mistakes

- **Mistake 1**: Not initializing master volume
  - **Symptom**: No sound at all
  - **Fix**: `POKE 54295,15` at game start

- **Mistake 2**: Forgetting to gate off
  - **Symptom**: Sound continues indefinitely
  - **Fix**: Always `POKE 54277,waveform` (without +1) at end

- **Mistake 3**: Using blocking loops during gameplay
  - **Symptom**: Game freezes during sound
  - **Fix**: Keep duration loops short (< 100 iterations)

- **Mistake 4**: Playing sounds too frequently
  - **Symptom**: Overlapping or muddy audio
  - **Fix**: Track last sound time, enforce minimum gap

- **Mistake 5**: Not varying sound for different events
  - **Symptom**: All actions sound the same
  - **Fix**: Use different frequencies and waveforms per event type

## Memory Usage

- **Code**: ~10-15 lines per sound effect
- **Variables**: None required for basic effects
- **Optional**: Note array for melodies (~10-50 bytes)

## Sound Design Guide

| Effect Type | Frequency | Waveform | Duration | Use Case |
|-------------|-----------|----------|----------|----------|
| Success | 70-100 | Triangle | Short | Correct answers, pickups |
| Failure | 20-40 | Noise | Medium | Errors, crashes |
| Explosion | 255→20 | Noise | Medium | Destruction |
| Pickup | 80→120 | Sawtooth | Very short | Items, coins |
| Jump | 60→90 | Triangle | Short | Player actions |
| Hit | 30-50 | Noise | Very short | Damage taken |
| Menu | 60-80 | Pulse | Very short | Navigation |

## Integration Example

```basic
NEW
10 REM --- SOUND EFFECTS DEMO ---
20 PRINT CHR$(147)
30 POKE 54295,15:POKE 54296,0     : REM init SID
40 PRINT "SOUND EFFECTS TESTER"
50 PRINT:PRINT "1 = SUCCESS"
60 PRINT "2 = FAILURE"
70 PRINT "3 = EXPLOSION"
80 PRINT "4 = PICKUP"
90 PRINT "5 = HIT"
100 PRINT "6 = JUMP"
110 PRINT "7 = VICTORY"
120 PRINT "Q = QUIT"
130 GET K$:IF K$="" THEN 130
140 IF K$="Q" THEN GOSUB 900:END
150 IF K$="1" THEN GOSUB 1000
160 IF K$="2" THEN GOSUB 1100
170 IF K$="3" THEN GOSUB 1200
180 IF K$="4" THEN GOSUB 1300
190 IF K$="5" THEN GOSUB 1400
200 IF K$="6" THEN GOSUB 1500
210 IF K$="7" THEN GOSUB 1600
220 GOTO 130

900 REM --- SILENCE ---
910 POKE 54277,0:POKE 54295,0
920 RETURN

1000 REM --- SUCCESS SOUND ---
1010 POKE 54272,80:POKE 54273,0
1020 POKE 54275,18:POKE 54276,240
1030 POKE 54277,17
1040 FOR D=1 TO 50:NEXT D
1050 POKE 54277,16
1060 RETURN

1100 REM --- FAILURE SOUND ---
1110 POKE 54272,20:POKE 54273,200
1120 POKE 54275,66:POKE 54276,32
1130 POKE 54277,129
1140 FOR D=1 TO 80:NEXT D
1150 POKE 54277,128
1160 RETURN

1200 REM --- EXPLOSION ---
1210 POKE 54275,0:POKE 54276,0
1220 FOR F=255 TO 20 STEP -10
1230 POKE 54272,F:POKE 54273,INT(RND(1)*256)
1240 POKE 54277,129
1250 FOR D=1 TO 5:NEXT D
1260 POKE 54277,128
1270 NEXT F
1280 RETURN

1300 REM --- PICKUP ---
1310 FOR P=80 TO 120 STEP 10
1320 POKE 54272,P:POKE 54273,0
1330 POKE 54277,33
1340 FOR D=1 TO 8:NEXT D
1350 POKE 54277,32
1360 NEXT P
1370 RETURN

1400 REM --- HIT ---
1410 POKE 54272,40:POKE 54273,0
1420 POKE 54275,0:POKE 54276,240
1430 POKE 54277,129
1440 FOR D=1 TO 30:NEXT D
1450 POKE 54277,128
1460 RETURN

1500 REM --- JUMP ---
1510 FOR N=60 TO 90 STEP 10
1520 POKE 54272,N:POKE 54273,0
1530 POKE 54277,17
1540 FOR D=1 TO 8:NEXT D
1550 POKE 54277,16
1560 NEXT N
1570 RETURN

1600 REM --- VICTORY JINGLE ---
1610 FOR I=0 TO 4
1620 F=60+I*12
1630 POKE 54272,F:POKE 54273,0
1640 POKE 54277,17
1650 FOR D=1 TO 40:NEXT D
1660 POKE 54277,16
1670 FOR D=1 TO 10:NEXT D
1680 NEXT I
1690 RETURN
```

## Collision Integration

```basic
REM From game loop
2800 HIT=PEEK(53278)               : REM sprite collision
2810 IF HIT AND 1 THEN GOSUB 3000:LIVES=LIVES-1
2820 IF LIVES=0 THEN GOSUB 3100:STATE=3

3000 REM HIT SOUND
3010 POKE 54272,40:POKE 54273,0
3020 POKE 54277,129
3030 FOR D=1 TO 30:NEXT D
3040 POKE 54277,128
3050 RETURN

3100 REM GAME OVER SOUND
3110 FOR F=100 TO 20 STEP -5
3120 POKE 54272,F
3130 POKE 54277,129
3140 FOR D=1 TO 10:NEXT D
3150 POKE 54277,128
3160 NEXT F
3170 RETURN
```

## Performance Tips

1. **Keep effects short**:
   ```basic
   REM Good: Quick, responsive
   FOR D=1 TO 50:NEXT D

   REM Bad: Blocks gameplay
   FOR D=1 TO 500:NEXT D
   ```

2. **Reuse envelope settings**:
   ```basic
   REM Init once at start
   1000 POKE 54275,18:POKE 54276,240:RETURN

   REM Just change frequency for each sound
   POKE 54272,freq:POKE 54277,17
   ```

3. **Sound priority system**:
   ```basic
   REM Only play if not already playing
   IF SOUNDTIME=0 OR TI>SOUNDTIME+30 THEN GOSUB sound:SOUNDTIME=TI
   ```

4. **Pre-calculate frequencies**:
   ```basic
   REM At init
   1000 SUCFREQ=80:FAILFREQ=20:HITFREQ=40

   REM During gameplay
   POKE 54272,SUCFREQ:GOSUB play
   ```

## Sound Timing

```basic
REM Approximate durations (PAL):
FOR D=1 TO 20:NEXT D      : REM ~0.2 seconds (very quick)
FOR D=1 TO 50:NEXT D      : REM ~0.5 seconds (quick)
FOR D=1 TO 100:NEXT D     : REM ~1 second (medium)
FOR D=1 TO 200:NEXT D     : REM ~2 seconds (long)

REM For NTSC, multiply by 0.83 for equivalent duration
```

## Waveform Character Guide

| Waveform | Value | Gate On | Character | Best For |
|----------|-------|---------|-----------|----------|
| Triangle | 16 | 17 | Smooth, mellow | Success, melodies |
| Sawtooth | 32 | 33 | Bright, harsh | Alerts, pickups |
| Pulse | 64 | 65 | Classic chip | Menu, UI |
| Noise | 128 | 129 | White noise | Explosions, hits |

## See Also

- [SID Initialization](sid-initialization.md) - Setting up the SID chip
- [Simple Music](simple-music.md) - Creating melodies
- [Sprite Collision](../sprites/sprite-collision.md) - Triggering sounds on collision
- **Lessons**: 7 (Sound Off), 8 (Typing Turmoil), 28 (Collision)
- **Vault**: [SID Chip](/vault/sid-chip)

## Quick Reference Card

```basic
REM Sound effect pattern
POKE 54272,freq_hi:POKE 54273,freq_lo
POKE 54275,attack_decay
POKE 54276,sustain_release
POKE 54277,waveform+1          : REM gate on
FOR D=1 TO duration:NEXT D
POKE 54277,waveform            : REM gate off

REM Common effects:
Success:   freq=80,  wave=17  (triangle), dur=50
Failure:   freq=20,  wave=129 (noise),    dur=80
Explosion: freq=255→20, wave=129, sweep down
Pickup:    freq=80→120, wave=33, sweep up
```

## Best Practices

1. **Match sound to action**
   - High pitch = positive (success, pickup)
   - Low pitch = negative (failure, damage)
   - Noise = violent (explosions, crashes)

2. **Keep sounds short during gameplay**
   - < 50 iterations for action feedback
   - Longer sounds for menus/transitions

3. **Vary similar sounds**
   - Different pitches for different pickups
   - Prevents audio fatigue

4. **Test on real hardware**
   - Emulators may not accurately represent timing
   - Volume levels differ between 6581/8580 SID chips

5. **Clean up after sounds**
   - Always gate off
   - Prevents audio artifacts

---

**Status**: Phase 2 Pattern
**Last Updated**: 2025-01-15
**Source**: Code Like It's 198x - C64 BASIC Course
