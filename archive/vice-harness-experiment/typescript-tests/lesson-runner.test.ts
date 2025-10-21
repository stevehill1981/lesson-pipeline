import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'fs';
import { parse as parseYAML } from 'yaml';
import { LessonRunner } from '../../dist/harness/lesson-runner.js';
import { VICEAdapter } from '../../dist/harness/vice-adapter.js';
import type { Lesson } from '../../dist/harness/lesson-schema.js';

test('LessonRunner parses lesson YAML', () => {
  const yamlContent = readFileSync('tests/fixtures/test-lesson.yaml', 'utf-8');
  const lesson: Lesson = parseYAML(yamlContent);

  assert.strictEqual(lesson.title, 'Test Lesson - Hello World');
  assert.strictEqual(lesson.type, 'basic');
  assert.strictEqual(lesson.target_platform, 'c64');
});

test('LessonRunner validates required capabilities', () => {
  const yamlContent = readFileSync('tests/fixtures/test-lesson.yaml', 'utf-8');
  const lesson: Lesson = parseYAML(yamlContent);
  const adapter = new VICEAdapter({ port: 6510 });

  const runner = new LessonRunner(adapter);
  const missingCaps = runner.checkCapabilities(lesson);

  assert.deepStrictEqual(missingCaps, [], 'VICE adapter should have all required capabilities');
});

test('LessonRunner.checkCapabilities() detects missing capabilities', () => {
  const lesson: Lesson = {
    title: 'Test',
    type: 'basic',
    difficulty: 'beginner',
    target_platform: 'c64',
    requires_capabilities: ['inject_joystick'], // VICE doesn't support this
    program: { path: 'test.prg' },
    execution: [],
    verification: []
  };

  const adapter = new VICEAdapter({ port: 6510 });
  const runner = new LessonRunner(adapter);
  const missingCaps = runner.checkCapabilities(lesson);

  assert.deepStrictEqual(missingCaps, ['inject_joystick']);
});

test('LessonRunner skips lesson with missing capabilities', async () => {
  const lesson: Lesson = {
    title: 'Test',
    type: 'basic',
    difficulty: 'beginner',
    target_platform: 'c64',
    requires_capabilities: ['inject_joystick'],
    program: { path: 'test.prg' },
    execution: [],
    verification: []
  };

  const adapter = new VICEAdapter({ port: 6510 });
  const runner = new LessonRunner(adapter);
  const result = await runner.runLesson(lesson);

  assert.strictEqual(result.status, 'skipped');
  assert.ok(result.reason?.includes('inject_joystick'));
});

test('LessonRunner.runLesson() returns error when adapter not connected', async () => {
  const lesson: Lesson = {
    title: 'Test',
    type: 'basic',
    difficulty: 'beginner',
    target_platform: 'c64',
    program: { path: 'test.prg' },
    execution: [
      { action: 'load_program', program: 'test.prg' }
    ],
    verification: []
  };

  const adapter = new VICEAdapter({ port: 9999 }); // Port with no VICE
  const runner = new LessonRunner(adapter);
  const result = await runner.runLesson(lesson);

  assert.strictEqual(result.status, 'error');
});
