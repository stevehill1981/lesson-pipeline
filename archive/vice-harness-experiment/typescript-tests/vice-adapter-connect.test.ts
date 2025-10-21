import { test } from 'node:test';
import assert from 'node:assert';
import { VICEAdapter } from '../../dist/harness/vice-adapter.js';
import { EmulatorConnectionError } from '../../dist/harness/errors.js';

/**
 * Integration tests for VICE adapter connection
 *
 * These tests require VICE to be running with remote monitor:
 * x64sc -remotemonitor -monport 6510
 *
 * Tests will be skipped if VICE is not available
 */

test('VICEAdapter.connect() establishes TCP connection', async () => {
  const adapter = new VICEAdapter({ port: 6510 });

  try {
    await adapter.connect();
    assert.ok(await adapter.alive(), 'Connection should be alive after connect');
    await adapter.disconnect();
  } catch (error) {
    if (error instanceof EmulatorConnectionError) {
      console.log('⚠️  Skipping test: VICE not running on port 6510');
      return;
    }
    throw error;
  }
});

test('VICEAdapter.connect() throws EmulatorConnectionError on invalid port', async () => {
  const adapter = new VICEAdapter({ port: 9999 }); // Port unlikely to have VICE

  await assert.rejects(
    async () => await adapter.connect(),
    EmulatorConnectionError,
    'Should throw EmulatorConnectionError'
  );
});

test('VICEAdapter.alive() returns false when not connected', async () => {
  const adapter = new VICEAdapter({ port: 6510 });

  assert.strictEqual(await adapter.alive(), false);
});

test('VICEAdapter.alive() returns false after disconnect', async () => {
  const adapter = new VICEAdapter({ port: 6510 });

  try {
    await adapter.connect();
    await adapter.disconnect();
    assert.strictEqual(await adapter.alive(), false);
  } catch (error) {
    if (error instanceof EmulatorConnectionError) {
      console.log('⚠️  Skipping test: VICE not running on port 6510');
      return;
    }
    throw error;
  }
});
