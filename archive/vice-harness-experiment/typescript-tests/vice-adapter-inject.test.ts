import { test } from 'node:test';
import assert from 'node:assert';
import { VICEAdapter } from '../../dist/harness/vice-adapter.js';
import { EmulatorConnectionError } from '../../dist/harness/errors.js';

/**
 * Integration tests for VICE adapter keyboard input injection
 *
 * Requires VICE running with remote monitor:
 * x64sc -remotemonitor -monport 6510
 */

test('VICEAdapter.injectKeys() returns false when not connected', async () => {
  const adapter = new VICEAdapter({ port: 6510 });

  const result = await adapter.injectKeys('RUN\n');
  assert.strictEqual(result, false, 'Should return false when not connected');
});

test('VICEAdapter.injectKeys() sends simple text', async () => {
  const adapter = new VICEAdapter({ port: 6510 });

  try {
    await adapter.connect();
    const result = await adapter.injectKeys('HELLO');
    assert.strictEqual(result, true, 'Should return true on success');
    await adapter.disconnect();
  } catch (error) {
    if (error instanceof EmulatorConnectionError) {
      console.log('⚠️  Skipping test: VICE not running on port 6510');
      return;
    }
    throw error;
  }
});

test('VICEAdapter.injectKeys() handles RETURN key (\\n)', async () => {
  const adapter = new VICEAdapter({ port: 6510 });

  try {
    await adapter.connect();
    const result = await adapter.injectKeys('RUN\n');
    assert.strictEqual(result, true, 'Should return true on success');
    await adapter.disconnect();
  } catch (error) {
    if (error instanceof EmulatorConnectionError) {
      console.log('⚠️  Skipping test: VICE not running on port 6510');
      return;
    }
    throw error;
  }
});

test('VICEAdapter.injectKeys() handles multiple lines', async () => {
  const adapter = new VICEAdapter({ port: 6510 });

  try {
    await adapter.connect();
    const result = await adapter.injectKeys('10 PRINT "HELLO"\n20 END\nRUN\n');
    assert.strictEqual(result, true, 'Should return true on success');
    await adapter.disconnect();
  } catch (error) {
    if (error instanceof EmulatorConnectionError) {
      console.log('⚠️  Skipping test: VICE not running on port 6510');
      return;
    }
    throw error;
  }
});
