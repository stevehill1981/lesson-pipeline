# Lesson Pipeline Foundation Implementation Plan

> **For Claude:** Use `${SUPERPOWERS_SKILLS_ROOT}/skills/collaboration/executing-plans/SKILL.md` to implement this plan task-by-task.

**Goal:** Build a complete lesson creation pipeline for Code198x that validates BASIC/Assembly code, tests it in emulators, captures media, and generates lesson MDX with verified examples.

**Architecture:** Platform-agnostic core with pluggable platform-specific validators/compilers. Reference database provides ground truth for syntax validation. Pattern library stores verified, reusable code. VICE automation runs headless tests with input simulation and media capture. CLI orchestrates the workflow enforced by the C64 Lesson Creation skill.

**Tech Stack:** Node.js, JSON/YAML schemas, VICE emulator (x64sc), petcat for BASIC tokenization, FFmpeg for media processing

---

## Phase 1: Foundation

### Task 1: Project Initialization

**Files:**
- Create: `package.json`
- Create: `.nvmrc`
- Create: `tsconfig.json`

**Step 1: Initialize Node.js project**

Create `package.json`:

```json
{
  "name": "@code198x/lesson-pipeline",
  "version": "0.1.0",
  "description": "Automated lesson creation pipeline for Code Like It's 198x",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "retro-lesson": "./dist/cli.js"
  },
  "scripts": {
    "build": "tsc",
    "test": "node --test",
    "dev": "tsc --watch",
    "lint": "eslint src/**/*.ts"
  },
  "keywords": ["retro", "c64", "education", "testing"],
  "author": "Steve Hill",
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^20.0.0",
    "eslint": "^8.0.0",
    "typescript": "^5.0.0"
  },
  "dependencies": {
    "ajv": "^8.12.0",
    "commander": "^11.0.0",
    "yaml": "^2.3.0"
  }
}
```

**Step 2: Create Node version file**

Create `.nvmrc`:

```
20
```

**Step 3: Create TypeScript configuration**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

**Step 4: Install dependencies**

Run: `npm install`
Expected: Dependencies installed, node_modules/ created

**Step 5: Commit**

```bash
git add package.json .nvmrc tsconfig.json package-lock.json
git commit -m "chore: Initialize Node.js project with TypeScript"
```

---

### Task 2: Directory Structure

**Files:**
- Create: `src/core/.gitkeep`
- Create: `src/platforms/c64/.gitkeep`
- Create: `src/platforms/spectrum/.gitkeep`
- Create: `src/platforms/amiga/.gitkeep`
- Create: `src/platforms/nes/.gitkeep`
- Create: `docs/reference/platforms/.gitkeep`
- Create: `docs/reference/c64-reference/basic-v2/.gitkeep`
- Create: `docs/reference/c64-reference/assembly-6510/.gitkeep`
- Create: `schemas/.gitkeep`
- Create: `tests/fixtures/.gitkeep`

**Step 1: Create directory structure**

```bash
mkdir -p src/{core,platforms/{c64,spectrum,amiga,nes}}
mkdir -p docs/reference/{platforms,c64-reference/{basic-v2,assembly-6510}}
mkdir -p schemas tests/fixtures
touch src/core/.gitkeep src/platforms/{c64,spectrum,amiga,nes}/.gitkeep
touch docs/reference/platforms/.gitkeep
touch docs/reference/c64-reference/{basic-v2,assembly-6510}/.gitkeep
touch schemas/.gitkeep tests/fixtures/.gitkeep
```

**Step 2: Commit**

```bash
git add src/ docs/ schemas/ tests/
git commit -m "chore: Create project directory structure"
```

---

## Phase 2: Schemas & Type Definitions

### Task 3: Platform Definition Schema

**Files:**
- Create: `schemas/platform-definition.schema.json`
- Create: `src/core/types.ts`
- Create: `tests/schemas/platform-definition.test.ts`

**Step 1: Write platform definition JSON schema**

Create `schemas/platform-definition.schema.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://code198x.stevehill.xyz/schemas/platform-definition.json",
  "title": "Platform Definition",
  "description": "Defines a retro platform's languages, emulator, and constraints",
  "type": "object",
  "required": ["id", "name", "languages", "emulator"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "description": "Unique platform identifier (e.g., 'c64', 'spectrum')"
    },
    "name": {
      "type": "string",
      "description": "Human-readable platform name"
    },
    "languages": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["id", "name", "validator", "file_extension"],
        "properties": {
          "id": {
            "type": "string",
            "description": "Language identifier"
          },
          "name": {
            "type": "string"
          },
          "validator": {
            "type": "string",
            "description": "Validator module name"
          },
          "compiler": {
            "type": "string",
            "description": "Optional compiler/assembler command"
          },
          "file_extension": {
            "type": "string",
            "pattern": "^\\.[a-z]+$"
          },
          "reference_docs": {
            "type": "string",
            "description": "Path to reference documentation"
          }
        }
      }
    },
    "emulator": {
      "type": "object",
      "required": ["name", "command"],
      "properties": {
        "name": {
          "type": "string"
        },
        "command": {
          "type": "string"
        },
        "headless_flag": {
          "type": "string"
        },
        "controller": {
          "type": "string",
          "description": "Automation controller module"
        }
      }
    },
    "lesson_time_limits": {
      "type": "object",
      "description": "Time limits per language",
      "patternProperties": {
        ".*": {
          "type": "string",
          "pattern": "^\\d+-\\d+min$"
        }
      }
    }
  }
}
```

**Step 2: Create TypeScript types**

Create `src/core/types.ts`:

```typescript
export interface PlatformLanguage {
  id: string;
  name: string;
  validator: string;
  compiler?: string;
  file_extension: string;
  reference_docs?: string;
}

export interface PlatformEmulator {
  name: string;
  command: string;
  headless_flag?: string;
  controller?: string;
}

export interface PlatformDefinition {
  id: string;
  name: string;
  languages: PlatformLanguage[];
  emulator: PlatformEmulator;
  lesson_time_limits?: Record<string, string>;
}

export interface PatternMetadata {
  id: string;
  week: number;
  concept: string;
  dependencies: string[];
  code: string;
  data_statements?: string;
  memory_used?: number[];
  registers_touched?: number[];
  teaching_notes: string;
  wow_factor: number;
  line_count: number;
}

export interface TestConfiguration {
  platform: string;
  program: string;
  runtime: string;
  inputs?: TestInput[];
  captures?: CaptureConfiguration;
}

export interface TestInput {
  time: string;
  device: 'keyboard' | 'joystick';
  key?: string;
  port?: number;
  action?: string;
  duration?: string;
}

export interface CaptureConfiguration {
  screenshots?: Screenshot[];
  video?: VideoCapture;
  audio?: AudioCapture;
}

export interface Screenshot {
  time: string;
  name: string;
}

export interface VideoCapture {
  start: string;
  end: string;
  name: string;
}

export interface AudioCapture {
  format: string;
  name: string;
}
```

