import { describe, it, expect } from 'vitest';
import { 
  getTaskDependencyStatus, 
  detectCircularDependency, 
  getDownstreamTasks 
} from '../utils/dependencies';
import { 
  getDaysDifference, 
  addDaysToDate, 
  generateTimelineDays 
} from '../utils/date';
import { validateTaskForm } from '../utils/sanitizer';
import { Task } from '../types/task';

describe('Gantt Timeline & Task Dependencies Unit Tests', () => {
  const sampleTasks: Task[] = [
    {
      id: 'task-a',
      title: 'Task A (Design)',
      description: 'Initial design',
      status: 'in_progress',
      priority: 'high',
      category: 'Design',
      startDate: '2026-08-20',
      dueDate: '2026-08-22',
      dependencies: [],
      subtasks: [],
      tags: [],
      createdAt: '2026-08-20T00:00:00Z',
      updatedAt: '2026-08-20T00:00:00Z',
    },
    {
      id: 'task-b',
      title: 'Task B (Development)',
      description: 'Frontend implementation',
      status: 'todo',
      priority: 'medium',
      category: 'Dev',
      startDate: '2026-08-23',
      dueDate: '2026-08-26',
      dependencies: ['task-a'],
      subtasks: [],
      tags: [],
      createdAt: '2026-08-20T00:00:00Z',
      updatedAt: '2026-08-20T00:00:00Z',
    },
    {
      id: 'task-c',
      title: 'Task C (Deployment)',
      description: 'Production release',
      status: 'todo',
      priority: 'urgent',
      category: 'DevOps',
      startDate: '2026-08-27',
      dueDate: '2026-08-30',
      dependencies: ['task-b'],
      subtasks: [],
      tags: [],
      createdAt: '2026-08-20T00:00:00Z',
      updatedAt: '2026-08-20T00:00:00Z',
    }
  ];

  it('correctly identifies blocked tasks when prerequisite is incomplete', () => {
    const statusA = getTaskDependencyStatus(sampleTasks[0], sampleTasks);
    expect(statusA.isBlocked).toBe(false);
    expect(statusA.blockedBy).toHaveLength(0);

    const statusB = getTaskDependencyStatus(sampleTasks[1], sampleTasks);
    expect(statusB.isBlocked).toBe(true);
    expect(statusB.blockedBy).toHaveLength(1);
    expect(statusB.blockedBy[0].id).toBe('task-a');
  });

  it('unblocks task when prerequisite is completed', () => {
    const updatedTasks = sampleTasks.map((t) =>
      t.id === 'task-a' ? { ...t, status: 'completed' as const } : t
    );
    const statusB = getTaskDependencyStatus(updatedTasks[1], updatedTasks);
    expect(statusB.isBlocked).toBe(false);
    expect(statusB.blockedBy).toHaveLength(0);
  });

  it('detects circular dependencies correctly', () => {
    // A cannot depend on A
    expect(detectCircularDependency('task-a', 'task-a', sampleTasks)).toBe(true);

    // B depends on A. A cannot depend on B.
    expect(detectCircularDependency('task-a', 'task-b', sampleTasks)).toBe(true);

    // C depends on B (which depends on A). A cannot depend on C.
    expect(detectCircularDependency('task-a', 'task-c', sampleTasks)).toBe(true);

    // C can depend on A (no cycle)
    expect(detectCircularDependency('task-c', 'task-a', sampleTasks)).toBe(false);
  });

  it('finds downstream cascaded tasks properly', () => {
    const downstreamOfA = getDownstreamTasks('task-a', sampleTasks);
    const ids = downstreamOfA.map((t) => t.id);
    expect(ids).toContain('task-b');
    expect(ids).toContain('task-c');
  });

  it('calculates Gantt day difference and offset accurately', () => {
    expect(getDaysDifference('2026-08-20', '2026-08-20')).toBe(1);
    expect(getDaysDifference('2026-08-20', '2026-08-22')).toBe(3);
    expect(addDaysToDate('2026-08-20', 5)).toBe('2026-08-25');
  });

  it('generates timeline days for Gantt matrix', () => {
    const days = generateTimelineDays('2026-08-20', 7, 'th');
    expect(days).toHaveLength(7);
    expect(days[0].dateStr).toBe('2026-08-20');
    expect(days[6].dateStr).toBe('2026-08-26');
  });

  it('validates start date and prevents start date > due date', () => {
    const invalidForm = validateTaskForm({
      title: 'Valid Title',
      startDate: '2026-08-25',
      dueDate: '2026-08-20',
      status: 'todo',
      priority: 'high',
      category: 'General',
    });
    expect(invalidForm.isValid).toBe(false);
    expect(invalidForm.errors.startDate).toBeDefined();

    const validForm = validateTaskForm({
      title: 'Valid Title',
      startDate: '2026-08-20',
      dueDate: '2026-08-25',
      status: 'todo',
      priority: 'high',
      category: 'General',
    });
    expect(validForm.isValid).toBe(true);
  });
});
