/**
 * Emulator adapter interface - all adapters must implement this
 *
 * Defines standardized methods for controlling retro computer emulators
 * across different platforms (C64/VICE, NES/FCEUX, ZX Spectrum/Fuse, etc.)
 */

export type EmulatorCapability =
  | 'load_program'
  | 'inject_keys'
  | 'inject_joystick'
  | 'wait_for_text'
  | 'read_memory'
  | 'write_memory'
  | 'capture_screenshot'
  | 'reset'
  | 'pause'
  | 'step'
  | 'set_breakpoint'
  | 'get_registers';

export interface LoadProgramOptions {
  loadAddress?: number;
}

export interface WaitForTextOptions {
  timeout?: number;
  caseSensitive?: boolean;
}

export type JoystickDirection = 'up' | 'down' | 'left' | 'right' | 'none';
export type JoystickButton = 'fire' | null;

export interface CPURegisters {
  [register: string]: number;
}

/**
 * Abstract interface that all emulator adapters must implement
 */
export interface EmulatorAdapter {
  // ============ Connection Lifecycle ============

  /**
   * Establish connection to emulator
   * @throws {EmulatorConnectionError} if connection fails
   */
  connect(): Promise<void>;

  /**
   * Close connection gracefully and stop emulator if needed
   */
  disconnect(): Promise<void>;

  /**
   * Check if emulator is responding
   * @returns true if emulator is alive, false otherwise
   */
  alive(): Promise<boolean>;

  // ============ Metadata ============

  /**
   * Get emulator name (e.g., "VICE", "FCEUX", "Fuse")
   */
  name(): string;

  /**
   * Get platform identifier (e.g., "c64", "nes", "spectrum")
   */
  platform(): string;

  /**
   * Get list of supported capabilities
   */
  capabilities(): EmulatorCapability[];

  /**
   * Check if adapter supports a specific capability
   */
  supports(action: EmulatorCapability): boolean;

  // ============ Program Loading ============

  /**
   * Load and prepare program for execution
   * @param path - Path to program file (.prg, .nes, .tap, etc.)
   * @param options - Optional load address override
   * @returns true on success
   * @throws {EmulatorError} on fatal error
   */
  loadProgram(path: string, options?: LoadProgramOptions): Promise<boolean>;

  // ============ Execution Control ============

  /**
   * Start/resume execution
   */
  run(): Promise<void>;

  /**
   * Pause execution (optional - not all emulators support)
   * @throws {EmulatorCapabilityError} if not supported
   */
  pause?(): Promise<void>;

  /**
   * Soft reset to clean state
   */
  reset(): Promise<void>;

  /**
   * Execute one CPU cycle/instruction (optional - for debugging)
   * @throws {EmulatorCapabilityError} if not supported
   */
  step?(): Promise<void>;

  // ============ Input Injection ============

  /**
   * Send keyboard input
   * @param keys - String of characters (\n for ENTER, \r for RETURN, \b for BACKSPACE)
   * @returns true if injection successful
   */
  injectKeys(keys: string): Promise<boolean>;

  /**
   * Send joystick input (optional - not all platforms have joysticks)
   * @param port - Joystick port (1 or 2)
   * @param direction - Direction to press
   * @param button - Button state
   * @throws {EmulatorCapabilityError} if not supported
   */
  injectJoystick?(port: number, direction: JoystickDirection, button?: JoystickButton): Promise<boolean>;

  // ============ Output Capture ============

  /**
   * Block until text appears on screen or timeout
   * @param text - Text to search for
   * @param options - Timeout and case sensitivity options
   * @returns true if found, false if timeout
   * @throws {EmulatorTimeoutError} if adapter timeout < method timeout
   */
  waitForText(text: string, options?: WaitForTextOptions): Promise<boolean>;

  /**
   * Save current screen to image file (optional)
   * @param path - Output file path (.png or .bmp)
   * @returns path to saved file
   * @throws {EmulatorCaptureError} if capture fails
   */
  captureScreenshot?(path: string): Promise<string>;

  /**
   * Read raw memory bytes
   * @param startAddress - Starting address (hex integer)
   * @param length - Number of bytes to read
   * @returns array of bytes
   */
  readMemory(startAddress: number, length: number): Promise<number[]>;

  /**
   * Write raw memory bytes (optional)
   * @param startAddress - Starting address
   * @param data - Bytes to write
   * @returns true on success
   * @throws {EmulatorCapabilityError} if not supported
   */
  writeMemory?(startAddress: number, data: number[]): Promise<boolean>;

  // ============ Debugging ============

  /**
   * Set execution breakpoint (optional - for advanced debugging)
   * @param address - Breakpoint address
   * @returns breakpoint ID or true
   * @throws {EmulatorCapabilityError} if not supported
   */
  setBreakpoint?(address: number): Promise<number | boolean>;

  /**
   * Remove previously set breakpoint (optional)
   * @param bpId - Breakpoint ID
   * @throws {EmulatorCapabilityError} if not supported
   */
  removeBreakpoint?(bpId: number): Promise<void>;

  /**
   * Return current CPU state (optional)
   * @returns register values (keys depend on platform)
   * @throws {EmulatorCapabilityError} if not supported
   */
  getRegisters?(): Promise<CPURegisters>;
}
