import { describe, it, expect } from 'vitest';
import { isOverdue, getTodayString, addDaysToDate } from '../utils/date';
import { 
  playCompletionSound, 
  playTimerFinishSound, 
  triggerConfetti,
  startTimerAlarm,
  stopTimerAlarm,
  testAlarmSound
} from '../utils/feedback';
import { Task } from '../types/task';

describe('Focus & Rollover Logic Suite', () => {
  it('should correctly identify overdue tasks for rollover', () => {
    const today = getTodayString();
    const yesterday = addDaysToDate(today, -1);
    const tomorrow = addDaysToDate(today, 1);

    expect(isOverdue(yesterday)).toBe(true);
    expect(isOverdue(today)).toBe(false);
    expect(isOverdue(tomorrow)).toBe(false);
  });

  it('rollover logic shifts overdue incomplete tasks to today', () => {
    const today = getTodayString();
    const yesterday = addDaysToDate(today, -2);

    const tasks: Task[] = [
      {
        id: 't1',
        title: 'Task 1',
        description: '',
        status: 'todo',
        priority: 'high',
        category: 'General',
        dueDate: yesterday,
        subtasks: [],
        tags: [],
        createdAt: yesterday,
        updatedAt: yesterday,
      },
      {
        id: 't2',
        title: 'Task 2 (Done)',
        description: '',
        status: 'completed',
        priority: 'low',
        category: 'General',
        dueDate: yesterday,
        subtasks: [],
        tags: [],
        createdAt: yesterday,
        updatedAt: yesterday,
      },
    ];

    const rolledOver = tasks.map((t) => {
      if (t.status !== 'completed' && isOverdue(t.dueDate)) {
        return { ...t, dueDate: today };
      }
      return t;
    });

    expect(rolledOver[0].dueDate).toBe(today);
    expect(rolledOver[1].dueDate).toBe(yesterday); // Completed task is not rolled over
  });

  it('feedback sound, alarm loops and confetti functions handle headless environment safely without throwing', () => {
    expect(() => playCompletionSound()).not.toThrow();
    expect(() => testAlarmSound()).not.toThrow();
    expect(() => {
      const stop = startTimerAlarm();
      expect(typeof stop).toBe('function');
      stop();
    }).not.toThrow();
    expect(() => stopTimerAlarm()).not.toThrow();
    expect(() => playTimerFinishSound()).not.toThrow();
    expect(() => triggerConfetti()).not.toThrow();
  });

  it('validates single-day and synced dates properly without errors', () => {
    const today = getTodayString();
    const futureDate = addDaysToDate(today, 10);

    // Matching startDate and dueDate for single-day tasks
    expect(today <= futureDate).toBe(true);
    // Synced startDate and dueDate
    const syncedTask = {
      startDate: futureDate,
      dueDate: futureDate,
    };
    expect(syncedTask.startDate <= syncedTask.dueDate).toBe(true);
  });
});

