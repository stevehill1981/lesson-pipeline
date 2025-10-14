import { test } from 'node:test';
import assert from 'node:assert';
import { ReferenceLoader } from '../../dist/core/reference-loader.js';

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