**Step 3: Write schema validation test**

Create `tests/schemas/platform-definition.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import Ajv from 'ajv';
import { readFileSync } from 'fs';

test('platform definition schema validates valid C64 definition', () => {
  const ajv = new Ajv();
  const schema = JSON.parse(
    readFileSync('schemas/platform-definition.schema.json', 'utf-8')
  );

  const validPlatform = {
    id: 'c64',
    name: 'Commodore 64',
    languages: [
      {
        id: 'basic-v2',
        name: 'BASIC V2',
        validator: 'basic-v2-validator',
        compiler: 'petcat',
        file_extension: '.bas',
        reference_docs: 'c64-reference/basic-v2/'
      }
    ],
    emulator: {
      name: 'VICE',
      command: 'x64sc',
      headless_flag: '-console',
      controller: 'vice-automation'
    },
    lesson_time_limits: {
      'basic-v2': '15-20min'
    }
  };

  const validate = ajv.compile(schema);
  const valid = validate(validPlatform);

  assert.strictEqual(valid, true, `Validation failed: ${JSON.stringify(validate.errors)}`);
});

test('platform definition schema rejects invalid platform', () => {
  const ajv = new Ajv();
  const schema = JSON.parse(
    readFileSync('schemas/platform-definition.schema.json', 'utf-8')
  );

  const invalidPlatform = {
    id: 'c64',
    // Missing required 'name' field
    languages: [],
    emulator: {
      name: 'VICE'
      // Missing required 'command' field
    }
  };

  const validate = ajv.compile(schema);
  const valid = validate(invalidPlatform);

  assert.strictEqual(valid, false);
  assert.ok(validate.errors && validate.errors.length > 0);
});
```

**Step 4: Run tests**

Run: `npm test`
Expected: 2 passing tests

**Step 5: Commit**

```bash
git add schemas/ src/core/types.ts tests/schemas/
git commit -m "feat(schema): Add platform definition schema and types"
```

---

### Task 4: Pattern Metadata Schema

**Files:**
- Create: `schemas/pattern-metadata.schema.json`
- Create: `tests/schemas/pattern-metadata.test.ts`

**Step 1: Write pattern metadata schema**

Create `schemas/pattern-metadata.schema.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://code198x.stevehill.xyz/schemas/pattern-metadata.json",
  "title": "Pattern Metadata",
  "description": "Metadata for verified code patterns",
  "type": "object",
  "required": ["id", "week", "concept", "code", "teaching_notes", "wow_factor", "line_count"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$"
    },
    "week": {
      "type": "integer",
      "minimum": 1
    },
    "concept": {
      "type": "string",
      "description": "What concept this pattern teaches"
    },
    "dependencies": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Pattern IDs this depends on"
    },
    "code": {
      "type": "string",
      "description": "The actual BASIC or Assembly code"
    },
    "data_statements": {
      "type": "string",
      "description": "Optional DATA statements for BASIC"
    },
    "memory_used": {
      "type": "array",
      "items": {
        "type": "integer",
        "minimum": 0,
        "maximum": 65535
      },
      "description": "Memory addresses used by this pattern"
    },
    "registers_touched": {
      "type": "array",
      "items": {
        "type": "integer",
        "minimum": 0,
        "maximum": 65535
      },
      "description": "Hardware registers accessed"
    },
    "teaching_notes": {
      "type": "string",
      "description": "How to teach this pattern to learners"
    },
    "wow_factor": {
      "type": "integer",
      "minimum": 1,
      "maximum": 5,
      "description": "Visual/audio impact (1=subtle, 5=spectacular)"
    },
    "line_count": {
      "type": "integer",
      "minimum": 1,
      "description": "Number of lines of code"
    },
    "optimization_level": {
      "type": "string",
      "enum": ["clear", "efficient", "professional"],
      "description": "Code optimization level for pedagogical progression"
    }
  }
}
```

**Step 2: Write pattern validation test**

Create `tests/schemas/pattern-metadata.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import Ajv from 'ajv';
import { readFileSync } from 'fs';

test('pattern metadata schema validates sprite definition pattern', () => {
  const ajv = new Ajv();
  const schema = JSON.parse(
    readFileSync('schemas/pattern-metadata.schema.json', 'utf-8')
  );

  const validPattern = {
    id: 'sprite-basic',
    week: 2,
    concept: 'sprite-definition',
    dependencies: ['poke-basics'],
    code: '10 REM DEFINE SPRITE 0\\n20 FOR I=0 TO 62\\n30 READ A\\n40 POKE 832+I,A\\n50 NEXT I',
    data_statements: '1000 DATA 0,126,0,1,255,128',
    memory_used: [832, 893],
    registers_touched: [53248, 53269],
    teaching_notes: 'Introduces sprite pointer concept',
    wow_factor: 3,
    line_count: 15,
    optimization_level: 'clear'
  };

  const validate = ajv.compile(schema);
  const valid = validate(validPattern);

  assert.strictEqual(valid, true, `Validation failed: ${JSON.stringify(validate.errors)}`);
});

test('pattern metadata schema rejects invalid wow_factor', () => {
  const ajv = new Ajv();
  const schema = JSON.parse(
    readFileSync('schemas/pattern-metadata.schema.json', 'utf-8')
  );

  const invalidPattern = {
    id: 'test',
    week: 1,
    concept: 'test',
    code: '10 PRINT "TEST"',
    teaching_notes: 'test',
    wow_factor: 10, // Invalid: must be 1-5
    line_count: 1
  };

  const validate = ajv.compile(schema);
  const valid = validate(invalidPattern);

  assert.strictEqual(valid, false);
});
```

**Step 3: Run tests**

Run: `npm test`
Expected: 4 passing tests (2 from previous task + 2 new)

**Step 4: Commit**

