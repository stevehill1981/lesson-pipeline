import { test } from 'node:test';
import assert from 'node:assert';
import { ViceController } from '../../dist/core/vice-controller.js';

test('VICE controller initializes with config', () => {
  const controller = new ViceController({
    executable: 'x64sc',
    headless: true
  });

  assert.ok(controller);
});

test('VICE controller returns error for missing PRG', async () => {
  const controller = new ViceController({
    executable: 'x64sc',
    headless: true
  });

  const result = await controller.runProgram('nonexistent.prg', 1000);

  assert.strictEqual(result.success, false);
  assert.ok(result.error);
  assert.ok(result.error.includes('not found'));
});
