#!/usr/bin/env node

import { Command } from 'commander';
import { validateCommand } from './commands/validate.js';
import { registerCaptureCommand } from './commands/capture.js';

const program = new Command();

program
  .name('retro-lesson')
  .description('Lesson creation pipeline for Code Like It\'s 198x')
  .version('0.1.0');

program
  .command('validate')
  .description('Validate BASIC or Assembly syntax')
  .argument('<file>', 'Path to code file')
  .option('-p, --platform <platform>', 'Platform (c64, spectrum, etc.)', 'c64')
  .action(validateCommand);

// Register capture command
registerCaptureCommand(program);

program.parse();