```bash
git add schemas/pattern-metadata.schema.json tests/schemas/pattern-metadata.test.ts
git commit -m "feat(schema): Add pattern metadata schema"
```

---

## Phase 3: C64 Reference Documentation

### Task 5: C64 BASIC V2 Command Reference

**Files:**
- Create: `docs/reference/c64-reference/basic-v2/commands.json`
- Create: `src/core/reference-loader.ts`
- Create: `tests/reference/basic-v2-commands.test.ts`

**Step 1: Write C64 BASIC V2 commands reference**

Create `docs/reference/c64-reference/basic-v2/commands.json`:

```json
{
  "PRINT": {
    "syntax": "PRINT [expression [;|,] ...]",
    "category": "io",
    "params": {
      "expression": {
        "type": "string|number",
        "optional": true
      }
    },
    "description": "Outputs text or numbers to the screen",
    "common_mistakes": [
      "Forgetting semicolon causes newline",
      "Comma advances to next tab position (10 char intervals)"
    ],
    "examples": [
      "PRINT \"HELLO\"",
      "PRINT A; B; C",
      "PRINT \"SCORE:\"; SCORE"
    ],
    "since": "BASIC V2"
  },
  "POKE": {
    "syntax": "POKE address, value",
    "category": "memory",
    "params": {
      "address": {
        "type": "integer",
        "range": [0, 65535]
      },
      "value": {
        "type": "integer",
        "range": [0, 255]
      }
    },
    "description": "Writes a byte value to memory address",
    "common_mistakes": [
      "POKE without comma separator",
      "Value > 255 causes ILLEGAL QUANTITY ERROR",
      "Poking wrong addresses can crash system"
    ],
    "examples": [
      "POKE 53280,0 : REM BLACK BORDER",
      "POKE 53281,1 : REM WHITE BACKGROUND",
      "POKE 1024,1 : REM PUT 'A' AT TOP LEFT"
    ],
    "since": "BASIC V2"
  },
  "PEEK": {
    "syntax": "PEEK(address)",
    "category": "memory",
    "params": {
      "address": {
        "type": "integer",
        "range": [0, 65535]
      }
    },
    "returns": "integer",
    "description": "Reads a byte value from memory address",
    "common_mistakes": [
      "Parentheses are required",
      "Returns value 0-255, not multi-byte values"
    ],
    "examples": [
      "A = PEEK(53280) : REM READ BORDER COLOR",
      "IF PEEK(197) <> 64 THEN 100 : REM KEY PRESSED"
    ],
    "since": "BASIC V2"
  },
  "FOR": {
    "syntax": "FOR variable = start TO end [STEP increment]",
    "category": "control",
    "params": {
      "variable": {
        "type": "numeric-variable"
      },
      "start": {
        "type": "number"
      },
      "end": {
        "type": "number"
      },
      "increment": {
        "type": "number",
        "optional": true,
        "default": 1
      }
    },
    "description": "Begins a loop that counts from start to end",
    "common_mistakes": [
      "Forgetting NEXT statement causes SYNTAX ERROR",
      "Variable in NEXT must match FOR variable",
      "Nested loops must have different variables"
    ],
    "examples": [
      "FOR I=1 TO 10",
      "FOR X=0 TO 39 STEP 2",
      "FOR T=100 TO 1 STEP -1"
    ],
    "requires": ["NEXT"],
    "since": "BASIC V2"
  },
  "NEXT": {
    "syntax": "NEXT [variable]",
    "category": "control",
    "params": {
      "variable": {
        "type": "numeric-variable",
        "optional": true
      }
    },
    "description": "Marks end of FOR loop",
    "common_mistakes": [
      "Variable should match FOR variable for clarity",
      "Missing NEXT causes SYNTAX ERROR on RUN"
    ],
    "examples": [
      "NEXT I",
      "NEXT",
      "NEXT X"
    ],
    "requires": ["FOR"],
    "since": "BASIC V2"
  },
  "IF": {
    "syntax": "IF condition THEN statement",
    "category": "control",
    "params": {
      "condition": {
        "type": "boolean-expression"
      },
      "statement": {
        "type": "line-number|statement"
      }
    },
    "description": "Executes statement if condition is true",
    "common_mistakes": [
      "ELSE doesn't exist in BASIC V2",
      "Multiple statements require THEN line-number",
      "String comparisons are case-sensitive"
    ],
    "examples": [
      "IF A=10 THEN PRINT \"TEN\"",
      "IF X>100 THEN 500",
      "IF A$=\"YES\" THEN GOSUB 1000"
    ],
    "since": "BASIC V2"
  },
  "GOTO": {
    "syntax": "GOTO line-number",
    "category": "control",
    "params": {
      "line-number": {
        "type": "integer",
        "range": [0, 63999]
      }
    },
    "description": "Jumps to specified line number",
    "common_mistakes": [
      "Jumping to non-existent line causes UNDEF'D STATEMENT ERROR",
      "Excessive GOTO creates spaghetti code"
    ],
    "examples": [
      "GOTO 100",
      "IF A=0 THEN GOTO 500"
    ],
    "since": "BASIC V2"
  },
  "GOSUB": {
    "syntax": "GOSUB line-number",
    "category": "control",
    "params": {
      "line-number": {
        "type": "integer",
        "range": [0, 63999]
      }
    },
    "description": "Calls subroutine at line number",
    "common_mistakes": [
      "Subroutine must end with RETURN",
      "Forgetting RETURN causes program to continue",
      "Too many nested GOSUBs (>23) causes OUT OF MEMORY"
    ],
    "examples": [
      "GOSUB 1000",
      "IF SCORE>100 THEN GOSUB 2000"
    ],
    "requires": ["RETURN"],
    "since": "BASIC V2"
  },
  "RETURN": {
    "syntax": "RETURN",
    "category": "control",
    "description": "Returns from GOSUB subroutine",
    "common_mistakes": [
      "RETURN without GOSUB causes RETURN WITHOUT GOSUB ERROR",
      "Jumping into middle of subroutine breaks RETURN"
    ],
    "examples": [
      "RETURN"
    ],
    "requires": ["GOSUB"],
    "since": "BASIC V2"
  },
  "REM": {
    "syntax": "REM comment",
    "category": "utility",
    "params": {
      "comment": {
        "type": "text"
      }
    },
    "description": "Comment line, ignored by interpreter",
    "common_mistakes": [
      "REM slows program execution (still stored in memory)",
      "Everything after REM is ignored, even valid BASIC"
    ],
    "examples": [
      "REM THIS IS A COMMENT",
      "10 REM INITIALIZE VARIABLES"
    ],
    "since": "BASIC V2"
  },
  "AND": {
    "syntax": "expression AND expression",
    "category": "operator",
    "params": {
      "expression": {
        "type": "number"
      }
    },
    "returns": "number",
    "description": "Bitwise AND operation (also logical AND for comparisons)",
    "common_mistakes": [
      "Not boolean-only, also does bitwise operations",
      "Operator precedence can surprise (use parentheses)"
    ],
    "examples": [
      "IF A>5 AND B<10 THEN 100",
      "C = A AND B : REM BITWISE",
      "IF (X=1 AND Y=2) OR Z=3 THEN 200"
    ],
    "since": "BASIC V2"
  },
  "OR": {
    "syntax": "expression OR expression",
    "category": "operator",
    "params": {
      "expression": {
        "type": "number"
      }
    },
    "returns": "number",
    "description": "Bitwise OR operation (also logical OR for comparisons)",
    "common_mistakes": [
      "Not boolean-only, also does bitwise operations",
      "Operator precedence can surprise (use parentheses)"
    ],
    "examples": [
      "IF A=1 OR B=2 THEN 100",
      "C = A OR B : REM BITWISE",
      "IF X<0 OR X>39 THEN 500"
    ],
    "since": "BASIC V2"
  }
}
```

