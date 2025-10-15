import { test } from 'node:test';
import assert from 'node:assert';
import { BasicValidator } from '../../dist/platforms/c64/basic-validator.js';
import { PrgConverter } from '../../dist/platforms/c64/prg-converter.js';
import { PatternManager } from '../../dist/core/pattern-manager.js';
import { LessonGenerator } from '../../dist/core/lesson-generator.js';
import { writeFileSync, unlinkSync, existsSync } from 'fs';

test('end-to-end: validate → convert → generate lesson', async () => {
  // Step 1: Load pattern
  const patternManager = new PatternManager();
  const pattern = patternManager.loadPattern('c64', 'basic', 'hello-world');

  assert.ok(pattern);
  assert.ok(pattern.code);

  // Step 2: Validate
  const validator = new BasicValidator();
  const errors = validator.validate(pattern.code);

  assert.strictEqual(errors.length, 0, 'Pattern should have no validation errors');

  // Step 3: Convert to PRG
  const tempBas = 'test-temp.bas';
  writeFileSync(tempBas, pattern.code);

  try {
    const converter = new PrgConverter();
    const prgPath = converter.convertBasicToPrg(tempBas);

    assert.ok(existsSync(prgPath), 'PRG file should be created');

    // Cleanup PRG
    unlinkSync(prgPath);
  } catch (err: any) {
    if (err.message.includes('petcat')) {
      console.log('⚠️  Skipping PRG conversion: petcat not installed');
    } else {
      throw err;
    }
  }

  // Cleanup temp file
  unlinkSync(tempBas);

  // Step 4: Generate lesson MDX
  const generator = new LessonGenerator();
  const mdx = generator.generateMDX({
    title: 'Hello World',
    system: 'C64',
    course: 'Commodore 64 BASIC',
    lessonNumber: 1,
    totalLessons: 64
  }, [{
    title: 'Basic Example',
    code: pattern.code,
    explanation: pattern.teaching_notes
  }]);

  assert.ok(mdx.includes('Hello World'));
  assert.ok(mdx.includes(pattern.code));
  assert.ok(mdx.includes(pattern.teaching_notes));
});
