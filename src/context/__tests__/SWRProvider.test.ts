import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getStoredItems, setStoredItems, clearStoredItems, STORAGE_KEY } from '@/context/SWRProvider';
import type { Item } from '@/types';
import { createTask, createAppointment } from '@/__tests__/utils';

describe('Storage Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getStoredItems', () => {
    it('returns undefined when no items are stored', () => {
      const result = getStoredItems<Item>();
      expect(result).toBeUndefined();
    });

    it('returns parsed items when stored', () => {
      const items: Item[] = [createTask({ id: 'test-1' }), createAppointment({ id: 'test-2' })];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      
      const result = getStoredItems<Item[]>();
      expect(result).toEqual(items);
    });

    it('returns undefined on invalid JSON', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid-json');
      
      const result = getStoredItems<Item[]>();
      expect(result).toBeUndefined();
    });

    it('returns undefined on localStorage error', () => {
      vi.spyOn(localStorage, 'getItem').mockImplementationOnce(() => {
        throw new Error('Storage error');
      });
      
      const result = getStoredItems<Item[]>();
      expect(result).toBeUndefined();
    });

    it('handles different data types', () => {
      const numbers = [1, 2, 3];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(numbers));
      
      const result = getStoredItems<number[]>();
      expect(result).toEqual(numbers);
    });

    it('handles empty array stored', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      
      const result = getStoredItems<Item[]>();
      expect(result).toEqual([]);
    });
  });

  describe('setStoredItems', () => {
    it('stores items as JSON string', () => {
      const items: Item[] = [createTask({ id: 'test-1' })];
      setStoredItems(items);
      
      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).toBe(JSON.stringify(items));
    });

    it('overwrites existing items', () => {
      const initial: Item[] = [createTask({ id: 'initial' })];
      const updated: Item[] = [createTask({ id: 'updated' }), createAppointment({ id: 'appt-1' })];
      
      setStoredItems(initial);
      setStoredItems(updated);
      
      const result = getStoredItems<Item[]>();
      expect(result).toEqual(updated);
    });

    it('handles different data types', () => {
      const data = { count: 42, enabled: true };
      setStoredItems(data);
      
      const stored = localStorage.getItem(STORAGE_KEY);
      expect(JSON.parse(stored!)).toEqual(data);
    });

    it('handles empty array', () => {
      setStoredItems<Item[]>([]);
      
      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).toBe('[]');
    });

    it('silently fails on localStorage error', () => {
      vi.spyOn(localStorage, 'setItem').mockImplementationOnce(() => {
        throw new Error('Storage error');
      });
      
      expect(() => setStoredItems([createTask()])).not.toThrow();
    });
  });

  describe('clearStoredItems', () => {
    it('removes items from storage', () => {
      const items: Item[] = [createTask({ id: 'test-1' })];
      setStoredItems(items);
      
      clearStoredItems();
      
      const result = localStorage.getItem(STORAGE_KEY);
      expect(result).toBeNull();
    });

    it('does not throw when storage is already empty', () => {
      expect(() => clearStoredItems()).not.toThrow();
    });

    it('silently fails on localStorage error', () => {
      vi.spyOn(localStorage, 'removeItem').mockImplementationOnce(() => {
        throw new Error('Storage error');
      });
      
      expect(() => clearStoredItems()).not.toThrow();
    });
  });
});