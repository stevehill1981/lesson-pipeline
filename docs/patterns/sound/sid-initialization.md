# SID Initialization

**Category**: Sound
**Difficulty**: Beginner
**Appears in**: Lessons 7, 8, 32, 40, 48
**Prerequisites**: None

## Overview

Configure the C64's legendary SID chip (Sound Interface Device) to produce tones by setting voice registers, master volume, waveform, and envelope parameters. The foundation for all sound effects and music in your games.

## The Pattern

```basic
REM --- SID VOICE 1 INITIALIZATION ---
10 POKE 54295,15                    : REM master volume (0-15)
20 POKE 54296,0                     : REM no filters
30 POKE 54273,0                     : REM frequency low byte
40 POKE 54272,50                    : REM frequency high byte
50 POKE 54275,17                    : REM attack/decay
60 POKE 54276,240                   : REM sustain/release
70 POKE 54277,33                    : REM triangle wave + gate on
80 FOR T=1 TO 200:NEXT T            : REM note duration
90 POKE 54277,32                    : REM gate off
```

## Parameters

| Register | Address | Purpose | Values |
|----------|---------|---------|--------|
| `54272` | $D400 | Frequency high byte | 0-255 |
| `54273` | $D401 | Frequency low byte | 0-255 |
| `54275` | $D405 | Attack/Decay | Packed nibbles 0-15 each |
| `54276` | $D406 | Sustain/Release | Packed nibbles 0-15 each |
| `54277` | $D407 | Waveform control | Bit flags + gate |
| `54295` | $D418 | Master volume | 0-15 |
| `54296` | $D419 | Filter control | Complex, use 0 for basic |

## How It Works

### Step 1: Master Volume
```basic
POKE 54295,15
```
- Sets master volume for all voices (0=silent, 15=maximum)
- Affects all three SID voices globally

### Step 2: Frequency (Pitch)
```basic
POKE 54273,0      : REM low byte
POKE 54272,50     : REM high byte
```
- 16-bit frequency value determines pitch
- Little-endian: low byte at 54273, high byte at 54272
- 50 (high byte) ≈ middle C
- Higher values = higher pitch

### Step 3: Envelope (ADSR)
```basic
POKE 54275,17     : REM attack=1, decay=7
POKE 54276,240    : REM sustain=15, release=0
```
- Attack: How fast note ramps up (0-15, fast to slow)
- Decay: How fast it drops to sustain level (0-15)
- Sustain: Volume level during hold (0-15)
- Release: How fast note fades when gate closes (0-15)

### Step 4: Waveform + Gate
```basic
POKE 54277,33     : REM triangle (16) + gate (1)
```
- Waveform bits: Triangle=16, Sawtooth=32, Pulse=64, Noise=128
- Add 1 to set gate (turn sound on)
- Subtract 1 or AND 254 to clear gate (turn off)

## Variations

### Variation 1: Silent SID (Game Start)
```basic
100 POKE 54295,0      : REM volume off
110 POKE 54296,0      : REM filters off
120 POKE 54277,0      : REM voice 1 off
130 POKE 54284,0      : REM voice 2 off
140 POKE 54291,0      : REM voice 3 off
```

**Use case**: Clean slate before game starts

### Variation 2: Three Voice Initialization
```basic
100 POKE 54295,15
110 REM voice 1
120 POKE 54272,50:POKE 54273,0
130 POKE 54275,17:POKE 54276,240
140 REM voice 2
150 POKE 54279,75:POKE 54280,0
160 POKE 54282,17:POKE 54283,240
170 REM voice 3
180 POKE 54286,100:POKE 54287,0
190 POKE 54289,17:POKE 54290,240
```

**Feature**: Initialize all three voices for chords

### Variation 3: Quick Beep Setup
```basic
100 POKE 54295,15:POKE 54296,0
110 POKE 54272,80:POKE 54273,0
120 POKE 54275,0:POKE 54276,240
130 POKE 54277,17                 : REM triangle + gate
140 FOR D=1 TO 50:NEXT D
150 POKE 54277,16                 : REM gate off
```

**Use case**: Fast initialization for simple beeps

