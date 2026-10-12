export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateLocale(dateStr: string, language: 'th' | 'en' = 'th'): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const englishMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = language === 'th' ? thaiMonths[month - 1] : englishMonths[month - 1];
  const yearDisplay = language === 'th' ? year + 543 : year;
  return `${day} ${monthName} ${yearDisplay}`;
}

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isOverdue(dueDateStr: string): boolean {
  if (!dueDateStr) return false;
  const today = getTodayString();
  const cleanDue = dueDateStr.split('T')[0].trim();
  return cleanDue < today;
}

export function isToday(dateStr: string): boolean {
  if (!dateStr) return false;
  return dateStr.split('T')[0].trim() === getTodayString();
}

/**
 * Checks if a task is active, occurring, scheduled, or due on a given date.
 * Handles single-day and multi-day spans safely.
 */
export function isTaskOnDate(
  task: { startDate?: string; dueDate?: string },
  dateStr: string = getTodayString()
): boolean {
  if (!task.dueDate && !task.startDate) return false;
  const target = (dateStr || getTodayString()).split('T')[0].trim();
  const start = (task.startDate || task.dueDate || '').split('T')[0].trim();
  const due = (task.dueDate || task.startDate || '').split('T')[0].trim();

  if (!start && !due) return false;
  const minDate = start && due ? (start <= due ? start : due) : (start || due);
  const maxDate = start && due ? (start <= due ? due : start) : (due || start);

  return minDate <= target && target <= maxDate;
}

/**
 * Checks if a task is relevant for today's work/focus.
 * This includes:
 * 1. Tasks scheduled/active on today (single-day or multi-day range)
 * 2. Unfinished overdue tasks from past days that need attention today
 * 3. Tasks currently marked 'in_progress' whose scheduled start is today or earlier
 */
export function isTaskForToday(
  task: { startDate?: string; dueDate?: string; status?: string },
  todayStr: string = getTodayString()
): boolean {
  const currentToday = todayStr || getTodayString();

  // 1. Is scheduled / occurring on today (multi-day or single-day)
  if (isTaskOnDate(task, currentToday)) return true;

  // 2. Overdue unfinished tasks must be visible & workable today
  if (task.status !== 'completed' && task.dueDate && isOverdue(task.dueDate)) return true;

  // 3. Any task currently in progress is active and workable today
  if (task.status === 'in_progress') return true;

  return false;
}

export function isThisWeek(dateStr: string): boolean {
  if (!dateStr) return false;
  const now = new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  const target = new Date(year, month - 1, day);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return target >= startOfWeek && target <= endOfWeek;
}

/**
 * Calculates number of calendar days between two date strings (YYYY-MM-DD).
 * Inclusive of start and end day if requested.
 */
export function getDaysDifference(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 1;
  const [sy, sm, sd] = startDateStr.split('-').map(Number);
  const [ey, em, ed] = endDateStr.split('-').map(Number);
  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1); // at least 1 day duration
}

/**
 * Adds N days to an ISO date string (YYYY-MM-DD).
 */
export function addDaysToDate(dateStr: string, days: number): string {
  if (!dateStr) return getTodayString();
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  target.setDate(target.getDate() + days);
  const resYear = target.getFullYear();
  const resMonth = String(target.getMonth() + 1).padStart(2, '0');
  const resDay = String(target.getDate()).padStart(2, '0');
  return `${resYear}-${resMonth}-${resDay}`;
}

export interface TimelineDay {
  dateStr: string;
  dayNumber: number;
  monthName: string;
  weekdayName: string;
  isToday: boolean;
  isWeekend: boolean;
  isFirstOfMonth: boolean;
}

/**
 * Generates an array of continuous days for the Gantt timeline header and grid.
 */
export function generateTimelineDays(
  startDateStr: string,
  totalDays: number,
  language: 'th' | 'en' = 'th'
): TimelineDay[] {
  const days: TimelineDay[] = [];
  const todayStr = getTodayString();
  const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const englishMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const thaiWeekdays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
  const englishWeekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const [sy, sm, sd] = startDateStr.split('-').map(Number);
  const current = new Date(sy, sm - 1, sd);

  for (let i = 0; i < totalDays; i++) {
    const y = current.getFullYear();
    const m = current.getMonth();
    const d = current.getDate();
    const dayOfWeek = current.getDay();
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    days.push({
      dateStr,
      dayNumber: d,
      monthName: language === 'th' ? thaiMonths[m] : englishMonths[m],
      weekdayName: language === 'th' ? thaiWeekdays[dayOfWeek] : englishWeekdays[dayOfWeek],
      isToday: dateStr === todayStr,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      isFirstOfMonth: d === 1,
    });

    current.setDate(current.getDate() + 1);
  }

  return days;
}

export interface CalendarDay {
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

/**
 * Returns a 35 or 42 day matrix for a month view.
 */
export function getMonthDays(year: number, month: number): CalendarDay[] {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDay = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
  const totalDays = lastDayOfMonth.getDate();

  const days: CalendarDay[] = [];
  const todayStr = getTodayString();

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({
      dateString: dateStr,
      dayNumber: d,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({
      dateString: dateStr,
      dayNumber: i,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  // Next month leading days to fill grid to multiple of 7
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dateString: dateStr,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }
  }

  return days;
}

/**
 * Returns the 7 days of the specified week.
 */
export function getWeekDays(referenceDate: Date): CalendarDay[] {
  const days: CalendarDay[] = [];
  const todayStr = getTodayString();
  const dayOfWeek = referenceDate.getDay();

  const startOfWeek = new Date(referenceDate);
  startOfWeek.setDate(referenceDate.getDate() - dayOfWeek);

  for (let i = 0; i < 7; i++) {
    const current = new Date(startOfWeek);
    current.setDate(startOfWeek.getDate() + i);

    const year = current.getFullYear();
    const month = current.getMonth();
    const d = current.getDate();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    days.push({
      dateString: dateStr,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  return days;
}
