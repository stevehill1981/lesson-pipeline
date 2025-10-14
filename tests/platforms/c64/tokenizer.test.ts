import { test } from 'node:test';
import assert from 'node:assert';
import { BasicTokenizer } from '../../../dist/platforms/c64/basic-tokenizer.js';

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
