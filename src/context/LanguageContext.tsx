import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types/task';

export const translations = {
  th: {
    // Navigation
    overview: 'ภาพรวมงาน',
    board: 'กระดานงาน',
    timeline: 'ไทม์ไลน์ Gantt',
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
    viewTimelineBtn: 'ดูไทม์ไลน์ Gantt',
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

    // Gantt Timeline & Dependencies
    ganttTitle: 'แผนผังไทม์ไลน์โปรเจกต์ (Gantt Chart)',
    ganttSub: 'ดูความต่อเนื่องของงาน วันเริ่มต้น-สิ้นสุด และการผูกเงื่อนไขงานก่อนหน้า (Dependencies)',
    startDateLabel: 'วันเริ่มต้น (Start Date)',
    dueDateLabel: 'วันสิ้นสุด/กำหนดส่ง (Due Date)',
    dependenciesLabel: 'งานที่ต้องทำก่อน (Blocked by / Prerequisite)',
    dependenciesPlaceholder: 'เลือกงานที่ต้องเสร็จก่อนเริ่มงานนี้...',
    noDependencies: 'ไม่มีเงื่อนไขงานก่อนหน้า',
    blockedByCount: 'ติดบล็อก {count} งาน',
    blockedBadge: '🔒 ติดบล็อก',
    delayedWarningTitle: '⚠️ งานต้นทางล่าช้า!',
    delayedWarningDesc: 'งาน "{title}" ล่าช้าหรือเลยกำหนดส่ง อาจกระทบต่องานนี้',
    circularDependencyError: 'ไม่สามารถเลือกงานนี้ได้ เนื่องจากเกิดเงื่อนไขวนซ้ำ (Circular Dependency)',
    startDateAfterDueDateError: 'วันเริ่มต้นต้องไม่เกินวันกำหนดส่ง',
    zoomDay: 'มุมมองรายวัน',
    zoomWeek: 'มุมมองรายสัปดาห์',
    zoomMonth: 'มุมมองรายเดือน',
    todayMarker: 'วันนี้',
    taskDurationDays: '{days} วัน',
    progressPercent: '{percent}%',
    unblockAllPrereqs: 'ต้องทำงานต้นทางให้เสร็จก่อน',
    showDependencyLines: 'แสดงเส้นเชื่อมโยงงาน (Dependency Lines)',
    dragToReschedule: 'คลิกลากเพื่อย้ายช่วงเวลาทำงาน',
    blockedTasksOverview: 'งานที่ติดบล็อกรอเริ่ม',
    dependenciesCount: '{count} เงื่อนไข',

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
    taskDescPlaceholder: 'ระบุรายละเอียด ขอบเขต หรือข้อกำหนดของงานนี้...',
    priorityLevelLabel: 'ระดับความสำคัญ',
    statusColLabel: 'สถานะงาน',
    subtasksChecklistLabel: 'รายการย่อย (Subtasks)',
    addSubtaskPlaceholder: 'เพิ่มรายการย่อย เช่น ออกแบบ UI, เขียน API...',
    tagsLabel: 'ป้ายกำกับ (Tags)',
    addTagPlaceholder: 'พิมพ์แท็กแล้วกด Enter เช่น Frontend, Urgent...',
    cancelBtn: 'ยกเลิก',
    saveBtn: 'บันทึกข้อมูล',
    savingBtn: 'กำลังบันทึก...',
    addBtn: 'เพิ่ม',

    // Category Manager Modal
    categoryModalTitle: 'จัดการหมวดหมู่งาน (Custom Categories)',
    addCategoryTitle: 'เพิ่มหมวดหมู่ใหม่',
    categoryNamePlaceholder: 'เช่น การตลาด (Marketing), เอกสาร (Docs)...',
    categoryBadgeColor: 'เลือกสีป้ายกำกับ (Badge Color)',
    existingCategories: 'หมวดหมู่ที่มีอยู่ ({count})',
    noCategoriesYet: 'ยังไม่มีหมวดหมู่เพิ่มเติม',
    confirmDeleteCategory: 'คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่นี้? งานในหมวดนี้จะถูกย้ายไป "ทั่วไป (General)"',

    // Settings Modal
    settingsModalTitle: 'ตั้งค่าระบบ & ซิงก์ข้อมูลคลาวด์',
    firebaseSyncTitle: 'การซิงก์ข้อมูลบนคลาวด์ (Firebase)',
    firebaseOnlineDesc: 'เชื่อมต่อกับ Project ID จาก .env เรียบร้อยแล้ว',
    firebaseOfflineDesc: 'ทำงานในโหมด Offline LocalStorage ปลอดภัยและรวดเร็ว',
    backupTitle: 'สำรองและกู้คืนข้อมูล (JSON Backup & Restore)',
    downloadBackup: 'ดาวน์โหลดไฟล์สำรองข้อมูล (JSON)',
    importJsonPlaceholder: 'วางโค้ด JSON สำรองข้อมูลที่นี่เพื่อนำเข้า...',
    importBtn: 'นำเข้าข้อมูลจาก JSON',
    importSuccess: 'นำเข้าข้อมูลสำเร็จเรียบร้อยแล้ว!',
    importError: 'รูปแบบ JSON ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
    sampleDataTitle: 'ข้อมูลตัวอย่าง & ล้างข้อมูล',
    reloadSampleData: 'โหลดข้อมูลตัวอย่างใหม่อีกครั้ง',
    clearAllTasks: 'ล้างข้อมูลงานทั้งหมด',
    confirmReset: 'คุณต้องการโหลดข้อมูลตัวอย่างภาษาไทยใหม่หรือไม่?',
    confirmClear: 'คุณแน่ใจหรือไม่ว่าต้องการล้างงานทั้งหมด?',
  },

  en: {
    // Navigation
    overview: 'Work Overview',
    board: 'Kanban Board',
    timeline: 'Gantt Timeline',
    calendar: 'Calendar Matrix',
    todo: 'To-Do Checklist',
    settings: 'Settings & Sync',
    workspace: 'Workspace',
    menuNavigation: 'Navigation',
    liveStats: 'Live Quick Stats',
    inProgress: 'In Progress',
    done: 'Done',
    urgentTasks: 'Urgent',

    // Header & Actions
    searchPlaceholder: 'Search tasks, tags, keywords...',
    newTask: 'New Task',
    signIn: 'Sign In',
    signingIn: 'Signing In...',
    signOut: 'Sign Out',
    connectGoogle: 'Connect Google Account',
    demoAccount: 'Demo Account',
    online: 'Online',
    offline: 'Offline Mode',
    manageCategories: 'Manage Categories',

    // Dashboard Overview
    prodSummary: 'Productivity Summary',
    overviewTitle: 'Work Overview & Execution',
    overviewSub: 'Completed {completed} of {total} total tasks ({rate}% success rate)',
    createTaskBtn: '+ Create New Task',
    viewBoardBtn: 'View Kanban Board',
    viewTimelineBtn: 'View Gantt Timeline',
    totalTasks: 'Total Tasks',
    activeTasks: 'In Progress',
    completionRate: 'Completion Rate',
    overdue: 'Overdue',
    urgentActive: 'Urgent Tasks',
    upcomingDeadlines: 'Upcoming Deadlines',
    fullCalendar: 'View Full Calendar',
    priorityDistribution: 'Priority Breakdown',
    taskCategories: 'Task Categories',
    recentActivity: 'Recent Activity Feed',
    noActivity: 'No recent activity yet',
    noUpcoming: 'No upcoming tasks due soon',
    urgent: 'Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low',

    // Gantt Timeline & Dependencies
    ganttTitle: 'Project Timeline & Gantt Schedule',
    ganttSub: 'Visual project overview, start-to-due date spans, and task dependency links',
    startDateLabel: 'Start Date',
    dueDateLabel: 'Due Date',
    dependenciesLabel: 'Prerequisites (Blocked By)',
    dependenciesPlaceholder: 'Select tasks that must finish before this task...',
    noDependencies: 'No prerequisites',
    blockedByCount: 'Blocked by {count} tasks',
    blockedBadge: '🔒 Blocked',
    delayedWarningTitle: '⚠️ Prerequisite Delayed!',
    delayedWarningDesc: 'Task "{title}" is overdue or delayed, impacting this task schedule',
    circularDependencyError: 'Cannot select this task: Circular dependency detected',
    startDateAfterDueDateError: 'Start date cannot be after due date',
    zoomDay: 'Daily View',
    zoomWeek: 'Weekly View',
    zoomMonth: 'Monthly View',
    todayMarker: 'Today',
    taskDurationDays: '{days} days',
    progressPercent: '{percent}%',
    unblockAllPrereqs: 'Prerequisite tasks must be completed first',
    showDependencyLines: 'Show Dependency Connectors',
    dragToReschedule: 'Click and drag to reschedule time span',
    blockedTasksOverview: 'Tasks Blocked Waiting to Start',
    dependenciesCount: '{count} dependencies',

    // Kanban Board
    taskFilters: 'Task Filters',
    allColumns: 'All Columns',
    allPriorities: 'All Priorities',
    allCategories: 'All Categories',
    allDates: 'All Due Dates',
    dueToday: 'Due Today',
    dueThisWeek: 'Due This Week',
    overdueTasks: 'Overdue',
    resetFilters: 'Reset Filters',
    tasksCount: '{count} tasks',
    toDoCol: 'To Do',
    inProgressCol: 'In Progress',
    reviewCol: 'Review',
    completedCol: 'Completed',
    noTasksInCol: 'No tasks in this stage',
    addFirstTask: 'Add First Task',

    // Calendar
    calendarDesc: 'Drag and drop cards across dates to reschedule instantly',
    todayBtn: 'Today',
    agendaView: 'Agenda View',
    monthView: 'Month Matrix',
    weekView: 'Week View',
    tasksOnDate: 'Tasks Due On {date}',
    noTasksOnDate: 'No tasks scheduled for this date',
    addTaskOnDate: 'Schedule Task',

    // Todo List
    quickTodoPlaceholder: 'What needs to get done? (e.g. Finish report, Fix bug...)',
    addTodoBtn: 'Add Todo',
    priorityLabel: 'Priority:',
    categoryLabel: 'Category:',
    allTab: 'All',
    activeTab: 'Active',
    todayTab: 'Today Goal',
    completedTab: 'Completed',
    allCaughtUp: 'All Caught Up!',
    noTasksInTab: 'No tasks found in this tab. Have a great day!',
    subtasksLabel: 'Subtasks',

    // Task Modal
    createTaskModalTitle: 'Create New Task',
    editTaskModalTitle: 'Edit Task Details',
    taskTitleLabel: 'Task Title',
    taskTitlePlaceholder: 'e.g. Design Google Auth Flow and User Settings',
    taskDescLabel: 'Description',
    taskDescPlaceholder: 'Enter detailed specifications, scope, or requirements...',
    priorityLevelLabel: 'Priority Level',
    statusColLabel: 'Workflow Status',
    subtasksChecklistLabel: 'Subtasks Checklist',
    addSubtaskPlaceholder: 'Add subtask item, e.g. Design UI, Write API...',
    tagsLabel: 'Tags & Keywords',
    addTagPlaceholder: 'Type tag and press Enter...',
    cancelBtn: 'Cancel',
    saveBtn: 'Save Task',
    savingBtn: 'Saving...',
    addBtn: 'Add',

    // Category Manager Modal
    categoryModalTitle: 'Custom Categories Manager',
    addCategoryTitle: 'Add New Category',
    categoryNamePlaceholder: 'e.g. Marketing, Docs, Compliance...',
    categoryBadgeColor: 'Badge Color Theme',
    existingCategories: 'Existing Categories ({count})',
    noCategoriesYet: 'No custom categories created yet',
    confirmDeleteCategory: 'Are you sure? Tasks in this category will move to General.',

    // Settings Modal
    settingsModalTitle: 'System Settings & Cloud Sync',
    firebaseSyncTitle: 'Cloud Database Sync (Firebase)',
    firebaseOnlineDesc: 'Connected to Project ID from .env configuration',
    firebaseOfflineDesc: 'Running in offline LocalStorage mode with full speed',
    backupTitle: 'JSON Data Backup & Restore',
    downloadBackup: 'Download Backup JSON',
    importJsonPlaceholder: 'Paste exported JSON content here...',
    importBtn: 'Import JSON',
    importSuccess: 'Data imported successfully!',
    importError: 'Invalid JSON format. Please verify.',
    sampleDataTitle: 'Sample Data & Reset',
    reloadSampleData: 'Reload Sample Data',
    clearAllTasks: 'Clear All Tasks',
    confirmReset: 'Do you want to reload sample tasks?',
    confirmClear: 'Are you sure you want to delete all tasks?',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations.th, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const cached = localStorage.getItem('tm_lang') as Language;
    return cached === 'en' ? 'en' : 'th'; // Default to Thai
  });

  useEffect(() => {
    localStorage.setItem('tm_lang', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'th' ? 'en' : 'th'));
  };

  const t = (key: keyof typeof translations.th, params?: Record<string, string | number>): string => {
    const dict = translations[language] || translations.th;
    let text = dict[key] || translations.th[key] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
      });
    }

    return text;
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
