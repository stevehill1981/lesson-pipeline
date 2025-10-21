import net from 'net';
import { existsSync } from 'fs';
import {
  EmulatorAdapter,
  EmulatorCapability,
  LoadProgramOptions,
  WaitForTextOptions
} from './emulator-adapter.js';
import { EmulatorConnectionError, EmulatorCommandError } from './errors.js';

export interface VICEAdapterConfig {
  port?: number;  // Default 6510 for remote monitor
  vicePath?: string;
  timeout?: number;
}

/**
 * VICE emulator adapter using TCP remote monitor protocol (text-based)
 *
 * IMPORTANT: This uses the REMOTE MONITOR (port 6510), NOT binary monitor (port 6502)
 *
 * Protocol details:
 * - Text-based ASCII commands with \n terminator
 * - Responses are plain text ending with prompt: (C:$xxxx)
 * - Commands: load "file", m 0400 0410, g, r, etc.
 * - Easier to debug than binary protocol
 *
 * Launch VICE: x64sc -remotemonitor -monport 6510
 */
export class VICEAdapter implements EmulatorAdapter {
  private config: Required<VICEAdapterConfig>;
  private socket: net.Socket | null = null;
  private connected: boolean = false;

  constructor(config: VICEAdapterConfig = {}) {
    this.config = {
      port: config.port || 6510,  // Remote monitor default port
      vicePath: config.vicePath || 'x64sc',
      timeout: config.timeout || 5000
    };
  }

  name(): string {
    return 'VICE';
  }

  platform(): string {
    return 'c64';
  }

  capabilities(): EmulatorCapability[] {
    return [
      'load_program',
      'inject_keys',
      'wait_for_text',
      'read_memory',
      'reset'
    ];
  }

