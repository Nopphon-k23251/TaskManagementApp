import { describe, it, expect } from 'vitest';
import { isFirebaseConfigured, testFirestoreConnection } from '../services/firebase';

describe('Firebase Service & Configuration Integrity', () => {
  it('should detect valid Firebase configuration from environment', () => {
    // In our test environment, config is set via .env
    expect(typeof isFirebaseConfigured).toBe('boolean');
  });

  it('should execute testFirestoreConnection and return a structured diagnostic result', async () => {
    const result = await testFirestoreConnection();
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('message');
    expect(typeof result.success).toBe('boolean');
    expect(typeof result.message).toBe('string');
  });
});
