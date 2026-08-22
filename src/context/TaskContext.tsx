import React, { createContext, useContext, useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { 
  Task, 
  TaskStatus, 
  CategoryItem, 
  ActivityLog, 
  TaskFilterOptions 
} from '../types/task';
import { useAuth } from './AuthContext';
import { 
  subscribeToTasks, 
  subscribeToCategories,
  syncSaveTaskToFirestore, 
  syncDeleteTaskFromFirestore,
  syncCategoriesToFirestore 
} from '../services/firebase';
import { getTodayString, isOverdue, isToday, isThisWeek } from '../utils/date';
import { sanitizeInput } from '../utils/sanitizer';

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'cat-1', name: 'งานออกแบบ (Design)', color: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800' },
  { id: 'cat-2', name: 'งานระบบ (DevOps)', color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' },
  { id: 'cat-3', name: 'งานฟีเจอร์ (Feature)', color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
  { id: 'cat-4', name: 'งานวิจัย (Research)', color: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
  { id: 'cat-5', name: 'ทั่วไป (General)', color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700' },
];

export const COLOR_OPTIONS = [
  { name: 'Indigo (คราม)', class: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' },
  { name: 'Rose (กุหลาบ)', class: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800' },
  { name: 'Purple (ม่วง)', class: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
  { name: 'Emerald (เขียวมรกต)', class: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
  { name: 'Teal (เขียวหัวเป็ด)', class: 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800' },
  { name: 'Amber (ส้มอำพัน)', class: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
  { name: 'Sky (ฟ้าใส)', class: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800' },
  { name: 'Pink (ชมพู)', class: 'bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800' },
  { name: 'Slate (เทาคลาสสิก)', class: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700' },
];

export type SyncStatus = 'synced' | 'syncing' | 'error' | 'offline' | 'demo';

interface TaskContextType {
  tasks: Task[];
  filteredTasks: Task[];
  categories: CategoryItem[];
  activityLogs: ActivityLog[];
  filters: TaskFilterOptions;
  isRealtimeSyncing: boolean;
  syncStatus: SyncStatus;
  setFilters: React.Dispatch<React.SetStateAction<TaskFilterOptions>>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTaskStatus: (id: string, newStatus: TaskStatus) => Promise<void>;
  updateTaskDueDate: (id: string, newDueDate: string) => Promise<void>;
  updateTaskDate: (id: string, newDueDate: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  resetFilters: () => void;
  addCategory: (name: string, color?: string) => void;
  updateCategory: (id: string, name: string, color?: string) => void;
  deleteCategory: (id: string) => void;
  resetToSampleData: () => Promise<void>;
  clearAllTasks: () => Promise<void>;
  exportTasksJson: () => string;
  importTasksJson: (jsonStr: string) => boolean;
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
    category: 'งานออกแบบ (Design)',
    dueDate: getTodayString(),
    subtasks: [
      { id: 'st-1', title: 'จัดทำระบบสองภาษา TH/EN', completed: true },
      { id: 'st-2', title: 'ปรับปรุง Responsive ให้ใช้งานง่ายบนมือถือ', completed: true },
      { id: 'st-3', title: 'เพิ่มระบบ User Edit Category เองได้', completed: true }
    ],
    tags: ['UI/UX', 'Mobile', 'Frontend'],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'เชื่อมต่อ Firebase Google Auth & Firestore Cloud Sync',
    description: 'ตั้งค่าการซิงก์ข้อมูลงานกับ Firebase แบบเรียลไทม์ และรองรับ Offline Local Storage',
    status: 'completed',
    priority: 'high',
    category: 'งานระบบ (DevOps)',
    dueDate: getTodayString(),
    subtasks: [
      { id: 'st-4', title: 'บันทึก Config ในไฟล์ .env', completed: true },
      { id: 'st-5', title: 'ทดสอบการ Sign in ด้วย Google', completed: true }
    ],
    tags: ['Firebase', 'Auth', 'Cloud'],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'พัฒนาระบบปฏิทิน Drag & Drop กำหนดส่งงาน',
    description: 'สามารถลากการ์ดงานวางลงในช่องวันที่เพื่อเลื่อนกำหนดส่งได้อย่างรวดเร็ว มีทั้งมุมมอง Month และ Agenda บนมือถือ',
    status: 'in_progress',
    priority: 'high',
    category: 'งานฟีเจอร์ (Feature)',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    subtasks: [
      { id: 'st-6', title: 'สร้าง Matrix ปฏิทินรายเดือน', completed: true },
      { id: 'st-7', title: 'เพิ่ม Agenda Date Strip สำหรับมือถือ', completed: true }
    ],
    tags: ['Calendar', 'DnD', 'Schedule'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'เขียนชุดทดสอบ Unit Tests และทดสอบความปลอดภัย XSS',
    description: 'ตรวจสอบ Input Sanitization ป้องกัน Script Injection และตรวจเช็ก Form Validation ครบทุกฟิลด์',
    status: 'todo',
    priority: 'medium',
    category: 'งานระบบ (DevOps)',
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    subtasks: [
      { id: 'st-9', title: 'ทดสอบ Date Matrix Utils', completed: true },
      { id: 'st-10', title: 'ทดสอบ Form Validation & XSS', completed: true }
    ],
    tags: ['Testing', 'Vitest', 'Security'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

function getScopedKey(key: string, userId?: string | null): string {
  const uid = userId || 'demo-user-123';
  return `tm_${key}_${uid}`;
}

function loadScopedData<T>(key: string, userId?: string | null, fallback?: T): T {
  try {
    const raw = localStorage.getItem(getScopedKey(key, userId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed !== null && parsed !== undefined) return parsed;
    }
  } catch (e) {
    console.warn(`Error loading cache for ${key}:`, e);
  }
  return fallback as T;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isFirebaseActive } = useAuth();
  const currentUserId = user?.uid || 'demo-user-123';
  const isDemoUser = Boolean(!user || user.isDemo);

  const [isRealtimeSyncing, setIsRealtimeSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(isDemoUser ? 'demo' : 'syncing');
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Initialize state scoped to current user
  const [tasks, setTasks] = useState<Task[]>(() => {
    const cached = loadScopedData<Task[]>('tasks', currentUserId);
    if (Array.isArray(cached) && cached.length > 0) return cached;
    return isDemoUser ? INITIAL_SAMPLE_TASKS : [];
  });

  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    const cached = loadScopedData<CategoryItem[]>('categories', currentUserId);
    if (Array.isArray(cached) && cached.length > 0) return cached;
    return DEFAULT_CATEGORIES;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const cached = loadScopedData<ActivityLog[]>('logs', currentUserId);
    if (Array.isArray(cached) && cached.length > 0) return cached;
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

  // 1. Cross-Tab Synchronization with User Verification
  useEffect(() => {
    try {
      const bc = new BroadcastChannel('tm_sync_channel');
      broadcastChannelRef.current = bc;
      bc.onmessage = (event) => {
        const msg = event.data;
        if (msg?.userId && msg.userId !== currentUserId) return;

        if (msg?.type === 'TASKS_UPDATED' && Array.isArray(msg.tasks)) {
          setTasks(msg.tasks);
        }
        if (msg?.type === 'CATEGORIES_UPDATED' && Array.isArray(msg.categories)) {
          setCategories(msg.categories);
        }
      };
      return () => {
        bc.close();
      };
    } catch {
      // BroadcastChannel unsupported fallback
    }
  }, [currentUserId]);

  const broadcastLocalUpdate = useCallback((updatedTasks: Task[], updatedCategories?: CategoryItem[]) => {
    localStorage.setItem(getScopedKey('tasks', currentUserId), JSON.stringify(updatedTasks));
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'TASKS_UPDATED',
        tasks: updatedTasks,
        userId: currentUserId
      });
      if (updatedCategories) {
        broadcastChannelRef.current.postMessage({
          type: 'CATEGORIES_UPDATED',
          categories: updatedCategories,
          userId: currentUserId
        });
      }
    }
  }, [currentUserId]);

  // 2. User Switch Handler: Switch local state when user logs in/out
  useEffect(() => {
    const cachedTasks = loadScopedData<Task[]>('tasks', currentUserId);
    const cachedCats = loadScopedData<CategoryItem[]>('categories', currentUserId);
    const cachedLogs = loadScopedData<ActivityLog[]>('logs', currentUserId);

    if (Array.isArray(cachedTasks)) {
      setTasks(cachedTasks);
    } else if (isDemoUser) {
      setTasks(INITIAL_SAMPLE_TASKS);
    } else {
      setTasks([]);
    }

    if (Array.isArray(cachedCats) && cachedCats.length > 0) {
      setCategories(cachedCats);
    } else {
      setCategories(DEFAULT_CATEGORIES);
    }

    if (Array.isArray(cachedLogs)) {
      setActivityLogs(cachedLogs);
    }
  }, [currentUserId, isDemoUser]);

  // 3. Cache to Scoped localStorage
  useEffect(() => {
    localStorage.setItem(getScopedKey('tasks', currentUserId), JSON.stringify(tasks));
  }, [tasks, currentUserId]);

  useEffect(() => {
    localStorage.setItem(getScopedKey('categories', currentUserId), JSON.stringify(categories));
  }, [categories, currentUserId]);

  useEffect(() => {
    localStorage.setItem(getScopedKey('logs', currentUserId), JSON.stringify(activityLogs));
  }, [activityLogs, currentUserId]);

  // 4. Realtime Cloud Synchronization with Firestore (Cross-Device)
  useEffect(() => {
    if (!isFirebaseActive || isDemoUser || !user) {
      setIsRealtimeSyncing(false);
      setSyncStatus(isDemoUser ? 'demo' : 'offline');
      return;
    }

    setIsRealtimeSyncing(true);
    setSyncStatus('syncing');

    // Subscribe to User Tasks in Realtime from Cloud Firestore
    const unsubscribeTasks = subscribeToTasks(
      user.uid,
      (cloudTasks) => {
        // Authoritative cloud update: update tasks state & scoped local cache
        setTasks(cloudTasks);
        localStorage.setItem(getScopedKey('tasks', user.uid), JSON.stringify(cloudTasks));
        setIsRealtimeSyncing(false);
        setSyncStatus('synced');
      },
      (err) => {
        console.error('Realtime tasks sync error:', err);
        setIsRealtimeSyncing(false);
        setSyncStatus('error');
      }
    );

    // Subscribe to User Categories in Realtime from Cloud Firestore
    const unsubscribeCategories = subscribeToCategories(
      user.uid,
      (cloudCategories) => {
        if (cloudCategories && cloudCategories.length > 0) {
          setCategories(cloudCategories);
          localStorage.setItem(getScopedKey('categories', user.uid), JSON.stringify(cloudCategories));
        }
      },
      (err) => {
        console.error('Realtime categories sync error:', err);
      }
    );

    return () => {
      unsubscribeTasks();
      unsubscribeCategories();
    };
  }, [user, isFirebaseActive, isDemoUser]);

  const addActivity = (taskId: string, taskTitle: string, action: ActivityLog['action'], details?: string) => {
    const newLog: ActivityLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
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
      userId: user?.uid || currentUserId,
      createdAt: now,
      updatedAt: now,
    };

    const nextTasks = [newTask, ...tasks];
    setTasks(nextTasks);
    broadcastLocalUpdate(nextTasks);
    addActivity(taskId, newTask.title, 'created', `สร้างในหมวดหมู่: ${newTask.category}`);

    // Sync to Firestore
    if (isFirebaseActive && user && !user.isDemo) {
      await syncSaveTaskToFirestore(newTask).catch((err) => {
        console.error('Failed to sync new task to Firestore:', err);
        setSyncStatus('error');
      });
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
        const updated = { ...task, ...cleanUpdates, userId: user?.uid || task.userId || currentUserId };
        updatedTargetTask = updated;
        addActivity(id, updated.title, 'updated', 'อัปเดตรายละเอียดงาน');
        return updated;
      }
      return task;
    });

    setTasks(nextTasks);
    broadcastLocalUpdate(nextTasks);

    // Sync to Firestore
    if (isFirebaseActive && user && !user.isDemo && updatedTargetTask) {
      await syncSaveTaskToFirestore(updatedTargetTask).catch((err) => {
        console.error('Failed to sync task update to Firestore:', err);
        setSyncStatus('error');
      });
    }
  };

  const deleteTask = async (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (target) {
      addActivity(id, target.title, 'deleted', 'ลบงานออกจากระบบ');
    }
    const nextTasks = tasks.filter((t) => t.id !== id);
    setTasks(nextTasks);
    broadcastLocalUpdate(nextTasks);

    // Sync to Firestore
    if (isFirebaseActive && user && !user.isDemo) {
      await syncDeleteTaskFromFirestore(id).catch((err) => {
        console.error('Failed to sync task deletion to Firestore:', err);
      });
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
        const updated = { 
          ...task, 
          status: newStatus, 
          updatedAt: new Date().toISOString(),
          userId: user?.uid || task.userId || currentUserId
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
      await syncSaveTaskToFirestore(updatedTargetTask).catch((err) => {
        console.error('Failed to sync task status to Firestore:', err);
      });
    }
  };

  const updateTaskDueDate = async (id: string, newDueDate: string) => {
    let updatedTargetTask: Task | null = null;
    const nextTasks = tasks.map((task) => {
      if (task.id === id) {
        addActivity(id, task.title, 'rescheduled', `เลื่อนกำหนดส่งเป็น: ${newDueDate}`);
        const updated = { 
          ...task, 
          dueDate: newDueDate, 
          updatedAt: new Date().toISOString(),
          userId: user?.uid || task.userId || currentUserId
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
      await syncSaveTaskToFirestore(updatedTargetTask).catch((err) => {
        console.error('Failed to sync task due date to Firestore:', err);
      });
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
          userId: user?.uid || task.userId || currentUserId
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
      await syncSaveTaskToFirestore(updatedTargetTask).catch((err) => {
        console.error('Failed to sync subtask to Firestore:', err);
      });
    }
  };

  const addCategory = (name: string, color?: string) => {
    const newCat: CategoryItem = {
      id: 'cat-' + Date.now(),
      name: sanitizeInput(name),
      color: color || COLOR_OPTIONS[0].class,
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    broadcastLocalUpdate(tasks, updated);

    if (isFirebaseActive && user && !user.isDemo) {
      syncCategoriesToFirestore(user.uid, updated).catch((e) => console.warn('Cat sync error:', e));
    }
  };

  const updateCategory = (id: string, newName: string, newColor?: string) => {
    const oldCat = categories.find((c) => c.id === id);
    const sanitizedName = sanitizeInput(newName);

    const updatedCategories = categories.map((c) =>
      c.id === id ? { ...c, name: sanitizedName, color: newColor || c.color } : c
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

  const resetToSampleData = async () => {
    const seeded = INITIAL_SAMPLE_TASKS.map((t) => ({
      ...t,
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId: user?.uid || currentUserId,
    }));
    setTasks(seeded);
    setCategories(DEFAULT_CATEGORIES);
    setActivityLogs([]);
    broadcastLocalUpdate(seeded, DEFAULT_CATEGORIES);

    if (isFirebaseActive && user && !user.isDemo) {
      await Promise.all(seeded.map((t) => syncSaveTaskToFirestore(t).catch(() => {})));
      await syncCategoriesToFirestore(user.uid, DEFAULT_CATEGORIES).catch(() => {});
    }
  };

  const clearAllTasks = async () => {
    const tasksToDelete = [...tasks];
    setTasks([]);
    setActivityLogs([]);
    broadcastLocalUpdate([]);

    if (isFirebaseActive && user && !user.isDemo) {
      await Promise.all(tasksToDelete.map((t) => syncDeleteTaskFromFirestore(t.id).catch(() => {})));
    }
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
    try {
      const data = JSON.parse(jsonStr);
      if (data && Array.isArray(data.tasks)) {
        const importedTasks = data.tasks.map((t: Task) => ({
          ...t,
          userId: user?.uid || currentUserId,
        }));
        setTasks(importedTasks);
        if (Array.isArray(data.categories)) setCategories(data.categories);
        if (Array.isArray(data.activityLogs)) setActivityLogs(data.activityLogs);
        broadcastLocalUpdate(importedTasks, data.categories);

        if (isFirebaseActive && user && !user.isDemo) {
          importedTasks.forEach((t: Task) => syncSaveTaskToFirestore(t).catch(() => {}));
        }
        return true;
      }
      return false;
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
      if (filters.dueDateRange === 'today' && !isToday(task.dueDate)) {
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
        filters,
        isRealtimeSyncing,
        syncStatus,
        setFilters,
        addTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        updateTaskDueDate,
        updateTaskDate: updateTaskDueDate,
        toggleSubtask,
        resetFilters: () => setFilters(DEFAULT_FILTERS),
        addCategory,
        updateCategory,
        deleteCategory,
        resetToSampleData,
        clearAllTasks,
        exportTasksJson,
        importTasksJson,
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

