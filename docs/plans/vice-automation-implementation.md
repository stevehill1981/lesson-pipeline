# VICE Automation & Media Capture Implementation Plan

**Goal**: Build automated screenshot/video capture for BASIC lessons using headless VICE emulator

**Context**: We have 64 complete BASIC lessons (Phase 0) that need screenshots and videos before building the 1024-lesson assembly curriculum. The infrastructure is partially built (MediaCapture class, Docker with VICE/ffmpeg/Xvfb) but needs VICE automation and workflow integration.

---

## Architecture

### Components

1. **ViceRunner** - Launches VICE headlessly, loads programs, controls execution
2. **TestOrchestrator** - Reads test configs, coordinates ViceRunner + MediaCapture
3. **Test Configuration** - YAML files describing what/when to capture per lesson
4. **CLI Command** - `retro-lesson capture` command to run captures
5. **Batch Processor** - Process all Phase 0 lessons in sequence

### Workflow

```
User runs: retro-lesson capture lesson-001.yml

1. CLI reads lesson-001.yml (test configuration)
2. TestOrchestrator starts Xvfb display
3. ViceRunner launches x64sc, loads BASIC program
4. At specified timestamps, MediaCapture takes screenshots
5. If video requested, MediaCapture records full execution
6. ViceRunner shuts down VICE
7. Media files saved to /website/public/images/c64/phase-0/tier-N/lesson-NNN/
8. Paths returned for optional MDX embedding
```

---

## Test Configuration Format

Each lesson gets a YAML file describing capture requirements:

**Example: `tests/fixtures/c64/phase-0/tier-1/lesson-001.yml`**

```yaml
platform: c64
phase: 0
tier: 1
lesson: 1
title: "Talk to Me"

program:
  type: basic
  file: "/code-samples/commodore-64/phase-0/tier-1/lesson-001/main.bas"

execution:
  duration: 30  # seconds
  autoRun: true

captures:
  screenshots:
    - name: "wow-moment"
      time: 10  # seconds after start
      description: "Infinite HELLO loop filling screen"

  video:
    enabled: true
    duration: 15
    fps: 30
    description: "Full execution showing loop"
```

---

## Implementation Tasks

### Task 1: Test Configuration Schema

**Files**:
- `schemas/test-configuration.schema.json`
- `src/core/test-config-parser.ts` (may already exist, verify/update)

**Schema** (JSON Schema):
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["platform", "phase", "tier", "lesson", "program", "execution"],
  "properties": {
    "platform": { "type": "string", "enum": ["c64", "spectrum", "nes", "amiga"] },
    "phase": { "type": "integer", "minimum": 0 },
    "tier": { "type": "integer", "minimum": 1 },
    "lesson": { "type": "integer", "minimum": 1 },
    "title": { "type": "string" },
    "program": {
      "type": "object",
      "required": ["type", "file"],
      "properties": {
        "type": { "type": "string", "enum": ["basic", "assembly"] },
        "file": { "type": "string" }
      }
    },
    "execution": {
      "type": "object",
      "required": ["duration"],
      "properties": {
        "duration": { "type": "integer", "minimum": 1 },
        "autoRun": { "type": "boolean", "default": true }
      }
    },
    "captures": {
      "type": "object",
      "properties": {
        "screenshots": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["name", "time"],
            "properties": {
              "name": { "type": "string" },
              "time": { "type": "integer", "minimum": 0 },
              "description": { "type": "string" }
            }
          }
        },
        "video": {
          "type": "object",
          "properties": {
            "enabled": { "type": "boolean" },
            "duration": { "type": "integer" },
            "fps": { "type": "integer", "default": 30 },
            "description": { "type": "string" }
          }
        }
      }
    }
  }
}
```

**Verification**: Load and validate example test config

---

### Task 2: ViceRunner Module

**File**: `src/platforms/c64/vice-runner.ts`

**Responsibilities**:
- Launch x64sc in headless mode (via Xvfb)
- Load BASIC program via command-line arguments
- Auto-run program if configured
- Provide hooks for timed screenshot captures
- Clean shutdown

**Interface**:
```typescript
export interface ViceOptions {
  display: string;        // e.g., ":99"
  program: string;        // path to .prg or .bas
  autoRun: boolean;
  verbose?: boolean;
}

export class ViceRunner {
  constructor(options: ViceOptions);

  async start(): Promise<void>;
  async waitForStartup(): Promise<void>;
  async shutdown(): Promise<void>;
  getDisplay(): string;
  isRunning(): boolean;
}
```

**Implementation Notes**:
- Use `child_process.spawn()` to run x64sc
- Command: `x64sc -autostart ${programPath} +sound -sounddev dummy -silent`
- For BASIC: may need to convert .bas to .prg first (using petcat)
- Monitor process for crashes/exits

---

### Task 3: Test Orchestrator

**File**: `src/core/test-orchestrator.ts`

**Responsibilities**:
- Parse test configuration YAML
- Start Xvfb if not running
- Coordinate ViceRunner + MediaCapture
- Execute timed screenshot captures
- Record video if requested
- Return captured media paths

**Interface**:
```typescript
export interface CaptureResult {
  screenshots: { name: string; path: string; time: number }[];
  video?: { path: string; duration: number };
  success: boolean;
  errors?: string[];
}