### Variation 4: Sawtooth Wave
```basic
100 POKE 54295,15
110 POKE 54272,100:POKE 54273,0
120 POKE 54275,33:POKE 54276,240
130 POKE 54277,33                 : REM sawtooth (32) + gate (1)
```

**Feature**: Different waveform for harsher sound

### Variation 5: Pulse Wave with Duty Cycle
```basic
100 POKE 54295,15
110 POKE 54272,60:POKE 54273,0
120 POKE 54274,128:POKE 54275,0   : REM pulse width 50%
130 POKE 54276,17:POKE 54277,240
140 POKE 54278,65                 : REM pulse (64) + gate (1)
```

**Feature**: Square/pulse wave for classic chip sound

### Variation 6: Noise Generator
```basic
100 POKE 54295,15
110 POKE 54272,255:POKE 54273,255
120 POKE 54275,0:POKE 54276,240
130 POKE 54277,129                : REM noise (128) + gate (1)
```

**Use case**: Explosions, static, drum sounds

## Common Mistakes

- **Mistake 1**: Forgetting master volume
  - **Symptom**: No sound at all
  - **Fix**: Always `POKE 54295,15` first

- **Mistake 2**: Not clearing gate between notes
  - **Symptom**: Notes run together or don't restart
  - **Fix**: Always gate off before new note: `POKE 54277,waveform` (without +1)

- **Mistake 3**: Wrong byte order for frequency
  - **Symptom**: Wrong pitch or no sound
  - **Fix**: Low byte (54273) then high byte (54272)

- **Mistake 4**: Leaving sound on after game ends
  - **Symptom**: Continuous tone after BASIC prompt
  - **Fix**: Gate off and volume to 0 before END

- **Mistake 5**: Not understanding envelope timing
  - **Symptom**: Notes too short or too long
  - **Fix**: Adjust attack (faster=0, slower=15) and sustain level

## Memory Usage

- **Registers**: 29 SID registers ($D400-$D41C)
- **Variables**: None required for basic init
- **Optional**: Frequency table array (~50 bytes)

## SID Register Map (Voice 1)

| Address | Decimal | Register | Purpose |
|---------|---------|----------|---------|
| $D400 | 54272 | FRELO1 | Frequency low byte |
| $D401 | 54273 | FREHI1 | Frequency high byte |
| $D402 | 54274 | PWLO1 | Pulse width low |
| $D403 | 54275 | PWHI1 | Pulse width high |
| $D404 | 54276 | VCREG1 | Control register |
| $D405 | 54277 | ATDCY1 | Attack/Decay |
| $D406 | 54278 | SUREL1 | Sustain/Release |

Voice 2 starts at $D407 (54279), Voice 3 at $D40E (54286).

## Waveform Bit Values

| Waveform | Bit Value | Description |
|----------|-----------|-------------|
| Triangle | 16 | Smooth, mellow tone |
| Sawtooth | 32 | Bright, harsh tone |
| Pulse | 64 | Square wave (with duty cycle) |
| Noise | 128 | White noise |
| Gate | 1 | Add to waveform to turn on |

**Combine**: Triangle + Gate = 16 + 1 = 17

## Integration Example

```basic
NEW
10 REM --- SID SOUND DEMO ---
20 PRINT CHR$(147);"SID WAVEFORM DEMO"
30 PRINT:PRINT "PRESS 1-4 FOR WAVEFORMS"
40 PRINT "PRESS Q TO QUIT"
50 PRINT
60 PRINT "1 = TRIANGLE"
70 PRINT "2 = SAWTOOTH"
80 PRINT "3 = PULSE"
90 PRINT "4 = NOISE"
100 REM init SID
110 POKE 54295,15:POKE 54296,0
120 POKE 54272,80:POKE 54273,0
130 POKE 54275,17:POKE 54276,240
140 REM main loop
150 GET K$:IF K$="" THEN 150
160 IF K$="Q" THEN GOSUB 500:END
170 IF K$="1" THEN WF=16:GOSUB 300
180 IF K$="2" THEN WF=32:GOSUB 300
190 IF K$="3" THEN WF=64:GOSUB 300
200 IF K$="4" THEN WF=128:GOSUB 300
210 GOTO 150

300 REM --- PLAY WAVEFORM ---
310 POKE 54277,WF+1           : REM gate on
320 FOR D=1 TO 120:NEXT D
330 POKE 54277,WF             : REM gate off
340 RETURN

500 REM --- SILENCE SID ---
510 POKE 54277,0
520 POKE 54295,0
530 RETURN
```

