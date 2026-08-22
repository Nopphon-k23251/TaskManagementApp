import { describe, it, expect } from 'vitest';
import { 
  isFirebaseConfigured, 
  testFirestoreConnection, 
  cleanFirestoreData 
} from '../services/firebase';

describe('Firebase Service & Configuration Integrity', () => {
  it('should detect valid Firebase configuration from environment', () => {
    expect(typeof isFirebaseConfigured).toBe('boolean');
  });

  it('should execute testFirestoreConnection and return a structured diagnostic result', async () => {
    const result = await testFirestoreConnection();
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('message');
    expect(typeof result.success).toBe('boolean');
    expect(typeof result.message).toBe('string');
    expect(result.success).toBe(true);
  });

  it('should strip undefined properties from nested objects to prevent Firestore setDoc crashes', () => {
    const dirtyData = {
      id: 'task-123',
      title: 'Clean Task',
      description: 'Test Desc',
      startDate: undefined,
      estimatedHours: undefined,
      subtasks: [
        { id: 'st-1', title: 'Sub 1', completed: false },
        { id: 'st-2', title: 'Sub 2', completed: true, details: undefined }
      ],
      nested: {
        keepMe: 'present',
        dropMe: undefined,
      }
    };

    const cleaned = cleanFirestoreData(dirtyData);
    expect(cleaned).toHaveProperty('id', 'task-123');
    expect(cleaned).toHaveProperty('title', 'Clean Task');
    expect(cleaned).not.toHaveProperty('startDate');
    expect(cleaned).not.toHaveProperty('estimatedHours');
    expect(cleaned.nested).toHaveProperty('keepMe', 'present');
    expect(cleaned.nested).not.toHaveProperty('dropMe');
    expect(cleaned.subtasks[1]).not.toHaveProperty('details');
  });
});
