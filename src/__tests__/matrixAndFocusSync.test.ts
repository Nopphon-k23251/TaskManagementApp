import { describe, it, expect } from 'vitest';
import { Task } from '../types/task';
import { getTodayString, addDaysToDate } from '../utils/date';

describe('Eisenhower Matrix Quadrant Exclusivity', () => {
  const today = getTodayString();
  const future = addDaysToDate(today, 5);
  const overdue = addDaysToDate(today, -2);

  const mockTasks: Task[] = [
    {
      id: 'task-1',
      title: 'Urgent task due in future',
      description: '',
      status: 'todo',
      priority: 'urgent',
      category: 'Work',
      dueDate: future,
      subtasks: [],
      tags: [],
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'task-2',
      title: 'High priority overdue',
      description: '',
      status: 'todo',
      priority: 'high',
      category: 'Work',
      dueDate: overdue,
      subtasks: [],
      tags: [],
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'task-3',
      title: 'High priority due in future',
      description: '',
      status: 'todo',
      priority: 'high',
      category: 'Work',
      dueDate: future,
      subtasks: [],
      tags: [],
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'task-4',
      title: 'Medium priority due today',
      description: '',
      status: 'todo',
      priority: 'medium',
      category: 'Work',
      dueDate: today,
      subtasks: [],
      tags: [],
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'task-5',
      title: 'Low priority backlog',
      description: '',
      status: 'todo',
      priority: 'low',
      category: 'Work',
      dueDate: future,
      subtasks: [],
      tags: [],
      createdAt: '',
      updatedAt: '',
    },
  ];

  it('partitions all active tasks into mutually exclusive quadrants without duplicate or missing tasks', () => {
    const isTodayOrOverdue = (date: string) => date === today || date < today;

    const doFirstTasks = mockTasks.filter(
      (t) => t.priority === 'urgent' || (t.priority === 'high' && isTodayOrOverdue(t.dueDate))
    );

    const scheduleTasks = mockTasks.filter(
      (t) => !doFirstTasks.includes(t) && t.priority === 'high'
    );

    const delegateTasks = mockTasks.filter(
      (t) => !doFirstTasks.includes(t) && !scheduleTasks.includes(t) && isTodayOrOverdue(t.dueDate)
    );

    const backlogTasks = mockTasks.filter(
      (t) => !doFirstTasks.includes(t) && !scheduleTasks.includes(t) && !delegateTasks.includes(t)
    );

    // Sum of tasks in all quadrants must equal total active tasks
    const totalPartitioned = doFirstTasks.length + scheduleTasks.length + delegateTasks.length + backlogTasks.length;
    expect(totalPartitioned).toBe(mockTasks.length);

    // No overlap between any two quadrants
    const allAssignedIds = [
      ...doFirstTasks.map((t) => t.id),
      ...scheduleTasks.map((t) => t.id),
      ...delegateTasks.map((t) => t.id),
      ...backlogTasks.map((t) => t.id),
    ];
    const uniqueIds = new Set(allAssignedIds);
    expect(uniqueIds.size).toBe(mockTasks.length);

    // Task-1 (priority urgent) belongs only to Q1
    expect(doFirstTasks.map((t) => t.id)).toContain('task-1');
    expect(scheduleTasks.map((t) => t.id)).not.toContain('task-1');

    // Task-2 (high priority overdue) belongs to Q1
    expect(doFirstTasks.map((t) => t.id)).toContain('task-2');

    // Task-3 (high priority future) belongs to Q2 (Schedule)
    expect(scheduleTasks.map((t) => t.id)).toContain('task-3');

    // Task-4 (medium priority today) belongs to Q3 (Delegate / Quick)
    expect(delegateTasks.map((t) => t.id)).toContain('task-4');

    // Task-5 (low priority future) belongs to Q4 (Backlog)
    expect(backlogTasks.map((t) => t.id)).toContain('task-5');
  });
});
