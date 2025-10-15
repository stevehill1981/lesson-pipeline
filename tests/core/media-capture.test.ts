import { test } from 'node:test';
import assert from 'node:assert';
import { MediaCapture } from '../../dist/core/media-capture.js';
import { existsSync, rmSync } from 'fs';

test('media capture initializes with config', () => {
  const capture = new MediaCapture({
    outputDir: './test-output'
  });

  assert.ok(capture);
  assert.ok(existsSync('./test-output'));

  // Cleanup
  rmSync('./test-output', { recursive: true });
});

test('media capture creates nested directories', () => {
  const capture = new MediaCapture({
    outputDir: './test-output/nested/path'
  });

  assert.ok(existsSync('./test-output/nested/path'));

  // Cleanup
  rmSync('./test-output', { recursive: true });
});
