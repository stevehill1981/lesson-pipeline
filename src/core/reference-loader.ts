import { readFileSync } from 'fs';
import { join } from 'path';

export interface CommandReference {
  syntax: string;
  category: string;
  params?: Record<string, ParamSpec>;
  returns?: string;
  description: string;
  common_mistakes?: string[];
  examples?: string[];
  requires?: string[];
  since: string;
}

export interface ParamSpec {
  type: string;
  range?: [number, number];
  optional?: boolean;
  default?: any;
}

export class ReferenceLoader {
  private cache: Map<string, Record<string, CommandReference>> = new Map();

  constructor(private basePath: string = 'docs/reference') {}

  loadCommands(platform: string, language: string): Record<string, CommandReference> {
    const cacheKey = `${platform}:${language}:commands`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const path = join(this.basePath, `${platform}-reference`, language, 'commands.json');

    try {
      const fileContent = readFileSync(path, 'utf-8');
      const commands = JSON.parse(fileContent);

      this.cache.set(cacheKey, commands);
      return commands;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(
          `Reference file not found: ${path}\n` +
          `Platform: ${platform}, Language: ${language}\n` +
          `Please ensure the reference documentation exists for this platform/language combination.`
        );
      }

      if (error instanceof SyntaxError) {
        throw new Error(
          `Invalid JSON in reference file: ${path}\n` +
          `Platform: ${platform}, Language: ${language}\n` +
          `Parse error: ${error.message}`
        );
      }

      throw new Error(
        `Failed to load reference file: ${path}\n` +
        `Platform: ${platform}, Language: ${language}\n` +
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  hasCommand(platform: string, language: string, command: string): boolean {
    const commands = this.loadCommands(platform, language);
    return command.toUpperCase() in commands;
  }

  getCommand(platform: string, language: string, command: string): CommandReference | null {
    const commands = this.loadCommands(platform, language);
    return commands[command.toUpperCase()] || null;
  }
}
