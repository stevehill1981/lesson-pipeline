import { test } from 'node:test';
import assert from 'node:assert';
import { PrgConverter } from '../../../dist/platforms/c64/prg-converter.js';
import { existsSync, unlinkSync } from 'fs';

test('PRG converter creates .prg file from BASIC', () => {
  const converter = new PrgConverter();

  try {
    const output = converter.convertBasicToPrg('tests/fixtures/valid-basic.bas');

    assert.ok(existsSync(output));
    assert.ok(output.endsWith('.prg'));

    // Cleanup
    unlinkSync(output);
  } catch (err: any) {
    if (err.message.includes('petcat')) {
      console.log('⚠️  Skipping test: petcat not installed');
    } else {
      throw err;
    }
  }
});

test('PRG converter can round-trip BASIC -> PRG -> BASIC', () => {
  const converter = new PrgConverter();

  try {
    const prgFile = converter.convertBasicToPrg('tests/fixtures/valid-basic.bas');
    const basicText = converter.convertPrgToBasic(prgFile);

    assert.ok(basicText.includes('PRINT'));
    assert.ok(basicText.includes('POKE'));

    // Cleanup
    unlinkSync(prgFile);
  } catch (err: any) {
    if (err.message.includes('petcat')) {
      console.log('⚠️  Skipping test: petcat not installed');
    } else {
      throw err;
    }
  }
});
