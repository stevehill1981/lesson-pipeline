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
  private cache: Map<string, any> = new Map();

  constructor(private basePath: string = 'docs/reference') {}

  loadCommands(platform: string, language: string): Record<string, CommandReference> {
    const cacheKey = `${platform}:${language}:commands`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const path = join(this.basePath, `${platform}-reference`, language, 'commands.json');
    const commands = JSON.parse(readFileSync(path, 'utf-8'));

    this.cache.set(cacheKey, commands);
    return commands;
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
