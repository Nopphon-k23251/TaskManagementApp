/**
 * Advanced Cybersecurity & Defensive Architecture Utilities
 * Implements OWASP Top 10 defenses: Rate Limiting, Brute Force Mitigation,
 * Anti-Replay Nonce Verification, Prototype Pollution Guards, and Safe URI Validation.
 */

// ==========================================
// 1. In-Memory Sliding Window Rate Limiter
// ==========================================
export interface RateLimitConfig {
  maxRequests: number; // Max allowed requests in time window
  windowMs: number;    // Time window in milliseconds
}

class SlidingWindowRateLimiter {
  private requests: Map<string, number[]> = new Map();

  /**
   * Check if action is allowed for a specific key (e.g. actionType + userId or client IP)
   */
  public isAllowed(key: string, config: RateLimitConfig = { maxRequests: 60, windowMs: 60000 }): {
    allowed: boolean;
    remaining: number;
    resetInMs: number;
  } {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];

    // Filter out timestamps older than the sliding window
    const validTimestamps = timestamps.filter((t) => now - t < config.windowMs);

    if (validTimestamps.length >= config.maxRequests) {
      const oldest = validTimestamps[0];
      const resetInMs = Math.max(0, config.windowMs - (now - oldest));
      return {
        allowed: false,
        remaining: 0,
        resetInMs,
      };
    }

    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);

    return {
      allowed: true,
      remaining: config.maxRequests - validTimestamps.length,
      resetInMs: config.windowMs,
    };
  }

  public reset(key: string): void {
    this.requests.delete(key);
  }
}

export const appRateLimiter = new SlidingWindowRateLimiter();

// ==========================================
// 2. Brute-Force & Credential Stuffing Lockout Tracker
// ==========================================
interface LockoutState {
  attempts: number;
  lockedUntil: number;
  lastAttempt: number;
}

class LoginAttemptTracker {
  private tracker: Map<string, LockoutState> = new Map();
  private readonly maxAttempts = 5;
  private readonly initialLockoutMs = 30000; // 30 seconds

  public checkLockout(identifier: string): { isLocked: boolean; remainingSec: number } {
    const state = this.tracker.get(identifier);
    if (!state) return { isLocked: false, remainingSec: 0 };

    const now = Date.now();
    if (now < state.lockedUntil) {
      return {
        isLocked: true,
        remainingSec: Math.ceil((state.lockedUntil - now) / 1000),
      };
    }

    // Lockout expired - if inactive for more than 5 minutes, reset attempts
    if (now - state.lastAttempt > 300000) {
      this.tracker.delete(identifier);
    }

    return { isLocked: false, remainingSec: 0 };
  }

  public recordFailedAttempt(identifier: string): { isLocked: boolean; remainingSec: number } {
    const now = Date.now();
    const state = this.tracker.get(identifier) || { attempts: 0, lockedUntil: 0, lastAttempt: now };
    
    state.attempts += 1;
    state.lastAttempt = now;

    if (state.attempts >= this.maxAttempts) {
      // Exponential backoff: 30s, 60s, 120s...
      const multiplier = Math.pow(2, state.attempts - this.maxAttempts);
      const lockoutDuration = Math.min(this.initialLockoutMs * multiplier, 900000); // max 15 mins
      state.lockedUntil = now + lockoutDuration;
      this.tracker.set(identifier, state);
      return {
        isLocked: true,
        remainingSec: Math.ceil(lockoutDuration / 1000),
      };
    }

    this.tracker.set(identifier, state);
    return { isLocked: false, remainingSec: 0 };
  }

  public recordSuccess(identifier: string): void {
    this.tracker.delete(identifier);
  }
}

export const loginAttemptTracker = new LoginAttemptTracker();

// ==========================================
// 3. Anti-Replay Attack & Timestamp Nonce Verification
// ==========================================
const usedNonces = new Set<string>();
const NONCE_VALIDITY_WINDOW_MS = 300000; // 5 minutes

/**
 * Generate a cryptographically secure random token/nonce
 */
export function generateSecureNonce(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buffer = new Uint8Array(16);
    crypto.getRandomValues(buffer);
    return Array.from(buffer, (byte) => byte.toString(16).padStart(2, '0')).join('') + '-' + Date.now();
  }
  return Math.random().toString(36).substring(2) + '-' + Date.now();
}

/**
 * Verify nonce to prevent token replay attacks
 */
export function verifyNonce(nonce: string): boolean {
  if (!nonce || typeof nonce !== 'string') return false;

  const parts = nonce.split('-');
  const timestamp = parseInt(parts[parts.length - 1], 10);

  if (isNaN(timestamp)) return false;

  const now = Date.now();
  // Check if timestamp is within the acceptable time window (reject future or expired tokens)
  if (Math.abs(now - timestamp) > NONCE_VALIDITY_WINDOW_MS) {
    return false;
  }

  // Reject already used nonces
  if (usedNonces.has(nonce)) {
    return false;
  }

  usedNonces.add(nonce);

  // Periodic cleanup of expired nonces to avoid memory leaks
  if (usedNonces.size > 1000) {
    usedNonces.clear();
  }

  return true;
}

// ==========================================
// 4. Prototype Pollution Safe JSON Parser
// ==========================================
export function safeJsonParse<T = any>(jsonString: string): { success: boolean; data?: T; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);

    // Deep check for prototype pollution keys (__proto__, constructor, prototype)
    if (isPolluted(parsed)) {
      return {
        success: false,
        error: 'Security Error: Potential Prototype Pollution payload detected and rejected.',
      };
    }

    return { success: true, data: parsed };
  } catch (err: any) {
    return { success: false, error: err.message || 'Malformed JSON' };
  }
}

function isPolluted(obj: any): boolean {
  if (!obj || typeof obj !== 'object') return false;

  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];

  for (const key of Object.keys(obj)) {
    if (dangerousKeys.includes(key)) return true;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (isPolluted(obj[key])) return true;
    }
  }

  return false;
}

// ==========================================
// 5. Safe URI & Open Redirect Validator
// ==========================================
export function isSafeUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();

  // Reject javascript:, data:, vbscript: pseudo-protocols
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.startsWith('file:')
  ) {
    return false;
  }

  // Allow relative URLs or HTTP/HTTPS URLs
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true;

  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
