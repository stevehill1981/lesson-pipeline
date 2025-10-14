import { test } from 'node:test';
import assert from 'node:assert';
import { ReferenceLoader } from '../../dist/core/reference-loader.js';

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

test('reference loader throws meaningful error for non-existent platform', () => {
  const loader = new ReferenceLoader();

  assert.throws(
    () => loader.loadCommands('invalid-platform', 'basic-v2'),
    (error: Error) => {
      assert.ok(error.message.includes('Reference file not found'));
      assert.ok(error.message.includes('Platform: invalid-platform'));
      assert.ok(error.message.includes('Language: basic-v2'));
      return true;
    }
  );
});

test('reference loader throws meaningful error for non-existent language', () => {
  const loader = new ReferenceLoader();

  assert.throws(
    () => loader.loadCommands('c64', 'invalid-language'),
    (error: Error) => {
      assert.ok(error.message.includes('Reference file not found'));
      assert.ok(error.message.includes('Platform: c64'));
      assert.ok(error.message.includes('Language: invalid-language'));
      return true;
    }
  );
});
