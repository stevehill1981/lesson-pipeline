# C64 Lesson Creation Skill

## When to Use

Before writing any C64 BASIC or Assembly lesson for Code Like It's 198x.

## Overview

This workflow integrates all components of the lesson creation pipeline to produce verified, tested, and documented C64 lessons with working code, captured media, and reusable patterns.

## Pipeline Components

### Phase 1-6 (Foundation)
- **BasicValidator** - Validates BASIC V2 syntax against reference docs
- **BasicTokenizer** - Tokenizes BASIC code for analysis
- **PrgConverter** - Converts BASIC text to PRG files using petcat
- **ReferenceLoader** - Loads C64 command/memory reference documentation

### Phase 7-8 (VICE & Media)
- **ViceController** - Headless VICE emulator automation
- **InputSimulator** - Keyboard and joystick input simulation
- **MediaCapture** - Screenshot, video, and audio capture via FFmpeg

### Phase 9-11 (Configuration & Generation)
- **TestConfigParser** - YAML test configuration parser
- **PatternManager** - Pattern library management
- **LessonGenerator** - MDX lesson content generation

### Phase 12 (Platform)
- **C64 Platform Definition** - Platform-specific configuration in `docs/platforms/c64.json`

## Mandatory Workflow

### Phase 1: Preparation

**Read Essential Documentation:**
- [ ] Read CURRICULUM.md for lesson specification
- [ ] Read C64 reference docs:
  - `docs/reference/c64-reference/basic-v2/commands.json` - All BASIC V2 commands
  - `docs/reference/c64-reference/basic-v2/memory-map.json` - Memory addresses
  - `docs/reference/c64-reference/basic-v2/capabilities.json` - Platform features
- [ ] Identify WOW moment from curriculum (must be 20-40 lines)
- [ ] Check pattern library for reusable code:
  ```typescript
  const manager = new PatternManager();
  const patterns = manager.listPatterns('c64', 'basic', weekNumber);
  ```

**Key Constraints:**
- 15-20 minutes per lesson maximum
- ONE concept per lesson
- 20-40 line WOW moment program
- NO indentation (BASIC V2 flush left)
- NO invented commands (must exist in commands.json)

### Phase 2: Code Composition

For each example (Basic → Practical → WOW):

**2.1 Compose Code**
- [ ] Compose from verified patterns OR write minimal new code
- [ ] Keep examples progressively more complex
- [ ] Ensure WOW moment is 20-40 lines maximum

**2.2 Validate Syntax**
```typescript
import { BasicValidator } from './platforms/c64/basic-validator.js';

const validator = new BasicValidator();
const errors = validator.validate(code);

if (errors.length > 0) {
  // Fix all validation errors
  errors.forEach(err => {
    console.log(`Line ${err.line}: ${err.message}`);
  });
}
```

**2.3 Fix All Validation Errors**
- [ ] Unknown commands → Check commands.json reference
- [ ] POKE syntax errors → Ensure comma between address and value
- [ ] POKE values → Must be 0-255
- [ ] PEEK syntax → Must use parentheses: PEEK(address)
- [ ] Memory addresses → Verify against memory-map.json

**Common Validation Issues:**
```basic
# WRONG: POKE without comma
10 POKE 53280 0

# RIGHT: POKE with comma
10 POKE 53280,0

# WRONG: PEEK without parentheses
10 X = PEEK 53280

# RIGHT: PEEK with parentheses
10 X = PEEK(53280)

# WRONG: Value > 255
10 POKE 53280,300

# RIGHT: Value 0-255
10 POKE 53280,14
```

### Phase 3: Testing & Capture

**3.1 Create Test Configuration**

Create YAML test config (e.g., `tests/lesson-01.yaml`):

```yaml
platform: c64
program: lesson-01.bas
runtime: 30s

inputs:
  - time: 2s
    device: keyboard
    key: SPACE
  - time: 5s
    device: keyboard
    key: RETURN

captures:
  screenshots:
    - time: 0s
      name: initial-state
    - time: 3s
      name: after-space
    - time: 10s
      name: final-result
  video:
    start: 0s
    end: 15s
    name: full-demo
  audio:
    format: wav
    name: sound-effects
```

**3.2 Convert to PRG**

```typescript
import { PrgConverter } from './platforms/c64/prg-converter.js';

const converter = new PrgConverter();
const prgPath = converter.convertBasicToPrg('lesson-01.bas');
// Creates: lesson-01.prg
```

