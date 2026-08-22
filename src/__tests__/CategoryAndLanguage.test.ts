import { describe, it, expect } from 'vitest';
import { translations } from '../context/LanguageContext';
import { DEFAULT_CATEGORIES } from '../context/TaskContext';

describe('Language & Localization Dictionary', () => {
  it('should have Thai and English translations with matching keys', () => {
    const thKeys = Object.keys(translations.th);
    const enKeys = Object.keys(translations.en);
    expect(thKeys.length).toBeGreaterThan(20);
    expect(thKeys.sort()).toEqual(enKeys.sort());
  });

  it('should translate overview title correctly in Thai and English', () => {
    expect(translations.th.overview).toBe('ภาพรวมงาน');
    expect(translations.en.overview).toBe('Work Overview');
  });

  it('should support dynamic category list with valid structure', () => {
    expect(DEFAULT_CATEGORIES.length).toBeGreaterThan(0);
    DEFAULT_CATEGORIES.forEach((cat) => {
      expect(cat.id).toBeDefined();
      expect(cat.name.length).toBeGreaterThan(0);
      expect(cat.color).toBeDefined();
    });
  });
});
