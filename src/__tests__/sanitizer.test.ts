import { describe, it, expect } from 'vitest';
import { sanitizeInput, validateTaskForm } from '../utils/sanitizer';

describe('Sanitizer & Security Utils', () => {
  it('should escape HTML tags and malicious script tags', () => {
    const raw = '<script>alert("xss")</script>';
    const sanitized = sanitizeInput(raw);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('&lt;script&gt;');
  });

  it('should sanitize quote marks and slashes', () => {
    const raw = 'onClick="steal()"';
    const sanitized = sanitizeInput(raw);
    expect(sanitized).toContain('&quot;');
    expect(sanitized).not.toContain('"');
  });

  it('should return empty string for null or empty values', () => {
    expect(sanitizeInput('')).toBe('');
  });
});

describe('Task Form Validation', () => {
  it('should fail if title is missing or blank', () => {
    const result = validateTaskForm({
      title: '   ',
      dueDate: '2026-08-25',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBeDefined();
  });

  it('should fail if title is too short', () => {
    const result = validateTaskForm({
      title: 'a',
      dueDate: '2026-08-25',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toContain('at least 2 characters');
  });

  it('should fail if dueDate is empty or invalid', () => {
    const result = validateTaskForm({
      title: 'Valid Task Title',
      dueDate: '',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.dueDate).toBeDefined();
  });

  it('should pass with valid title and dueDate', () => {
    const result = validateTaskForm({
      title: 'Setup Production Deployment',
      dueDate: '2026-08-25',
      priority: 'high',
      status: 'todo',
    });
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });
});
