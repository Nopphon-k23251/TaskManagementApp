import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
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
  syncCreateTaskToFirestore, 
  syncUpdateTaskToFirestore, 
  syncDeleteTaskFromFirestore 
} from '../services/firebase';
import { getTodayString, isOverdue, isToday, isThisWeek } from '../utils/date';
import { sanitizeInput } from '../utils/sanitizer';

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'cat-1', name: 'งานฟีเจอร์ (Feature)', color: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' },
  { id: 'cat-2', name: 'แก้ไขบั๊ก (Bug)', color: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800' },
  { id: 'cat-3', name: 'งานออกแบบ (Design)', color: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
  { id: 'cat-4', name: 'งานระบบ (DevOps)', color: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
  { id: 'cat-5', name: 'การตลาด (Marketing)', color: 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800' },
  { id: 'cat-6', name: 'วิจัย/ศึกษา (Research)', color: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
  { id: 'cat-7', name: 'เรื่องส่วนตัว (Personal)', color: 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800' },
  { id: 'cat-8', name: 'ทั่วไป (Other)', color: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700' },
];

export const COLOR_OPTIONS = [
  { name: 'Indigo (น้ำเงินคราม)', class: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' },
  { name: 'Rose (แดงกุหลาบ)', class: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800' },
  { name: 'Purple (ม่วง)', class: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
  { name: 'Emerald (เขียวมรกต)', class: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
  { name: 'Teal (เขียวอมฟ้า)', class: 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800' },
  { name: 'Amber (ส้มอำพัน)', class: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
  { name: 'Sky (ฟ้าสดใส)', class: 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800' },
  { name: 'Pink (ชมพู)', class: 'bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800' },
  { name: 'Slate (เทา)', class: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700' },
];

interface TaskContextType {
  tasks: Task[];
  categories: CategoryItem[];
  filteredTasks: Task[];
  activityLogs: ActivityLog[];
  filters: TaskFilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<TaskFilterOptions>>;
  resetFilters: () => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  updateTaskDate: (id: string, dueDate: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addCategory: (name: string, color?: string) => void;
  updateCategory: (id: string, name: string, color: string) => void;
  deleteCategory: (id: string) => void;
  resetToSampleData: () => void;
  clearAllTasks: () => void;
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

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isFirebaseActive } = useAuth();
  
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

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('tm_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('tm_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('tm_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  // Firestore real-time synchronization if user is logged in via Firebase
  useEffect(() => {
    if (!isFirebaseActive || !user || user.isDemo) return;

    const unsubscribe = subscribeToTasks(user.uid, (cloudTasks) => {
      if (cloudTasks && cloudTasks.length > 0) {
        setTasks(cloudTasks);
      }
    });

    return () => unsubscribe();
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
    const tempId = 'task-' + Date.now();
    const newTask: Task = {
      ...taskData,
      id: tempId,
      title: sanitizeInput(taskData.title),
      description: sanitizeInput(taskData.description),
      userId: user?.uid,
      createdAt: now,
      updatedAt: now,
    };

    setTasks((prev) => [newTask, ...prev]);
    addActivity(tempId, newTask.title, 'created', `สร้างในหมวดหมู่: ${newTask.category}`);

    if (isFirebaseActive && user && !user.isDemo) {
      try {
        const cloudId = await syncCreateTaskToFirestore({
          ...taskData,
          title: sanitizeInput(taskData.title),
          description: sanitizeInput(taskData.description),
          userId: user.uid,
          createdAt: now,
          updatedAt: now,
        });
        if (cloudId) {
          setTasks((prev) => prev.map((t) => (t.id === tempId ? { ...t, id: cloudId } : t)));
          return cloudId;
        }
      } catch (err) {
        console.warn('Firestore sync failed, preserved locally:', err);
      }
    }

    return tempId;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const cleanUpdates = { ...updates };
    if (cleanUpdates.title) cleanUpdates.title = sanitizeInput(cleanUpdates.title);
    if (cleanUpdates.description) cleanUpdates.description = sanitizeInput(cleanUpdates.description);
    cleanUpdates.updatedAt = new Date().toISOString();

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const updated = { ...task, ...cleanUpdates };
          addActivity(id, updated.title, 'updated', 'อัปเดตรายละเอียดงาน');
          return updated;
        }
        return task;
      })
    );

    if (isFirebaseActive && user && !user.isDemo) {
      try {
        await syncUpdateTaskToFirestore(id, cleanUpdates);
      } catch (err) {
        console.warn('Firestore update failed:', err);
      }
    }
  };

  const deleteTask = async (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (target) {
      addActivity(id, target.title, 'deleted', 'ลบงานออกจากระบบ');
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));

    if (isFirebaseActive && user && !user.isDemo) {
      try {
        await syncDeleteTaskFromFirestore(id);
      } catch (err) {
        console.warn('Firestore delete failed:', err);
      }
    }
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    const target = tasks.find((t) => t.id === id);
    if (!target || target.status === status) return;

    const readableStatus = {
      todo: 'To Do (รอดำเนินการ)',
      in_progress: 'In Progress (กำลังทำ)',
      review: 'In Review (ตรวจทาน)',
      completed: 'Completed (เสร็จสิ้น)',
    }[status];

    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, status, updatedAt: new Date().toISOString() }
          : task
      )
    );

    addActivity(id, target.title, 'status_changed', `ย้ายไป: ${readableStatus}`);

    if (isFirebaseActive && user && !user.isDemo) {
      try {
        await syncUpdateTaskToFirestore(id, { status, updatedAt: new Date().toISOString() });
      } catch (err) {
        console.warn('Firestore status update failed:', err);
      }
    }
  };

  const updateTaskDate = async (id: string, dueDate: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target || target.dueDate === dueDate) return;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, dueDate, updatedAt: new Date().toISOString() }
          : task
      )
    );

    addActivity(id, target.title, 'rescheduled', `เปลี่ยนกำหนดส่งเป็น ${dueDate}`);

    if (isFirebaseActive && user && !user.isDemo) {
      try {
        await syncUpdateTaskToFirestore(id, { dueDate, updatedAt: new Date().toISOString() });
      } catch (err) {
        console.warn('Firestore date update failed:', err);
      }
    }
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    let updatedSubtasks: any[] = [];
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const subtasks = task.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          updatedSubtasks = subtasks;
          return { ...task, subtasks, updatedAt: new Date().toISOString() };
        }
        return task;
      })
    );

    if (isFirebaseActive && user && !user.isDemo && updatedSubtasks.length > 0) {
      try {
        await syncUpdateTaskToFirestore(taskId, {
          subtasks: updatedSubtasks,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Firestore subtask update failed:', err);
      }
    }
  };

  // Category Management Handlers
  const addCategory = (name: string, color?: string) => {
    const sanitizedName = sanitizeInput(name);
    if (!sanitizedName) return;
    const newCat: CategoryItem = {
      id: 'cat-' + Date.now(),
      name: sanitizedName,
      color: color || COLOR_OPTIONS[0].class,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const updateCategory = (id: string, name: string, color: string) => {
    const sanitizedName = sanitizeInput(name);
    if (!sanitizedName) return;
    const oldCat = categories.find((c) => c.id === id);

    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: sanitizedName, color } : c))
    );

    // If name changed, update tasks under this category
    if (oldCat && oldCat.name !== sanitizedName) {
      setTasks((prev) =>
        prev.map((t) => (t.category === oldCat.name ? { ...t, category: sanitizedName } : t))
      );
    }
  };

  const deleteCategory = (id: string) => {
    const target = categories.find((c) => c.id === id);
    if (!target) return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
    // Reassign tasks in this category to default 'Other'
    setTasks((prev) =>
      prev.map((t) =>
        t.category === target.name ? { ...t, category: 'ทั่วไป (Other)' } : t
      )
    );
  };

  const resetToSampleData = () => {
    setTasks(INITIAL_SAMPLE_TASKS);
    setCategories(DEFAULT_CATEGORIES);
    localStorage.setItem('tm_tasks', JSON.stringify(INITIAL_SAMPLE_TASKS));
    localStorage.setItem('tm_categories', JSON.stringify(DEFAULT_CATEGORIES));
  };

  const clearAllTasks = () => {
    setTasks([]);
    localStorage.setItem('tm_tasks', JSON.stringify([]));
  };

  const exportTasksJson = () => {
    return JSON.stringify({ tasks, categories }, null, 2);
  };

  const importTasksJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
        setTasks(parsed);
        localStorage.setItem('tm_tasks', JSON.stringify(parsed));
        return true;
      } else if (parsed && Array.isArray(parsed.tasks)) {
        setTasks(parsed.tasks);
        localStorage.setItem('tm_tasks', JSON.stringify(parsed.tasks));
        if (Array.isArray(parsed.categories)) {
          setCategories(parsed.categories);
          localStorage.setItem('tm_categories', JSON.stringify(parsed.categories));
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Filter computation
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description.toLowerCase().includes(query);
        const matchesCat = task.category.toLowerCase().includes(query);
        const matchesTag = task.tags.some((tag) => tag.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesTag && !matchesCat) return false;
      }

      if (filters.status && filters.status !== 'all' && task.status !== filters.status) {
        return false;
      }

      if (filters.priority && filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }

      if (filters.category && filters.category !== 'all' && task.category !== filters.category) {
        return false;
      }

      if (filters.dueDateRange && filters.dueDateRange !== 'all') {
        if (filters.dueDateRange === 'today' && !isToday(task.dueDate)) return false;
        if (filters.dueDateRange === 'this_week' && !isThisWeek(task.dueDate)) return false;
        if (filters.dueDateRange === 'overdue' && !isOverdue(task.dueDate)) return false;
      }

      return true;
    });
  }, [tasks, filters]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        categories,
        filteredTasks,
        activityLogs,
        filters,
        setFilters,
        resetFilters,
        addTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        updateTaskDate,
        toggleSubtask,
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
