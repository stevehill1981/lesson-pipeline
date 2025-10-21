import { readFileSync } from 'fs';
import YAML from 'yaml';
import Ajv from 'ajv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

export interface TestConfiguration {
  platform: 'c64' | 'spectrum' | 'nes' | 'amiga';
  phase: number;
  tier: number;
  lesson: number;
  title?: string;
  program: ProgramConfig;
  execution: ExecutionConfig;
  captures?: CapturesConfig;
}

export interface ProgramConfig {
  type: 'basic' | 'assembly';
  file: string;
}

export interface ExecutionConfig {
  duration: number;  // seconds
  autoRun?: boolean;
  keybuf?: string;   // Keyboard input to inject (e.g., "4\n")
}

export interface CapturesConfig {
  screenshots?: ScreenshotConfig[];
  video?: VideoConfig;
}

export interface ScreenshotConfig {
  name: string;
  time: number;  // seconds
  description?: string;
}

export interface VideoConfig {
  enabled: boolean;
  duration?: number;  // seconds
  fps?: number;
  description?: string;
}

export class TestConfigParser {
  private ajv: Ajv;
  private schemaPath: string;

  constructor() {
    this.ajv = new Ajv();
    // Schema is in lesson-pipeline/schemas/
    // In ES modules, use import.meta.url instead of __dirname
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.schemaPath = resolve(__dirname, '../../schemas/test-configuration.schema.json');
  }

  parse(filePath: string): TestConfiguration {
    const content = readFileSync(filePath, 'utf-8');
    const config = YAML.parse(content);

    // Validate against schema
    this.validate(config);

    return config as TestConfiguration;
  }

  private validate(config: any): void {
    const schemaContent = readFileSync(this.schemaPath, 'utf-8');
    const schema = JSON.parse(schemaContent);

    const validate = this.ajv.compile(schema);
    const valid = validate(config);

    if (!valid) {
      const errors = validate.errors?.map(err => `${err.instancePath} ${err.message}`).join('; ');
      throw new Error(`Invalid test configuration: ${errors}`);
    }
  }

  /**
   * Get output directory path for captures based on test configuration
   */
  getOutputDir(config: TestConfiguration, baseDir: string = './output'): string {
    return resolve(
      baseDir,
      config.platform,
      `phase-${config.phase}`,
      `tier-${config.tier}`,
      `lesson-${String(config.lesson).padStart(3, '0')}`
    );
  }

  /**
   * Get relative path for embedding in MDX
   */
  getRelativePath(config: TestConfiguration): string {
    return `/images/${config.platform}/phase-${config.phase}/tier-${config.tier}/lesson-${String(config.lesson).padStart(3, '0')}`;
  }
}