**3.3 Run in VICE**

```typescript
import { ViceController } from './core/vice-controller.js';
import { InputSimulator } from './core/input-simulator.js';

// Initialize VICE
const vice = new ViceController({
  executable: 'x64sc',
  headless: true
});

// Setup inputs
const sim = new InputSimulator();
sim.addKeyPress(2000, 'SPACE');
sim.addKeyPress(5000, 'RETURN');

// Run program
const result = await vice.runProgram(prgPath, 30000);

if (!result.success) {
  console.error('Program failed:', result.error);
}
```

**3.4 Capture Media**

```typescript
import { MediaCapture } from './core/media-capture.js';

const capture = new MediaCapture({
  outputDir: './media/lesson-01'
});

// Capture screenshots at specific times
await capture.captureScreenshot('initial-state', ':99');
await capture.captureScreenshot('after-space', ':99');
await capture.captureScreenshot('final-result', ':99');

// Capture video
await capture.captureVideo('full-demo', 15, ':99');

// Capture audio
await capture.captureAudio('sound-effects', 15);
```

**3.5 Verify Results**
- [ ] Screenshots show expected visual output
- [ ] Video captures the full WOW moment
- [ ] Audio captures sound effects correctly
- [ ] No crashes or unexpected behavior
- [ ] Program completes within runtime limit

### Phase 4: Pattern Extraction

If new reusable code was created:

**4.1 Identify Reusable Components**
- Screen color setup
- Sound effect routines
- Character manipulation
- Sprite handling
- Common input patterns

**4.2 Create Pattern Metadata**

Create `patterns/c64/basic/week-NN/pattern-name.json`:

```json
{
  "id": "screen-color-cycle",
  "week": 2,
  "concept": "color-animation",
  "dependencies": [],
  "code": "100 FOR I=0 TO 15\n110 POKE 53280,I\n120 FOR D=1 TO 100:NEXT D\n130 NEXT I",
  "teaching_notes": "Cycles through all 16 C64 colors on border",
  "wow_factor": 3,
  "line_count": 4,
  "optimization_level": "clear",
  "data_statements": null
}
```

**4.3 Document for Learners**
- [ ] Clear variable names
- [ ] Teaching-focused comments (WHY, not WHAT)
- [ ] Note any hardware-specific details
- [ ] Explain wow_factor rating (1-5)

**Pattern Metadata Fields:**
- `id` - Unique identifier (kebab-case)
- `week` - Week number (1-8)
- `concept` - Teaching concept (e.g., "color-animation", "sprite-movement")
- `dependencies` - Array of pattern IDs this depends on
- `code` - BASIC code with \n line breaks
- `teaching_notes` - Why/how to teach this
- `wow_factor` - 1-5 rating of visual/audio impact
- `line_count` - Total lines of code
- `optimization_level` - "clear", "balanced", or "optimized"
- `data_statements` - Optional DATA lines if needed

**4.4 Add to Pattern Library**

```typescript
const manager = new PatternManager();

// Load the pattern
const pattern = manager.loadPattern('c64', 'basic', 'screen-color-cycle');

// Resolve dependencies and get full code
const code = manager.resolvePattern(pattern);
```

### Phase 5: Lesson Generation

**5.1 Generate MDX Structure**

```typescript
import { LessonGenerator, LessonMetadata, LessonExample } from './core/lesson-generator.js';

const generator = new LessonGenerator();

const metadata: LessonMetadata = {
  title: 'Making Colors Dance',
  system: 'C64',
  course: 'Commodore 64 BASIC',
  lessonNumber: 5,
  totalLessons: 64,
  objectives: [
    'Understand color memory addresses',
    'Create smooth color transitions',
    'Build visual effects with FOR loops'
  ]
};

const examples: LessonExample[] = [
  {
    title: 'Basic Example: Change Border Color',
    code: '10 POKE 53280,2\n20 END',
    explanation: 'Changes the border to red. Memory address 53280 controls border color.'
  },
  {
    title: 'Practical Example: Cycle Two Colors',
    code: basicExample,
    explanation: 'Alternates between two colors in a loop.',
    imagePath: '/images/c64-basic/week-02/lesson-05-basic.png'
  },
  {
    title: 'WOW Moment: Rainbow Border Animation',
    code: wowExample,
    explanation: 'Creates a smooth rainbow effect...',
    imagePath: '/images/c64-basic/week-02/lesson-05-wow.png',
    videoPath: '/videos/c64-basic/week-02/lesson-05-demo.mp4'
  }
];

const mdx = generator.generateMDX(metadata, examples);
```

