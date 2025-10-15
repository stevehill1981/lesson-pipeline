import { readFileSync } from 'fs';
import YAML from 'yaml';

export interface TestConfig {
  platform: string;
  program: string;
  runtime: string;
  inputs?: TestInput[];
  captures?: CaptureConfig;
}

export interface TestInput {
  time: string;
  device: 'keyboard' | 'joystick';
  key?: string;
  port?: number;
  action?: string;
  duration?: string;
}

export interface CaptureConfig {
  screenshots?: Screenshot[];
  video?: VideoConfig;
  audio?: AudioConfig;
}

export interface Screenshot {
  time: string;
  name: string;
}

export interface VideoConfig {
  start: string;
  end: string;
  name: string;
}

export interface AudioConfig {
  format: string;
  name: string;
}

export class TestConfigParser {
  parse(filePath: string): TestConfig {
    const content = readFileSync(filePath, 'utf-8');
    const config = YAML.parse(content);

    if (!config.platform || !config.program || !config.runtime) {
      throw new Error('Missing required fields: platform, program, runtime');
    }

    return config as TestConfig;
  }

  parseTimeToMs(time: string): number {
    const match = time.match(/^(\d+)s$/);
    if (!match) {
      throw new Error(`Invalid time format: ${time}. Expected format: "5s"`);
    }
    return parseInt(match[1]) * 1000;
  }
}