export class TestOrchestrator {
  constructor(config: TestConfiguration);

  async execute(): Promise<CaptureResult>;
  async cleanup(): Promise<void>;
}
```

**Workflow**:
1. Start Xvfb on display :99 (via existing vice-headless.sh)
2. Initialize MediaCapture with output directory
3. Create ViceRunner with test config
4. Start VICE
5. Wait for startup (2-3 seconds)
6. Start video recording if enabled
7. For each screenshot: wait until timestamp, capture
8. Stop video recording
9. Shutdown VICE
10. Return paths

---

### Task 4: CLI Command

**File**: `src/commands/capture.ts`

**Command**: `retro-lesson capture <test-config.yml> [options]`

**Options**:
- `--output-dir <path>` - Where to save media (default: `./output`)
- `--verbose` - Show detailed execution logs
- `--skip-video` - Only capture screenshots
- `--skip-screenshots` - Only capture video

**Implementation**:
```typescript
import { Command } from 'commander';
import { TestOrchestrator } from '../core/test-orchestrator';
import { loadYaml } from '../core/utils';

export function registerCaptureCommand(program: Command) {
  program
    .command('capture <config>')
    .description('Run VICE and capture screenshots/video')
    .option('-o, --output-dir <path>', 'Output directory', './output')
    .option('-v, --verbose', 'Verbose output')
    .option('--skip-video', 'Skip video capture')
    .option('--skip-screenshots', 'Skip screenshot capture')
    .action(async (configPath, options) => {
      const config = await loadYaml(configPath);
      const orchestrator = new TestOrchestrator(config, options);
      const result = await orchestrator.execute();

      console.log(`\n✅ Capture complete:`);
      console.log(`   Screenshots: ${result.screenshots.length}`);
      if (result.video) console.log(`   Video: ${result.video.path}`);
    });
}
```

Register in `src/cli.ts`.

---

### Task 5: Batch Processing Script

**File**: `src/scripts/batch-capture.ts`

**Purpose**: Process all Phase 0 lessons in sequence

**Usage**: `npm run batch-capture -- phase-0`

**Implementation**:
- Find all test config files in `tests/fixtures/c64/phase-0/**/*.yml`
- For each config:
  - Run TestOrchestrator
  - Log results
  - Handle errors gracefully (continue on failure)
- Generate summary report

---

## Testing Strategy

### Phase 1: Unit Testing
- Test ViceRunner starts/stops VICE
- Test MediaCapture creates screenshots/videos
- Test TestOrchestrator coordinates correctly

### Phase 2: Integration Testing
- Create test config for Lesson 1
- Run full capture workflow
- Verify media files created
- Check quality/content

### Phase 3: Batch Processing
- Run on Tier 1 (16 lessons)
- Verify all captures successful
- Fix any issues
- Run on all Phase 0 (64 lessons)

---

## Output Structure

Media saved to website for embedding:

```
/website/public/images/c64/
  phase-0/
    tier-1/
      lesson-001/
        wow-moment.png
        execution.mp4
      lesson-002/
        ...
    tier-2/
      ...
```

MDX can reference: `![WOW Moment](/images/c64/phase-0/tier-1/lesson-001/wow-moment.png)`

---

## Dependencies & Requirements

**System Requirements**:
- Docker (for isolated VICE environment)
- OR Local VICE installation + Xvfb + ffmpeg + ImageMagick

**Node Packages** (already installed):
- `commander` - CLI
- `yaml` - Config parsing
- `ajv` - Schema validation

**Additional Packages Needed**:
- None (use built-in child_process)

---

## Success Criteria

1. ✅ Can run single lesson capture: `retro-lesson capture tests/fixtures/c64/phase-0/tier-1/lesson-001.yml`
2. ✅ Screenshot captured at correct timestamp
3. ✅ Video captured with acceptable quality
4. ✅ Batch processing completes all 64 Phase 0 lessons
5. ✅ Media files organized correctly in website/public/images/
6. ✅ No manual intervention required

---

## Timeline Estimate

- Task 1 (Schema): 30 minutes
- Task 2 (ViceRunner): 2 hours
- Task 3 (TestOrchestrator): 2 hours
- Task 4 (CLI Command): 1 hour
- Task 5 (Batch Script): 1 hour
- Testing & Debugging: 2-3 hours

**Total**: 8-10 hours of development

---

## Next Steps

1. Verify existing MediaCapture class works
2. Create test configuration schema
3. Build ViceRunner module
4. Build TestOrchestrator
5. Add CLI command
6. Test on Lesson 1
7. Create batch processor
8. Run on all Phase 0 lessons
9. Document results
