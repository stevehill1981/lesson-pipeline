import { TestConfiguration, TestConfigParser } from './test-config-parser.js';
import { ViceRunner } from '../platforms/c64/vice-runner.js';
import { MediaCapture } from './media-capture.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { mkdirSync, existsSync } from 'fs';

const execAsync = promisify(exec);

export interface CaptureResult {
  screenshots: Array<{
    name: string;
    path: string;
    time: number;
  }>;
  video?: {
    path: string;
    duration: number;
  };
  success: boolean;
  errors?: string[];
}

export interface OrchestratorOptions {
  outputDir?: string;
  display?: string;
  verbose?: boolean;
  skipVideo?: boolean;
  skipScreenshots?: boolean;
}

export class TestOrchestrator {
  private config: TestConfiguration;
  private options: OrchestratorOptions;
  private parser: TestConfigParser;
  private xvfbProcess?: any;

  constructor(config: TestConfiguration, options: OrchestratorOptions = {}) {
    this.config = config;
    this.options = {
      outputDir: './output',
      display: ':99',
      verbose: false,
      skipVideo: false,
      skipScreenshots: false,
      ...options
    };
    this.parser = new TestConfigParser();
  }

  /**
   * Execute the full test workflow: start VICE, capture media, cleanup
   */
  async execute(): Promise<CaptureResult> {
    const result: CaptureResult = {
      screenshots: [],
      success: false,
      errors: []
    };

    try {
      // Step 1: Xvfb not needed - using actual display
      // await this.ensureXvfb();

      // Step 2: Create output directory
      const outputDir = this.parser.getOutputDir(
        this.config,
        this.options.outputDir
      );

      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      if (this.options.verbose) {
        console.log(`\n📁 Output directory: ${outputDir}`);
        console.log(`🖥️  Display: ${this.options.display}`);
        console.log(`📦 Program: ${this.config.program.file}`);
        console.log(`⏱️  Duration: ${this.config.execution.duration}s\n`);
      }

      // Step 3: Initialize MediaCapture
      const mediaCapture = new MediaCapture({
        outputDir,
        format: 'png',
        quality: 90
      });

      // Step 4: Capture screenshots using VICE's -exitscreenshot + -limitcycles
      // C64 runs at ~1 MHz (1,000,000 cycles/second)
      const CYCLES_PER_SECOND = 1000000;

      if (
        !this.options.skipScreenshots &&
        this.config.captures?.screenshots
      ) {
        for (const screenshot of this.config.captures.screenshots) {
          if (this.options.verbose) {
            console.log(`\n📸 Capturing screenshot: ${screenshot.name} (at ${screenshot.time}s)`);
          }

          try {
            const screenshotPath = `${outputDir}/${screenshot.name}.png`;

            // Calculate cycles needed (with 10s buffer for startup/loading)
            const cycles = (screenshot.time + 10) * CYCLES_PER_SECOND;

            // Create ViceRunner with exitscreenshot and limitcycles
            const viceInstance = new ViceRunner({
              display: this.options.display!,
              program: this.config.program.file,
              autoRun: this.config.execution.autoRun ?? true,
              verbose: this.options.verbose,
              exitScreenshot: screenshotPath,
              limitCycles: cycles,
              keybuf: this.config.execution.keybuf  // Inject keyboard input if specified
            });

            await viceInstance.start();

            // Wait for VICE to exit automatically (add buffer for startup/shutdown)
            await this.sleep((screenshot.time + 10) * 1000);

            // Verify screenshot was created
            if (existsSync(screenshotPath)) {
              result.screenshots.push({
                name: screenshot.name,
                path: screenshotPath,
                time: screenshot.time
              });

              if (this.options.verbose) {
                console.log(`   ✓ Saved: ${screenshotPath}`);
              }
            } else {
              throw new Error('Screenshot file not created');
            }
          } catch (error: any) {
            const errorMsg = `Failed to capture screenshot ${screenshot.name}: ${error.message}`;
            result.errors?.push(errorMsg);
            if (this.options.verbose) {
              console.error(`   ✗ ${errorMsg}`);
            }
          }
        }
      }

      result.success = true;

    } catch (error: any) {
      result.success = false;
      result.errors?.push(`Orchestration failed: ${error.message}`);

      if (this.options.verbose) {
        console.error(`\n❌ Error: ${error.message}`);
      }
    } finally {
      // Cleanup: VICE instances exit automatically via -limitcycles
    }

    return result;
  }

  /**
   * Ensure Xvfb is running on the specified display
   */
  private async ensureXvfb(): Promise<void> {
    // Check if Xvfb is already running
    const displayNum = this.options.display!.replace(':', '');

    try {
      await execAsync(`pgrep -f "Xvfb ${this.options.display}"`);
      if (this.options.verbose) {
        console.log(`✓ Xvfb already running on ${this.options.display}`);
      }
    } catch {
      // Xvfb not running, start it
      if (this.options.verbose) {
        console.log(`🖥️  Starting Xvfb on ${this.options.display}...`);
      }

      await execAsync(
        `Xvfb ${this.options.display} -screen 0 1024x768x24 > /dev/null 2>&1 &`
      );

      // Wait for Xvfb to start
      await this.sleep(2000);
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    // Currently no additional cleanup needed beyond VICE shutdown
    // Xvfb is left running for subsequent tests
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
