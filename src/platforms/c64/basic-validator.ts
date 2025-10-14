import { BasicTokenizer } from './basic-tokenizer.js';
import { ReferenceLoader } from '../../core/reference-loader.js';

export interface ValidationError {
  line: number;
  message: string;
  severity: 'error' | 'warning';
}

export class BasicValidator {
  private tokenizer: BasicTokenizer;
  private refLoader: ReferenceLoader;

  constructor() {
    this.tokenizer = new BasicTokenizer();
    this.refLoader = new ReferenceLoader();
  }

  validate(code: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineNum = i + 1;

      if (!line) continue;

      // Extract line number if present
      const match = line.match(/^(\d+)\s+(.*)$/);
      const basicLineNum = match ? parseInt(match[1]) : null;
      const statement = match ? match[2] : line;

      // Tokenize
      const tokens = this.tokenizer.tokenize(statement);

      // Validate commands
      for (const token of tokens) {
        if (token.type === 'command') {
          if (!this.refLoader.hasCommand('c64', 'basic-v2', token.value)) {
            errors.push({
              line: lineNum,
              message: `Unknown command: ${token.value}`,
              severity: 'error'
            });
          }
        }
      }

      // Check if first token looks like it should be a command but isn't recognized
      if (tokens.length > 0 && tokens[0].type === 'variable') {
        const firstToken = tokens[0].value.toUpperCase();
        // Check if it looks like a command (all caps pattern) and isn't a known command
        if (!this.refLoader.hasCommand('c64', 'basic-v2', firstToken)) {
          // Could be a variable assignment, check for equals sign
          const hasEquals = tokens.some(t => t.value === '=');
          if (!hasEquals) {
            // Likely meant to be a command
            errors.push({
              line: lineNum,
              message: `Unknown command: ${firstToken}`,
              severity: 'error'
            });
          }
        }
      }

      // Check for common mistakes
      errors.push(...this.checkCommonMistakes(lineNum, statement, tokens));
    }

    return errors;
  }

  private checkCommonMistakes(lineNum: number, statement: string, tokens: any[]): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check for FOR without NEXT
    const hasFor = tokens.some(t => t.value === 'FOR');
    const hasNext = tokens.some(t => t.value === 'NEXT');

    // Check POKE syntax
    const pokeIdx = tokens.findIndex(t => t.value === 'POKE');
    if (pokeIdx >= 0) {
      const afterPoke = tokens.slice(pokeIdx + 1);
      const hasComma = afterPoke.some(t => t.value === ',');

      if (!hasComma) {
        errors.push({
          line: lineNum,
          message: 'POKE requires comma between address and value',
          severity: 'error'
        });
      }

      // Check for value > 255
      const numbers = afterPoke.filter(t => t.type === 'number');
      if (numbers.length >= 2) {
        const value = parseInt(numbers[1].value);
        if (value > 255) {
          errors.push({
            line: lineNum,
            message: 'POKE value must be 0-255',
            severity: 'error'
          });
        }
      }
    }

    // Check for PEEK without parentheses
    if (statement.includes('PEEK') && !statement.includes('PEEK(')) {
      errors.push({
        line: lineNum,
        message: 'PEEK requires parentheses: PEEK(address)',
        severity: 'error'
      });
    }

    // Check for GOSUB without likely RETURN
    // (This is a weak check, would need program-wide analysis)

    return errors;
  }
}
