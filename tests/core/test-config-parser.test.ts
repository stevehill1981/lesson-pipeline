import { test } from 'node:test';
import assert from 'node:assert';
import { TestConfigParser } from '../../dist/core/test-config-parser.js';

test('test config parser loads YAML file', () => {
  const parser = new TestConfigParser();
  const config = parser.parse('tests/fixtures/test-config.yaml');

  assert.strictEqual(config.platform, 'c64');
  assert.strictEqual(config.program, 'lesson-18.bas');
  assert.strictEqual(config.runtime, '30s');
});

test('test config parser validates required fields', () => {
  const parser = new TestConfigParser();

  assert.throws(() => {
    parser.parse('tests/fixtures/invalid-config.yaml');
  }, /Missing required fields/);
});

test('test config parser converts time strings', () => {
  const parser = new TestConfigParser();

  assert.strictEqual(parser.parseTimeToMs('5s'), 5000);
  assert.strictEqual(parser.parseTimeToMs('30s'), 30000);
});
