#!/usr/bin/env node

/**
 * Batch capture screenshots for all code samples
 *
 * For each .bas file, captures:
 * - Screenshot at 5s (early execution)
 * - Screenshot at 15s (later execution)
 *
 * Usage: node dist/scripts/batch-capture.js <code-samples-dir> <output-dir>
 */

import * as fs from 'fs';
import * as path from 'path';
import { TestOrchestrator, OrchestratorOptions } from '../core/test-orchestrator.js';
import { TestConfiguration } from '../core/test-config-parser.js';

interface CaptureJob {
  basFile: string;
  phase: number;
  tier: number;
  lesson: number;
  exampleNumber: number | null;
}

function findAllBasFiles(baseDir: string): CaptureJob[] {
  const jobs: CaptureJob[] = [];

  // Walk phase-N/tier-N/lesson-NNN directories
  const phasePattern = /^phase-(\d+)$/;
  const tierPattern = /^tier-(\d+)$/;
  const lessonPattern = /^lesson-(\d+)$/;

  if (!fs.existsSync(baseDir)) {
    console.error(`Base directory not found: ${baseDir}`);
    return jobs;
  }

  // Find phase directories
  const phaseDirs = fs.readdirSync(baseDir)
    .filter(d => phasePattern.test(d))
    .map(d => ({
      name: d,
      number: parseInt(d.match(phasePattern)![1])
    }));

  for (const phase of phaseDirs) {
    const phaseDir = path.join(baseDir, phase.name);

    // Find tier directories
    const tierDirs = fs.readdirSync(phaseDir)
      .filter(d => tierPattern.test(d))
      .map(d => ({
        name: d,
        number: parseInt(d.match(tierPattern)![1])
      }));

    for (const tier of tierDirs) {
      const tierDir = path.join(phaseDir, tier.name);

      // Find lesson directories
      const lessonDirs = fs.readdirSync(tierDir)
        .filter(d => lessonPattern.test(d))
        .map(d => ({
          name: d,
          number: parseInt(d.match(lessonPattern)![1])
        }));

      for (const lesson of lessonDirs) {
        const lessonDir = path.join(tierDir, lesson.name);

        // Find all .bas files
        const basFiles = fs.readdirSync(lessonDir)
          .filter(f => f.endsWith('.bas'));

        for (const basFile of basFiles) {
          const fullPath = path.join(lessonDir, basFile);

          // Extract example number from filename (e.g., "example-2.bas" -> 2)
          const exampleMatch = basFile.match(/example-(\d+)\.bas$/);
          const exampleNumber = exampleMatch ? parseInt(exampleMatch[1]) : null;

          jobs.push({
            basFile: fullPath,
            phase: phase.number,
            tier: tier.number,
            lesson: lesson.number,
            exampleNumber
          });
        }
      }
    }
  }

  return jobs;
}

function generateInputResponse(basContent: string): string | undefined {
  // Check if program has INPUT statement
  const inputMatch = basContent.match(/INPUT\s+([A-Z$]+)/i);
  if (!inputMatch) {
    return undefined;
  }

  // Look for clues in PRINT statements before the INPUT
  const printBeforeInput = basContent.match(/PRINT\s+"([^"]+)"/i);

  // Generate appropriate response based on context
  if (printBeforeInput) {
    const question = printBeforeInput[1].toLowerCase();

    // Math questions
    if (question.includes('2+2') || question.includes('2 + 2')) {
      return '4\n';
    }
    if (question.includes('what') && question.includes('name')) {
      return 'PLAYER\n';
    }
    if (question.includes('age') || question.includes('old')) {
      return '25\n';
    }
    if (question.includes('score') || question.includes('points')) {
      return '100\n';
    }
  }

  // Default: return a simple number
  return '1\n';
}

async function captureJob(job: CaptureJob, outputDir: string, verbose: boolean): Promise<void> {
  const { basFile, phase, tier, lesson, exampleNumber } = job;

  // Read the BASIC file to check for INPUT statements
  const basContent = fs.readFileSync(basFile, 'utf-8');
  const inputResponse = generateInputResponse(basContent);

  // Determine output subdirectory
  const lessonOutputDir = path.join(
    outputDir,
    `c64/phase-${phase}/tier-${tier}/lesson-${String(lesson).padStart(3, '0')}`
  );

  // Create filename prefix based on example number
  const prefix = exampleNumber ? `example-${exampleNumber}` : 'main';

  // Create test configuration
  const config: TestConfiguration = {
    platform: 'c64',
    phase,
    tier,
    lesson,
    title: `Phase ${phase} Tier ${tier} Lesson ${lesson}${exampleNumber ? ` Example ${exampleNumber}` : ''}`,
    program: {
      type: 'basic',
      file: basFile
    },
    execution: {
      duration: 20,
      autoRun: true,
      keybuf: inputResponse  // Auto-inject keyboard input if needed
    },
    captures: {
      screenshots: [
        {
          name: `${prefix}-capture`,
          time: 3,
          description: 'Program execution capture'
        }
      ]
    }
  };

  // Run orchestrator
  const options: OrchestratorOptions = {
    outputDir: lessonOutputDir,
    display: ':99',
    verbose,
    skipVideo: true  // Skip video for batch processing
  };

  try {
    const orchestrator = new TestOrchestrator(config, options);
    const result = await orchestrator.execute();

    if (!result.success) {
      console.error(`  ✗ Failed: ${result.errors?.join(', ')}`);
    }
  } catch (error: any) {
    console.error(`  ✗ Exception: ${error.message}`);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node dist/scripts/batch-capture.js <code-samples-dir> <output-dir>');
    console.error('Example: node dist/scripts/batch-capture.js /Users/stevehill/Projects/Code198x/code-samples/commodore-64 /Users/stevehill/Projects/Code198x/website/public/images');
    process.exit(1);
  }

  const codeSamplesDir = args[0];
  const outputDir = args[1];
  const verbose = args.includes('-v') || args.includes('--verbose');

  console.log('🔍 Finding all BASIC files...\n');
  const jobs = findAllBasFiles(codeSamplesDir);

  console.log(`📚 Found ${jobs.length} BASIC files to capture\n`);

  if (jobs.length === 0) {
    console.error('No BASIC files found!');
    process.exit(1);
  }

  let completed = 0;
  let failed = 0;

  for (const job of jobs) {
    const baseName = path.basename(job.basFile);
    console.log(`\n[${completed + 1}/${jobs.length}] Processing: Phase ${job.phase} Tier ${job.tier} Lesson ${job.lesson} - ${baseName}`);

    try {
      await captureJob(job, outputDir, verbose);
      completed++;
    } catch (error: any) {
      console.error(`  ✗ Fatal error: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`✨ Batch capture complete!`);
  console.log(`   ✅ Completed: ${completed}`);
  if (failed > 0) {
    console.log(`   ✗ Failed: ${failed}`);
  }
  console.log(`${'='.repeat(50)}\n`);
}

main();
