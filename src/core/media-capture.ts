import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const execAsync = promisify(exec);

export interface CaptureConfig {
  outputDir: string;
  format?: 'png' | 'jpg';
  quality?: number;
}

export class MediaCapture {
  private config: CaptureConfig;

  constructor(config: CaptureConfig) {
    this.config = {
      format: 'png',
      quality: 90,
      ...config
    };

    if (!existsSync(this.config.outputDir)) {
      mkdirSync(this.config.outputDir, { recursive: true });
    }
  }

  async captureScreenshot(name: string, display: string = ':99'): Promise<string> {
    const outputPath = `${this.config.outputDir}/${name}.${this.config.format}`;
    const dir = dirname(outputPath);

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    try {
      // On macOS, use simple screencapture
      if (process.platform === 'darwin') {
        await execAsync(
          `screencapture -x "${outputPath}"`
        );
      } else {
        // On Linux, use xwd with the actual display
        const xwdPath = `${this.config.outputDir}/${name}.xwd`;
        await execAsync(
          `xwd -root -out "${xwdPath}" 2>/dev/null`
        );
        await execAsync(
          `convert "${xwdPath}" "${outputPath}" 2>/dev/null`
        );
        await execAsync(`rm -f "${xwdPath}"`);
      }

      return outputPath;
    } catch (error: any) {
      throw new Error(`Screenshot capture failed: ${error.message}`);
    }
  }

  async captureVideo(name: string, duration: number, display: string = ':99'): Promise<string> {
    const outputPath = `${this.config.outputDir}/${name}.mp4`;
    const dir = dirname(outputPath);

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    try {
      // On macOS, use ffmpeg with avfoundation to capture screen
      if (process.platform === 'darwin') {
        await execAsync(
          `ffmpeg -f avfoundation -i "1:none" -t ${duration} -vcodec libx264 -preset ultrafast "${outputPath}" 2>/dev/null`
        );
      } else {
        // On Linux, use x11grab
        await execAsync(
          `ffmpeg -f x11grab -video_size 800x600 -i ${display} -t ${duration} -vcodec libx264 "${outputPath}"`
        );
      }
      return outputPath;
    } catch (error: any) {
      throw new Error(`Video capture failed: ${error.message}`);
    }
  }

  async captureAudio(name: string, duration: number): Promise<string> {
    const outputPath = `${this.config.outputDir}/${name}.wav`;
    const dir = dirname(outputPath);

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    try {
      await execAsync(
        `ffmpeg -f pulse -i default -t ${duration} ${outputPath}`
      );
      return outputPath;
    } catch (error: any) {
      throw new Error(`Audio capture failed: ${error.message}`);
    }
  }
}