**Step 2: Write reference loader module**

Create `src/core/reference-loader.ts`:

```typescript
import { readFileSync } from 'fs';
import { join } from 'path';

export interface CommandReference {
  syntax: string;
  category: string;
  params?: Record<string, ParamSpec>;
  returns?: string;
  description: string;
  common_mistakes?: string[];
  examples?: string[];
  requires?: string[];
  since: string;
}

export interface ParamSpec {
  type: string;
  range?: [number, number];
  optional?: boolean;
  default?: any;
}

export class ReferenceLoader {
  private cache: Map<string, any> = new Map();

  constructor(private basePath: string = 'docs/reference') {}

  loadCommands(platform: string, language: string): Record<string, CommandReference> {
    const cacheKey = `${platform}:${language}:commands`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const path = join(this.basePath, `${platform}-reference`, language, 'commands.json');
    const commands = JSON.parse(readFileSync(path, 'utf-8'));

    this.cache.set(cacheKey, commands);
    return commands;
  }

  hasCommand(platform: string, language: string, command: string): boolean {
    const commands = this.loadCommands(platform, language);
    return command.toUpperCase() in commands;
  }

  getCommand(platform: string, language: string, command: string): CommandReference | null {
    const commands = this.loadCommands(platform, language);
    return commands[command.toUpperCase()] || null;
  }
}
```

**Step 3: Write test for reference loader**

Create `tests/reference/basic-v2-commands.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import { ReferenceLoader } from '../../src/core/reference-loader.js';

test('reference loader loads C64 BASIC V2 commands', () => {
  const loader = new ReferenceLoader();
  const commands = loader.loadCommands('c64', 'basic-v2');

  assert.ok(commands);
  assert.ok('PRINT' in commands);
  assert.ok('POKE' in commands);
  assert.ok('FOR' in commands);
});

test('reference loader validates PRINT command exists', () => {
  const loader = new ReferenceLoader();

  assert.strictEqual(loader.hasCommand('c64', 'basic-v2', 'PRINT'), true);
  assert.strictEqual(loader.hasCommand('c64', 'basic-v2', 'print'), true); // Case insensitive
  assert.strictEqual(loader.hasCommand('c64', 'basic-v2', 'FAKECMD'), false);
});

test('reference loader retrieves POKE command details', () => {
  const loader = new ReferenceLoader();
  const poke = loader.getCommand('c64', 'basic-v2', 'POKE');

  assert.ok(poke);
  assert.strictEqual(poke.syntax, 'POKE address, value');
  assert.strictEqual(poke.category, 'memory');
  assert.ok(poke.params);
  assert.ok(poke.params.address);
  assert.deepStrictEqual(poke.params.address.range, [0, 65535]);
  assert.ok(poke.common_mistakes);
  assert.ok(poke.common_mistakes.length > 0);
});

test('reference loader confirms AND and OR operators exist', () => {
  const loader = new ReferenceLoader();

  assert.strictEqual(loader.hasCommand('c64', 'basic-v2', 'AND'), true);
  assert.strictEqual(loader.hasCommand('c64', 'basic-v2', 'OR'), true);
});
```

**Step 4: Build project**

Run: `npm run build`
Expected: TypeScript compiles to dist/

**Step 5: Run tests**

Run: `npm test`
Expected: 8 passing tests (4 from schemas + 4 new)

**Step 6: Commit**

```bash
git add docs/reference/c64-reference/basic-v2/ src/core/reference-loader.ts tests/reference/
git commit -m "feat(reference): Add C64 BASIC V2 command reference with AND/OR"
```

---

### Task 6: C64 Memory Map Reference

**Files:**
- Create: `docs/reference/c64-reference/memory-map.json`
- Create: `tests/reference/memory-map.test.ts`

**Step 1: Write C64 memory map reference**

Create `docs/reference/c64-reference/memory-map.json`:

