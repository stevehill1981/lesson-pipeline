#!/usr/bin/env node

/**
 * Extracts code blocks from validated lesson MDX files and saves them
 * as individual .bas files in the code-samples directory.
 *
 * Usage: node dist/scripts/extract-code-samples.js <output-dir>
 */

import * as fs from 'fs';
import * as path from 'path';

interface CodeBlock {
  content: string;
  index: number;
}

function extractCodeBlocks(content: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  const regex = /```(?:basic|bas|BASIC)\n([\s\S]*?)```/g;
  let match;
  let index = 1;

  while ((match = regex.exec(content)) !== null) {
    blocks.push({
      content: match[1].trim(),
      index: index++
    });
  }

  return blocks;
}

function extractLessonNumber(filePath: string): number | null {
  const match = filePath.match(/lesson-(\d+)\.mdx$/);
  return match ? parseInt(match[1], 10) : null;
}

function extractWeekNumber(filePath: string): number | null {
  const match = filePath.match(/week-(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

function processLesson(lessonPath: string, outputBaseDir: string): void {
  const lessonNumber = extractLessonNumber(lessonPath);
  const weekNumber = extractWeekNumber(lessonPath);

  if (!lessonNumber || !weekNumber) {
    console.warn(`⚠️  Could not extract lesson/week number from ${lessonPath}`);
    return;
  }

  // Read the MDX file
  const content = fs.readFileSync(lessonPath, 'utf-8');

  // Extract code blocks
  const blocks = extractCodeBlocks(content);

  if (blocks.length === 0) {
    console.log(`📝 Lesson ${lessonNumber}: No code blocks found`);
    return;
  }

  // Create output directory
  const outputDir = path.join(
    outputBaseDir,
    `week-${weekNumber}`,
    `lesson-${String(lessonNumber).padStart(2, '0')}`
  );

  // Remove existing directory if it exists
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true });
  }

  fs.mkdirSync(outputDir, { recursive: true });

  // Write each code block to a file
  blocks.forEach(block => {
    const filename = blocks.length === 1
      ? 'main.bas'
      : `example-${block.index}.bas`;
    const filePath = path.join(outputDir, filename);

    fs.writeFileSync(filePath, block.content + '\n', 'utf-8');
  });

  console.log(`✅ Lesson ${lessonNumber}: Extracted ${blocks.length} code block(s)`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error('Usage: node dist/scripts/extract-code-samples.js <output-dir>');
    console.error('Example: node dist/scripts/extract-code-samples.js /Users/stevehill/Projects/Code198x/code-samples/commodore-64/basic');
    process.exit(1);
  }

  const outputDir = args[0];

  // Find all lesson MDX files
  const lessonFiles: string[] = [];

  for (let week = 1; week <= 8; week++) {
    const weekDir = path.join(
      '/Users/stevehill/Projects/Code198x/website/src/pages/commodore-64/basic',
      `week-${week}`
    );

    if (!fs.existsSync(weekDir)) {
      console.warn(`⚠️  Week ${week} directory not found: ${weekDir}`);
      continue;
    }

    const files = fs.readdirSync(weekDir);
    const lessonPattern = /^lesson-\d+\.mdx$/;

    files
      .filter(f => lessonPattern.test(f))
      .forEach(f => lessonFiles.push(path.join(weekDir, f)));
  }

  console.log(`\n📚 Found ${lessonFiles.length} lesson files\n`);

  // Process each lesson
  let totalBlocks = 0;
  lessonFiles.forEach(lessonPath => {
    const content = fs.readFileSync(lessonPath, 'utf-8');
    const blocks = extractCodeBlocks(content);
    totalBlocks += blocks.length;
    processLesson(lessonPath, outputDir);
  });

  console.log(`\n✨ Complete! Extracted ${totalBlocks} code blocks from ${lessonFiles.length} lessons\n`);
}

main();