**5.2 Write Opening Section**

Connect to prior lessons:
```markdown
## You've Been Using This Already!

Remember in Lesson 4 when we changed the screen color? That POKE 53280
command was accessing the border color memory. Today we're going to make
those colors move!
```

**5.3 Write Explanations**

For each example:
- What the code does (observable behavior)
- Why it works (concept explanation)
- How to modify it (experimentation ideas)

**5.4 Write Quick Reference**

Essential syntax only:
```markdown
## Quick Reference

**Border Color:**
- `POKE 53280,color` - Change border (0-15)

**Background Color:**
- `POKE 53281,color` - Change background (0-15)

**C64 Color Values:**
- 0=Black, 1=White, 2=Red, 3=Cyan, 4=Purple, 5=Green
- 6=Blue, 7=Yellow, 8=Orange, 9=Brown, 10=Light Red
- 11=Dark Grey, 12=Grey, 13=Light Green, 14=Light Blue, 15=Light Grey
```

**5.5 Write "What You've Learnt"**

Capabilities unlocked:
```markdown
## What You've Learnt

- Memory addresses 53280 and 53281 control screen colors
- You can create animations by POKEing values in loops
- Delays (empty FOR loops) control animation speed
- The C64 has 16 colors you can use in any combination
```

### Phase 6: Verification

**6.1 Code Samples Directory**
- [ ] All code saved to `code-samples/c64/basic/week-NN/lesson-NN/`
- [ ] Each example in separate .bas file:
  - `basic-example.bas`
  - `practical-example.bas`
  - `wow-moment.bas`

**6.2 Media Assets**
- [ ] Screenshots in `public/images/c64-basic/week-NN/`
- [ ] Videos in `public/videos/c64-basic/week-NN/`
- [ ] Audio in `public/audio/c64-basic/week-NN/`

**6.3 MDX Frontmatter**

Verify complete:
```yaml
---
layout: ../../../../layouts/LessonLayout.astro
title: "Making Colors Dance"
game: "Commodore 64 BASIC"
system: "C64"
lessonNumber: 5
totalLessons: 64
prevLesson: "/c64/basic/week-02/lesson-04"
nextLesson: "/c64/basic/week-02/lesson-06"
objectives:
  - Understand color memory addresses
  - Create smooth color transitions
  - Build visual effects with FOR loops
---
```

**6.4 Reference Verification**
- [ ] No invented commands (all exist in commands.json)
- [ ] No invented memory addresses (all in memory-map.json)
- [ ] No invented techniques (verified in VICE)
- [ ] Memory addresses match reference docs exactly

**6.5 Final Readthrough**
- [ ] Read full lesson as learner
- [ ] Every code example explained
- [ ] Clear progression: Basic → Practical → WOW
- [ ] WOW moment delivers on promise
- [ ] Language is UK English
- [ ] Tone is enthusiastic but clear

## Complete Integration Example

Here's how all components work together:

```typescript
import { BasicValidator } from './platforms/c64/basic-validator.js';
import { PrgConverter } from './platforms/c64/prg-converter.js';
import { ViceController } from './core/vice-controller.js';
import { MediaCapture } from './core/media-capture.js';
import { PatternManager } from './core/pattern-manager.js';
import { LessonGenerator } from './core/lesson-generator.js';
import { TestConfigParser } from './core/test-config-parser.js';

// 1. Load or create code
const patternManager = new PatternManager();
const pattern = patternManager.loadPattern('c64', 'basic', 'color-cycle');
let code = pattern.code;

// 2. Validate
const validator = new BasicValidator();
const errors = validator.validate(code);
if (errors.length > 0) {
  console.error('Validation errors:', errors);
  process.exit(1);
}

// 3. Convert to PRG
const converter = new PrgConverter();
const prgPath = converter.convertBasicToPrg('temp.bas');

// 4. Load test config
const testParser = new TestConfigParser();
const testConfig = testParser.parse('tests/lesson-05.yaml');

// 5. Run in VICE
const vice = new ViceController({
  executable: 'x64sc',
  headless: true
});

const result = await vice.runProgram(prgPath,
  testParser.parseTimeToMs(testConfig.runtime)
);

// 6. Capture media
const capture = new MediaCapture({
  outputDir: './media/lesson-05'
});

for (const screenshot of testConfig.captures?.screenshots || []) {
  await capture.captureScreenshot(screenshot.name);
}

// 7. Generate lesson MDX
const generator = new LessonGenerator();
const mdx = generator.generateMDX({
  title: 'Making Colors Dance',
  system: 'C64',
  course: 'Commodore 64 BASIC',
  lessonNumber: 5,
  totalLessons: 64
}, [{
  title: 'WOW Moment',
  code: code,
  explanation: pattern.teaching_notes,
  imagePath: '/images/c64-basic/week-02/lesson-05-wow.png'
}]);

console.log('✅ Lesson complete!');
```

