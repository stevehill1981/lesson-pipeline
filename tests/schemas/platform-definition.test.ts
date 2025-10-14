import { test } from 'node:test';
import assert from 'node:assert';
import Ajv from 'ajv';
import { readFileSync } from 'fs';
import type { PlatformDefinition } from '../../src/core/types.js';

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

test('schema rejects invalid platform ID with uppercase', () => {
  const ajv = new Ajv();
  const schema = JSON.parse(
    readFileSync('schemas/platform-definition.schema.json', 'utf-8')
  );

  const invalidPlatform = {
    id: 'C64',  // Uppercase - should be 'c64'
    name: 'Commodore 64',
    languages: [
      {
        id: 'basic-v2',
        name: 'BASIC V2',
        validator: 'basic-v2-validator',
        file_extension: '.bas'
      }
    ],
    emulator: {
      name: 'VICE',
      command: 'x64sc'
    }
  };

  const validate = ajv.compile(schema);
  const valid = validate(invalidPlatform);

  assert.strictEqual(valid, false);
  assert.ok(validate.errors?.some(err => err.instancePath === '/id'));
});

test('schema rejects invalid file extension without dot', () => {
  const ajv = new Ajv();
  const schema = JSON.parse(
    readFileSync('schemas/platform-definition.schema.json', 'utf-8')
  );

  const invalidPlatform = {
    id: 'c64',
    name: 'Commodore 64',
    languages: [
      {
        id: 'basic-v2',
        name: 'BASIC V2',
        validator: 'basic-v2-validator',
        file_extension: 'bas'  // Missing dot - should be '.bas'
      }
    ],
    emulator: {
      name: 'VICE',
      command: 'x64sc'
    }
  };

  const validate = ajv.compile(schema);
  const valid = validate(invalidPlatform);

  assert.strictEqual(valid, false);
  assert.ok(validate.errors?.some(err => err.instancePath === '/languages/0/file_extension'));
});

test('schema rejects invalid time limit format', () => {
  const ajv = new Ajv();
  const schema = JSON.parse(
    readFileSync('schemas/platform-definition.schema.json', 'utf-8')
  );

  const invalidPlatform1 = {
    id: 'c64',
    name: 'Commodore 64',
    languages: [
      {
        id: 'basic-v2',
        name: 'BASIC V2',
        validator: 'basic-v2-validator',
        file_extension: '.bas'
      }
    ],
    emulator: {
      name: 'VICE',
      command: 'x64sc'
    },
    lesson_time_limits: {
      'basic-v2': '15min'  // Invalid - should be '15-20min'
    }
  };

  const validate1 = ajv.compile(schema);
  const valid1 = validate1(invalidPlatform1);
  assert.strictEqual(valid1, false);

  const invalidPlatform2 = {
    id: 'c64',
    name: 'Commodore 64',
    languages: [
      {
        id: 'basic-v2',
        name: 'BASIC V2',
        validator: 'basic-v2-validator',
        file_extension: '.bas'
      }
    ],
    emulator: {
      name: 'VICE',
      command: 'x64sc'
    },
    lesson_time_limits: {
      'basic-v2': '15-20'  // Invalid - missing 'min'
    }
  };

  const validate2 = ajv.compile(schema);
  const valid2 = validate2(invalidPlatform2);
  assert.strictEqual(valid2, false);
});

test('schema accepts platform with multiple languages', () => {
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
        file_extension: '.bas'
      },
      {
        id: 'asm-6502',
        name: '6502 Assembly',
        validator: 'asm-6502-validator',
        compiler: 'acme',
        file_extension: '.asm'
      }
    ],
    emulator: {
      name: 'VICE',
      command: 'x64sc'
    }
  };

  const validate = ajv.compile(schema);
  const valid = validate(validPlatform);

  assert.strictEqual(valid, true, `Validation failed: ${JSON.stringify(validate.errors)}`);
});

test('schema accepts minimal platform without optional fields', () => {
  const ajv = new Ajv();
  const schema = JSON.parse(
    readFileSync('schemas/platform-definition.schema.json', 'utf-8')
  );

  const minimalPlatform = {
    id: 'spectrum',
    name: 'ZX Spectrum',
    languages: [
      {
        id: 'sinclair-basic',
        name: 'Sinclair BASIC',
        validator: 'sinclair-basic-validator',
        file_extension: '.bas'
      }
    ],
    emulator: {
      name: 'Fuse',
      command: 'fuse'
    }
  };

  const validate = ajv.compile(schema);
  const valid = validate(minimalPlatform);

  assert.strictEqual(valid, true, `Validation failed: ${JSON.stringify(validate.errors)}`);
});

test('TypeScript PlatformDefinition matches JSON Schema', () => {
  const ajv = new Ajv();
  const schema = JSON.parse(
    readFileSync('schemas/platform-definition.schema.json', 'utf-8')
  );

  const typedPlatform: PlatformDefinition = {
    id: 'amiga',
    name: 'Commodore Amiga',
    languages: [
      {
        id: 'amos',
        name: 'AMOS BASIC',
        validator: 'amos-validator',
        compiler: 'amosc',
        file_extension: '.amos',
        reference_docs: 'amiga-reference/amos/'
      },
      {
        id: 'asm-68k',
        name: '68000 Assembly',
        validator: 'asm-68k-validator',
        compiler: 'vasm',
        file_extension: '.s'
      }
    ],
    emulator: {
      name: 'FS-UAE',
      command: 'fs-uae',
      headless_flag: '--headless',
      controller: 'amiga-automation'
    },
    lesson_time_limits: {
      'amos': '20-30min',
      'asm-68k': '30-45min'
    }
  };

  const validate = ajv.compile(schema);
  const valid = validate(typedPlatform);

  assert.strictEqual(valid, true, `TypeScript type doesn't match schema: ${JSON.stringify(validate.errors)}`);
});
