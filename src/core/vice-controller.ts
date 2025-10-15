import { spawn, ChildProcess } from 'child_process';
import { existsSync } from 'fs';

export interface ViceConfig {
  executable: string;
  headless: boolean;
  display?: string;
}

export interface ViceRunResult {
  success: boolean;
  duration: number;
  output: string;
  error?: string;
}

export class ViceController {
  private process: ChildProcess | null = null;
  private config: ViceConfig;

  constructor(config: ViceConfig) {
    this.config = config;
  }

  async runProgram(prgPath: string, timeout: number = 30000): Promise<ViceRunResult> {
    if (!existsSync(prgPath)) {
      return {
        success: false,
        duration: 0,
        output: '',
        error: `PRG file not found: ${prgPath}`
      };
    }

    const startTime = Date.now();

    return new Promise((resolve) => {
      const args = ['-console', '-autostart', prgPath];

      if (this.config.headless) {
        // Use xvfb-run for headless mode
        this.process = spawn('xvfb-run', [
          '-a',
          this.config.executable,
          ...args
        ]);
      } else {
        this.process = spawn(this.config.executable, args);
      }

      let output = '';
      let error = '';

      this.process.stdout?.on('data', (data) => {
        output += data.toString();
      });

      this.process.stderr?.on('data', (data) => {
        error += data.toString();
      });

      const timeoutId = setTimeout(() => {
        this.stop();
        resolve({
          success: true,
          duration: Date.now() - startTime,
          output,
          error: error || undefined
        });
      }, timeout);

      this.process.on('exit', (code) => {
        clearTimeout(timeoutId);
        resolve({
          success: code === 0,
          duration: Date.now() - startTime,
          output,
          error: code !== 0 ? error : undefined
        });
      });
    });
  }

  stop(): void {
    if (this.process) {
      this.process.kill('SIGTERM');
      this.process = null;
    }
  }
}
