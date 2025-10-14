export interface BasicToken {
  type: 'command' | 'keyword' | 'number' | 'string' | 'variable' | 'operator' | 'separator';
  value: string;
  line?: number;
}

export class BasicTokenizer {
  private commands = [
    'PRINT', 'POKE', 'PEEK', 'FOR', 'NEXT', 'IF', 'THEN', 'GOTO', 'GOSUB',
    'RETURN', 'REM', 'END', 'STOP', 'READ', 'DATA', 'INPUT', 'GET', 'SYS',
    'LET', 'DIM', 'NEW', 'LIST', 'RUN', 'LOAD', 'SAVE', 'CLR'
  ];

  private keywords = [
    'AND', 'OR', 'NOT', 'TO', 'STEP', 'FN', 'SPC', 'TAB',
    'LEFT$', 'RIGHT$', 'MID$', 'LEN', 'STR$', 'VAL', 'ASC', 'CHR$',
    'RND', 'INT', 'ABS', 'SGN', 'SIN', 'COS', 'TAN', 'ATN', 'EXP', 'LOG', 'SQR'
  ];

  tokenize(line: string): BasicToken[] {
    const tokens: BasicToken[] = [];
    let current = '';
    let inString = false;
    let inRemark = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      // Handle strings
      if (char === '"') {
        if (inString) {
          tokens.push({ type: 'string', value: current });
          current = '';
          inString = false;
        } else {
          if (current) {
            tokens.push(...this.tokenizePart(current));
            current = '';
          }
          inString = true;
        }
        continue;
      }

      if (inString) {
        current += char;
        continue;
      }

      // Handle REM (everything after is comment)
      if (inRemark) {
        current += char;
        continue;
      }

      // Separators and operators
      if ([' ', ',', ';', ':', '(', ')', '+', '-', '*', '/', '=', '<', '>'].includes(char)) {
        if (current) {
          const partTokens = this.tokenizePart(current);

          // Check if we just hit REM
          if (partTokens.some(t => t.type === 'command' && t.value === 'REM')) {
            inRemark = true;
          }

          tokens.push(...partTokens);
          current = '';
        }

        if (char !== ' ') {
          const type = [',', ';', ':', '(', ')'].includes(char) ? 'separator' : 'operator';
          tokens.push({ type, value: char });
        }
        continue;
      }

      current += char;
    }

    // Final token
    if (current) {
      if (inString) {
        tokens.push({ type: 'string', value: current });
      } else {
        tokens.push(...this.tokenizePart(current));
      }
    }

    return tokens;
  }

  private tokenizePart(part: string): BasicToken[] {
    const upper = part.toUpperCase();

    // Check for commands
    if (this.commands.includes(upper)) {
      return [{ type: 'command', value: upper }];
    }

    // Check for keywords
    if (this.keywords.includes(upper)) {
      return [{ type: 'keyword', value: upper }];
    }

    // Check for numbers
    if (/^\d+(\.\d+)?$/.test(part)) {
      return [{ type: 'number', value: part }];
    }

    // Must be variable
    return [{ type: 'variable', value: part }];
  }
}
