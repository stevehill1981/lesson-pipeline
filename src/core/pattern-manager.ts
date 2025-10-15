import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { PatternMetadata } from './types.js';

export class PatternManager {
  private basePath: string;
  private cache: Map<string, PatternMetadata> = new Map();

  constructor(basePath: string = 'patterns') {
    this.basePath = basePath;
  }

  loadPattern(platform: string, language: string, patternId: string): PatternMetadata {
    const cacheKey = `${platform}:${language}:${patternId}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Try to find pattern in any week directory
    const langPath = join(this.basePath, platform, language);

    if (!existsSync(langPath)) {
      throw new Error(`Pattern directory not found: ${langPath}`);
    }

    const weeks = readdirSync(langPath).filter(f => f.startsWith('week-'));

    for (const week of weeks) {
      const patternPath = join(langPath, week, `${patternId}.json`);
      if (existsSync(patternPath)) {
        const pattern = JSON.parse(readFileSync(patternPath, 'utf-8'));
        this.cache.set(cacheKey, pattern);
        return pattern;
      }
    }

    throw new Error(`Pattern not found: ${patternId}`);
  }

  listPatterns(platform: string, language: string, week?: number): string[] {
    const langPath = join(this.basePath, platform, language);

    if (!existsSync(langPath)) {
      return [];
    }

    const patterns: string[] = [];
    const weeks = week
      ? [`week-${week.toString().padStart(2, '0')}`]
      : readdirSync(langPath).filter(f => f.startsWith('week-'));

    for (const weekDir of weeks) {
      const weekPath = join(langPath, weekDir);
      if (existsSync(weekPath)) {
        const files = readdirSync(weekPath).filter(f => f.endsWith('.json'));
        patterns.push(...files.map(f => f.replace('.json', '')));
      }
    }

    return patterns;
  }

  resolvePattern(pattern: PatternMetadata): string {
    // Replace dependency references with actual code
    let code = pattern.code;

    if (pattern.dependencies && pattern.dependencies.length > 0) {
      // Dependencies would be loaded and their code prepended
      // For now, just return the pattern's own code
    }

    if (pattern.data_statements) {
      code += '\n' + pattern.data_statements;
    }

    return code;
  }
}