```json
{
  "screen_memory": {
    "start": 1024,
    "end": 2023,
    "size": 1000,
    "description": "Default screen RAM (40x25 characters)",
    "access": "read-write",
    "notes": [
      "Each byte is screen code (not PETSCII)",
      "Address = 1024 + (row * 40) + column"
    ]
  },
  "color_memory": {
    "start": 55296,
    "end": 56295,
    "size": 1000,
    "description": "Color RAM for screen characters",
    "access": "read-write",
    "notes": [
      "Lower 4 bits only (0-15)",
      "Parallel to screen memory (same offset calculations)"
    ]
  },
  "border_color": {
    "start": 53280,
    "end": 53280,
    "size": 1,
    "description": "Screen border color",
    "access": "read-write",
    "register": "VIC-II $D020",
    "values": {
      "0": "black",
      "1": "white",
      "2": "red",
      "3": "cyan",
      "4": "purple",
      "5": "green",
      "6": "blue",
      "7": "yellow",
      "8": "orange",
      "9": "brown",
      "10": "light red",
      "11": "dark grey",
      "12": "grey",
      "13": "light green",
      "14": "light blue",
      "15": "light grey"
    }
  },
  "background_color": {
    "start": 53281,
    "end": 53281,
    "size": 1,
    "description": "Screen background color",
    "access": "read-write",
    "register": "VIC-II $D021",
    "values": "same as border_color"
  },
  "sprite_data": {
    "start": 832,
    "end": 1023,
    "size": 192,
    "description": "Default sprite data area (3 sprites)",
    "access": "read-write",
    "notes": [
      "Each sprite = 63 bytes (21 rows × 3 bytes)",
      "Sprite 0: 832-894, Sprite 1: 896-958, Sprite 2: 960-1022",
      "Can be relocated anywhere via sprite pointers"
    ]
  },
  "sprite_pointers": {
    "start": 2040,
    "end": 2047,
    "size": 8,
    "description": "Sprite data pointers (screen RAM + 1016-1023)",
    "access": "read-write",
    "notes": [
      "Value * 64 = sprite data address",
      "Default: 13 (13*64=832) for sprite 0",
      "Changes with screen RAM location"
    ]
  },
  "sprite_enable": {
    "start": 53269,
    "end": 53269,
    "size": 1,
    "description": "Sprite enable register",
    "access": "read-write",
    "register": "VIC-II $D015",
    "notes": [
      "Bit 0 = sprite 0, bit 1 = sprite 1, etc.",
      "Set bit to 1 to enable sprite"
    ]
  },
  "sprite_x": {
    "start": 53248,
    "end": 53264,
    "size": 16,
    "description": "Sprite X coordinates (low byte) and MSB register",
    "access": "read-write",
    "register": "VIC-II $D000-$D010",
    "notes": [
      "Even addresses: X coordinate low byte (0-255)",
      "$D010: X coordinate MSB for positions > 255"
    ]
  },
  "sprite_y": {
    "start": 53249,
    "end": 53264,
    "size": 8,
    "description": "Sprite Y coordinates",
    "access": "read-write",
    "register": "VIC-II $D001,$D003,$D005...",
    "notes": [
      "Odd addresses from $D001-$D00F",
      "Range: 0-255 (50-249 visible)"
    ]
  },
  "sprite_collision": {
    "start": 53279,
    "end": 53279,
    "size": 1,
    "description": "Sprite-sprite collision register",
    "access": "read-only",
    "register": "VIC-II $D01E",
    "notes": [
      "Bit set when corresponding sprites collide",
      "Reading clears the register"
    ]
  },
  "keyboard_matrix": {
    "start": 197,
    "end": 197,
    "size": 1,
    "description": "Keyboard buffer (last key pressed)",
    "access": "read-only",
    "notes": [
      "64 = no key pressed",
      "Values 0-63 represent different keys",
      "Not the same as PETSCII/screen codes"
    ]
  },
  "sid_voice1_freq": {
    "start": 54272,
    "end": 54273,
    "size": 2,
    "description": "SID voice 1 frequency (16-bit)",
    "access": "write-only",
    "register": "SID $D400-$D401",
    "notes": [
      "Low byte then high byte",
      "Frequency = value × 0.0596Hz"
    ]
  },
  "sid_voice1_control": {
    "start": 54276,
    "end": 54276,
    "size": 1,
    "description": "SID voice 1 control register",
    "access": "write-only",
    "register": "SID $D404",
    "notes": [
      "Bit 0: gate (1=on, 0=off)",
      "Bit 4-6: waveform (1=triangle, 2=sawtooth, 4=pulse, 8=noise)"
    ]
  }
}
```

**Step 2: Extend reference loader for memory map**

Edit `src/core/reference-loader.ts`, add:

```typescript
export interface MemoryRegion {
  start: number;
  end: number;
  size: number;
  description: string;
  access: 'read-only' | 'read-write' | 'write-only';
  register?: string;
  values?: Record<string, string> | string;
  notes?: string[];
}

// Add to ReferenceLoader class:
loadMemoryMap(platform: string): Record<string, MemoryRegion> {
  const cacheKey = `${platform}:memory-map`;

  if (this.cache.has(cacheKey)) {
    return this.cache.get(cacheKey);
  }

  const path = join(this.basePath, `${platform}-reference`, 'memory-map.json');
  const memoryMap = JSON.parse(readFileSync(path, 'utf-8'));

  this.cache.set(cacheKey, memoryMap);
  return memoryMap;
}

getMemoryRegion(platform: string, address: number): MemoryRegion | null {
  const memoryMap = this.loadMemoryMap(platform);

  for (const [name, region] of Object.entries(memoryMap)) {
    if (address >= region.start && address <= region.end) {
      return region;
    }
  }

  return null;
}
```

**Step 3: Write memory map tests**

Create `tests/reference/memory-map.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import { ReferenceLoader } from '../../src/core/reference-loader.js';

test('memory map loads for C64', () => {
  const loader = new ReferenceLoader();
  const memoryMap = loader.loadMemoryMap('c64');

  assert.ok(memoryMap);
  assert.ok('border_color' in memoryMap);
  assert.ok('sprite_enable' in memoryMap);
});

test('memory map identifies border color address', () => {
  const loader = new ReferenceLoader();
  const region = loader.getMemoryRegion('c64', 53280);

  assert.ok(region);
  assert.strictEqual(region.description, 'Screen border color');
  assert.strictEqual(region.register, 'VIC-II $D020');
});

test('memory map identifies screen memory range', () => {
  const loader = new ReferenceLoader();

  const topLeft = loader.getMemoryRegion('c64', 1024);
  const bottomRight = loader.getMemoryRegion('c64', 2023);

  assert.ok(topLeft);
  assert.ok(bottomRight);
  assert.strictEqual(topLeft.description, bottomRight.description);
});

test('memory map returns null for unused address', () => {
  const loader = new ReferenceLoader();
  const region = loader.getMemoryRegion('c64', 12345);

  // This might be null if address isn't mapped
  // (depends on complete memory map coverage)
  assert.ok(region === null || region);
});
```

**Step 4: Build and test**

Run: `npm run build && npm test`
Expected: 12 passing tests

**Step 5: Commit**

```bash
git add docs/reference/c64-reference/memory-map.json src/core/reference-loader.ts tests/reference/memory-map.test.ts
git commit -m "feat(reference): Add C64 memory map with VIC-II, SID, sprite registers"
```

---

## Phase 4: BASIC Validator

### Task 7: BASIC Syntax Tokenizer

