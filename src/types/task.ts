export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';

export type Language = 'th' | 'en';

export interface CategoryItem {
  id: string;
  name: string;
  color: string; // Tailwind color class or hex
}

export type TaskCategory = string;

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate: string; // ISO date string (YYYY-MM-DD)
  startDate?: string;
  estimatedHours?: number;
  subtasks: SubTask[];
  tags: string[];
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  taskId: string;
  taskTitle: string;
  action: 'created' | 'updated' | 'status_changed' | 'deleted' | 'rescheduled';
  details?: string;
  timestamp: string;
}

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isDemo?: boolean;
}

export type ActiveTab = 'overview' | 'board' | 'calendar' | 'todo';

export interface TaskFilterOptions {
  searchQuery: string;
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  category?: string | 'all';
  dueDateRange?: 'all' | 'today' | 'this_week' | 'overdue';
}
