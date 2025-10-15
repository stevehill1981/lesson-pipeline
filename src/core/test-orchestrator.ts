import { TestConfiguration, TestConfigParser } from './test-config-parser';
import { ViceRunner } from '../platforms/c64/vice-runner';
import { MediaCapture } from './media-capture';
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

    let viceRunner: ViceRunner | undefined;

    try {
      // Step 1: Start Xvfb if needed
      await this.ensureXvfb();

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

      // Step 4: Start VICE
      if (this.options.verbose) {
        console.log('🚀 Starting VICE...');
      }

      viceRunner = new ViceRunner({
        display: this.options.display!,
        program: this.config.program.file,
        autoRun: this.config.execution.autoRun ?? true,
        verbose: this.options.verbose
      });

      await viceRunner.start();
      await viceRunner.waitForStartup();

      if (this.options.verbose) {
        console.log('✅ VICE running\n');
      }

      // Step 5: Start video recording if enabled
      let videoPromise: Promise<string> | undefined;

      if (
        !this.options.skipVideo &&
        this.config.captures?.video?.enabled
      ) {
        const videoDuration = this.config.captures.video.duration || this.config.execution.duration;

        if (this.options.verbose) {
          console.log(`🎥 Recording video (${videoDuration}s)...`);
        }

        videoPromise = mediaCapture.captureVideo(
          'execution',
          videoDuration,
          this.options.display
        );
      }

      // Step 6: Capture screenshots at specified times
      if (
        !this.options.skipScreenshots &&
        this.config.captures?.screenshots
      ) {
        for (const screenshot of this.config.captures.screenshots) {
          // Wait until the specified time
          await this.sleep(screenshot.time * 1000);

          if (this.options.verbose) {
            console.log(`📸 Capturing screenshot: ${screenshot.name} (at ${screenshot.time}s)`);
          }

          try {
            const path = await mediaCapture.captureScreenshot(
              screenshot.name,
              this.options.display
            );

            result.screenshots.push({
              name: screenshot.name,
              path,
              time: screenshot.time
            });

            if (this.options.verbose) {
              console.log(`   ✓ Saved: ${path}`);
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

      // Step 7: Wait for video recording to complete
      if (videoPromise) {
        try {
          const videoPath = await videoPromise;
          result.video = {
            path: videoPath,
            duration: this.config.captures!.video!.duration || this.config.execution.duration
          };

          if (this.options.verbose) {
            console.log(`\n✅ Video saved: ${videoPath}`);
          }
        } catch (error: any) {
          const errorMsg = `Failed to capture video: ${error.message}`;
          result.errors?.push(errorMsg);
          if (this.options.verbose) {
            console.error(`✗ ${errorMsg}`);
          }
        }
      }

      // Step 8: Wait for remaining execution time
      const totalScreenshotTime = this.config.captures?.screenshots
        ?.reduce((max, s) => Math.max(max, s.time), 0) || 0;
      const remainingTime = Math.max(
        0,
        this.config.execution.duration - totalScreenshotTime
      );

      if (remainingTime > 0) {
        await this.sleep(remainingTime * 1000);
      }

      result.success = true;

    } catch (error: any) {
      result.success = false;
      result.errors?.push(`Orchestration failed: ${error.message}`);

      if (this.options.verbose) {
        console.error(`\n❌ Error: ${error.message}`);
      }
    } finally {
      // Step 9: Cleanup
      if (viceRunner) {
        if (this.options.verbose) {
          console.log('\n🛑 Shutting down VICE...');
        }
        await viceRunner.shutdown();
      }
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
