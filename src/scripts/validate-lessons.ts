#!/usr/bin/env node
/**
 * Validate C64 BASIC code blocks in lesson MDX files
 */

import { readFileSync } from 'fs';
import { BasicValidator } from '../platforms/c64/basic-validator.js';

interface ValidationResult {
  lesson: string;
  codeBlocks: number;
  errors: Array<{
    blockIndex: number;
    errors: Array<{ line: number; message: string }>;
  }>;
}

/**
 * Extract code blocks from MDX content
 * Only extracts blocks explicitly marked as 'basic', 'bas', or 'BASIC'
 */
function extractCodeBlocks(content: string): string[] {
  const blocks: string[] = [];
  const regex = /```(?:basic|bas|BASIC)\n([\s\S]*?)```/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    blocks.push(match[1].trim());
  }

  return blocks;
}

/**
 * Validate a single lesson file
 */
function validateLesson(lessonPath: string): ValidationResult {
  const content = readFileSync(lessonPath, 'utf-8');
  const codeBlocks = extractCodeBlocks(content);
  const validator = new BasicValidator();

  const result: ValidationResult = {
    lesson: lessonPath,
    codeBlocks: codeBlocks.length,
    errors: []
  };

  codeBlocks.forEach((code, index) => {
    const errors = validator.validate(code);
    if (errors.length > 0) {
      result.errors.push({
        blockIndex: index + 1,
        errors: errors
      });
    }
  });

  return result;
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: validate-lessons.ts <lesson-file.mdx> [<lesson-file2.mdx> ...]');
    console.error('       validate-lessons.ts --week <week-dir>');
    process.exit(1);
  }

  const lessonPaths = args;
  const results: ValidationResult[] = [];

  for (const lessonPath of lessonPaths) {
    try {
      const result = validateLesson(lessonPath);
      results.push(result);
    } catch (error) {
      console.error(`Failed to validate ${lessonPath}:`, error);
    }
  }

  // Report results
  let totalLessons = 0;
  let totalBlocks = 0;
  let lessonsWithErrors = 0;
  let totalErrors = 0;

  console.log('\n=== C64 BASIC Lesson Validation Report ===\n');

  for (const result of results) {
    totalLessons++;
    totalBlocks += result.codeBlocks;

    if (result.errors.length > 0) {
      lessonsWithErrors++;
      const lessonName = result.lesson.split('/').slice(-1)[0];
      console.log(`❌ ${lessonName} (${result.codeBlocks} code blocks)`);

      for (const blockError of result.errors) {
        totalErrors += blockError.errors.length;
        console.log(`   Block ${blockError.blockIndex}:`);
        for (const error of blockError.errors) {
          console.log(`     Line ${error.line}: ${error.message}`);
        }
      }
      console.log();
    } else {
      const lessonName = result.lesson.split('/').slice(-1)[0];
      console.log(`✅ ${lessonName} (${result.codeBlocks} code blocks)`);
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Total lessons: ${totalLessons}`);
  console.log(`Total code blocks: ${totalBlocks}`);
  console.log(`Lessons with errors: ${lessonsWithErrors}`);
  console.log(`Total validation errors: ${totalErrors}`);

  if (lessonsWithErrors > 0) {
    console.log(`\n⚠️  ${lessonsWithErrors} lesson(s) have validation errors`);
    process.exit(1);
  } else {
    console.log('\n✅ All lessons validated successfully!');
  }
}

main();