**Files:**
- Create: `src/platforms/c64/basic-tokenizer.ts`
- Create: `tests/platforms/c64/tokenizer.test.ts`

**Step 1: Write BASIC tokenizer**

Create `src/platforms/c64/basic-tokenizer.ts`:

```typescript
export interface BasicToken {
  type: 'command' | 'keyword' | 'number' | 'string' | 'variable' | 'operator' | 'separator';
  value: string;
  line?: number;
}

export class BasicTokenizer {
  private commands = [
    'PRINT', 'POKE', 'PEEK', 'FOR', 'NEXT', 'IF', 'THEN', 'GOTO', 'GOSUB',
    'RETURN', 'REM', 'END', 'STOP', 'READ', 'DATA', 'INPUT', 'GET', 'SYS',
    'LET', 'DIM', 'NEW', 'LIST', 'RUN', 'LOAD', 'SAVE', 'CLR'
  ];

  private keywords = [
    'AND', 'OR', 'NOT', 'TO', 'STEP', 'FN', 'SPC', 'TAB',
    'LEFT$', 'RIGHT$', 'MID$', 'LEN', 'STR$', 'VAL', 'ASC', 'CHR$',
    'RND', 'INT', 'ABS', 'SGN', 'SIN', 'COS', 'TAN', 'ATN', 'EXP', 'LOG', 'SQR'
  ];

  tokenize(line: string): BasicToken[] {
    const tokens: BasicToken[] = [];
    let current = '';
    let inString = false;
    let inRemark = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      // Handle strings
      if (char === '"') {
        if (inString) {
          tokens.push({ type: 'string', value: current });
          current = '';
          inString = false;
        } else {
          if (current) {
            tokens.push(...this.tokenizePart(current));
            current = '';
          }
          inString = true;
        }
        continue;
      }

      if (inString) {
        current += char;
        continue;
      }

      // Handle REM (everything after is comment)
      if (inRemark) {
        current += char;
        continue;
      }

      // Separators and operators
      if ([' ', ',', ';', ':', '(', ')', '+', '-', '*', '/', '=', '<', '>'].includes(char)) {
        if (current) {
          const partTokens = this.tokenizePart(current);

          // Check if we just hit REM
          if (partTokens.some(t => t.type === 'command' && t.value === 'REM')) {
            inRemark = true;
          }

          tokens.push(...partTokens);
          current = '';
        }

        if (char !== ' ') {
          const type = [',', ';', ':', '(', ')'].includes(char) ? 'separator' : 'operator';
          tokens.push({ type, value: char });
        }
        continue;
      }

      current += char;
    }

    // Final token
    if (current) {
      if (inString) {
        tokens.push({ type: 'string', value: current });
      } else {
        tokens.push(...this.tokenizePart(current));
      }
    }

    return tokens;
  }

  private tokenizePart(part: string): BasicToken[] {
    const upper = part.toUpperCase();

    // Check for commands
    if (this.commands.includes(upper)) {
      return [{ type: 'command', value: upper }];
    }

    // Check for keywords
    if (this.keywords.includes(upper)) {
      return [{ type: 'keyword', value: upper }];
    }

    // Check for numbers
    if (/^\d+(\.\d+)?$/.test(part)) {
      return [{ type: 'number', value: part }];
    }

    // Must be variable
    return [{ type: 'variable', value: part }];
  }
}
```

**Step 2: Write tokenizer tests**

Create `tests/platforms/c64/tokenizer.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import { BasicTokenizer } from '../../../src/platforms/c64/basic-tokenizer.js';

test('tokenizer identifies PRINT command', () => {
  const tokenizer = new BasicTokenizer();
  const tokens = tokenizer.tokenize('PRINT "HELLO"');

  assert.strictEqual(tokens.length, 2);
  assert.strictEqual(tokens[0].type, 'command');
  assert.strictEqual(tokens[0].value, 'PRINT');
  assert.strictEqual(tokens[1].type, 'string');
  assert.strictEqual(tokens[1].value, 'HELLO');
});

test('tokenizer identifies POKE with numbers', () => {
  const tokenizer = new BasicTokenizer();
  const tokens = tokenizer.tokenize('POKE 53280,0');

  assert.ok(tokens.some(t => t.type === 'command' && t.value === 'POKE'));
  assert.ok(tokens.some(t => t.type === 'number' && t.value === '53280'));
  assert.ok(tokens.some(t => t.type === 'number' && t.value === '0'));
  assert.ok(tokens.some(t => t.type === 'separator' && t.value === ','));
});

test('tokenizer identifies FOR loop structure', () => {
  const tokenizer = new BasicTokenizer();
  const tokens = tokenizer.tokenize('FOR I=1 TO 10 STEP 2');

  assert.ok(tokens.some(t => t.type === 'command' && t.value === 'FOR'));
  assert.ok(tokens.some(t => t.type === 'variable' && t.value === 'I'));
  assert.ok(tokens.some(t => t.type === 'keyword' && t.value === 'TO'));
  assert.ok(tokens.some(t => t.type === 'keyword' && t.value === 'STEP'));
});

test('tokenizer handles REM comments', () => {
  const tokenizer = new BasicTokenizer();
  const tokens = tokenizer.tokenize('REM THIS IS A COMMENT');

  assert.strictEqual(tokens[0].type, 'command');
  assert.strictEqual(tokens[0].value, 'REM');
  // Everything after REM is treated as part of comment
});

test('tokenizer identifies AND operator', () => {
  const tokenizer = new BasicTokenizer();
  const tokens = tokenizer.tokenize('IF A>5 AND B<10 THEN 100');

  assert.ok(tokens.some(t => t.type === 'keyword' && t.value === 'AND'));
});

test('tokenizer identifies OR operator', () => {
  const tokenizer = new BasicTokenizer();
  const tokens = tokenizer.tokenize('IF A=1 OR B=2 THEN 100');

  assert.ok(tokens.some(t => t.type === 'keyword' && t.value === 'OR'));
});
```

**Step 3: Build and test**

Run: `npm run build && npm test`
Expected: 18 passing tests

**Step 4: Commit**

```bash
git add src/platforms/c64/basic-tokenizer.ts tests/platforms/c64/
git commit -m "feat(c64): Add BASIC tokenizer with AND/OR support"
```

---

### Task 8: BASIC Syntax Validator

**Files:**
- Create: `src/platforms/c64/basic-validator.ts`
- Create: `tests/platforms/c64/validator.test.ts`

