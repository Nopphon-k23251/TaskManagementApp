import { Task } from '../types/task';
import { isOverdue } from './date';

export interface DependencyStatus {
  isBlocked: boolean;
  blockedBy: Task[];
  delayedBy: Task[];
  hasWarning: boolean;
  uncompletedDependenciesCount: number;
}

/**
 * Evaluates whether a given task is currently blocked by unfinished prerequisite tasks,
 * and whether any prerequisite task is delayed/overdue (triggering a Visual Warning ⚠️).
 */
export function getTaskDependencyStatus(task: Task, allTasks: Task[]): DependencyStatus {
  if (!task.dependencies || task.dependencies.length === 0) {
    return {
      isBlocked: false,
      blockedBy: [],
      delayedBy: [],
      hasWarning: false,
      uncompletedDependenciesCount: 0,
    };
  }

  const taskMap = new Map<string, Task>();
  allTasks.forEach((t) => taskMap.set(t.id, t));

  const blockedBy: Task[] = [];
  const delayedBy: Task[] = [];

  const taskStart = task.startDate || task.dueDate;

  for (const depId of task.dependencies) {
    const parent = taskMap.get(depId);
    if (parent) {
      if (parent.status !== 'completed') {
        blockedBy.push(parent);

        // Check if prerequisite is delayed:
        // 1. Parent is overdue, OR
        // 2. Parent's due date exceeds or equals child's start date
        const parentOverdue = isOverdue(parent.dueDate);
        const parentEndsAfterChildStart = Boolean(parent.dueDate && taskStart && parent.dueDate > taskStart);

        if (parentOverdue || parentEndsAfterChildStart) {
          delayedBy.push(parent);
        }
      }
    }
  }

  return {
    isBlocked: blockedBy.length > 0 && task.status !== 'completed',
    blockedBy,
    delayedBy,
    hasWarning: delayedBy.length > 0 && task.status !== 'completed',
    uncompletedDependenciesCount: blockedBy.length,
  };
}

/**
 * Checks for circular dependencies before adding a new dependency.
 * Returns true if adding `targetDependencyId` to `currentTaskId` would create a circular loop.
 */
export function detectCircularDependency(
  currentTaskId: string,
  targetDependencyId: string,
  allTasks: Task[]
): boolean {
  if (currentTaskId === targetDependencyId) {
    return true;
  }

  const taskMap = new Map<string, Task>();
  allTasks.forEach((t) => taskMap.set(t.id, t));

  const visited = new Set<string>();

  function hasPathToCurrent(nodeId: string): boolean {
    if (nodeId === currentTaskId) return true;
    if (visited.has(nodeId)) return false;
    visited.add(nodeId);

    const node = taskMap.get(nodeId);
    if (!node || !node.dependencies) return false;

    for (const depId of node.dependencies) {
      if (hasPathToCurrent(depId)) {
        return true;
      }
    }
    return false;
  }

  return hasPathToCurrent(targetDependencyId);
}

/**
 * Returns all downstream tasks directly or indirectly affected by a task.
 */
export function getDownstreamTasks(taskId: string, allTasks: Task[]): Task[] {
  const downstream: Task[] = [];
  const queue = [taskId];
  const visited = new Set<string>([taskId]);

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    for (const t of allTasks) {
      if (t.dependencies?.includes(currentId) && !visited.has(t.id)) {
        visited.add(t.id);
        downstream.push(t);
        queue.push(t.id);
      }
    }
  }

  return downstream;
}
