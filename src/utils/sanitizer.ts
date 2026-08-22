/**
 * Sanitizes input string to prevent XSS attacks and removes potentially malicious HTML tags/scripts.
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
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
  dueDate: string;
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
