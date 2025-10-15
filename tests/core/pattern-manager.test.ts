import { test } from 'node:test';
import assert from 'node:assert';
import { PatternManager } from '../../dist/core/pattern-manager.js';

test('pattern manager loads pattern by ID', () => {
  const manager = new PatternManager();
  const pattern = manager.loadPattern('c64', 'basic', 'hello-world');

  assert.strictEqual(pattern.id, 'hello-world');
  assert.strictEqual(pattern.week, 1);
  assert.strictEqual(pattern.concept, 'print-statement');
});

test('pattern manager lists patterns for week', () => {
  const manager = new PatternManager();
  const patterns = manager.listPatterns('c64', 'basic', 1);

  assert.ok(patterns.length > 0);
  assert.ok(patterns.includes('hello-world'));
});

test('pattern manager resolves pattern code', () => {
  const manager = new PatternManager();
  const pattern = manager.loadPattern('c64', 'basic', 'hello-world');
  const code = manager.resolvePattern(pattern);

  assert.ok(code.includes('PRINT'));
  assert.ok(code.includes('HELLO, WORLD!'));
});
