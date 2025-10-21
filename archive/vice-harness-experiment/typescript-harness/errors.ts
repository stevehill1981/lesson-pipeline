/**
 * Base error for all emulator-related errors
 */
export class EmulatorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmulatorError';
  }
}

/**
 * Thrown when unable to establish connection to emulator
 */
export class EmulatorConnectionError extends EmulatorError {
  constructor(message: string) {
    super(message);
    this.name = 'EmulatorConnectionError';
  }
}

/**
 * Thrown when an operation times out
 */
export class EmulatorTimeoutError extends EmulatorError {
  constructor(message: string) {
    super(message);
    this.name = 'EmulatorTimeoutError';
  }
}

/**
 * Thrown when a command fails
 */
export class EmulatorCommandError extends EmulatorError {
  constructor(message: string) {
    super(message);
    this.name = 'EmulatorCommandError';
  }
}

/**
 * Thrown when media capture fails
 */
export class EmulatorCaptureError extends EmulatorError {
  constructor(message: string) {
    super(message);
    this.name = 'EmulatorCaptureError';
  }
}

/**
 * Thrown when adapter doesn't support requested capability
 */
export class EmulatorCapabilityError extends EmulatorError {
  constructor(capability: string, adapterName: string) {
    super(`Adapter ${adapterName} does not support capability: ${capability}`);
    this.name = 'EmulatorCapabilityError';
  }
}
