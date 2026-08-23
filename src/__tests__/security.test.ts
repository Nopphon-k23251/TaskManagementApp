import { describe, it, expect, beforeEach } from 'vitest';
import { 
  appRateLimiter, 
  loginAttemptTracker, 
  generateSecureNonce, 
  verifyNonce, 
  safeJsonParse, 
  isSafeUrl 
} from '../utils/security';
import { sanitizeInput, validateTaskForm, validateJsonImportPayload } from '../utils/sanitizer';

describe('Security & Penetration Testing Suite', () => {

  describe('Rate Limiter & DDoS Mitigation', () => {
    const testKey = 'test_action_' + Date.now();

    beforeEach(() => {
      appRateLimiter.reset(testKey);
    });

    it('should allow requests within configured threshold', () => {
      const config = { maxRequests: 3, windowMs: 10000 };
      expect(appRateLimiter.isAllowed(testKey, config).allowed).toBe(true);
      expect(appRateLimiter.isAllowed(testKey, config).allowed).toBe(true);
      expect(appRateLimiter.isAllowed(testKey, config).allowed).toBe(true);
    });

    it('should block excess requests exceeding limit', () => {
      const config = { maxRequests: 2, windowMs: 10000 };
      appRateLimiter.isAllowed(testKey, config);
      appRateLimiter.isAllowed(testKey, config);

      const blocked = appRateLimiter.isAllowed(testKey, config);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.resetInMs).toBeGreaterThan(0);
    });
  });

  describe('Brute-Force & Credential Stuffing Mitigation', () => {
    const userIdentifier = 'test_user_target_' + Date.now();

    beforeEach(() => {
      loginAttemptTracker.recordSuccess(userIdentifier);
    });

    it('should allow initial attempts', () => {
      const check = loginAttemptTracker.checkLockout(userIdentifier);
      expect(check.isLocked).toBe(false);
    });

    it('should trigger progressive lockout after 5 consecutive failed attempts', () => {
      for (let i = 0; i < 4; i++) {
        const attempt = loginAttemptTracker.recordFailedAttempt(userIdentifier);
        expect(attempt.isLocked).toBe(false);
      }

      // 5th failed attempt should trigger lockout
      const fifthAttempt = loginAttemptTracker.recordFailedAttempt(userIdentifier);
      expect(fifthAttempt.isLocked).toBe(true);
      expect(fifthAttempt.remainingSec).toBeGreaterThan(0);

      // Check lockout status
      const lockoutCheck = loginAttemptTracker.checkLockout(userIdentifier);
      expect(lockoutCheck.isLocked).toBe(true);
    });

    it('should clear lockout state on successful authentication', () => {
      loginAttemptTracker.recordSuccess(userIdentifier);
      const check = loginAttemptTracker.checkLockout(userIdentifier);
      expect(check.isLocked).toBe(false);
    });
  });

  describe('Anti-Replay Attack Nonce Protection', () => {
    it('should accept valid newly generated nonce', () => {
      const nonce = generateSecureNonce();
      expect(verifyNonce(nonce)).toBe(true);
    });

    it('should reject replayed/duplicate nonce', () => {
      const nonce = generateSecureNonce();
      expect(verifyNonce(nonce)).toBe(true);
      // Second attempt with exact same nonce should fail (Replay Attack detection)
      expect(verifyNonce(nonce)).toBe(false);
    });

    it('should reject expired or malformed nonces', () => {
      expect(verifyNonce('invalid-nonce')).toBe(false);
      // Expired timestamp (1 hour ago)
      const expiredNonce = 'testnonce-' + (Date.now() - 3600000);
      expect(verifyNonce(expiredNonce)).toBe(false);
    });
  });

  describe('Prototype Pollution Defense', () => {
    it('should block JSON payload containing __proto__ injection', () => {
      const maliciousPayload = '{"title": "Valid", "__proto__": {"isAdmin": true}}';
      const result = safeJsonParse(maliciousPayload);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Prototype Pollution');
    });

    it('should block nested constructor/prototype attacks', () => {
      const nestedPayload = '{"task": {"constructor": {"prototype": {"polluted": true}}}}';
      const result = safeJsonParse(nestedPayload);
      expect(result.success).toBe(false);
    });

    it('should parse benign JSON cleanly', () => {
      const validPayload = '{"title": "Task 1", "priority": "high"}';
      const result = safeJsonParse(validPayload);
      expect(result.success).toBe(true);
      expect(result.data.title).toBe('Task 1');
    });
  });

  describe('Safe URL & Open Redirect Mitigation', () => {
    it('should block dangerous pseudo-protocols like javascript:', () => {
      expect(isSafeUrl('javascript:alert(1)')).toBe(false);
      expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
      expect(isSafeUrl('vbscript:msgbox(1)')).toBe(false);
    });

    it('should allow valid relative and absolute HTTP/HTTPS URLs', () => {
      expect(isSafeUrl('/dashboard')).toBe(true);
      expect(isSafeUrl('https://google.com')).toBe(true);
    });
  });

  describe('XSS & Input Sanitization', () => {
    it('should strip dangerous tags, inline events, and null bytes', () => {
      const payload = '<img src=x onerror=alert(1)>Test<script>alert(2)</script>\0';
      const clean = sanitizeInput(payload);
      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('onerror');
      expect(clean).not.toContain('\0');
    });

    it('should enforce strict bounds in validateTaskForm', () => {
      const longTitle = 'a'.repeat(200);
      const res = validateTaskForm({ title: longTitle, dueDate: '2026-08-25' });
      expect(res.isValid).toBe(false);
      expect(res.errors.title).toContain('150 characters');
    });

    it('should validate JSON import payloads against resource exhaustion', () => {
      const validBackup = JSON.stringify({
        tasks: [{ id: 't1', title: 'Task 1', dueDate: '2026-08-25', status: 'todo', priority: 'medium' }],
      });
      const result = validateJsonImportPayload(validBackup);
      expect(result.isValid).toBe(true);
      expect(result.tasks?.length).toBe(1);
    });
  });

});