## Frequency Reference Table

Approximate frequency high bytes for notes:

| Note | Value | Note | Value |
|------|-------|------|-------|
| C-3 | 17 | C-4 | 34 |
| D-3 | 19 | D-4 | 38 |
| E-3 | 21 | E-4 | 43 |
| F-3 | 23 | F-4 | 45 |
| G-3 | 25 | G-4 | 51 |
| A-3 | 28 | A-4 | 57 |
| B-3 | 32 | B-4 | 64 |
| C-4 | 34 | C-5 | 68 |

For precise tuning, use full 16-bit values from SID frequency charts.

## ADSR Envelope Guide

```basic
REM Fast attack, short sustain (drums)
POKE 54275,0      : REM attack=0 (instant), decay=0
POKE 54276,240    : REM sustain=15, release=0

REM Slow attack, long sustain (pads)
POKE 54275,136    : REM attack=8, decay=8
POKE 54276,249    : REM sustain=15, release=9

REM Medium envelope (normal notes)
POKE 54275,17     : REM attack=1, decay=7
POKE 54276,240    : REM sustain=15, release=0
```

## Performance Tips

1. **Initialize once at game start**:
   ```basic
   REM Good: Init in setup routine
   1000 POKE 54295,15:POKE 54296,0:RETURN

   REM Bad: Init every sound call
   ```

2. **Reuse envelope settings**:
   ```basic
   REM Only change frequency for new notes
   POKE 54272,FREQ:POKE 54277,17
   ```

3. **Gate off before new note**:
   ```basic
   REM Always clear gate first
   POKE 54277,16     : REM gate off
   POKE 54272,NEWFREQ
   POKE 54277,17     : REM gate on
   ```

## See Also

- [Sound Effects](sound-effects.md) - Using SID for game feedback
- [Simple Music](simple-music.md) - Creating melodies
- **Lessons**: 7 (Sound Off), 8 (Typing Turmoil)
- **Vault**: [SID Chip](/vault/sid-chip)

## Quick Reference Card

```basic
REM SID Voice 1 initialization pattern
POKE 54295,15                       : REM master volume
POKE 54296,0                        : REM filters off
POKE 54272,freq_hi:POKE 54273,freq_lo
POKE 54275,17                       : REM attack/decay
POKE 54276,240                      : REM sustain/release
POKE 54277,waveform+1               : REM gate on
FOR D=1 TO duration:NEXT D
POKE 54277,waveform                 : REM gate off

REM Waveforms: Triangle=16, Sawtooth=32, Pulse=64, Noise=128
```

## Hardware Notes

- **SID Chip**: 6581 or 8580 depending on C64 model
- **Three voices**: Each can play simultaneously
- **Frequency range**: ~0 Hz to ~4 kHz per voice
- **Filters**: Low-pass, band-pass, high-pass (advanced)
- **Ring modulation**: Voice sync for complex timbres (advanced)

## Best Practices

1. **Always set master volume first**
   - No sound without it
   - Set to 15 for maximum, adjust downward if needed

2. **Clear gate between notes**
   - Prevents notes running together
   - Ensures clean attack envelope

3. **Use appropriate waveforms**
   - Triangle: Mellow, bass, melodies
   - Sawtooth: Bright, leads, harmonics
   - Pulse: Classic chip sound, adjustable width
   - Noise: Drums, explosions, percussion

4. **Initialize at game start**
   - Set volume and filters once
   - Reuse envelope settings when possible

5. **Clean up at game end**
   - Gate off all voices
   - Volume to zero
   - Prevents hanging tones

---

**Status**: Phase 2 Pattern
**Last Updated**: 2025-01-15
**Source**: Code Like It's 198x - C64 BASIC Course
