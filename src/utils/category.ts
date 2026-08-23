import React from 'react';
import { CategoryItem } from '../types/task';

export interface CategoryStyleResult {
  className: string;
  style: React.CSSProperties;
}

/**
 * Returns either tailwind classes or custom RGB/HEX inline styles for a category badge
 */
export function getCategoryBadgeStyle(categoryName: string, categories: CategoryItem[]): CategoryStyleResult {
  const cat = categories.find((c) => c.name === categoryName);
  
  if (cat && (cat.customBg || cat.customText || cat.customBorder)) {
    return {
      className: 'font-mono font-bold border transition-all',
      style: {
        backgroundColor: cat.customBg || 'transparent',
        color: cat.customText || 'currentColor',
        borderColor: cat.customBorder || 'transparent',
        boxShadow: cat.customBorder ? `0 0 8px ${cat.customBorder}55` : undefined,
      },
    };
  }

  return {
    className: `${cat?.color || 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'} font-mono font-bold transition-all`,
    style: {},
  };
}