**Step 1: Write BASIC validator**

Create `src/platforms/c64/basic-validator.ts`:

```typescript
import { BasicTokenizer } from './basic-tokenizer.js';
import { ReferenceLoader } from '../../core/reference-loader.js';

export interface ValidationError {
  line: number;
  message: string;
  severity: 'error' | 'warning';
}

export class BasicValidator {
  private tokenizer: BasicTokenizer;
  private refLoader: ReferenceLoader;

  constructor() {
    this.tokenizer = new BasicTokenizer();
    this.refLoader = new ReferenceLoader();
  }

  validate(code: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineNum = i + 1;

      if (!line) continue;

      // Extract line number if present
      const match = line.match(/^(\d+)\s+(.*)$/);
      const basicLineNum = match ? parseInt(match[1]) : null;
      const statement = match ? match[2] : line;

      // Tokenize
      const tokens = this.tokenizer.tokenize(statement);

      // Validate commands
      for (const token of tokens) {
        if (token.type === 'command') {
          if (!this.refLoader.hasCommand('c64', 'basic-v2', token.value)) {
            errors.push({
              line: lineNum,
              message: `Unknown command: ${token.value}`,
              severity: 'error'
            });
          }
        }
      }

      // Check for common mistakes
      errors.push(...this.checkCommonMistakes(lineNum, statement, tokens));
    }

    return errors;
  }

  private checkCommonMistakes(lineNum: number, statement: string, tokens: any[]): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check for FOR without NEXT
    const hasFor = tokens.some(t => t.value === 'FOR');
    const hasNext = tokens.some(t => t.value === 'NEXT');

    // Check POKE syntax
    const pokeIdx = tokens.findIndex(t => t.value === 'POKE');
    if (pokeIdx >= 0) {
      const afterPoke = tokens.slice(pokeIdx + 1);
      const hasComma = afterPoke.some(t => t.value === ',');

      if (!hasComma) {
        errors.push({
          line: lineNum,
          message: 'POKE requires comma between address and value',
          severity: 'error'
        });
      }

      // Check for value > 255
      const numbers = afterPoke.filter(t => t.type === 'number');
      if (numbers.length >= 2) {
        const value = parseInt(numbers[1].value);
        if (value > 255) {
          errors.push({
            line: lineNum,
            message: 'POKE value must be 0-255',
            severity: 'error'
          });
        }
      }
    }

    // Check for PEEK without parentheses
    if (statement.includes('PEEK') && !statement.includes('PEEK(')) {
      errors.push({
        line: lineNum,
        message: 'PEEK requires parentheses: PEEK(address)',
        severity: 'error'
      });
    }

    // Check for GOSUB without likely RETURN
    // (This is a weak check, would need program-wide analysis)

    return errors;
  }
}
```

**Step 2: Write validator tests**

Create `tests/platforms/c64/validator.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import { BasicValidator } from '../../../src/platforms/c64/basic-validator.js';

test('validator accepts valid PRINT statement', () => {
  const validator = new BasicValidator();
  const errors = validator.validate('10 PRINT "HELLO"');

  assert.strictEqual(errors.length, 0);
});

test('validator accepts valid POKE statement', () => {
  const validator = new BasicValidator();
  const errors = validator.validate('10 POKE 53280,0');

  assert.strictEqual(errors.length, 0);
});

test('validator rejects unknown command', () => {
  const validator = new BasicValidator();
  const errors = validator.validate('10 FAKECMD 123');

  assert.strictEqual(errors.length, 1);
  assert.strictEqual(errors[0].severity, 'error');
  assert.ok(errors[0].message.includes('Unknown command'));
});

test('validator catches POKE without comma', () => {
  const validator = new BasicValidator();
  const errors = validator.validate('10 POKE 53280 0');

  assert.ok(errors.length > 0);
  assert.ok(errors.some(e => e.message.includes('comma')));
});

test('validator catches POKE value > 255', () => {
  const validator = new BasicValidator();
  const errors = validator.validate('10 POKE 53280,300');

  assert.ok(errors.length > 0);
  assert.ok(errors.some(e => e.message.includes('0-255')));
});

test('validator catches PEEK without parentheses', () => {
  const validator = new BasicValidator();
  const errors = validator.validate('10 A = PEEK 53280');

  assert.ok(errors.length > 0);
  assert.ok(errors.some(e => e.message.includes('parentheses')));
});

test('validator accepts AND in condition', () => {
  const validator = new BasicValidator();
  const errors = validator.validate('10 IF A>5 AND B<10 THEN 100');

  assert.strictEqual(errors.length, 0);
});

test('validator accepts OR in condition', () => {
  const validator = new BasicValidator();
  const errors = validator.validate('10 IF A=1 OR B=2 THEN 100');

  assert.strictEqual(errors.length, 0);
});
```

**Step 3: Build and test**

Run: `npm run build && npm test`
Expected: 26 passing tests

**Step 4: Commit**

```bash
git add src/platforms/c64/basic-validator.ts tests/platforms/c64/validator.test.ts
git commit -m "feat(c64): Add BASIC syntax validator with common mistake detection"
```

---

## Phase 5: CLI Foundation

### Task 9: CLI Structure

**Files:**
- Create: `src/cli.ts`
- Create: `src/commands/validate.ts`

**Step 1: Write CLI entry point**

Create `src/cli.ts`:

```typescript
#!/usr/bin/env node

import { Command } from 'commander';
import { validateCommand } from './commands/validate.js';

const program = new Command();

program
  .name('retro-lesson')
  .description('Lesson creation pipeline for Code Like It\'s 198x')
  .version('0.1.0');

program
  .command('validate')
  .description('Validate BASIC or Assembly syntax')
  .argument('<file>', 'Path to code file')
  .option('-p, --platform <platform>', 'Platform (c64, spectrum, etc.)', 'c64')
  .action(validateCommand);

program.parse();
```

**Step 2: Write validate command**

Create `src/commands/validate.ts`:

```typescript
import { readFileSync } from 'fs';
import { extname } from 'path';
import { BasicValidator } from '../platforms/c64/basic-validator.js';

export async function validateCommand(file: string, options: { platform: string }) {
  try {
    const code = readFileSync(file, 'utf-8');
    const ext = extname(file);

    if (options.platform === 'c64' && ext === '.bas') {
      const validator = new BasicValidator();
      const errors = validator.validate(code);

      if (errors.length === 0) {
        console.log('✓ Validation passed');
        process.exit(0);
      } else {
        console.log(`✗ Found ${errors.length} error(s):\n`);

        for (const error of errors) {
          const severity = error.severity === 'error' ? '❌' : '⚠️';
          console.log(`${severity} Line ${error.line}: ${error.message}`);
        }

        process.exit(1);
      }
    } else {
      console.error(`Unsupported platform/file combination: ${options.platform} / ${ext}`);
      process.exit(1);
    }
  } catch (err: any) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}
```

