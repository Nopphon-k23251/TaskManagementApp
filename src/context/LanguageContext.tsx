import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types/task';

export const translations = {
  th: {
    // Navigation
    overview: 'ภาพรวมงาน',
    board: 'กระดานงาน',
    calendar: 'ปฏิทินงาน',
    todo: 'สิ่งที่ต้องทำ',
    settings: 'ตั้งค่า & ซิงก์',
    workspace: 'พื้นที่ทำงาน',
    menuNavigation: 'เมนูหลัก',
    liveStats: 'สถิติด่วนแบบเรียลไทม์',
    inProgress: 'กำลังทำ',
    done: 'เสร็จสิ้น',
    urgentTasks: 'งานเร่งด่วน',
    
    // Header & Actions
    searchPlaceholder: 'ค้นหางาน, แท็ก, คีย์เวิร์ด...',
    newTask: 'สร้างงานใหม่',
    signIn: 'เข้าสู่ระบบ',
    signingIn: 'กำลังเข้าสู่ระบบ...',
    signOut: 'ออกจากระบบ',
    connectGoogle: 'เชื่อมต่อบัญชี Google',
    demoAccount: 'โหมดทดลองใช้ (Demo)',
    online: 'ออนไลน์',
    offline: 'โหมดออฟไลน์',
    manageCategories: 'จัดการหมวดหมู่',

    // Dashboard Overview
    prodSummary: 'สรุปผลิตภาพการทำงาน',
    overviewTitle: 'ภาพรวมและการดำเนินงาน',
    overviewSub: 'คุณทำงานเสร็จแล้ว {completed} จากทั้งหมด {total} งาน (อัตราความสำเร็จ {rate}%)',
    createTaskBtn: '+ สร้างงานใหม่',
    viewBoardBtn: 'ดูกระดาน Kanban',
    totalTasks: 'งานทั้งหมด',
    activeTasks: 'งานที่กำลังทำ',
    completionRate: 'อัตราความสำเร็จ',
    overdue: 'เลยกำหนด',
    urgentActive: 'งานเร่งด่วน',
    upcomingDeadlines: 'กำหนดส่งที่ใกล้จะถึง',
    fullCalendar: 'ดูปฏิทินทั้งหมด',
    priorityDistribution: 'สัดส่วนตามความสำคัญ',
    taskCategories: 'หมวดหมู่งาน',
    recentActivity: 'ประวัติกิจกรรมล่าสุด',
    noActivity: 'ยังไม่มีกิจกรรมล่าสุด',
    noUpcoming: 'ไม่มีงานที่ใกล้ถึงกำหนดส่ง',
    urgent: 'เร่งด่วนมาก',
    high: 'สูง',
    medium: 'ปานกลาง',
    low: 'ต่ำ',

    // Kanban Board
    taskFilters: 'ตัวกรองงาน',
    allColumns: 'ทุกคอลัมน์',
    allPriorities: 'ทุกระดับความสำคัญ',
    allCategories: 'ทุกหมวดหมู่',
    allDates: 'ทุกช่วงเวลา',
    dueToday: 'ส่งวันนี้',
    dueThisWeek: 'ส่งสัปดาห์นี้',
    overdueTasks: 'เลยกำหนดส่ง',
    resetFilters: 'ล้างตัวกรอง',
    tasksCount: '{count} งาน',
    toDoCol: 'รอดำเนินการ',
    inProgressCol: 'กำลังทำ',
    reviewCol: 'ตรวจทาน',
    completedCol: 'เสร็จสิ้น',
    noTasksInCol: 'ไม่มีงานในขั้นตอนนี้',
    addFirstTask: 'เพิ่มงานแรก',

    // Calendar
    calendarDesc: 'ลากและวางการ์ดงานเพื่อเปลี่ยนกำหนดส่ง',
    todayBtn: 'วันนี้',
    agendaView: 'กำหนดการ (วัน)',
    monthView: 'รายเดือน',
    weekView: 'รายสัปดาห์',
    tasksOnDate: 'งานประจำวันที่ {date}',
    noTasksOnDate: 'ไม่มีงานที่ต้องส่งในวันนี้',
    addTaskOnDate: 'เพิ่มงานในวันนี้',

    // Todo List
    quickTodoPlaceholder: 'มีอะไรที่ต้องทำวันนี้บ้าง? (เช่น ส่งรายงาน, แก้ไขบั๊ก...)',
    addTodoBtn: 'เพิ่มงาน',
    priorityLabel: 'ความสำคัญ:',
    categoryLabel: 'หมวดหมู่:',
    allTab: 'ทั้งหมด',
    activeTab: 'ยังไม่เสร็จ',
    todayTab: 'เป้าหมายวันนี้',
    completedTab: 'เสร็จแล้ว',
    allCaughtUp: 'ทำงานครบหมดแล้ว!',
    noTasksInTab: 'ไม่พบงานในแท็บนี้ ขอให้เป็นวันที่ยอดเยี่ยม!',
    subtasksLabel: 'รายการย่อย',

    // Task Modal
    createTaskModalTitle: 'สร้างงานใหม่',
    editTaskModalTitle: 'แก้ไขรายละเอียดงาน',
    taskTitleLabel: 'ชื่องาน',
    taskTitlePlaceholder: 'เช่น พัฒนาระบบ Login ด้วย Google และตั้งค่าโปรไฟล์',
    taskDescLabel: 'รายละเอียดงาน',
    taskDescPlaceholder: 'ใส่รายละเอียดเพิ่มเติม, ลิงก์, หรือข้อกำหนด...',
    priorityLevelLabel: 'ระดับความสำคัญ',
    statusColLabel: 'สถานะงาน',
    dueDateLabel: 'กำหนดส่ง',
    subtasksChecklistLabel: 'รายการงานย่อย (Subtasks)',
    addSubtaskPlaceholder: 'เพิ่มรายการงานย่อย...',
    addBtn: 'เพิ่ม',
    tagsLabel: 'แท็ก (Tags)',
    addTagPlaceholder: 'พิมพ์ชื่อแท็กแล้วกด Enter',
    cancelBtn: 'ยกเลิก',
    saveBtn: 'บันทึกข้อมูล',
    savingBtn: 'กำลังบันทึก...',

    // Categories Modal
    categoryModalTitle: 'จัดการหมวดหมู่งาน (Custom Categories)',
    addCategoryTitle: 'เพิ่มหมวดหมู่ใหม่',
    categoryNamePlaceholder: 'ชื่อหมวดหมู่ (เช่น งานวิจัย, งานด่วน, ส่วนตัว)...',
    categoryBadgeColor: 'สีของป้าย:',
    existingCategories: 'หมวดหมู่ที่มีอยู่ ({count})',
    noCategoriesYet: 'ยังไม่มีหมวดหมู่',
    confirmDeleteCategory: 'คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่นี้?',

    // Settings Modal
    settingsModalTitle: 'การตั้งค่า & จัดการข้อมูล',
    firebaseSyncTitle: 'การซิงก์ข้อมูลบนคลาวด์ (Firebase)',
    firebaseOnlineDesc: 'เชื่อมต่อกับ Project ID จาก .env เรียบร้อยแล้ว',
    firebaseOfflineDesc: 'ทำงานในโหมดจัดเก็บข้อมูลในเครื่อง (Local Storage)',
    backupTitle: 'สำรองและนำเข้าข้อมูล (Backup & Restore)',
    downloadBackup: 'ดาวน์โหลดไฟล์สำรองข้อมูล JSON',
    importJsonPlaceholder: 'วางโค้ด JSON ของรายการงานที่นี่เพื่อนำเข้า...',
    importBtn: 'นำเข้าข้อมูลงาน',
    importSuccess: 'นำเข้าข้อมูลงานสำเร็จเรียบร้อยแล้ว!',
    importError: 'ข้อผิดพลาด: รูปแบบไฟล์ JSON ไม่ถูกต้อง',
    sampleDataTitle: 'ข้อมูลตัวอย่าง & รีเซ็ตระบบ',
    reloadSampleData: 'โหลดข้อมูลตัวอย่างเริ่มต้น',
    clearAllTasks: 'ลบงานทั้งหมดในระบบ',
    confirmReset: 'ต้องการรีเซ็ตข้อมูลเป็นชุดตัวอย่างเริ่มต้นหรือไม่?',
    confirmClear: 'คุณแน่ใจหรือไม่ว่าต้องการลบงานทั้งหมดออกจากระบบ?',

    // Validation
    titleRequired: 'จำเป็นต้องระบุชื่องาน',
    titleMinLength: 'ชื่องานต้องมีอย่างน้อย 2 ตัวอักษร',
    titleMaxLength: 'ชื่องานต้องไม่เกิน 120 ตัวอักษร',
    dueDateRequired: 'จำเป็นต้องระบุกำหนดส่ง',
    invalidDate: 'รูปแบบวันที่ไม่ถูกต้อง',
  },
  en: {
    // Navigation
    overview: 'Work Overview',
    board: 'Task Board',
    calendar: 'Calendar Schedule',
    todo: 'To-Do List',
    settings: 'Settings & Sync',
    workspace: 'Workspace',
    menuNavigation: 'Menu Navigation',
    liveStats: 'Live Quick Stats',
    inProgress: 'In Progress',
    done: 'Done',
    urgentTasks: 'Urgent Tasks',

    // Header & Actions
    searchPlaceholder: 'Search tasks, tags, keywords...',
    newTask: 'New Task',
    signIn: 'Sign In',
    signingIn: 'Signing in...',
    signOut: 'Sign Out',
    connectGoogle: 'Connect Google Account',
    demoAccount: 'Demo Account',
    online: 'Online',
    offline: 'Offline Mode',
    manageCategories: 'Manage Categories',

    // Dashboard Overview
    prodSummary: 'Productivity Summary',
    overviewTitle: 'Work Overview & Performance',
    overviewSub: 'Completed {completed} of {total} total workspace tasks ({rate}% efficiency rate).',
    createTaskBtn: '+ Create New Task',
    viewBoardBtn: 'View Kanban Board',
    totalTasks: 'Total Tasks',
    activeTasks: 'In Progress',
    completionRate: 'Completion Rate',
    overdue: 'Overdue',
    urgentActive: 'Urgent Active',
    upcomingDeadlines: 'Upcoming Deadlines',
    fullCalendar: 'Full Calendar',
    priorityDistribution: 'Priority Distribution',
    taskCategories: 'Task Categories',
    recentActivity: 'Recent Activity',
    noActivity: 'No recent activity.',
    noUpcoming: 'No upcoming deadlines scheduled.',
    urgent: 'Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low',

    // Kanban Board
    taskFilters: 'Task Filters',
    allColumns: 'All Columns',
    allPriorities: 'All Priorities',
    allCategories: 'All Categories',
    allDates: 'All Dates',
    dueToday: 'Due Today',
    dueThisWeek: 'Due This Week',
    overdueTasks: 'Overdue Tasks',
    resetFilters: 'Reset',
    tasksCount: '{count} tasks',
    toDoCol: 'To Do',
    inProgressCol: 'In Progress',
    reviewCol: 'In Review',
    completedCol: 'Completed',
    noTasksInCol: 'No tasks in this column',
    addFirstTask: 'Add first task',

    // Calendar
    calendarDesc: 'Drag and drop task cards to reschedule dates',
    todayBtn: 'Today',
    agendaView: 'Agenda',
    monthView: 'Month',
    weekView: 'Week',
    tasksOnDate: 'Tasks on {date}',
    noTasksOnDate: 'No tasks scheduled for this day.',
    addTaskOnDate: 'Add Task',

    // Todo List
    quickTodoPlaceholder: 'What needs to be done today? (e.g. Finish Sprint review, Fix login bug...)',
    addTodoBtn: 'Add Todo',
    priorityLabel: 'Priority:',
    categoryLabel: 'Category:',
    allTab: 'All',
    activeTab: 'Active',
    todayTab: "Today's Focus",
    completedTab: 'Completed',
    allCaughtUp: 'All caught up!',
    noTasksInTab: 'No tasks found in this tab. Enjoy your productive day!',
    subtasksLabel: 'Subtasks',

    // Task Modal
    createTaskModalTitle: 'Create New Task',
    editTaskModalTitle: 'Edit Task Details',
    taskTitleLabel: 'Task Title',
    taskTitlePlaceholder: 'e.g. Implement OAuth login and profile settings',
    taskDescLabel: 'Description',
    taskDescPlaceholder: 'Add detailed context, links, or acceptance criteria...',
    priorityLevelLabel: 'Priority Level',
    statusColLabel: 'Status Column',
    dueDateLabel: 'Due Date',
    subtasksChecklistLabel: 'Subtasks Checklist',
    addSubtaskPlaceholder: 'Add checklist subtask...',
    addBtn: 'Add',
    tagsLabel: 'Tags',
    addTagPlaceholder: 'Add tag and press Enter',
    cancelBtn: 'Cancel',
    saveBtn: 'Save Task',
    savingBtn: 'Saving...',

    // Categories Modal
    categoryModalTitle: 'Custom Categories Management',
    addCategoryTitle: 'Add New Category',
    categoryNamePlaceholder: 'Category name (e.g. Marketing, DevOps, Personal)...',
    categoryBadgeColor: 'Badge Color:',
    existingCategories: 'Existing Categories ({count})',
    noCategoriesYet: 'No categories created yet',
    confirmDeleteCategory: 'Are you sure you want to delete this category?',

    // Settings Modal
    settingsModalTitle: 'Settings & Data Management',
    firebaseSyncTitle: 'Firebase Cloud Sync',
    firebaseOnlineDesc: 'Connected with Project ID from .env',
    firebaseOfflineDesc: 'Offline local storage mode active',
    backupTitle: 'Backup & Export / Import',
    downloadBackup: 'Download Tasks Backup JSON',
    importJsonPlaceholder: 'Paste JSON tasks array to import...',
    importBtn: 'Import Tasks Data',
    importSuccess: 'Tasks successfully imported!',
    importError: 'Error: Invalid JSON format. Please check syntax.',
    sampleDataTitle: 'Sample Data & Reset',
    reloadSampleData: 'Reload Sample Data',
    clearAllTasks: 'Clear All Tasks',
    confirmReset: 'Reset workspace to initial sample tasks?',
    confirmClear: 'Are you sure you want to clear ALL workspace tasks?',

    // Validation
    titleRequired: 'Title is required',
    titleMinLength: 'Title must be at least 2 characters',
    titleMaxLength: 'Title must not exceed 120 characters',
    dueDateRequired: 'Due date is required',
    invalidDate: 'Invalid date format',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations['th'], params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('tm_language');
    if (saved === 'th' || saved === 'en') return saved;
    return 'th'; // Default to Thai as requested
  });

  useEffect(() => {
    localStorage.setItem('tm_language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'th' ? 'en' : 'th'));
  };

  const t = (key: keyof typeof translations['th'], params?: Record<string, string | number>): string => {
    const dict = translations[language] || translations.th;
    let str = (dict as any)[key] || (translations.th as any)[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
