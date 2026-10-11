export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';

export type TimerMode = 'focus' | 'short_break' | 'long_break';

export type Language = 'th' | 'en';

export interface CategoryItem {
  id: string;
  name: string;
  color: string; // Tailwind color class or hex
  customBg?: string;
  customText?: string;
  customBorder?: string;
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
  startDate?: string; // ISO date string (YYYY-MM-DD)
  dueDate: string;    // ISO date string (YYYY-MM-DD)
  startTime?: string; // HH:mm format (e.g. "09:00")
  dueTime?: string;   // HH:mm format (e.g. "17:30")
  dependencies?: string[]; // Array of task IDs that this task is blocked by (prerequisites)
  estimatedHours?: number;
  order?: number; // Custom display sequence index
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

export type ActiveTab = 
  | 'focus' 
  | 'tasks' 
  | 'calendar' 
  | 'insights'
  | 'overview' 
  | 'board' 
  | 'timeline' 
  | 'todo';

export interface Habit {
  id: string;
  title: string;
  icon?: string;
  category?: string;
  completedDates: string[]; // ISO date string YYYY-MM-DD
  streak: number;
  bestStreak?: number;
  createdAt: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  durationMinutes: number;
  completedAt: string;
}

export interface TaskFilterOptions {
  searchQuery: string;
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  category?: string | 'all';
  dueDateRange?: 'all' | 'today' | 'this_week' | 'overdue';
}