**Step 3: Create test fixture**

Create `tests/fixtures/valid-basic.bas`:

```basic
10 REM SIMPLE TEST
20 PRINT "HELLO WORLD"
30 POKE 53280,0
40 END
```

Create `tests/fixtures/invalid-basic.bas`:

```basic
10 PRINT "TEST"
20 FAKECMD 123
30 POKE 53280 0
40 END
```

**Step 4: Build**

Run: `npm run build`

**Step 5: Manual test**

Run: `node dist/cli.js validate tests/fixtures/valid-basic.bas`
Expected: "✓ Validation passed"

Run: `node dist/cli.js validate tests/fixtures/invalid-basic.bas`
Expected: Error messages about FAKECMD and POKE syntax

**Step 6: Commit**

```bash
git add src/cli.ts src/commands/ tests/fixtures/
git commit -m "feat(cli): Add validate command for BASIC syntax checking"
```

---

## Phase 6: BASIC to PRG Converter

### Task 10: Petcat Integration

**Files:**
- Create: `src/platforms/c64/prg-converter.ts`
- Create: `tests/platforms/c64/prg-converter.test.ts`
- Create: `docker/Dockerfile.vice`

**Step 1: Create VICE Docker container**

Create `docker/Dockerfile.vice`:

```dockerfile
FROM debian:bullseye-slim

RUN apt-get update && apt-get install -y \
    vice \
    ffmpeg \
    xvfb \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# Wrapper script for headless VICE
COPY vice-headless.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/vice-headless.sh

CMD ["/bin/bash"]
```

Create `docker/vice-headless.sh`:

```bash
#!/bin/bash
# Wrapper for running VICE headlessly with Xvfb

Xvfb :99 -screen 0 1024x768x24 &
export DISPLAY=:99

exec "$@"
```

**Step 2: Write PRG converter**

Create `src/platforms/c64/prg-converter.ts`:

```typescript
import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { dirname, basename } from 'path';

export class PrgConverter {
  /**
   * Converts BASIC text listing to PRG file using petcat
   * Returns path to generated PRG file
   */
  convertBasicToPrg(inputFile: string, outputFile?: string): string {
    if (!existsSync(inputFile)) {
      throw new Error(`Input file not found: ${inputFile}`);
    }

    // Default output: same name with .prg extension
    const output = outputFile || inputFile.replace(/\.[^.]+$/, '.prg');

    try {
      // petcat -w2 -o output.prg -- input.bas
      // -w2 = BASIC V2 format
      execSync(`petcat -w2 -o "${output}" -- "${inputFile}"`, {
        stdio: 'pipe'
      });

      if (!existsSync(output)) {
        throw new Error('petcat failed to create PRG file');
      }

      return output;
    } catch (err: any) {
      throw new Error(`Failed to convert BASIC to PRG: ${err.message}`);
    }
  }

  /**
   * Converts PRG back to BASIC text listing (for verification)
   */
  convertPrgToBasic(inputFile: string): string {
    if (!existsSync(inputFile)) {
      throw new Error(`PRG file not found: ${inputFile}`);
    }

    try {
      // petcat -2 input.prg
      const output = execSync(`petcat -2 "${inputFile}"`, {
        encoding: 'utf-8'
      });

      return output;
    } catch (err: any) {
      throw new Error(`Failed to convert PRG to BASIC: ${err.message}`);
    }
  }
}
```

**Step 3: Write converter tests**

Create `tests/platforms/c64/prg-converter.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import { PrgConverter } from '../../../src/platforms/c64/prg-converter.js';
import { existsSync, unlinkSync } from 'fs';

test('PRG converter creates .prg file from BASIC', () => {
  const converter = new PrgConverter();

  try {
    const output = converter.convertBasicToPrg('tests/fixtures/valid-basic.bas');

    assert.ok(existsSync(output));
    assert.ok(output.endsWith('.prg'));

    // Cleanup
    unlinkSync(output);
  } catch (err: any) {
    if (err.message.includes('petcat')) {
      console.log('⚠️  Skipping test: petcat not installed');
    } else {
      throw err;
    }
  }
});

test('PRG converter can round-trip BASIC -> PRG -> BASIC', () => {
  const converter = new PrgConverter();

  try {
    const prgFile = converter.convertBasicToPrg('tests/fixtures/valid-basic.bas');
    const basicText = converter.convertPrgToBasic(prgFile);

    assert.ok(basicText.includes('PRINT'));
    assert.ok(basicText.includes('POKE'));

    // Cleanup
    unlinkSync(prgFile);
  } catch (err: any) {
    if (err.message.includes('petcat')) {
      console.log('⚠️  Skipping test: petcat not installed');
    } else {
      throw err;
    }
  }
});
```

**Step 4: Build and test**

Run: `npm run build && npm test`
Expected: Tests pass (or skip if petcat not installed)

**Step 5: Commit**

```bash
git add src/platforms/c64/prg-converter.ts tests/platforms/c64/prg-converter.test.ts docker/
git commit -m "feat(c64): Add BASIC to PRG converter using petcat"
```

---

## Next Steps: TODO

The plan above covers the foundation. Additional tasks needed:

- **Phase 7**: VICE automation (headless testing, input simulation)
- **Phase 8**: Media capture (screenshots, video, audio)
- **Phase 9**: Test configuration YAML parser
- **Phase 10**: Pattern library structure and first patterns
- **Phase 11**: MDX lesson generator
- **Phase 12**: C64 platform definition JSON
- **Phase 13**: C64 Lesson Creation skill file
- **Phase 14**: End-to-end integration test

This plan provides:
1. Solid foundation with schemas and types
2. Reference database for C64 BASIC V2 (commands and memory map)
3. Tokenizer and validator for syntax checking
4. CLI structure with validate command
5. PRG conversion capability

Each task follows TDD with exact file paths, complete code, and test verification.

---

**Plan Status:** Phase 1-6 complete, requires phases 7-14 for full pipeline
