/**
 * Input Sanitization & Parameterized Validation Utilities
 * Defends against XSS (Stored, Reflected, DOM-based), HTML Injection,
 * and Malicious Payload Corruption (OWASP Top 10 A03).
 */

import { Task, CategoryItem } from '../types/task';
import { safeJsonParse } from './security';

/**
 * Sanitizes input string to prevent XSS attacks and removes potentially malicious HTML tags/scripts/events
 * while preserving natural international characters and Thai Unicode.
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';

  return input
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove script tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove iframe, object, embed, form tags
    .replace(/<\/?(iframe|object|embed|form|applet|meta|link|style)[^>]*>/gi, '')
    // Remove inline event handlers (e.g. onerror=, onclick=, onload=)
    .replace(/on\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/on\w+\s*=\s*[^>\s]+/gi, '')
    // Remove javascript: and vbscript: URIs
    .replace(/javascript:[^"'>]*/gi, '')
    .replace(/vbscript:[^"'>]*/gi, '')
    // Escape angle brackets
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
  if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
    errors.title = 'Title is required (จำเป็นต้องระบุชื่องาน)';
  } else if (data.title.trim().length < 2) {
    errors.title = 'Title must be at least 2 characters';
  } else if (data.title.trim().length > 150) {
    errors.title = 'Title must not exceed 150 characters';
  }

  // Due Date validation
  if (!data.dueDate || typeof data.dueDate !== 'string' || data.dueDate.trim() === '') {
    errors.dueDate = 'Due date is required (จำเป็นต้องระบุกำหนดส่ง)';
  } else {
    const parsed = new Date(data.dueDate);
    if (isNaN(parsed.getTime())) {
      errors.dueDate = 'Invalid date format (รูปแบบวันที่ไม่ถูกต้อง)';
    }
  }

  // Start Date validation (must not be after dueDate)
  if (data.startDate && typeof data.startDate === 'string' && data.startDate.trim() !== '') {
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

  // Description length bounds (prevent resource exhaustion DoS)
  if (data.description && typeof data.description === 'string' && data.description.length > 5000) {
    errors.description = 'Description exceeds maximum allowed size of 5000 characters';
  }

  // Tags bounds validation
  if (data.tags && Array.isArray(data.tags)) {
    if (data.tags.length > 30) {
      errors.tags = 'Maximum of 30 tags allowed per task';
    }
  }

  // Dependencies bounds validation
  if (data.dependencies && Array.isArray(data.dependencies)) {
    if (data.dependencies.length > 50) {
      errors.dependencies = 'Maximum of 50 dependencies allowed';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates and sanitizes JSON import backup payload
 */
export function validateJsonImportPayload(jsonStr: string): {
  isValid: boolean;
  tasks?: Task[];
  categories?: CategoryItem[];
  error?: string;
} {
  if (!jsonStr || typeof jsonStr !== 'string' || jsonStr.trim().length === 0) {
    return { isValid: false, error: 'Empty JSON payload' };
  }

  // Prevent giant payload DoS (> 5MB)
  if (jsonStr.length > 5 * 1024 * 1024) {
    return { isValid: false, error: 'JSON payload exceeds maximum allowed size of 5MB' };
  }

  const parseResult = safeJsonParse(jsonStr);
  if (!parseResult.success || !parseResult.data) {
    return { isValid: false, error: parseResult.error || 'Invalid JSON format' };
  }

  const data = parseResult.data;

  // Handle format: { tasks: [...], categories: [...] } or array of tasks [...]
  let rawTasks: any[] = [];
  let rawCategories: any[] = [];

  if (Array.isArray(data)) {
    rawTasks = data;
  } else if (typeof data === 'object' && data !== null) {
    if (Array.isArray(data.tasks)) rawTasks = data.tasks;
    if (Array.isArray(data.categories)) rawCategories = data.categories;
  } else {
    return { isValid: false, error: 'Invalid backup structure: Expected Object or Array' };
  }

  // Enforce resource bounds
  if (rawTasks.length > 2000) {
    return { isValid: false, error: 'Import exceeds maximum allowed tasks (2,000 tasks limit)' };
  }

  if (rawCategories.length > 100) {
    return { isValid: false, error: 'Import exceeds maximum allowed categories (100 limit)' };
  }

  // Sanitize each task
  const sanitizedTasks: Task[] = [];
  for (const t of rawTasks) {
    if (!t || typeof t !== 'object' || !t.id || !t.title || !t.dueDate) continue;

    sanitizedTasks.push({
      id: String(t.id).substring(0, 64),
      title: sanitizeInput(String(t.title)).substring(0, 150),
      description: sanitizeInput(String(t.description || '')).substring(0, 5000),
      status: ['todo', 'in_progress', 'review', 'completed'].includes(t.status) ? t.status : 'todo',
      priority: ['low', 'medium', 'high', 'urgent'].includes(t.priority) ? t.priority : 'medium',
      category: sanitizeInput(String(t.category || 'ทั่วไป (General)')).substring(0, 50),
      startDate: t.startDate ? String(t.startDate).substring(0, 20) : undefined,
      dueDate: String(t.dueDate).substring(0, 20),
      dependencies: Array.isArray(t.dependencies) ? t.dependencies.slice(0, 50).map((d: any) => String(d).substring(0, 64)) : [],
      subtasks: Array.isArray(t.subtasks)
        ? t.subtasks.slice(0, 100).map((st: any) => ({
            id: String(st.id || Math.random().toString(36).substring(2)).substring(0, 64),
            title: sanitizeInput(String(st.title || '')).substring(0, 150),
            completed: Boolean(st.completed),
          }))
        : [],
      tags: Array.isArray(t.tags) ? t.tags.slice(0, 30).map((tag: any) => sanitizeInput(String(tag)).substring(0, 40)) : [],
      order: typeof t.order === 'number' ? t.order : undefined,
      createdAt: t.createdAt ? String(t.createdAt).substring(0, 30) : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Sanitize categories
  const sanitizedCategories: CategoryItem[] = [];
  for (const c of rawCategories) {
    if (!c || typeof c !== 'object' || !c.id || !c.name) continue;
    sanitizedCategories.push({
      id: String(c.id).substring(0, 64),
      name: sanitizeInput(String(c.name)).substring(0, 50),
      color: String(c.color || '').substring(0, 200),
      customBg: c.customBg ? String(c.customBg).substring(0, 50) : undefined,
      customText: c.customText ? String(c.customText).substring(0, 50) : undefined,
      customBorder: c.customBorder ? String(c.customBorder).substring(0, 50) : undefined,
    });
  }

  return {
    isValid: true,
    tasks: sanitizedTasks,
    categories: sanitizedCategories.length > 0 ? sanitizedCategories : undefined,
  };
}
