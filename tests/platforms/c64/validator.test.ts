import { test } from 'node:test';
import assert from 'node:assert';
import { BasicValidator } from '../../../dist/platforms/c64/basic-validator.js';

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
