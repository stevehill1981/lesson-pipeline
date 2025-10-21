import { EmulatorAdapter } from './emulator-adapter.js';
import {
  Lesson,
  LessonAction,
  LessonResult,
  LessonStatus,
  VerificationConfig,
  VerificationResult
} from './lesson-schema.js';
import { EmulatorConnectionError, EmulatorError } from './errors.js';

/**
 * Executes lesson test steps using an emulator adapter
 */
export class LessonRunner {
  private adapter: EmulatorAdapter;

  constructor(adapter: EmulatorAdapter) {
    this.adapter = adapter;
  }

  /**
   * Check if adapter has all required capabilities for this lesson
   * @returns Array of missing capability names (empty if all present)
   */
  checkCapabilities(lesson: Lesson): string[] {
    if (!lesson.requires_capabilities) {
      return [];
    }

    const missing: string[] = [];
    for (const capability of lesson.requires_capabilities) {
      if (!this.adapter.supports(capability as any)) {
        missing.push(capability);
      }
    }

    return missing;
  }

  /**
   * Execute a complete lesson test
   */
  async runLesson(lesson: Lesson): Promise<LessonResult> {
    const startTime = Date.now();

    // Check capabilities
    const missingCaps = this.checkCapabilities(lesson);
    if (missingCaps.length > 0) {
      return {
        lesson: lesson.title,
        status: 'skipped',
        duration_ms: Date.now() - startTime,
        reason: `Missing capabilities: ${missingCaps.join(', ')}`
      };
    }

    try {
      // Connect if not already connected
      const isAlive = await this.adapter.alive();
      if (!isAlive) {
        try {
          await this.adapter.connect();
        } catch (error) {
          return {
            lesson: lesson.title,
            status: 'error',
            duration_ms: Date.now() - startTime,
            reason: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          };
        }
      }

      // Execute setup actions
      if (lesson.setup) {
        for (const action of lesson.setup) {
          await this.executeAction(action);
        }
      }

      // Execute main actions
      for (const action of lesson.execution) {
        await this.executeAction(action);
      }

      // Run verifications
      const verificationResults: VerificationResult[] = [];
      for (const verification of lesson.verification) {
        const result = await this.verify(verification);
        verificationResults.push(result);
      }

      // Determine overall status
      const allPassed = verificationResults.every(v => v.passed);
      const status: LessonStatus = allPassed ? 'pass' : 'fail';

      return {
        lesson: lesson.title,
        status,
        duration_ms: Date.now() - startTime,
        details: verificationResults
      };

    } catch (error) {
      return {
        lesson: lesson.title,
        status: 'error',
        duration_ms: Date.now() - startTime,
        reason: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Execute a single lesson action
   */
  private async executeAction(action: LessonAction): Promise<void> {
    switch (action.action) {
      case 'reset':
        await this.adapter.reset();
        break;

      case 'load_program':
        if (!action.program) {
          throw new Error('load_program action requires program path');
        }
        await this.adapter.loadProgram(action.program);
        break;

      case 'wait_for':
        if (!action.text) {
          throw new Error('wait_for action requires text');
        }
        await this.adapter.waitForText(action.text, {
          timeout: (action.timeout_seconds || 30) * 1000
        });
        break;

      case 'inject_keys':
        if (!action.keys) {
          throw new Error('inject_keys action requires keys');
        }
        await this.adapter.injectKeys(action.keys);
        break;

      case 'read_memory':
        if (!action.start_address || !action.end_address) {
          throw new Error('read_memory action requires start_address and end_address');
        }
        const start = parseInt(action.start_address, 16);
        const end = parseInt(action.end_address, 16);
        await this.adapter.readMemory(start, end - start + 1);
        break;

      default:
        throw new Error(`Unsupported action: ${action.action}`);
    }
  }

  /**
   * Verify a lesson expectation
   */
  private async verify(verification: VerificationConfig): Promise<VerificationResult> {
    switch (verification.type) {
      case 'text_output':
        return this.verifyTextOutput(verification);

      case 'memory_check':
        return this.verifyMemory(verification);

      default:
        return {
          type: verification.type,
          passed: false,
          message: `Unsupported verification type: ${verification.type}`
        };
    }
  }

  /**
   * Verify text appears on screen
   */
  private async verifyTextOutput(verification: VerificationConfig): Promise<VerificationResult> {
    if (!verification.expected || verification.expected.length === 0) {
      return {
        type: 'text_output',
        passed: false,
        message: 'No expected text specified'
      };
    }

    const allFound = await Promise.all(
      verification.expected.map(text =>
        this.adapter.waitForText(text, { timeout: 5000 })
      )
    );

    const passed = allFound.every(found => found);

    return {
      type: 'text_output',
      passed,
      expected: verification.expected,
      message: passed ? 'All expected text found' : 'Some expected text not found'
    };
  }

  /**
   * Verify memory contents
   */
  private async verifyMemory(verification: VerificationConfig): Promise<VerificationResult> {
    if (!verification.address || !verification.length || !verification.expected_bytes) {
      return {
        type: 'memory_check',
        passed: false,
        message: 'Memory verification requires address, length, and expected_bytes'
      };
    }

    const address = parseInt(verification.address, 16);
    const bytes = await this.adapter.readMemory(address, verification.length);

    const mode = verification.mode || 'exact';
    let passed = false;

    if (mode === 'exact') {
      passed = bytes.length === verification.expected_bytes.length &&
        bytes.every((b, i) => b === verification.expected_bytes![i]);
    } else if (mode === 'contains') {
      // Check if expected bytes appear anywhere in the read bytes
      const expectedStr = verification.expected_bytes.join(',');
      const actualStr = bytes.join(',');
      passed = actualStr.includes(expectedStr);
    }

    return {
      type: 'memory_check',
      passed,
      expected: verification.expected_bytes,
      actual: bytes,
      message: passed ? 'Memory check passed' : 'Memory check failed'
    };
  }
}
