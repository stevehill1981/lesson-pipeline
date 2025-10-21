import { spawn, ChildProcess, exec } from 'child_process';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { resolve, dirname, basename, extname } from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ViceOptions {
  display: string;          // X display (e.g., ":99")
  program: string;           // Path to .prg or .bas file
  autoRun: boolean;          // Auto-run program after loading
  verbose?: boolean;         // Log VICE output
  workingDir?: string;       // Working directory for VICE
  exitScreenshot?: string;   // Path to save screenshot on exit
  exitRecord?: string;       // Path to save video recording on exit
  limitCycles?: number;      // Automatically exit after N cycles
  keybuf?: string;           // Keyboard input to inject (e.g., "4\n" for INPUT)
  keybufDelay?: number;      // Delay before injecting input (default: 0)
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
   * Convert .bas text file to .prg using petcat
   * petcat requires lowercase input for proper tokenization
   */
  private async convertBasToPrg(basPath: string): Promise<string> {
    const prgPath = basPath.replace(/\.bas$/, '.prg');

    // Read BASIC file and convert to lowercase for petcat
    const content = readFileSync(basPath, 'utf-8');
    const lowercaseContent = content.toLowerCase();

    // Write to temp file
    const tempBasPath = basPath.replace(/\.bas$/, '.lowercase.bas');
    const fs = await import('fs');
    fs.writeFileSync(tempBasPath, lowercaseContent);

    try {
      await execAsync(`petcat -w2 -l 0801 -o "${prgPath}" -- "${tempBasPath}"`);
      // Clean up temp file
      fs.unlinkSync(tempBasPath);
      return prgPath;
    } catch (error: any) {
      // Clean up temp file on error
      try { fs.unlinkSync(tempBasPath); } catch {}
      throw new Error(`Failed to convert BASIC file: ${error.message}`);
    }
  }

  /**
   * Start VICE emulator
   */
  async start(): Promise<void> {
    if (this.running) {
      throw new Error('VICE is already running');
    }

    return new Promise(async (resolvePromise, reject) => {
      let programPath = resolve(this.options.program);

      // If it's a .bas file, convert to .prg first (with lowercase conversion)
      if (extname(programPath) === '.bas') {
        try {
          if (this.options.verbose) {
            console.log(`[ViceRunner] Converting BASIC to PRG (lowercasing for petcat)...`);
          }
          programPath = await this.convertBasToPrg(programPath);
          if (this.options.verbose) {
            console.log(`[ViceRunner] Created: ${programPath}`);
          }
        } catch (error: any) {
          reject(error);
          return;
        }
      }

      // VICE command-line arguments
      const args = [
        '-autostart', programPath,
        '+sound',
        '-sounddev', 'dummy',
        '-VICIIdsize'
      ];

      // Add exit options if specified
      if (this.options.exitScreenshot) {
        args.push('-exitscreenshot', this.options.exitScreenshot);
      }

      if (this.options.exitRecord) {
        args.push('-exitrecord', this.options.exitRecord);
      }

      if (this.options.limitCycles) {
        args.push('-limitcycles', this.options.limitCycles.toString());
      }

      // Add keyboard buffer injection if specified
      if (this.options.keybuf) {
        args.push('-keybuf', this.options.keybuf);
      }

      if (this.options.keybufDelay) {
        args.push('-keybuf-delay', this.options.keybufDelay.toString());
      }

      // Set environment - use default display (not Xvfb)
      const env = {
        ...process.env
        // Don't override DISPLAY - let VICE use the actual display
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
