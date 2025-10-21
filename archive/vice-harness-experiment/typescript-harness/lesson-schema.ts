/**
 * Lesson definition schema for test harness
 *
 * Defines YAML structure for lesson test specifications
 */

export interface Lesson {
  title: string;
  type: 'basic' | 'assembly' | 'forth' | 'amos';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  target_platform: string;
  requires_capabilities?: string[];
  program: ProgramConfig;
  setup?: LessonAction[];
  execution: LessonAction[];
  verification: VerificationConfig[];
  tags?: string[];
}

export interface ProgramConfig {
  path: string;
  load_address?: number;
}

export type LessonActionType =
  | 'reset'
  | 'load_program'
  | 'wait_for'
  | 'inject_keys'
  | 'inject_joystick'
  | 'capture_screenshot'
  | 'set_breakpoint'
  | 'go'
  | 'read_memory'
  | 'step'
  | 'get_registers';

export interface LessonAction {
  action: LessonActionType;
  description?: string;

  // load_program
  program?: string;
  address?: string;

  // wait_for
  text?: string;
  timeout_seconds?: number;

  // inject_keys
  keys?: string;

  // inject_joystick
  port?: number;
  direction?: string;
  button?: string;

  // capture_screenshot
  filename?: string;

  // set_breakpoint / go
  breakpoint_address?: string;

  // read_memory
  start_address?: string;
  end_address?: string;
  store_as?: string;
}

export type VerificationType =
  | 'text_output'
  | 'memory_check'
  | 'register_check';

export interface VerificationConfig {
  type: VerificationType;

  // text_output
  expected?: string[];
  location?: 'screen' | 'memory';

  // memory_check
  address?: string;
  length?: number;
  expected_bytes?: number[];
  mode?: 'exact' | 'contains';

  // register_check
  register?: string;
  expected_value?: string;
}

export type LessonStatus = 'pass' | 'fail' | 'error' | 'skipped';

export interface LessonResult {
  lesson: string;
  status: LessonStatus;
  duration_ms: number;
  reason?: string;
  details?: VerificationResult[];
}

export interface VerificationResult {
  type: VerificationType;
  passed: boolean;
  expected?: any;
  actual?: any;
  message?: string;
}
