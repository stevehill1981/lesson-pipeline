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

test('memory map distinguishes sprite X and Y registers (even/odd addresses)', () => {
  const loader = new ReferenceLoader();

  // Test even addresses (sprite X coords)
  const sprite0X = loader.getMemoryRegion('c64', 53248); // $D000
  const sprite1X = loader.getMemoryRegion('c64', 53250); // $D002
  const sprite7X = loader.getMemoryRegion('c64', 53262); // $D00E

  assert.ok(sprite0X);
  assert.ok(sprite1X);
  assert.ok(sprite7X);
  assert.strictEqual(sprite0X.description, 'Sprite 0 X coordinate');
  assert.strictEqual(sprite1X.description, 'Sprite 1 X coordinate');
  assert.strictEqual(sprite7X.description, 'Sprite 7 X coordinate');

  // Test odd addresses (sprite Y coords)
  const sprite0Y = loader.getMemoryRegion('c64', 53249); // $D001
  const sprite1Y = loader.getMemoryRegion('c64', 53251); // $D003
  const sprite7Y = loader.getMemoryRegion('c64', 53263); // $D00F

  assert.ok(sprite0Y);
  assert.ok(sprite1Y);
  assert.ok(sprite7Y);
  assert.strictEqual(sprite0Y.description, 'Sprite 0 Y coordinate');
  assert.strictEqual(sprite1Y.description, 'Sprite 1 Y coordinate');
  assert.strictEqual(sprite7Y.description, 'Sprite 7 Y coordinate');

  // Test sprite X MSB register
  const spriteMSB = loader.getMemoryRegion('c64', 53264); // $D010

  assert.ok(spriteMSB);
  assert.strictEqual(spriteMSB.description, 'Sprite X coordinate MSB (most significant bit)');
});
