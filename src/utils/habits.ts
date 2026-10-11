import { Habit } from '../types/task';
import { getTodayString, addDaysToDate } from './date';

/**
 * Calculates current consecutive streak of completed dates up to today or yesterday.
 * If not completed today or yesterday, the active streak is broken (0).
 */
export function calculateStreak(completedDates: string[], referenceDate?: string): number {
  if (!completedDates || completedDates.length === 0) return 0;

  const today = referenceDate || getTodayString();
  const yesterday = addDaysToDate(today, -1);
  const dateSet = new Set(completedDates);

  // Check if active: must be completed today or yesterday
  let checkDate = '';
  if (dateSet.has(today)) {
    checkDate = today;
  } else if (dateSet.has(yesterday)) {
    checkDate = yesterday;
  } else {
    return 0; // Streak broken
  }

  let streak = 0;
  while (dateSet.has(checkDate)) {
    streak++;
    checkDate = addDaysToDate(checkDate, -1);
  }

  return streak;
}

/**
 * Calculates all-time best streak in a list of completed dates.
 */
export function calculateBestStreak(completedDates: string[]): number {
  if (!completedDates || completedDates.length === 0) return 0;

  const sorted = Array.from(new Set(completedDates)).sort();
  if (sorted.length === 0) return 0;

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const expectedCurr = addDaysToDate(prev, 1);

    if (curr === expectedCurr) {
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else {
      currentStreak = 1;
    }
  }

  return maxStreak;
}

/**
 * Checks if a habit is completed on a given date string (YYYY-MM-DD).
 */
export function isHabitCompletedOn(habit: Habit, dateStr: string): boolean {
  return habit.completedDates.includes(dateStr);
}

/**
 * Toggles a habit's completed status for a given date, automatically recalculating streak & bestStreak.
 */
export function toggleHabitDate(habit: Habit, dateStr: string = getTodayString()): Habit {
  const isCompleted = habit.completedDates.includes(dateStr);
  const newDates = isCompleted
    ? habit.completedDates.filter((d) => d !== dateStr)
    : [...habit.completedDates, dateStr];

  const newStreak = calculateStreak(newDates);
  const newBest = Math.max(habit.bestStreak || 0, newStreak, calculateBestStreak(newDates));

  return {
    ...habit,
    completedDates: newDates,
    streak: newStreak,
    bestStreak: newBest,
  };
}
