import { test } from 'node:test';
import assert from 'node:assert';
import { VICEAdapter } from '../../dist/harness/vice-adapter.js';
import { EmulatorConnectionError } from '../../dist/harness/errors.js';

/**
 * Integration tests for VICE adapter text detection
 *
 * Requires VICE running with remote monitor:
 * x64sc -remotemonitor -monport 6510
 */

test('VICEAdapter.waitForText() returns false when not connected', async () => {
  const adapter = new VICEAdapter({ port: 6510 });

  const result = await adapter.waitForText('READY', { timeout: 1000 });
  assert.strictEqual(result, false, 'Should return false when not connected');
});

test('VICEAdapter.waitForText() finds READY prompt after connection', async () => {
  const adapter = new VICEAdapter({ port: 6510 });

  try {
    await adapter.connect();

    // C64 should show "READY." prompt on startup
    const result = await adapter.waitForText('READY', { timeout: 5000 });
    assert.strictEqual(result, true, 'Should find READY prompt on C64 screen');

    await adapter.disconnect();
  } catch (error) {
    if (error instanceof EmulatorConnectionError) {
      console.log('⚠️  Skipping test: VICE not running on port 6510');
      return;
    }
    throw error;
  }
});

test('VICEAdapter.waitForText() returns false on timeout for missing text', async () => {
  const adapter = new VICEAdapter({ port: 6510 });

  try {
    await adapter.connect();

    // This text should NOT exist on the screen
    const result = await adapter.waitForText('NONEXISTENT_TEXT_12345', { timeout: 2000 });
    assert.strictEqual(result, false, 'Should return false when text not found');

    await adapter.disconnect();
  } catch (error) {
    if (error instanceof EmulatorConnectionError) {
      console.log('⚠️  Skipping test: VICE not running on port 6510');
      return;
    }
    throw error;
  }
});

test('VICEAdapter.waitForText() handles case-insensitive search', async () => {
  const adapter = new VICEAdapter({ port: 6510 });

  try {
    await adapter.connect();

    // Search for "ready" (lowercase) with case-insensitive flag
    const result = await adapter.waitForText('ready', {
      timeout: 5000,
      caseSensitive: false
    });
    assert.strictEqual(result, true, 'Should find text case-insensitively');

    await adapter.disconnect();
  } catch (error) {
    if (error instanceof EmulatorConnectionError) {
      console.log('⚠️  Skipping test: VICE not running on port 6510');
      return;
    }
    throw error;
  }
});

test('VICEAdapter.waitForText() finds text after typing', async () => {
  const adapter = new VICEAdapter({ port: 6510 });

  try {
    await adapter.connect();

    // Type text onto the screen
    await adapter.injectKeys('HELLO WORLD');

    // Wait for it to appear
    const result = await adapter.waitForText('HELLO WORLD', { timeout: 5000 });
    assert.strictEqual(result, true, 'Should find typed text on screen');

    await adapter.disconnect();
  } catch (error) {
    if (error instanceof EmulatorConnectionError) {
      console.log('⚠️  Skipping test: VICE not running on port 6510');
      return;
    }
    throw error;
  }
});
