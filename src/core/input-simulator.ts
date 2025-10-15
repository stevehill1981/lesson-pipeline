export type InputDevice = 'keyboard' | 'joystick';
export type JoystickAction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'FIRE';

export interface InputEvent {
  time: number;
  device: InputDevice;
  key?: string;
  port?: number;
  action?: JoystickAction;
}

export class InputSimulator {
  private events: InputEvent[] = [];

  addKeyPress(time: number, key: string): void {
    this.events.push({
      time,
      device: 'keyboard',
      key
    });
  }

  addJoystickAction(time: number, port: number, action: JoystickAction): void {
    this.events.push({
      time,
      device: 'joystick',
      port,
      action
    });
  }

  getEventsForTime(currentTime: number): InputEvent[] {
    return this.events.filter(e => e.time <= currentTime && e.time > currentTime - 100);
  }

  getAllEvents(): InputEvent[] {
    return [...this.events].sort((a, b) => a.time - b.time);
  }

  toViceCommands(): string[] {
    // Convert to VICE monitor commands
    return this.events.map(event => {
      if (event.device === 'keyboard' && event.key) {
        return `keybuf "${event.key}"`;
      } else if (event.device === 'joystick' && event.action) {
        const port = event.port || 2;
        return `joystick ${port} ${event.action.toLowerCase()}`;
      }
      return '';
    }).filter(cmd => cmd !== '');
  }
}
