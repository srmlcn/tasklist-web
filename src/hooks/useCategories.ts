'use client';

import { useState, useCallback, useEffect } from 'react';
import { Category, DEFAULT_CATEGORIES } from '@/types';

const CATEGORIES_KEY = 'tasklist-categories';

function getStoredCategories(): Category[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
  
  try {
    const stored = localStorage.getItem(CATEGORIES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore errors
  }
  return DEFAULT_CATEGORIES;
}

function setStoredCategories(categories: Category[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch {
    // Ignore errors
  }
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setCategories(getStoredCategories());
    setIsLoaded(true);
  }, []);

  const updateCategories = useCallback((newCategories: Category[]) => {
    setCategories(newCategories);
    setStoredCategories(newCategories);
  }, []);

  const getCategoryById = useCallback((id: string | undefined): Category | undefined => {
    if (!id) return undefined;
    return categories.find(c => c.id === id);
  }, [categories]);

  return {
    categories,
    isLoaded,
    updateCategories,
    getCategoryById,
  };
}
