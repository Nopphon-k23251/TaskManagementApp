import { describe, it, expect } from 'vitest';
import { calculateStreak, calculateBestStreak, toggleHabitDate } from '../utils/habits';
import { Habit } from '../types/task';

describe('Habit Streaks & Calculation Suite', () => {
  it('should return 0 streak for empty completed dates', () => {
    expect(calculateStreak([])).toBe(0);
  });

  it('should calculate active streak correctly when completed today', () => {
    const today = '2026-10-11';
    const completedDates = ['2026-10-09', '2026-10-10', '2026-10-11'];
    expect(calculateStreak(completedDates, today)).toBe(3);
  });

  it('should maintain active streak when completed yesterday but not yet today', () => {
    const today = '2026-10-11';
    const completedDates = ['2026-10-09', '2026-10-10'];
    expect(calculateStreak(completedDates, today)).toBe(2);
  });

  it('should break streak (return 0) if last completion was before yesterday', () => {
    const today = '2026-10-11';
    const completedDates = ['2026-10-08', '2026-10-09'];
    expect(calculateStreak(completedDates, today)).toBe(0);
  });

  it('should calculate all-time best streak properly', () => {
    const dates = [
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04', // 4 days streak
      '2026-10-07',
      '2026-10-08', // 2 days streak
    ];
    expect(calculateBestStreak(dates)).toBe(4);
  });

  it('should toggle habit completion on and off correctly', () => {
    const sampleHabit: Habit = {
      id: 'h1',
      title: 'Workout',
      completedDates: ['2026-10-10'],
      streak: 1,
      bestStreak: 1,
      createdAt: '2026-10-01',
    };

    // Toggle today (2026-10-11) on
    const toggledOn = toggleHabitDate(sampleHabit, '2026-10-11');
    expect(toggledOn.completedDates).toContain('2026-10-11');

    // Toggle today off
    const toggledOff = toggleHabitDate(toggledOn, '2026-10-11');
    expect(toggledOff.completedDates).not.toContain('2026-10-11');
  });
});
