import { test } from 'node:test';
import assert from 'node:assert';
import { VICEAdapter } from '../../dist/harness/vice-adapter.js';

test('VICEAdapter returns correct name', () => {
  const adapter = new VICEAdapter({ port: 6510 });

  assert.strictEqual(adapter.name(), 'VICE');
});

test('VICEAdapter returns correct platform', () => {
  const adapter = new VICEAdapter({ port: 6510 });

  assert.strictEqual(adapter.platform(), 'c64');
});

test('VICEAdapter declares supported capabilities', () => {
  const adapter = new VICEAdapter({ port: 6510 });
  const caps = adapter.capabilities();

  assert.ok(caps.includes('load_program'));
  assert.ok(caps.includes('inject_keys'));
  assert.ok(caps.includes('wait_for_text'));
  assert.ok(caps.includes('read_memory'));
  assert.ok(caps.includes('reset'));
});

test('VICEAdapter.supports() returns true for supported capability', () => {
  const adapter = new VICEAdapter({ port: 6510 });

  assert.strictEqual(adapter.supports('load_program'), true);
  assert.strictEqual(adapter.supports('inject_keys'), true);
});

test('VICEAdapter.supports() returns false for unsupported capability', () => {
  const adapter = new VICEAdapter({ port: 6510 });

  assert.strictEqual(adapter.supports('inject_joystick'), false);
});
