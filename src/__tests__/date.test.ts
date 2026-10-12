import { describe, it, expect } from 'vitest';
import { 
  formatDate, 
  formatDateLocale, 
  getTodayString, 
  isOverdue, 
  getMonthDays, 
  getWeekDays,
  isTaskOnDate,
  isTaskForToday,
  addDaysToDate
} from '../utils/date';
import { Task } from '../types/task';

describe('Date Utilities & Calendar Matrix', () => {
  it('should format date strings properly', () => {
    const formatted = formatDate('2026-08-25');
    expect(formatted).toContain('Aug');
    expect(formatted).toContain('25');
    expect(formatted).toContain('2026');
  });

  it('should format localized date strings for Thai and English', () => {
    const thDate = formatDateLocale('2026-08-25', 'th');
    const enDate = formatDateLocale('2026-08-25', 'en');
    expect(thDate).toBe('25 ส.ค. 2569');
    expect(enDate).toBe('25 Aug 2026');
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

  describe('isTaskOnDate', () => {
    const baseTask: Task = {
      id: 't-1',
      title: 'Test Task',
      description: '',
      status: 'todo',
      priority: 'high',
      category: 'General',
      dueDate: '2026-10-15',
      subtasks: [],
      tags: [],
      createdAt: '2026-10-10',
      updatedAt: '2026-10-10',
    };

    it('matches single day task by dueDate', () => {
      expect(isTaskOnDate(baseTask, '2026-10-15')).toBe(true);
      expect(isTaskOnDate(baseTask, '2026-10-14')).toBe(false);
      expect(isTaskOnDate(baseTask, '2026-10-16')).toBe(false);
    });

    it('matches multi-day task between startDate and dueDate inclusive', () => {
      const multiDayTask: Task = {
        ...baseTask,
        startDate: '2026-10-10',
        dueDate: '2026-10-15',
      };

      expect(isTaskOnDate(multiDayTask, '2026-10-09')).toBe(false);
      expect(isTaskOnDate(multiDayTask, '2026-10-10')).toBe(true);
      expect(isTaskOnDate(multiDayTask, '2026-10-12')).toBe(true);
      expect(isTaskOnDate(multiDayTask, '2026-10-15')).toBe(true);
      expect(isTaskOnDate(multiDayTask, '2026-10-16')).toBe(false);
    });

    it('handles ISO timestamp strings properly', () => {
      const isoTask: Task = {
        ...baseTask,
        startDate: '2026-10-10T15:30:00.000Z',
        dueDate: '2026-10-15T00:00:00.000Z',
      };

      expect(isTaskOnDate(isoTask, '2026-10-12')).toBe(true);
      expect(isTaskOnDate(isoTask, '2026-10-10')).toBe(true);
      expect(isTaskOnDate(isoTask, '2026-10-15')).toBe(true);
    });
  });

  describe('isTaskForToday', () => {
    const today = getTodayString();
    const yesterday = addDaysToDate(today, -1);
    const tomorrow = addDaysToDate(today, 1);

    const makeTask = (partial: Partial<Task>): Task => ({
      id: 'task-test',
      title: 'Sample Task',
      description: '',
      status: 'todo',
      priority: 'medium',
      category: 'General',
      dueDate: today,
      subtasks: [],
      tags: [],
      createdAt: today,
      updatedAt: today,
      ...partial,
    });

    it('includes tasks explicitly scheduled for today', () => {
      const task = makeTask({ dueDate: today });
      expect(isTaskForToday(task, today)).toBe(true);
    });

    it('includes multi-day tasks active today created on another page', () => {
      const task = makeTask({ startDate: yesterday, dueDate: tomorrow });
      expect(isTaskForToday(task, today)).toBe(true);
    });

    it('includes overdue incomplete tasks so they show up on home page', () => {
      const overdueIncomplete = makeTask({ dueDate: yesterday, status: 'todo' });
      expect(isTaskForToday(overdueIncomplete, today)).toBe(true);
    });

    it('excludes completed overdue tasks', () => {
      const overdueDone = makeTask({ dueDate: yesterday, status: 'completed' });
      expect(isTaskForToday(overdueDone, today)).toBe(false);
    });

    it('excludes future tasks', () => {
      const futureTask = makeTask({ dueDate: tomorrow, status: 'todo' });
      expect(isTaskForToday(futureTask, today)).toBe(false);
    });

    it('includes in-progress tasks regardless of date', () => {
      const inProgressTask = makeTask({ dueDate: tomorrow, status: 'in_progress' });
      expect(isTaskForToday(inProgressTask, today)).toBe(true);
    });
  });
});

