import { spawn, ChildProcess } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

export interface ViceOptions {
  display: string;          // X display (e.g., ":99")
  program: string;           // Path to .prg or .bas file
  autoRun: boolean;          // Auto-run program after loading
  verbose?: boolean;         // Log VICE output
  workingDir?: string;       // Working directory for VICE
}

export class ViceRunner {
  private options: ViceOptions;
  private process?: ChildProcess;
  private running: boolean = false;

  constructor(options: ViceOptions) {
    this.options = {
      verbose: false,
      workingDir: '/tmp',
      ...options
    };

    this.validateOptions();
  }

  private validateOptions(): void {
    if (!this.options.program) {
      throw new Error('Program path is required');
    }

    if (!existsSync(this.options.program)) {
      throw new Error(`Program file not found: ${this.options.program}`);
    }

    if (!this.options.display.startsWith(':')) {
      throw new Error('Display must start with ":" (e.g., ":99")');
    }
  }

  /**
   * Start VICE emulator
   */
  async start(): Promise<void> {
    if (this.running) {
      throw new Error('VICE is already running');
    }

    return new Promise((resolvePromise, reject) => {
      const programPath = resolve(this.options.program);

      // VICE command-line arguments
      const args = [
        '-autostart', programPath,        // Auto-load program
        '+sound',                          // Enable sound (required for timing)
        '-sounddev', 'dummy',              // Dummy sound device (no audio output)
        '-silent',                         // Suppress informational messages
        '-VICIIdsize',                     // Double size (better for screenshots)
        '+confirmexit',                    // Don't ask for confirmation on exit
        '-refresh', '1'                    // Screen refresh rate
      ];

      if (this.options.autoRun) {
        args.push('-autostart-handle-tde');  // Handle true drive emulation
      }

      // Set environment
      const env = {
        ...process.env,
        DISPLAY: this.options.display
      };

      if (this.options.verbose) {
        console.log(`[ViceRunner] Starting x64sc with args:`, args);
        console.log(`[ViceRunner] Display: ${this.options.display}`);
        console.log(`[ViceRunner] Program: ${programPath}`);
      }

      // Spawn VICE process
      this.process = spawn('x64sc', args, {
        env,
        cwd: this.options.workingDir,
        stdio: this.options.verbose ? 'inherit' : 'ignore'
      });

      // Handle process events
      this.process.on('error', (error) => {
        this.running = false;
        reject(new Error(`Failed to start VICE: ${error.message}`));
      });

      this.process.on('exit', (code, signal) => {
        this.running = false;
        if (this.options.verbose) {
          console.log(`[ViceRunner] VICE exited with code ${code}, signal ${signal}`);
        }
      });

      // Give VICE time to start up
      this.running = true;
      setTimeout(() => {
        if (this.running) {
          resolvePromise();
        } else {
          reject(new Error('VICE failed to start'));
        }
      }, 3000);  // 3 second startup time
    });
  }

  /**
   * Wait for VICE startup and program loading
   * Additional wait beyond initial start() for program to load and begin executing
   */
  async waitForStartup(additionalMs: number = 2000): Promise<void> {
    if (!this.running) {
      throw new Error('VICE is not running');
    }

    return new Promise(resolve => setTimeout(resolve, additionalMs));
  }

  /**
   * Shutdown VICE gracefully
   */
  async shutdown(): Promise<void> {
    if (!this.process || !this.running) {
      return;
    }

    return new Promise((resolve) => {
      if (!this.process) {
        resolve();
        return;
      }

      // Set up exit handler
      this.process.once('exit', () => {
        this.running = false;
        if (this.options.verbose) {
          console.log('[ViceRunner] VICE shutdown complete');
        }
        resolve();
      });

      // Send SIGTERM (graceful shutdown)
      this.process.kill('SIGTERM');

      // Fallback: force kill after 5 seconds
      setTimeout(() => {
        if (this.running && this.process) {
          if (this.options.verbose) {
            console.log('[ViceRunner] Force killing VICE');
          }
          this.process.kill('SIGKILL');
        }
      }, 5000);
    });
  }

  /**
   * Get the X display being used
   */
  getDisplay(): string {
    return this.options.display;
  }

  /**
   * Check if VICE is currently running
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Get the process ID (for debugging)
   */
  getPid(): number | undefined {
    return this.process?.pid;
  }
}
