# frozen_string_literal: true

# Base module defining the interface all emulator adapters must implement
module EmulatorAdapter
  # Connection lifecycle
  def connect; end
  def disconnect; end
  def alive?; end

  # Metadata
  def name; end
  def platform; end
  def capabilities; end
  def supports?(action); end

  # Program execution
  def load_program(path, options = {}); end
  def run; end
  def reset; end

  # Input injection
  def inject_keys(keys); end

  # Output capture
  def wait_for_text(text, options = {}); end
  def read_memory(start_address, length); end
end
