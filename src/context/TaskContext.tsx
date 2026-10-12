import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import { 
  Task, 
  TaskStatus, 
  CategoryItem, 
  ActivityLog, 
  TaskFilterOptions,
  Habit,
  FocusSession
} from '../types/task';
import { useAuth } from './AuthContext';
import { 
  subscribeToTasks, 
  subscribeToCategories,
  syncSaveTaskToFirestore, 
  syncDeleteTaskFromFirestore,
  syncCategoriesToFirestore 
} from '../services/firebase';
import { 
  getTodayString, 
  addDaysToDate, 
  isOverdue, 
  isToday, 
  isThisWeek,
  isTaskOnDate 
} from '../utils/date';
import { toggleHabitDate } from '../utils/habits';
import { sanitizeInput, validateJsonImportPayload } from '../utils/sanitizer';
import { appRateLimiter } from '../utils/security';

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'cat-1', name: 'งานออกแบบ', color: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/50' },
  { id: 'cat-2', name: 'งานระบบ', color: 'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/50' },
  { id: 'cat-3', name: 'งานฟีเจอร์', color: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/50' },
  { id: 'cat-4', name: 'งานวิจัย', color: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/50' },
  { id: 'cat-5', name: 'ทั่วไป', color: 'bg-slate-200 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700' },
];

export const COLOR_OPTIONS = [
  { name: 'ฟ้าไซเบอร์', class: 'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/50' },
  { name: 'กุหลาบเลเซอร์', class: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/50' },
  { name: 'ม่วงพลาสมา', class: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/50' },
  { name: 'เขียวเมทริกซ์', class: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/50' },
  { name: 'ส้มอำพัน', class: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/50' },
  { name: 'คราม', class: 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/50' },
  { name: 'เทาคลาสสิก', class: 'bg-slate-200 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700' },
];

interface TaskContextType {
  tasks: Task[];
  filteredTasks: Task[];
  categories: CategoryItem[];
  activityLogs: ActivityLog[];
  habits: Habit[];
  focusSessions: FocusSession[];
  activeFocusTask: Task | null;
  todayFocusMinutes: number;
  filters: TaskFilterOptions;
  isRealtimeSyncing: boolean;
  setFilters: React.Dispatch<React.SetStateAction<TaskFilterOptions>>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTaskStatus: (id: string, newStatus: TaskStatus) => Promise<void>;
  updateTaskDueDate: (id: string, newDueDate: string) => Promise<void>;
  updateTaskDate: (id: string, newDueDate: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  resetFilters: () => void;
  addCategory: (name: string, color?: string, customProps?: { customBg?: string; customText?: string; customBorder?: string }) => void;
  updateCategory: (id: string, name: string, color?: string, customProps?: { customBg?: string; customText?: string; customBorder?: string }) => void;
  deleteCategory: (id: string) => void;
  resetToSampleData: () => void;
  clearAllTasks: () => void;
  clearCompletedTasks: () => void;
  reorderTasks: (newTasks: Task[]) => void;
  exportTasksJson: () => string;
  importTasksJson: (jsonStr: string) => boolean;
  setActiveFocusTask: (task: Task | null) => void;
  toggleHabit: (id: string, dateStr?: string) => Promise<void>;
  addHabit: (title: string, category?: string, icon?: string) => Promise<string>;
  deleteHabit: (id: string) => Promise<void>;
  logFocusSession: (session: { taskId?: string; taskTitle?: string; durationMinutes: number }) => Promise<void>;
  rolloverUnfinishedTasks: () => Promise<number>;
}

const DEFAULT_FILTERS: TaskFilterOptions = {
  searchQuery: '',
  status: 'all',
  priority: 'all',
  category: 'all',
  dueDateRange: 'all',
};

const INITIAL_SAMPLE_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'ออกแบบ UI/UX ระบบ Kanban และ Dashboard ภาษาไทย',
    description: 'พัฒนาระบบรองรับทั้งมือถือและคอมพิวเตอร์ รองรับ Dark/Light Mode และจัดการหมวดหมู่ได้เอง',
    status: 'in_progress',
    priority: 'urgent',
    category: 'งานออกแบบ',
    startDate: addDaysToDate(getTodayString(), -3),
    dueDate: addDaysToDate(getTodayString(), 1),
    dependencies: [],
    order: 0,
    subtasks: [
      { id: 'st-1', title: 'จัดทำระบบสองภาษา TH/EN', completed: true },
      { id: 'st-2', title: 'ปรับปรุง Responsive ให้ใช้งานง่ายบนมือถือ', completed: true },
      { id: 'st-3', title: 'เพิ่มระบบ User Edit Category เองได้', completed: true }
    ],
    tags: ['UI/UX', 'Mobile', 'Frontend'],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'เชื่อมต่อ Firebase Google Auth & Firestore Cloud Sync',
    description: 'ตั้งค่าการซิงก์ข้อมูลงานกับ Firebase แบบเรียลไทม์ และรองรับ Offline Local Storage',
    status: 'completed',
    priority: 'high',
    category: 'งานระบบ',
    startDate: addDaysToDate(getTodayString(), -6),
    dueDate: addDaysToDate(getTodayString(), -2),
    dependencies: [],
    order: 1,
    subtasks: [
      { id: 'st-4', title: 'บันทึก Config ในไฟล์ .env', completed: true },
      { id: 'st-5', title: 'ทดสอบการ Sign in ด้วย Google', completed: true }
    ],
    tags: ['Firebase', 'Auth', 'Cloud'],
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'พัฒนาระบบปฏิทิน และ Gantt Timeline Drag & Drop',
    description: 'สามารถลากการ์ดงานวางลงในช่องวันที่เพื่อเลื่อนกำหนดส่ง และดูไทม์ไลน์โปรเจกต์พร้อม Visual Warning',
    status: 'in_progress',
    priority: 'high',
    category: 'งานฟีเจอร์',
    startDate: addDaysToDate(getTodayString(), 0),
    dueDate: addDaysToDate(getTodayString(), 4),
    dependencies: ['task-1'],
    order: 2,
    subtasks: [
      { id: 'st-6', title: 'สร้าง Matrix ปฏิทินรายเดือน', completed: true },
      { id: 'st-7', title: 'พัฒนา Gantt Chart & Dependency Lines', completed: true },
      { id: 'st-8', title: 'ระบบเตือนภัยงานต้นทางล่าช้า', completed: true }
    ],
    tags: ['Gantt', 'Timeline', 'Dependencies'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'เขียนชุดทดสอบ Unit Tests และทดสอบความปลอดภัย XSS',
    description: 'ตรวจสอบ Input Sanitization ป้องกัน Script Injection และตรวจเช็ก Form Validation ครบทุกฟิลด์',
    status: 'todo',
    priority: 'medium',
    category: 'งานระบบ',
    startDate: addDaysToDate(getTodayString(), 3),
    dueDate: addDaysToDate(getTodayString(), 8),
    dependencies: ['task-3'],
    order: 3,
    subtasks: [
      { id: 'st-9', title: 'ทดสอบ Date Matrix Utils', completed: true },
      { id: 'st-10', title: 'ทดสอบ Circular Dependencies & XSS', completed: true }
    ],
    tags: ['Testing', 'Vitest', 'Security'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const INITIAL_SAMPLE_HABITS: Habit[] = [
  {
    id: 'habit-1',
    title: 'อ่านหนังสือ / อัปเดตความรู้ 20 นาที',
    icon: 'BookOpen',
    category: 'งานวิจัย',
    completedDates: [addDaysToDate(getTodayString(), -2), addDaysToDate(getTodayString(), -1), getTodayString()],
    streak: 3,
    bestStreak: 7,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit-2',
    title: 'ออกกำลังกาย / ยืดเส้นสาย 15 นาที',
    icon: 'Activity',
    category: 'ทั่วไป',
    completedDates: [addDaysToDate(getTodayString(), -1), getTodayString()],
    streak: 2,
    bestStreak: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit-3',
    title: 'ดื่มน้ำสะอาดให้ครบ 2 ลิตร',
    icon: 'Droplets',
    category: 'ทั่วไป',
    completedDates: [addDaysToDate(getTodayString(), -1)],
    streak: 1,
    bestStreak: 12,
    createdAt: new Date().toISOString(),
  },
];

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isFirebaseActive } = useAuth();
  const [isRealtimeSyncing, setIsRealtimeSyncing] = useState(false);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    const cached = localStorage.getItem('tm_tasks');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_SAMPLE_TASKS;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const cached = localStorage.getItem('tm_habits');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_SAMPLE_HABITS;
  });

  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(() => {
    const cached = localStorage.getItem('tm_focus_sessions');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const [activeFocusTask, setActiveFocusTask] = useState<Task | null>(null);

  const todayFocusMinutes = useMemo(() => {
    const today = getTodayString();
    return focusSessions
      .filter((s) => s.completedAt.startsWith(today))
      .reduce((sum, s) => sum + s.durationMinutes, 0);
  }, [focusSessions]);

  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    const cached = localStorage.getItem('tm_categories');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_CATEGORIES;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const cached = localStorage.getItem('tm_activity_logs');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    return [
      {
        id: 'log-1',
        taskId: 'task-1',
        taskTitle: 'ออกแบบ UI/UX ระบบ Kanban และ Dashboard ภาษาไทย',
        action: 'status_changed',
        details: 'ย้ายไปยัง กำลังทำ (In Progress)',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      }
    ];
  });

  const [filters, setFilters] = useState<TaskFilterOptions>(DEFAULT_FILTERS);

  // Setup Cross-Tab BroadcastChannel for instantaneous (0ms) sync between tabs in the same browser
  useEffect(() => {
    try {
      const bc = new BroadcastChannel('tm_sync_channel');
      broadcastChannelRef.current = bc;
      bc.onmessage = (event) => {
        if (event.data?.type === 'TASKS_UPDATED' && Array.isArray(event.data.tasks)) {
          setTasks(event.data.tasks);
        }
        if (event.data?.type === 'CATEGORIES_UPDATED' && Array.isArray(event.data.categories)) {
          setCategories(event.data.categories);
        }
        if (event.data?.type === 'HABITS_UPDATED' && Array.isArray(event.data.habits)) {
          setHabits(event.data.habits);
        }
      };
      return () => {
        bc.close();
      };
    } catch {
      // BroadcastChannel unsupported fallback
    }
  }, []);

  const broadcastLocalUpdate = (updatedTasks: Task[], updatedCategories?: CategoryItem[]) => {
    localStorage.setItem('tm_tasks', JSON.stringify(updatedTasks));
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type: 'TASKS_UPDATED', tasks: updatedTasks });
      if (updatedCategories) {
        broadcastChannelRef.current.postMessage({ type: 'CATEGORIES_UPDATED', categories: updatedCategories });
      }
    }
  };

  // Cache to localStorage
  useEffect(() => {
    localStorage.setItem('tm_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('tm_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('tm_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('tm_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('tm_focus_sessions', JSON.stringify(focusSessions));
  }, [focusSessions]);

  // Realtime Cloud Synchronization with Firestore (Cross-Device: Desktop <-> Mobile)
  useEffect(() => {
    if (!isFirebaseActive || !user || user.isDemo) {
      setIsRealtimeSyncing(false);
      return;
    }

    setIsRealtimeSyncing(true);

    // 1. Subscribe to User Tasks in Realtime from Cloud Firestore
    const unsubscribeTasks = subscribeToTasks(user.uid, (cloudTasks) => {
      if (cloudTasks && cloudTasks.length > 0) {
        setTasks(cloudTasks);
        localStorage.setItem('tm_tasks', JSON.stringify(cloudTasks));
      } else {
        // If user has 0 tasks on Firestore, upload local sample tasks so other devices see them
        const localTasks = tasks;
        if (localTasks.length > 0) {
          localTasks.forEach((t) => {
            syncSaveTaskToFirestore({
              ...t,
              userId: user.uid,
              createdAt: t.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }).catch(() => {});
          });
        }
      }
    });

    // 2. Subscribe to User Categories in Realtime from Cloud Firestore
    const unsubscribeCategories = subscribeToCategories(user.uid, (cloudCategories) => {
      if (cloudCategories && cloudCategories.length > 0) {
        setCategories(cloudCategories);
        localStorage.setItem('tm_categories', JSON.stringify(cloudCategories));
      }
    });

    return () => {
      unsubscribeTasks();
      unsubscribeCategories();
    };
  }, [user, isFirebaseActive]);

  const addActivity = (taskId: string, taskTitle: string, action: ActivityLog['action'], details?: string) => {
    const newLog: ActivityLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      taskId,
      taskTitle,
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const now = new Date().toISOString();
    const taskId = 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const newTask: Task = {
      ...taskData,
      id: taskId,
      title: sanitizeInput(taskData.title),
      description: sanitizeInput(taskData.description),
      order: 0,
      userId: user?.uid,
      createdAt: now,
      updatedAt: now,
    };

    const nextTasks = [newTask, ...tasks.map((t, idx) => ({ ...t, order: idx + 1 }))];
    setTasks(nextTasks);
    broadcastLocalUpdate(nextTasks);
    addActivity(taskId, newTask.title, 'created', `สร้างในหมวดหมู่: ${newTask.category}`);

    // Sync to Firestore
    if (isFirebaseActive && user && !user.isDemo) {
      await syncSaveTaskToFirestore(newTask);
    }

    return taskId;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const cleanUpdates = { ...updates };
    if (cleanUpdates.title) cleanUpdates.title = sanitizeInput(cleanUpdates.title);
    if (cleanUpdates.description) cleanUpdates.description = sanitizeInput(cleanUpdates.description);
    cleanUpdates.updatedAt = new Date().toISOString();

    let updatedTargetTask: Task | null = null;
    const nextTasks = tasks.map((task) => {
      if (task.id === id) {
        const updated = { ...task, ...cleanUpdates };
        updatedTargetTask = updated;
        addActivity(id, updated.title, 'updated', 'อัปเดตรายละเอียดงาน');
        return updated;
      }
      return task;
    });

    setTasks(nextTasks);
    if (activeFocusTask?.id === id && updatedTargetTask) {
      setActiveFocusTask(updatedTargetTask);
    }
    broadcastLocalUpdate(nextTasks);

    // Sync to Firestore
    if (isFirebaseActive && user && !user.isDemo && updatedTargetTask) {
      await syncSaveTaskToFirestore({ ...(updatedTargetTask as Task), userId: user.uid });
    }
  };

  const deleteTask = async (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (target) {
      addActivity(id, target.title, 'deleted', 'ลบงานออกจากระบบ');
    }
    const nextTasks = tasks.filter((t) => t.id !== id);
    setTasks(nextTasks);
    if (activeFocusTask?.id === id) {
      setActiveFocusTask(null);
    }
    broadcastLocalUpdate(nextTasks);

    // Sync to Firestore
    if (isFirebaseActive && user && !user.isDemo) {
      await syncDeleteTaskFromFirestore(id);
    }
  };

  const updateTaskStatus = async (id: string, newStatus: TaskStatus) => {
    const statusTitles: Record<TaskStatus, string> = {
      todo: 'รอดำเนินการ (To Do)',
      in_progress: 'กำลังทำ (In Progress)',
      review: 'ตรวจทาน (Review)',
      completed: 'เสร็จสิ้น (Completed)',
    };
    
    let updatedTargetTask: Task | null = null;
    const nextTasks = tasks.map((task) => {
      if (task.id === id) {
        addActivity(id, task.title, 'status_changed', `ย้ายไปยัง ${statusTitles[newStatus]}`);
        const updated = { ...task, status: newStatus, updatedAt: new Date().toISOString() };
        updatedTargetTask = updated;
        return updated;
      }
      return task;
    });

    setTasks(nextTasks);
    if (activeFocusTask?.id === id && updatedTargetTask) {
      setActiveFocusTask(updatedTargetTask);
    }
    broadcastLocalUpdate(nextTasks);

    // Sync to Firestore
    if (isFirebaseActive && user && !user.isDemo && updatedTargetTask) {
      await syncSaveTaskToFirestore({ ...(updatedTargetTask as Task), userId: user.uid });
    }
  };

  const updateTaskDueDate = async (id: string, newDueDate: string) => {
    let updatedTargetTask: Task | null = null;
    const nextTasks = tasks.map((task) => {
      if (task.id === id) {
        addActivity(id, task.title, 'rescheduled', `เลื่อนกำหนดส่งเป็น: ${newDueDate}`);
        const updated = { ...task, dueDate: newDueDate, updatedAt: new Date().toISOString() };
        updatedTargetTask = updated;
        return updated;
      }
      return task;
    });

    setTasks(nextTasks);
    broadcastLocalUpdate(nextTasks);

    // Sync to Firestore
    if (isFirebaseActive && user && !user.isDemo && updatedTargetTask) {
      await syncSaveTaskToFirestore({ ...(updatedTargetTask as Task), userId: user.uid });
    }
  };

  const updateTaskDate = async (id: string, newDueDate: string) => {
    let updatedTargetTask: Task | null = null;
    const nextTasks = tasks.map((task) => {
      if (task.id === id) {
        addActivity(id, task.title, 'rescheduled', `เลื่อนกำหนดส่งเป็น: ${newDueDate}`);
        const isSingleDay = !task.startDate || task.startDate === task.dueDate;
        let newStartDate = task.startDate;
        if (isSingleDay) {
          newStartDate = newDueDate;
        } else if (task.startDate && task.startDate > newDueDate) {
          newStartDate = newDueDate;
        }
        const updated = {
          ...task,
          startDate: newStartDate,
          dueDate: newDueDate,
          updatedAt: new Date().toISOString(),
        };
        updatedTargetTask = updated;
        return updated;
      }
      return task;
    });

    setTasks(nextTasks);
    broadcastLocalUpdate(nextTasks);

    // Sync to Firestore
    if (isFirebaseActive && user && !user.isDemo && updatedTargetTask) {
      await syncSaveTaskToFirestore({ ...(updatedTargetTask as Task), userId: user.uid });
    }
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    let updatedTargetTask: Task | null = null;
    const nextTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const updatedSubtasks = task.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        const updated = {
          ...task,
          subtasks: updatedSubtasks,
          updatedAt: new Date().toISOString(),
        };
        updatedTargetTask = updated;
        return updated;
      }
      return task;
    });

    setTasks(nextTasks);
    broadcastLocalUpdate(nextTasks);

    // Sync to Firestore
    if (isFirebaseActive && user && !user.isDemo && updatedTargetTask) {
      await syncSaveTaskToFirestore({ ...(updatedTargetTask as Task), userId: user.uid });
    }
  };

  const addCategory = (
    name: string, 
    color?: string, 
    customProps?: { customBg?: string; customText?: string; customBorder?: string }
  ) => {
    const newCat: CategoryItem = {
      id: 'cat-' + Date.now(),
      name: sanitizeInput(name),
      color: color || COLOR_OPTIONS[0].class,
      customBg: customProps?.customBg,
      customText: customProps?.customText,
      customBorder: customProps?.customBorder,
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    broadcastLocalUpdate(tasks, updated);

    if (isFirebaseActive && user && !user.isDemo) {
      syncCategoriesToFirestore(user.uid, updated).catch((e) => console.warn('Cat sync error:', e));
    }
  };

  const updateCategory = (
    id: string, 
    newName: string, 
    newColor?: string, 
    customProps?: { customBg?: string; customText?: string; customBorder?: string }
  ) => {
    const oldCat = categories.find((c) => c.id === id);
    const sanitizedName = sanitizeInput(newName);

    const updatedCategories = categories.map((c) =>
      c.id === id
        ? {
            ...c,
            name: sanitizedName,
            color: newColor || c.color,
            customBg: customProps !== undefined ? customProps.customBg : c.customBg,
            customText: customProps !== undefined ? customProps.customText : c.customText,
            customBorder: customProps !== undefined ? customProps.customBorder : c.customBorder,
          }
        : c
    );
    setCategories(updatedCategories);

    let nextTasks = tasks;
    if (oldCat && oldCat.name !== sanitizedName) {
      nextTasks = tasks.map((t) => (t.category === oldCat.name ? { ...t, category: sanitizedName } : t));
      setTasks(nextTasks);
    }
    broadcastLocalUpdate(nextTasks, updatedCategories);

    if (isFirebaseActive && user && !user.isDemo) {
      syncCategoriesToFirestore(user.uid, updatedCategories).catch((e) => console.warn('Cat sync error:', e));
    }
  };

  const deleteCategory = (id: string) => {
    const target = categories.find((c) => c.id === id);
    const fallbackCategory = categories.find((c) => c.id !== id)?.name || 'ทั่วไป (General)';

    const updatedCategories = categories.filter((c) => c.id !== id);
    setCategories(updatedCategories);

    let nextTasks = tasks;
    if (target) {
      nextTasks = tasks.map((t) => (t.category === target.name ? { ...t, category: fallbackCategory } : t));
      setTasks(nextTasks);
    }
    broadcastLocalUpdate(nextTasks, updatedCategories);

    if (isFirebaseActive && user && !user.isDemo) {
      syncCategoriesToFirestore(user.uid, updatedCategories).catch((e) => console.warn('Cat sync error:', e));
    }
  };

  const resetToSampleData = () => {
    const seeded = INITIAL_SAMPLE_TASKS.map((t, idx) => ({
      ...t,
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      order: idx,
      userId: user?.uid,
    }));
    setTasks(seeded);
    setCategories(DEFAULT_CATEGORIES);
    setHabits(INITIAL_SAMPLE_HABITS);
    setActivityLogs([]);
    broadcastLocalUpdate(seeded, DEFAULT_CATEGORIES);

    if (isFirebaseActive && user && !user.isDemo) {
      seeded.forEach((t) => syncSaveTaskToFirestore(t).catch(() => {}));
      syncCategoriesToFirestore(user.uid, DEFAULT_CATEGORIES).catch(() => {});
    }
  };

  const clearAllTasks = () => {
    tasks.forEach((t) => {
      if (isFirebaseActive && user && !user.isDemo) {
        syncDeleteTaskFromFirestore(t.id).catch(() => {});
      }
    });
    setTasks([]);
    setActiveFocusTask(null);
    setActivityLogs([]);
    broadcastLocalUpdate([]);
  };

  const clearCompletedTasks = () => {
    const completedTasks = tasks.filter((t) => t.status === 'completed');
    if (isFirebaseActive && user && !user.isDemo) {
      completedTasks.forEach((t) => {
        syncDeleteTaskFromFirestore(t.id).catch(() => {});
      });
    }
    const remaining = tasks.filter((t) => t.status !== 'completed');
    setTasks(remaining);
    if (activeFocusTask && activeFocusTask.status === 'completed') {
      setActiveFocusTask(null);
    }
    broadcastLocalUpdate(remaining, categories);
    addActivity('all', 'Completed Tasks', 'deleted', `ล้างงานที่เสร็จสิ้นแล้วทั้งหมด (${completedTasks.length} งาน)`);
  };

  const reorderTasks = (newTasks: Task[]) => {
    const tasksWithOrder = newTasks.map((t, idx) => ({
      ...t,
      order: idx,
      updatedAt: new Date().toISOString(),
    }));
    setTasks(tasksWithOrder);
    broadcastLocalUpdate(tasksWithOrder, categories);

    if (isFirebaseActive && user && !user.isDemo) {
      tasksWithOrder.forEach((task) => {
        syncSaveTaskToFirestore({ ...task, userId: user.uid }).catch(() => {});
      });
    }
  };

  const toggleHabit = async (id: string, dateStr: string = getTodayString()) => {
    const updated = habits.map((h) => {
      if (h.id === id) {
        return toggleHabitDate(h, dateStr);
      }
      return h;
    });
    setHabits(updated);
    localStorage.setItem('tm_habits', JSON.stringify(updated));
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type: 'HABITS_UPDATED', habits: updated });
    }
  };

  const addHabit = async (title: string, category: string = 'ทั่วไป', icon?: string): Promise<string> => {
    const newHabit: Habit = {
      id: 'habit-' + Date.now(),
      title: title.trim(),
      category,
      icon,
      completedDates: [],
      streak: 0,
      bestStreak: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [newHabit, ...habits];
    setHabits(updated);
    localStorage.setItem('tm_habits', JSON.stringify(updated));
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type: 'HABITS_UPDATED', habits: updated });
    }
    return newHabit.id;
  };

  const deleteHabit = async (id: string) => {
    const updated = habits.filter((h) => h.id !== id);
    setHabits(updated);
    localStorage.setItem('tm_habits', JSON.stringify(updated));
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type: 'HABITS_UPDATED', habits: updated });
    }
  };

  const logFocusSession = async (session: { taskId?: string; taskTitle?: string; durationMinutes: number }) => {
    const newSession: FocusSession = {
      id: 'session-' + Date.now(),
      taskId: session.taskId,
      taskTitle: session.taskTitle,
      durationMinutes: session.durationMinutes,
      completedAt: new Date().toISOString(),
    };
    const updated = [newSession, ...focusSessions];
    setFocusSessions(updated);
    localStorage.setItem('tm_focus_sessions', JSON.stringify(updated));
  };

  const rolloverUnfinishedTasks = async (): Promise<number> => {
    const today = getTodayString();
    let count = 0;
    const updatedTasks = tasks.map((t) => {
      if (t.status !== 'completed' && t.dueDate < today) {
        count++;
        return {
          ...t,
          dueDate: today,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    if (count > 0) {
      setTasks(updatedTasks);
      broadcastLocalUpdate(updatedTasks);
      addActivity(
        'task-rollover',
        `ยกยอดงานค้าง ${count} งานมาทำวันนี้`,
        'rescheduled',
        `ย้ายกำหนดส่งของงานที่เลยกำหนด ${count} รายการมาเป็นวันนี้`
      );
    }
    return count;
  };

  const exportTasksJson = (): string => {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      tasks,
      categories,
      activityLogs,
    };
    return JSON.stringify(exportData, null, 2);
  };

  const importTasksJson = (jsonStr: string): boolean => {
    // 1. Rate limiting on bulk imports
    const rateCheck = appRateLimiter.isAllowed('import_tasks_' + (user?.uid || 'anon'), {
      maxRequests: 5,
      windowMs: 60000,
    });
    if (!rateCheck.allowed) {
      console.warn('Import rate limit exceeded. Please wait a moment.');
      return false;
    }

    // 2. Validate & Sanitize JSON payload with schema & size guards
    const validation = validateJsonImportPayload(jsonStr);
    if (!validation.isValid || !validation.tasks) {
      console.warn('Import validation failed:', validation.error);
      return false;
    }

    try {
      const importedTasks = validation.tasks.map((t: Task) => ({
        ...t,
        userId: user?.uid,
      }));
      setTasks(importedTasks);

      if (validation.categories && validation.categories.length > 0) {
        setCategories(validation.categories);
      }
      broadcastLocalUpdate(importedTasks, validation.categories || categories);

      if (isFirebaseActive && user && !user.isDemo) {
        importedTasks.forEach((t: Task) => syncSaveTaskToFirestore(t).catch(() => {}));
        if (validation.categories) {
          syncCategoriesToFirestore(user.uid, validation.categories).catch(() => {});
        }
      }
      return true;
    } catch {
      return false;
    }
  };

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Search Query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query) || false;
        const matchesTags = task.tags?.some((t) => t.toLowerCase().includes(query)) || false;
        const matchesCategory = task.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesTags && !matchesCategory) {
          return false;
        }
      }

      // 2. Status Filter
      if (filters.status !== 'all' && task.status !== filters.status) {
        return false;
      }

      // 3. Priority Filter
      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }

      // 4. Category Filter
      if (filters.category !== 'all' && task.category !== filters.category) {
        return false;
      }

      // 5. Due Date Filter
      if (filters.dueDateRange === 'today' && !isToday(task.dueDate) && !isTaskOnDate(task, getTodayString())) {
        return false;
      }
      if (filters.dueDateRange === 'this_week' && !isThisWeek(task.dueDate)) {
        return false;
      }
      if (filters.dueDateRange === 'overdue' && !isOverdue(task.dueDate)) {
        return false;
      }

      return true;
    });
  }, [tasks, filters]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        filteredTasks,
        categories,
        activityLogs,
        habits,
        focusSessions,
        activeFocusTask,
        todayFocusMinutes,
        filters,
        isRealtimeSyncing,
        setFilters,
        addTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        updateTaskDueDate,
        updateTaskDate,
        toggleSubtask,
        resetFilters: () => setFilters(DEFAULT_FILTERS),
        addCategory,
        updateCategory,
        deleteCategory,
        resetToSampleData,
        clearAllTasks,
        clearCompletedTasks,
        reorderTasks,
        exportTasksJson,
        importTasksJson,
        setActiveFocusTask,
        toggleHabit,
        addHabit,
        deleteHabit,
        logFocusSession,
        rolloverUnfinishedTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
