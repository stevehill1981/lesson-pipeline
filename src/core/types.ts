export interface PlatformLanguage {
  id: string;
  name: string;
  validator: string;
  compiler?: string;
  file_extension: string;
  reference_docs?: string;
}

export interface PlatformEmulator {
  name: string;
  command: string;
  headless_flag?: string;
  controller?: string;
}

export interface PlatformDefinition {
  id: string;
  name: string;
  languages: PlatformLanguage[];
  emulator: PlatformEmulator;
  lesson_time_limits?: Record<string, string>;
}

export interface PatternMetadata {
  id: string;
  week: number;
  concept: string;
  dependencies: string[];
  code: string;
  data_statements?: string;
  memory_used?: number[];
  registers_touched?: number[];
  teaching_notes: string;
  wow_factor: number;
  line_count: number;
  optimization_level?: 'clear' | 'efficient' | 'professional';
}

export interface TestConfiguration {
  platform: string;
  program: string;
  runtime: string;
  inputs?: TestInput[];
  captures?: CaptureConfiguration;
}

export interface TestInput {
  time: string;
  device: 'keyboard' | 'joystick';
  key?: string;
  port?: number;
  action?: string;
  duration?: string;
}

export interface CaptureConfiguration {
  screenshots?: Screenshot[];
  video?: VideoCapture;
  audio?: AudioCapture;
}

export interface Screenshot {
  time: string;
  name: string;
}

export interface VideoCapture {
  start: string;
  end: string;
  name: string;
}

export interface AudioCapture {
  format: string;
  name: string;
}
