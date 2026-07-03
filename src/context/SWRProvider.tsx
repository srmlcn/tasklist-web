'use client';

import { SWRConfig, SWRConfiguration } from 'swr';
import { ReactNode } from 'react';

const STORAGE_KEY = 'tasklist-items';

export function getStoredItems<T>(): T | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : undefined;
  } catch {
    return undefined;
  }
}

export function setStoredItems<T>(items: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    console.error('Failed to save items to localStorage');
  }
}

export function clearStoredItems(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    console.error('Failed to clear items from localStorage');
  }
}

const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateOnMount: true,
  fallbackData: undefined,
  dedupingInterval: 0,
};

interface SWRProviderProps {
  children: ReactNode;
  initialData?: unknown;
}

export function SWRProvider({ children, initialData }: SWRProviderProps) {
  return (
    <SWRConfig value={{ ...swrConfig, fallbackData: initialData }}>
      {children}
    </SWRConfig>
  );
}

export { STORAGE_KEY };
