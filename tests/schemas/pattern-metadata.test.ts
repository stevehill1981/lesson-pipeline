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
    dependencies: [],
    code: '10 PRINT "TEST"',
    teaching_notes: 'test',
    wow_factor: 10, // Invalid: must be 1-5
    line_count: 1
  };

  const validate = ajv.compile(schema);
  const valid = validate(invalidPattern);

  assert.strictEqual(valid, false);
});

test('pattern metadata schema requires all mandatory fields', () => {
  const ajv = new Ajv();
  const schema = JSON.parse(
    readFileSync('schemas/pattern-metadata.schema.json', 'utf-8')
  );

  const incompletePattern = {
    id: 'test',
    week: 1,
    concept: 'test'
    // Missing required fields: dependencies, code, teaching_notes, wow_factor, line_count
  };

  const validate = ajv.compile(schema);
  const valid = validate(incompletePattern);

  assert.strictEqual(valid, false);
  assert.ok(validate.errors && validate.errors.length > 0);
});

test('pattern metadata schema accepts minimal valid pattern', () => {
  const ajv = new Ajv();
  const schema = JSON.parse(
    readFileSync('schemas/pattern-metadata.schema.json', 'utf-8')
  );

  const minimalPattern = {
    id: 'hello-world',
    week: 1,
    concept: 'basic-output',
    dependencies: [],
    code: '10 PRINT "HELLO WORLD"',
    teaching_notes: 'First program - displays text on screen',
    wow_factor: 1,
    line_count: 1
  };

  const validate = ajv.compile(schema);
  const valid = validate(minimalPattern);

  assert.strictEqual(valid, true, `Validation failed: ${JSON.stringify(validate.errors)}`);
});

test('pattern metadata schema validates memory_used as array of integers', () => {
  const ajv = new Ajv();
  const schema = JSON.parse(
    readFileSync('schemas/pattern-metadata.schema.json', 'utf-8')
  );

  const patternWithMemory = {
    id: 'border-color',
    week: 1,
    concept: 'memory-manipulation',
    dependencies: [],
    code: '10 POKE 53280,0',
    teaching_notes: 'Changes border color using POKE',
    wow_factor: 2,
    line_count: 1,
    memory_used: [53280]
  };

  const validate = ajv.compile(schema);
  const valid = validate(patternWithMemory);

  assert.strictEqual(valid, true, `Validation failed: ${JSON.stringify(validate.errors)}`);
});

test('pattern metadata schema rejects memory address outside valid range', () => {
  const ajv = new Ajv();
  const schema = JSON.parse(
    readFileSync('schemas/pattern-metadata.schema.json', 'utf-8')
  );

  const invalidPattern = {
    id: 'test',
    week: 1,
    concept: 'test',
    dependencies: [],
    code: '10 PRINT "TEST"',
    teaching_notes: 'test',
    wow_factor: 1,
    line_count: 1,
    memory_used: [70000] // Invalid: > 65535
  };

  const validate = ajv.compile(schema);
  const valid = validate(invalidPattern);

  assert.strictEqual(valid, false);
});

test('pattern metadata schema validates optimization_level enum', () => {
  const ajv = new Ajv();
  const schema = JSON.parse(
    readFileSync('schemas/pattern-metadata.schema.json', 'utf-8')
  );

  const validLevels = ['clear', 'efficient', 'professional'];

  for (const level of validLevels) {
    const pattern = {
      id: `test-${level}`,
      week: 1,
      concept: 'test',
      dependencies: [],
      code: '10 PRINT "TEST"',
      teaching_notes: 'test',
      wow_factor: 1,
      line_count: 1,
      optimization_level: level
    };

    const validate = ajv.compile(schema);
    const valid = validate(pattern);

    assert.strictEqual(valid, true, `Validation failed for level ${level}: ${JSON.stringify(validate.errors)}`);
  }
});

test('pattern metadata schema rejects invalid optimization_level', () => {
  const ajv = new Ajv();
  const schema = JSON.parse(
    readFileSync('schemas/pattern-metadata.schema.json', 'utf-8')
  );

  const invalidPattern = {
    id: 'test',
    week: 1,
    concept: 'test',
    dependencies: [],
    code: '10 PRINT "TEST"',
    teaching_notes: 'test',
    wow_factor: 1,
    line_count: 1,
    optimization_level: 'super-advanced' // Invalid: not in enum
  };

  const validate = ajv.compile(schema);
  const valid = validate(invalidPattern);

  assert.strictEqual(valid, false);
});
