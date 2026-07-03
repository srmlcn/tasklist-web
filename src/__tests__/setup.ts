import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { mutate } from 'swr';

// Cleanup after each test
afterEach(() => {
  cleanup();
  // Clear SWR cache between tests
  mutate(() => true, undefined, { revalidate: false });
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    getStore: () => store,
    setStore: (newStore: Record<string, string>) => {
      store = { ...newStore };
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock window for SSR safety
Object.defineProperty(globalThis, 'window', {
  value: globalThis,
  writable: true,
  configurable: true,
});