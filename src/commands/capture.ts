import { Command } from 'commander';
import { TestConfigParser } from '../core/test-config-parser';
import { TestOrchestrator } from '../core/test-orchestrator';
import { existsSync } from 'fs';

export function registerCaptureCommand(program: Command): void {
  program
    .command('capture <config>')
    .description('Run VICE emulator and capture screenshots/video from a test configuration')
    .option('-o, --output-dir <path>', 'Output directory for media files', './output')
    .option('-d, --display <display>', 'X display for Xvfb (e.g., :99)', ':99')
    .option('-v, --verbose', 'Show detailed execution logs')
    .option('--skip-video', 'Skip video capture (screenshots only)')
    .option('--skip-screenshots', 'Skip screenshots (video only)')
    .action(async (configPath: string, options) => {
      try {
        // Validate config file exists
        if (!existsSync(configPath)) {
          console.error(`❌ Error: Config file not found: ${configPath}`);
          process.exit(1);
        }

        // Parse configuration
        const parser = new TestConfigParser();
        const config = parser.parse(configPath);

        if (options.verbose) {
          console.log(`\n📋 Test Configuration`);
          console.log(`   Platform: ${config.platform}`);
          console.log(`   Phase: ${config.phase}, Tier: ${config.tier}, Lesson: ${config.lesson}`);
          console.log(`   Title: ${config.title || 'N/A'}`);
          console.log(`   Program: ${config.program.file}`);
          console.log(`   Type: ${config.program.type}`);
        }

        // Create orchestrator
        const orchestrator = new TestOrchestrator(config, {
          outputDir: options.outputDir,
          display: options.display,
          verbose: options.verbose,
          skipVideo: options.skipVideo,
          skipScreenshots: options.skipScreenshots
        });

        // Execute capture workflow
        const result = await orchestrator.execute();

        // Display results
        console.log(`\n${'='.repeat(50)}`);
        if (result.success) {
          console.log(`✅ Capture Complete!\n`);

          if (result.screenshots.length > 0) {
            console.log(`📸 Screenshots (${result.screenshots.length}):`);
            result.screenshots.forEach(s => {
              console.log(`   • ${s.name} (at ${s.time}s)`);
              console.log(`     ${s.path}`);
            });
          }

          if (result.video) {
            console.log(`\n🎥 Video:`);
            console.log(`   • execution (${result.video.duration}s)`);
            console.log(`     ${result.video.path}`);
          }

          console.log(`\n📁 Output directory:`);
          console.log(`   ${parser.getOutputDir(config, options.outputDir)}`);

          console.log(`\n🌐 MDX relative path:`);
          console.log(`   ${parser.getRelativePath(config)}`);

        } else {
          console.log(`❌ Capture Failed\n`);
          if (result.errors && result.errors.length > 0) {
            console.log(`Errors:`);
            result.errors.forEach(err => console.log(`  • ${err}`));
          }
        }
        console.log(`${'='.repeat(50)}\n`);

        // Exit with appropriate code
        process.exit(result.success ? 0 : 1);

      } catch (error: any) {
        console.error(`\n❌ Fatal Error: ${error.message}`);
        if (options.verbose && error.stack) {
          console.error(error.stack);
        }
        process.exit(1);
      }
    });
}
