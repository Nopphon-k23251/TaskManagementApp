import { describe, it, expect } from 'vitest';
import { TIMER_DURATIONS, formatTimerDisplay } from '../context/TimerContext';

describe('TimerContext utilities', () => {
  it('defines correct durations for Pomodoro modes', () => {
    expect(TIMER_DURATIONS.focus).toBe(25 * 60);
    expect(TIMER_DURATIONS.short_break).toBe(5 * 60);
    expect(TIMER_DURATIONS.long_break).toBe(15 * 60);
  });

  it('formats timer display strings accurately (mm:ss)', () => {
    expect(formatTimerDisplay(25 * 60)).toBe('25:00');
    expect(formatTimerDisplay(5 * 60)).toBe('05:00');
    expect(formatTimerDisplay(59)).toBe('00:59');
    expect(formatTimerDisplay(9)).toBe('00:09');
    expect(formatTimerDisplay(0)).toBe('00:00');
  });
});
