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
    let code = match[1].trim();

    // Remove NEW command if present (not needed in .bas files)
    code = code.replace(/^NEW\n/i, '');
    code = code.replace(/^NEW$/im, '');

    // Skip blocks that are just comments or non-executable
    if (code && !code.match(/^REM/i)) {
      blocks.push({
        content: code,
        index: index++
      });
    }
  }

  return blocks;
}

function extractLessonNumber(filePath: string): number | null {
  const match = filePath.match(/lesson-(\d+)\.mdx$/);
  return match ? parseInt(match[1], 10) : null;
}

function extractTierNumber(filePath: string): number | null {
  const match = filePath.match(/tier-(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

function extractPhaseNumber(filePath: string): number | null {
  const match = filePath.match(/phase-(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

function processLesson(lessonPath: string, outputBaseDir: string): void {
  const lessonNumber = extractLessonNumber(lessonPath);
  const tierNumber = extractTierNumber(lessonPath);
  const phaseNumber = extractPhaseNumber(lessonPath);

  if (!lessonNumber || !tierNumber || phaseNumber === null) {
    console.warn(`⚠️  Could not extract lesson/tier/phase number from ${lessonPath}`);
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

  // Create output directory: phase-N/tier-N/lesson-NNN
  const outputDir = path.join(
    outputBaseDir,
    `phase-${phaseNumber}`,
    `tier-${tierNumber}`,
    `lesson-${String(lessonNumber).padStart(3, '0')}`
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
    console.error('Example: node dist/scripts/extract-code-samples.js /Users/stevehill/Projects/Code198x/code-samples/commodore-64');
    process.exit(1);
  }

  const outputDir = args[0];

  // Find all lesson MDX files in phase-0/tier-* directories
  const lessonFiles: string[] = [];
  const baseDir = '/Users/stevehill/Projects/Code198x/website/src/pages/commodore-64/phase-0';

  for (let tier = 1; tier <= 4; tier++) {
    const tierDir = path.join(baseDir, `tier-${tier}`);

    if (!fs.existsSync(tierDir)) {
      console.warn(`⚠️  Tier ${tier} directory not found: ${tierDir}`);
      continue;
    }

    const files = fs.readdirSync(tierDir);
    const lessonPattern = /^lesson-\d+\.mdx$/;

    files
      .filter(f => lessonPattern.test(f))
      .forEach(f => lessonFiles.push(path.join(tierDir, f)));
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
