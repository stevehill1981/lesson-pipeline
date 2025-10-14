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

export interface MemoryRegion {
  start: number;
  end: number;
  size: number;
  description: string;
  access: 'read-only' | 'read-write' | 'write-only';
  register?: string;
  values?: Record<string, string> | string;
  notes?: string[];
}

export class ReferenceLoader {
  private cache: Map<string, any> = new Map();

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

  loadMemoryMap(platform: string): Record<string, MemoryRegion> {
    const cacheKey = `${platform}:memory-map`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const path = join(this.basePath, `${platform}-reference`, 'memory-map.json');

    try {
      const fileContent = readFileSync(path, 'utf-8');
      const memoryMap = JSON.parse(fileContent);

      this.cache.set(cacheKey, memoryMap);
      return memoryMap;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(
          `Memory map file not found: ${path}\n` +
          `Platform: ${platform}\n` +
          `Please ensure the memory map documentation exists for this platform.`
        );
      }

      if (error instanceof SyntaxError) {
        throw new Error(
          `Invalid JSON in memory map file: ${path}\n` +
          `Platform: ${platform}\n` +
          `Parse error: ${error.message}`
        );
      }

      throw new Error(
        `Failed to load memory map file: ${path}\n` +
        `Platform: ${platform}\n` +
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  getMemoryRegion(platform: string, address: number): MemoryRegion | null {
    const memoryMap = this.loadMemoryMap(platform);

    for (const [name, region] of Object.entries(memoryMap)) {
      if (address >= region.start && address <= region.end) {
        return region;
      }
    }

    return null;
  }
}
