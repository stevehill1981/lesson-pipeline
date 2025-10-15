import { test } from 'node:test';
import assert from 'node:assert';
import { LessonGenerator } from '../../dist/core/lesson-generator.js';

test('lesson generator creates MDX with frontmatter', () => {
  const generator = new LessonGenerator();
  const mdx = generator.generateMDX({
    title: 'Hello World',
    system: 'C64',
    course: 'Commodore 64 BASIC',
    lessonNumber: 1,
    totalLessons: 64
  }, []);

  assert.ok(mdx.includes('---'));
  assert.ok(mdx.includes('title: "Hello World"'));
  assert.ok(mdx.includes('lessonNumber: 1'));
});

test('lesson generator includes code examples', () => {
  const generator = new LessonGenerator();
  const mdx = generator.generateMDX({
    title: 'Test Lesson',
    system: 'C64',
    course: 'BASIC',
    lessonNumber: 1,
    totalLessons: 64
  }, [{
    title: 'Example 1',
    code: '10 PRINT "TEST"',
    explanation: 'This prints TEST'
  }]);

  assert.ok(mdx.includes('```basic'));
  assert.ok(mdx.includes('10 PRINT "TEST"'));
  assert.ok(mdx.includes('This prints TEST'));
});

test('lesson generator includes image references', () => {
  const generator = new LessonGenerator();
  const mdx = generator.generateMDX({
    title: 'Test',
    system: 'C64',
    course: 'BASIC',
    lessonNumber: 1,
    totalLessons: 64
  }, [{
    title: 'Example',
    code: '10 PRINT "TEST"',
    explanation: 'Test',
    imagePath: '/images/test.png'
  }]);

  assert.ok(mdx.includes('![Screenshot](/images/test.png)'));
});
