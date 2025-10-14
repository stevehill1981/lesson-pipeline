import { readFileSync } from 'fs';
import { extname } from 'path';
import { BasicValidator } from '../platforms/c64/basic-validator.js';

export async function validateCommand(file: string, options: { platform: string }) {
  try {
    const code = readFileSync(file, 'utf-8');
    const ext = extname(file);

    if (options.platform === 'c64' && ext === '.bas') {
      const validator = new BasicValidator();
      const errors = validator.validate(code);

      if (errors.length === 0) {
        console.log('✓ Validation passed');
        process.exit(0);
      } else {
        console.log(`✗ Found ${errors.length} error(s):\n`);

        for (const error of errors) {
          const severity = error.severity === 'error' ? '❌' : '⚠️';
          console.log(`${severity} Line ${error.line}: ${error.message}`);
        }

        process.exit(1);
      }
    } else {
      console.error(`Unsupported platform/file combination: ${options.platform} / ${ext}`);
      process.exit(1);
    }
  } catch (err: any) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}
