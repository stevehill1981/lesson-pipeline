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
