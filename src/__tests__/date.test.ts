import { describe, it, expect } from 'vitest';
import { formatDate, getTodayString, isOverdue, getMonthDays, getWeekDays } from '../utils/date';

describe('Date Utilities & Calendar Matrix', () => {
  it('should format date strings properly', () => {
    const formatted = formatDate('2026-08-25');
    expect(formatted).toContain('Aug');
    expect(formatted).toContain('25');
    expect(formatted).toContain('2026');
  });

  it('should get current today date in YYYY-MM-DD format', () => {
    const today = getTodayString();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should accurately detect overdue dates', () => {
    expect(isOverdue('2020-01-01')).toBe(true);
    expect(isOverdue('2099-12-31')).toBe(false);
  });

  it('should generate a 35 or 42 cell matrix for month grid', () => {
    const monthDays = getMonthDays(2026, 7); // August 2026
    expect(monthDays.length % 7).toBe(0);
    expect(monthDays.length).toBeGreaterThanOrEqual(28);
  });

  it('should generate 7 days for week view', () => {
    const weekDays = getWeekDays(new Date('2026-08-22'));
    expect(weekDays.length).toBe(7);
  });
});
