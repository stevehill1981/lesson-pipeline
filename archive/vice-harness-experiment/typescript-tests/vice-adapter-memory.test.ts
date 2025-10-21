import { test } from 'node:test';
import assert from 'node:assert';
import { VICEAdapter } from '../../dist/harness/vice-adapter.js';
import { EmulatorConnectionError } from '../../dist/harness/errors.js';

/**
 * Tests for VICE adapter memory reading
 *
 * Requires VICE running with remote monitor:
 * x64sc -remotemonitor -monport 6510
 */

test('VICEAdapter.readMemory() returns empty array when not connected', async () => {
  const adapter = new VICEAdapter({ port: 6510 });

  const result = await adapter.readMemory(0x0400, 16);
  assert.deepStrictEqual(result, [], 'Should return empty array when not connected');
});

test('VICEAdapter.readMemory() reads screen RAM', async () => {
  const adapter = new VICEAdapter({ port: 6510 });

  try {
    await adapter.connect();

    // Read first 40 bytes of screen RAM (first line)
    const bytes = await adapter.readMemory(0x0400, 40);

    assert.ok(bytes.length > 0, 'Should read some bytes');
    assert.ok(bytes.length <= 40, 'Should not read more than requested');
    assert.ok(bytes.every(b => b >= 0 && b <= 255), 'All bytes should be valid (0-255)');

    await adapter.disconnect();
  } catch (error) {
    if (error instanceof EmulatorConnectionError) {
      console.log('⚠️  Skipping test: VICE not running on port 6510');
      return;
    }
    throw error;
  }
});

test('VICEAdapter.readMemory() reads correct range', async () => {
  const adapter = new VICEAdapter({ port: 6510 });

  try {
    await adapter.connect();

    // Read 10 bytes starting at screen RAM
    const bytes = await adapter.readMemory(0x0400, 10);

    assert.strictEqual(bytes.length, 10, 'Should read exactly 10 bytes');

    await adapter.disconnect();
  } catch (error) {
    if (error instanceof EmulatorConnectionError) {
      console.log('⚠️  Skipping test: VICE not running on port 6510');
      return;
    }
    throw error;
  }
});

test('VICEAdapter.readMemory() can read from different addresses', async () => {
  const adapter = new VICEAdapter({ port: 6510 });

  try {
    await adapter.connect();

    // Read from border color register
    const borderColor = await adapter.readMemory(0xD020, 1);
    assert.strictEqual(borderColor.length, 1, 'Should read 1 byte');
    assert.ok(borderColor[0] >= 0 && borderColor[0] <= 15, 'Border color should be 0-15');

    // Read from background color register
    const backgroundColor = await adapter.readMemory(0xD021, 1);
    assert.strictEqual(backgroundColor.length, 1, 'Should read 1 byte');
    assert.ok(backgroundColor[0] >= 0 && backgroundColor[0] <= 15, 'Background color should be 0-15');

    await adapter.disconnect();
  } catch (error) {
    if (error instanceof EmulatorConnectionError) {
      console.log('⚠️  Skipping test: VICE not running on port 6510');
      return;
    }
    throw error;
  }
});