  supports(action: EmulatorCapability): boolean {
    return this.capabilities().includes(action);
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      let resolved = false;
      this.socket = new net.Socket();

      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          this.socket?.destroy();
          reject(new EmulatorConnectionError(
            `Connection timeout: Unable to connect to VICE remote monitor on port ${this.config.port}`
          ));
        }
      }, this.config.timeout);

      // Set up handlers in exact same order as test-vice-commands.js
      this.socket.on('connect', () => {
        console.log('[VICEAdapter DEBUG] TCP connection established');
      });

      this.socket.on('data', (data) => {
        const response = data.toString('ascii');
        console.log('[VICEAdapter DEBUG] Received data:', JSON.stringify(response));

        if (response.includes('(C:$') && !resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          this.connected = true;
          resolve();
        }
      });

      this.socket.on('error', (err) => {
        console.log('[VICEAdapter DEBUG] Socket error:', err.message);
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          this.connected = false;
          reject(new EmulatorConnectionError(
            `Failed to connect to VICE remote monitor on port ${this.config.port}: ${err.message}`
          ));
        }
      });

      this.socket.on('close', () => {
        console.log('[VICEAdapter DEBUG] Socket closed');
        this.connected = false;
      });

      console.log('[VICEAdapter DEBUG] Connecting to localhost:' + this.config.port);
      this.socket.connect(this.config.port, 'localhost');
    });
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.socket) {
        this.connected = false;
        resolve();
        return;
      }

      this.socket.once('close', () => {
        this.connected = false;
        this.socket = null;
        resolve();
      });

      this.socket.end();
    });
  }

  async alive(): Promise<boolean> {
    return this.connected && this.socket !== null && !this.socket.destroyed;
  }

  async loadProgram(path: string, options?: LoadProgramOptions): Promise<boolean> {
    // Check if file exists first
    if (!existsSync(path)) {
      return false;
    }

    // If not connected, can't load
    if (!this.connected || !this.socket) {
      return false;
    }

    // Send load command to VICE remote monitor
    return new Promise((resolve, reject) => {
      const command = `load "${path}"\n`;
      let buffer = '';

      const responseHandler = (data: Buffer) => {
        buffer += data.toString('ascii');

        // Remote monitor responds with:
        // - "Ready." on success
        // - "?..." error message on failure
        // - Ends with prompt: (C:$xxxx)

        // Check if we have a complete response (ends with prompt)
        if (buffer.includes('(C:$')) {
          this.socket?.removeListener('data', responseHandler);

          // Check for error
          if (buffer.includes('?')) {
            resolve(false);
          } else {
            // Success (Ready. or just prompt)
            resolve(true);
          }
        }
      };

      if (!this.socket) {
        reject(new EmulatorCommandError('Socket not available'));
        return;
      }

      this.socket.on('data', responseHandler);
      this.socket.write(command);

      // Timeout after 5 seconds
      setTimeout(() => {
        this.socket?.removeListener('data', responseHandler);
        reject(new EmulatorCommandError('loadProgram timeout'));
      }, 5000);
    });
  }

  async run(): Promise<void> {
    throw new Error('Not implemented');
  }

  async reset(): Promise<void> {
    throw new Error('Not implemented');
  }

  async injectKeys(keys: string): Promise<boolean> {
    // If not connected, can't inject
    if (!this.connected || !this.socket) {
      return false;
    }

    // Send keyboard input via remote monitor
    // Note: Remote monitor doesn't have an "inject" command
    // We'll type the keys directly into the emulator
    return new Promise((resolve, reject) => {
      const command = `${keys}\n`;
      let buffer = '';

      const responseHandler = (data: Buffer) => {
        buffer += data.toString('ascii');

        // Wait for prompt to indicate command processed
        if (buffer.includes('(C:$')) {
          this.socket?.removeListener('data', responseHandler);

          // Check for error
          if (buffer.includes('?')) {
            resolve(false);
          } else {
            resolve(true);
          }
        }
      };

      if (!this.socket) {
        reject(new EmulatorCommandError('Socket not available'));
        return;
      }

      this.socket.on('data', responseHandler);
      this.socket.write(command);

      // Timeout after 5 seconds
      setTimeout(() => {
        this.socket?.removeListener('data', responseHandler);
        reject(new EmulatorCommandError('injectKeys timeout'));
      }, 5000);
    });
  }

  async waitForText(text: string, options?: WaitForTextOptions): Promise<boolean> {
    // If not connected, can't wait
    if (!this.connected || !this.socket) {
      return false;
    }

    const timeout = options?.timeout || 30000; // Default 30 seconds
    const caseSensitive = options?.caseSensitive !== false; // Default true
    const searchText = caseSensitive ? text : text.toLowerCase();

    const startTime = Date.now();
    const pollInterval = 200; // Poll every 200ms

    // C64 screen RAM: 0x0400 - 0x07E7 (1000 bytes = 40x25)
    const SCREEN_RAM_START = 0x0400;
    const SCREEN_RAM_SIZE = 1000;

    while (Date.now() - startTime < timeout) {
      try {
        // Read screen RAM
        const screenBytes = await this.readMemory(SCREEN_RAM_START, SCREEN_RAM_SIZE);

        if (screenBytes.length === 0) {
          // Failed to read memory, wait and retry
          await this.sleep(pollInterval);
          continue;
        }

        // Convert C64 screen codes to ASCII
        const screenText = this.screenCodesToText(screenBytes);
        const compareText = caseSensitive ? screenText : screenText.toLowerCase();

        // Check if text is present
        if (compareText.includes(searchText)) {
          return true;
        }

        // Wait before next poll
        await this.sleep(pollInterval);
      } catch (error) {
        // Ignore errors and keep polling
        await this.sleep(pollInterval);
      }
    }

    // Timeout reached
    return false;
  }

  /**
   * Convert C64 screen codes to ASCII text
   * Screen codes 0-26 = A-Z, 32 = space, etc.
   */
  private screenCodesToText(bytes: number[]): string {
    let text = '';

    for (const byte of bytes) {
      if (byte === 32) {
        // Space
        text += ' ';
      } else if (byte >= 1 && byte <= 26) {
        // A-Z (screen codes 1-26)
        text += String.fromCharCode(64 + byte);
      } else if (byte >= 48 && byte <= 57) {
        // 0-9 (screen codes 48-57)
        text += String.fromCharCode(byte);
      } else if (byte === 46) {
        // Period
        text += '.';
      } else if (byte === 44) {
        // Comma
        text += ',';
      } else if (byte === 33) {
        // Exclamation
        text += '!';
      } else if (byte === 63) {
        // Question mark
        text += '?';
      } else {
        // Unknown character, use space
        text += ' ';
      }
    }

    return text;
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async readMemory(startAddress: number, length: number): Promise<number[]> {
    // If not connected, can't read
    if (!this.connected || !this.socket) {
      return [];
    }

    // VICE remote monitor: m <start> <end>
    // Addresses are in hex (without 0x prefix)
    const endAddress = startAddress + length - 1;
    const command = `m ${startAddress.toString(16)} ${endAddress.toString(16)}\n`;

    return new Promise((resolve, reject) => {
      let buffer = '';

      const responseHandler = (data: Buffer) => {
        buffer += data.toString('ascii');

        // Wait for prompt to indicate complete response
        if (buffer.includes('(C:$')) {
          this.socket?.removeListener('data', responseHandler);

          // Parse hex bytes from text response
          // Remote monitor returns lines like:
          // >C:0400  20 20 20 20  20 20 20 20  20 20 20 20  20 20 20 20
          // >C:0410  20
          // (C:$0411)

          const bytes: number[] = [];
          const lines = buffer.split('\n');

          for (const line of lines) {
            // Match lines like ">C:0400  20 20 20 20  20 20..."
            const match = line.match(/^>C:[0-9a-fA-F]+\s+([0-9a-fA-F\s]+)/);
            if (match) {
              const hexBytes = match[1].trim().split(/\s+/);
              for (const hexByte of hexBytes) {
                if (hexByte && hexByte.length > 0) {
                  bytes.push(parseInt(hexByte, 16));
                }
              }
            }
          }

          resolve(bytes);
        }
      };

      if (!this.socket) {
        reject(new EmulatorCommandError('Socket not available'));
        return;
      }

      this.socket.on('data', responseHandler);
      this.socket.write(command);

      // Timeout after 5 seconds
      setTimeout(() => {
        this.socket?.removeListener('data', responseHandler);
        reject(new EmulatorCommandError('readMemory timeout'));
      }, 5000);
    });
  }
}