## Success Criteria

Lesson complete when:

1. **All code runs in VICE without errors**
   - No syntax errors
   - No runtime crashes
   - Produces expected output

2. **All media artifacts exist**
   - Screenshots captured
   - Video recorded (if applicable)
   - Audio captured (if applicable)

3. **Prose describes verified behavior**
   - No "should work" or "will probably"
   - Every statement verified in VICE
   - Screenshots prove claims

4. **Pattern library updated**
   - Reusable code extracted
   - Metadata complete
   - Teaching notes clear

5. **Can confidently say "This lesson teaches X with working code"**
   - WOW moment delivers
   - Learner can reproduce results
   - No invented features

## Common Pitfalls

### Don't
- ❌ Invent commands not in commands.json
- ❌ Use memory addresses not in memory-map.json
- ❌ Claim code works without running in VICE
- ❌ Skip validation step
- ❌ Create patterns without metadata
- ❌ Write lessons without testing code
- ❌ Use indentation in BASIC V2 code
- ❌ Exceed 20-40 line limit on WOW moments

### Do
- ✅ Validate against reference docs
- ✅ Test in VICE before documenting
- ✅ Capture media for verification
- ✅ Extract reusable patterns
- ✅ Document teaching rationale
- ✅ Keep WOW moments focused
- ✅ Write from UK perspective
- ✅ Make every lesson end with wonder

## File Structure Reference

```
lesson-pipeline/
├── src/
│   ├── core/
│   │   ├── vice-controller.ts       # VICE automation
│   │   ├── input-simulator.ts       # Keyboard/joystick
│   │   ├── media-capture.ts         # Screenshot/video/audio
│   │   ├── test-config-parser.ts    # YAML config parser
│   │   ├── pattern-manager.ts       # Pattern library
│   │   └── lesson-generator.ts      # MDX generation
│   └── platforms/c64/
│       ├── basic-validator.ts       # Syntax validation
│       ├── basic-tokenizer.ts       # Code analysis
│       └── prg-converter.ts         # BASIC → PRG
├── patterns/c64/basic/
│   └── week-NN/
│       └── pattern-name.json        # Reusable code
├── docs/
│   ├── platforms/
│   │   └── c64.json                 # Platform definition
│   ├── reference/c64-reference/
│   │   └── basic-v2/
│   │       ├── commands.json        # All BASIC commands
│   │       ├── memory-map.json      # Memory addresses
│   │       └── capabilities.json    # Platform features
│   └── skills/
│       └── c64-lesson-creation.md   # This document
└── tests/
    ├── fixtures/
    │   └── test-config.yaml         # Example test config
    └── integration/
        └── lesson-pipeline.test.ts  # End-to-end test
```

## CLI Integration

When the CLI is complete, this workflow becomes:

```bash
# Validate code
retro-lesson validate lesson-05.bas

# Run in VICE and capture
retro-lesson test lesson-05.bas --config tests/lesson-05.yaml

# Extract pattern
retro-lesson extract lesson-05.bas --pattern color-cycle

# Generate lesson
retro-lesson generate --config lesson-05-config.json

# Complete pipeline
retro-lesson create lesson-05 --week 2
```

## Additional Resources

- **Platform Definition:** `docs/platforms/c64.json`
- **C64 Reference:** `docs/reference/c64-reference/`
- **Test Examples:** `tests/fixtures/`
- **Pattern Library:** `patterns/c64/basic/`
- **Integration Test:** `tests/integration/lesson-pipeline.test.ts`

---

**Remember:** Every lesson must end with "WOW LOOK AT WHAT I CAN MAKE THIS THING DO!"

This workflow ensures every line of code is verified, every claim is tested, and every learner gets working code that delivers real results.
