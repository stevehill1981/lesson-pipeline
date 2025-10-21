import { test } from 'node:test';
import assert from 'node:assert';
import { writeFileSync, unlinkSync, mkdirSync } from 'fs';
import { VICEAdapter } from '../../dist/harness/vice-adapter.js';
import { EmulatorConnectionError } from '../../dist/harness/errors.js';

/**
 * Integration tests for VICE adapter program loading
 *
 * These tests require VICE to be running with remote monitor:
 * x64sc -remotemonitor -monport 6510
 */

const TEST_PRG_DIR = './test-prgs';
const TEST_PRG_PATH = `${TEST_PRG_DIR}/test.prg`;

test('VICEAdapter.loadProgram() loads PRG file', async () => {
  // Create a minimal PRG file (load address 0x0801 + simple BASIC program)
  mkdirSync(TEST_PRG_DIR, { recursive: true });
  const prgData = Buffer.from([
    0x01, 0x08,  // Load address: $0801 (BASIC start)
    0x0b, 0x08,  // Next line pointer
    0x0a, 0x00,  // Line number 10
    0x9e,        // SYS token
    0x32, 0x30, 0x36, 0x31,  // "2061" in ASCII
    0x00,        // End of line
    0x00, 0x00   // End of program
  ]);
  writeFileSync(TEST_PRG_PATH, prgData);

  const adapter = new VICEAdapter({ port: 6510 });

  try {
    await adapter.connect();
    const result = await adapter.loadProgram(TEST_PRG_PATH);
    assert.strictEqual(result, true, 'loadProgram should return true on success');
    await adapter.disconnect();
  } catch (error) {
    if (error instanceof EmulatorConnectionError) {
      console.log('⚠️  Skipping test: VICE not running on port 6510');
      return;
    }
    throw error;
  } finally {
    unlinkSync(TEST_PRG_PATH);
  }
});

test('VICEAdapter.loadProgram() returns false for nonexistent file without requiring connection', async () => {
  const adapter = new VICEAdapter({ port: 6510 });

  // Don't connect - just test that file existence is checked
  const result = await adapter.loadProgram('/nonexistent/file.prg');
  assert.strictEqual(result, false, 'loadProgram should return false for missing file');
});

test('VICEAdapter.loadProgram() returns false for nonexistent file when connected', async () => {
  const adapter = new VICEAdapter({ port: 6510 });

  try {
    await adapter.connect();
    const result = await adapter.loadProgram('/nonexistent/file.prg');
    assert.strictEqual(result, false, 'loadProgram should return false for missing file');
    await adapter.disconnect();
  } catch (error) {
    if (error instanceof EmulatorConnectionError) {
      console.log('⚠️  Skipping test: VICE not running on port 6510');
      return;
    }
    throw error;
  }
});
