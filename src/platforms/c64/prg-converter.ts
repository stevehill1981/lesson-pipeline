import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { dirname, basename } from 'path';

export class PrgConverter {
  /**
   * Converts BASIC text listing to PRG file using petcat
   * Returns path to generated PRG file
   */
  convertBasicToPrg(inputFile: string, outputFile?: string): string {
    if (!existsSync(inputFile)) {
      throw new Error(`Input file not found: ${inputFile}`);
    }

    // Default output: same name with .prg extension
    const output = outputFile || inputFile.replace(/\.[^.]+$/, '.prg');

    try {
      // petcat -text -w2 -o output.prg -- input.bas
      // -text = input is text format
      // -w2 = BASIC V2 format
      execSync(`petcat -text -w2 -o "${output}" -- "${inputFile}"`, {
        stdio: 'pipe'
      });

      if (!existsSync(output)) {
        throw new Error('petcat failed to create PRG file');
      }

      return output;
    } catch (err: any) {
      throw new Error(`Failed to convert BASIC to PRG: ${err.message}`);
    }
  }

  /**
   * Converts PRG back to BASIC text listing (for verification)
   */
  convertPrgToBasic(inputFile: string): string {
    if (!existsSync(inputFile)) {
      throw new Error(`PRG file not found: ${inputFile}`);
    }

    try {
      // petcat -2 input.prg
      const output = execSync(`petcat -2 "${inputFile}"`, {
        encoding: 'utf-8'
      });

      return output;
    } catch (err: any) {
      throw new Error(`Failed to convert PRG to BASIC: ${err.message}`);
    }
  }
}
