import { test } from 'node:test';
import assert from 'node:assert';
import { InputSimulator } from '../../dist/core/input-simulator.js';

test('input simulator adds keyboard events', () => {
  const sim = new InputSimulator();
  sim.addKeyPress(1000, 'SPACE');

  const events = sim.getAllEvents();
  assert.strictEqual(events.length, 1);
  assert.strictEqual(events[0].device, 'keyboard');
  assert.strictEqual(events[0].key, 'SPACE');
});

test('input simulator adds joystick events', () => {
  const sim = new InputSimulator();
  sim.addJoystickAction(2000, 2, 'FIRE');

  const events = sim.getAllEvents();
  assert.strictEqual(events.length, 1);
  assert.strictEqual(events[0].device, 'joystick');
  assert.strictEqual(events[0].action, 'FIRE');
});

test('input simulator converts to VICE commands', () => {
  const sim = new InputSimulator();
  sim.addKeyPress(1000, 'SPACE');
  sim.addJoystickAction(2000, 2, 'UP');

  const commands = sim.toViceCommands();
  assert.strictEqual(commands.length, 2);
  assert.ok(commands[0].includes('keybuf'));
  assert.ok(commands[1].includes('joystick'));
});
