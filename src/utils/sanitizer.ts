/**
 * Sanitizes input string to prevent XSS attacks and removes potentially malicious HTML tags/scripts
 * while preserving natural text characters like slashes, quotes, and punctuation.
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface TaskFormData {
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  startDate?: string;
  dueDate: string;
  dependencies?: string[];
  tags: string[];
}

/**
 * Validates a task form and returns specific field-by-field error messages.
 */
export function validateTaskForm(data: Partial<TaskFormData>): ValidationResult {
  const errors: Record<string, string> = {};

  // Title validation
  if (!data.title || data.title.trim() === '') {
    errors.title = 'Title is required (จำเป็นต้องระบุชื่องาน)';
  } else if (data.title.trim().length < 2) {
    errors.title = 'Title must be at least 2 characters';
  } else if (data.title.trim().length > 120) {
    errors.title = 'Title must not exceed 120 characters';
  }

  // Due Date validation
  if (!data.dueDate || data.dueDate.trim() === '') {
    errors.dueDate = 'Due date is required (จำเป็นต้องระบุกำหนดส่ง)';
  } else {
    const parsed = new Date(data.dueDate);
    if (isNaN(parsed.getTime())) {
      errors.dueDate = 'Invalid date format (รูปแบบวันที่ไม่ถูกต้อง)';
    }
  }

  // Start Date validation (must not be after dueDate)
  if (data.startDate && data.startDate.trim() !== '') {
    const parsedStart = new Date(data.startDate);
    if (isNaN(parsedStart.getTime())) {
      errors.startDate = 'Invalid start date format (รูปแบบวันเริ่มต้นไม่ถูกต้อง)';
    } else if (data.dueDate && data.startDate > data.dueDate) {
      errors.startDate = 'Start date cannot be after due date (วันเริ่มต้นต้องไม่เกินวันกำหนดส่ง)';
    }
  }

  // Priority validation
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  if (data.priority && !validPriorities.includes(data.priority)) {
    errors.priority = 'Invalid priority level';
  }

  // Status validation
  const validStatuses = ['todo', 'in_progress', 'review', 'completed'];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.status = 'Invalid status value';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
