import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useItems } from '@/hooks/useItems';
import { getStoredItems, setStoredItems } from '@/context/SWRProvider';
import type { Item } from '@/types';
import { createTask, createAppointment } from '@/__tests__/utils';

// Mock the storage functions
vi.mock('@/context/SWRProvider', async () => {
  const actual = await vi.importActual('@/context/SWRProvider');
  return {
    ...actual,
    getStoredItems: vi.fn(),
    setStoredItems: vi.fn(),
  };
});

// Helper to create fresh test data each time
function createTestData() {
  return [
    createTask({ id: 'task-1', name: 'Task 1', deadline: '2025-01-15T10:00:00Z' }),
    createTask({ id: 'task-2', name: 'Task 2', deadline: '2025-01-16T10:00:00Z' }),
    createTask({ id: 'task-3', name: 'Task 3', deadline: '2025-01-17T10:00:00Z' }),
  ];
}

describe('useItems Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getStoredItems).mockReturnValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('addItem', () => {
    it('adds a new task and returns it with an id', async () => {
      const { result } = renderHook(() => useItems());

      await waitFor(() => expect(result.current.items).toEqual([]));

      act(() => {
        result.current.addItem(createTask({ id: '' }));
      });

      await waitFor(() => {
        expect(result.current.items.length).toBe(1);
        expect(result.current.items[0].id).toBeDefined();
      });
    });

    it('adds a new appointment and returns it with an id', async () => {
      const { result } = renderHook(() => useItems());

      await waitFor(() => expect(result.current.items).toEqual([]));

      act(() => {
        result.current.addItem(createAppointment({ id: '' }));
      });

      await waitFor(() => {
        expect(result.current.items.length).toBe(1);
        expect(result.current.items[0].id).toBeDefined();
      });
    });

    it('adds multiple items with unique ids', async () => {
      const { result } = renderHook(() => useItems());

      let firstItem: Item | undefined;
      let secondItem: Item | undefined;

      act(() => {
        firstItem = result.current.addItem(createTask({ id: '' }));
      });

      act(() => {
        secondItem = result.current.addItem(createAppointment({ id: '' }));
      });

      expect(firstItem).toBeDefined();
      expect(secondItem).toBeDefined();
      expect(firstItem?.id).toBeDefined();
      expect(secondItem?.id).toBeDefined();
      expect(firstItem?.id).not.toBe(secondItem?.id);
    });

    it('calls setStoredItems when adding items', async () => {
      const { result } = renderHook(() => useItems());

      act(() => {
        result.current.addItem(createTask({ id: '' }));
      });

      await waitFor(() => {
        expect(setStoredItems).toHaveBeenCalled();
      });
    });
  });

  describe('updateItem', () => {
    it('updates an existing item', async () => {
      const storedItems = [createTask({ id: 'task-1', name: 'Original' })];
      vi.mocked(getStoredItems).mockReturnValue(storedItems);

      const { result } = renderHook(() => useItems());

      await waitFor(() => expect(result.current.items.length).toBe(1));

      act(() => {
        result.current.updateItem('task-1', { name: 'Updated' });
      });

      await waitFor(() => {
        expect(result.current.items[0].name).toBe('Updated');
      });
    });

    it('returns null for non-existent item', async () => {
      const { result } = renderHook(() => useItems());

      let updated: Item | null = null;
      act(() => {
        updated = result.current.updateItem('non-existent', { name: 'Test' });
      });

      expect(updated).toBeNull();
    });

    it('updates only the specified item', async () => {
      const storedItems = [
        createTask({ id: 'task-1', name: 'Task 1' }),
        createTask({ id: 'task-2', name: 'Task 2' }),
      ];
      vi.mocked(getStoredItems).mockReturnValue(storedItems);

      const { result } = renderHook(() => useItems());

      await waitFor(() => expect(result.current.items.length).toBe(2));

      act(() => {
        result.current.updateItem('task-1', { name: 'Updated' });
      });

      await waitFor(() => {
        expect(result.current.items[0].name).toBe('Updated');
        expect(result.current.items[1].name).toBe('Task 2');
      });
    });
  });

  describe('deleteItem', () => {
    it('deletes an existing item', async () => {
      const storedItems = [
        createTask({ id: 'task-1' }),
        createTask({ id: 'task-2' }),
      ];
      vi.mocked(getStoredItems).mockReturnValue(storedItems);

      const { result } = renderHook(() => useItems());

      await waitFor(() => expect(result.current.items.length).toBe(2));

      act(() => {
        const deleted = result.current.deleteItem('task-1');
        expect(deleted).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.items.length).toBe(1);
        expect(result.current.items[0].id).toBe('task-2');
      });
    });

    it('returns false for non-existent item', async () => {
      const { result } = renderHook(() => useItems());

      let deleted = false;
      act(() => {
        deleted = result.current.deleteItem('non-existent');
      });

      expect(deleted).toBe(false);
    });
  });

  describe('toggleTaskComplete', () => {
    it('toggles task completion status', async () => {
      const storedItems = [createTask({ id: 'task-1', isComplete: false })];
      vi.mocked(getStoredItems).mockReturnValue(storedItems);

      const { result } = renderHook(() => useItems());

      await waitFor(() => expect(result.current.items.length).toBe(1));

      act(() => {
        result.current.toggleTaskComplete('task-1');
      });

      await waitFor(() => {
        expect(result.current.items[0].isComplete).toBe(true);
      });

      act(() => {
        result.current.toggleTaskComplete('task-1');
      });

      await waitFor(() => {
        expect(result.current.items[0].isComplete).toBe(false);
      });
    });

    it('returns null for non-existent item', async () => {
      const { result } = renderHook(() => useItems());

      let toggled: Item | null = null;
      act(() => {
        toggled = result.current.toggleTaskComplete('non-existent');
      });

      expect(toggled).toBeNull();
    });

    it('returns null for appointment items', async () => {
      const storedItems = [createAppointment({ id: 'appt-1' })];
      vi.mocked(getStoredItems).mockReturnValue(storedItems);

      const { result } = renderHook(() => useItems());

      await waitFor(() => expect(result.current.items.length).toBe(1));

      let toggled: Item | null = null;
      act(() => {
        toggled = result.current.toggleTaskComplete('appt-1');
      });

      expect(toggled).toBeNull();
    });
  });

  describe('getItemsByDateRange', () => {
    it('filters items within date range', async () => {
      const storedItems: Item[] = [
        createTask({ id: 'task-1', deadline: '2025-01-10T00:00:00Z' }),
        createTask({ id: 'task-2', deadline: '2025-01-15T00:00:00Z' }),
        createTask({ id: 'task-3', deadline: '2025-01-20T00:00:00Z' }),
        createTask({ id: 'task-4', deadline: '2025-01-25T00:00:00Z' }),
      ];
      vi.mocked(getStoredItems).mockReturnValue(storedItems);

      const { result } = renderHook(() => useItems());

      await waitFor(() => expect(result.current.items.length).toBe(4));

      const filtered = result.current.getItemsByDateRange(
        new Date('2025-01-12T00:00:00Z'),
        new Date('2025-01-22T00:00:00Z')
      );

      expect(filtered.length).toBe(2);
      expect(filtered.map(i => i.id)).toContain('task-2');
      expect(filtered.map(i => i.id)).toContain('task-3');
    });

    it('filters by search term', async () => {
      const storedItems: Item[] = [
        createTask({ id: 'task-1', name: 'Buy groceries' }),
        createTask({ id: 'task-2', name: 'Clean house' }),
        createTask({ id: 'task-3', name: 'Buy presents' }),
      ];
      vi.mocked(getStoredItems).mockReturnValue(storedItems);

      const { result } = renderHook(() => useItems());

      await waitFor(() => expect(result.current.items.length).toBe(3));

      const filtered = result.current.getItemsByDateRange(
        new Date('2000-01-01'),
        new Date('2100-01-01'),
        'buy'
      );

      expect(filtered.length).toBe(2);
      expect(filtered.map(i => i.id)).toContain('task-1');
      expect(filtered.map(i => i.id)).toContain('task-3');
    });

    it('filters by description as well', async () => {
      const storedItems: Item[] = [
        createTask({ id: 'task-1', name: 'Task 1', description: 'Important meeting' }),
        createTask({ id: 'task-2', name: 'Task 2', description: 'Call mom' }),
      ];
      vi.mocked(getStoredItems).mockReturnValue(storedItems);

      const { result } = renderHook(() => useItems());

      await waitFor(() => expect(result.current.items.length).toBe(2));

      const filtered = result.current.getItemsByDateRange(
        new Date('2000-01-01'),
        new Date('2100-01-01'),
        'mom'
      );

      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('task-2');
    });

    it('sorts by priority when sortByPriority is true', async () => {
      const storedItems: Item[] = [
        createTask({ id: 'task-1', priority: 0, deadline: '2025-01-15T10:00:00Z' }),
        createTask({ id: 'task-2', priority: 3, deadline: '2025-01-15T10:00:00Z' }),
        createTask({ id: 'task-3', priority: 1, deadline: '2025-01-15T10:00:00Z' }),
      ];
      vi.mocked(getStoredItems).mockReturnValue(storedItems);

      const { result } = renderHook(() => useItems());

      await waitFor(() => expect(result.current.items.length).toBe(3));

      const sorted = result.current.getItemsByDateRange(
        new Date('2025-01-01'),
        new Date('2025-01-31'),
        undefined,
        true
      );

      expect(sorted[0].id).toBe('task-2'); // Priority 3
      expect(sorted[1].id).toBe('task-3'); // Priority 1
      expect(sorted[2].id).toBe('task-1'); // Priority 0
    });

    it('sorts by date as secondary sort when priority is equal', async () => {
      const storedItems: Item[] = [
        createTask({ id: 'task-1', priority: 1, deadline: '2025-01-20T00:00:00Z' }),
        createTask({ id: 'task-2', priority: 1, deadline: '2025-01-15T00:00:00Z' }),
        createTask({ id: 'task-3', priority: 1, deadline: '2025-01-10T00:00:00Z' }),
      ];
      vi.mocked(getStoredItems).mockReturnValue(storedItems);

      const { result } = renderHook(() => useItems());

      await waitFor(() => expect(result.current.items.length).toBe(3));

      const sorted = result.current.getItemsByDateRange(
        new Date('2025-01-01'),
        new Date('2025-01-31'),
        undefined,
        true
      );

      expect(sorted[0].id).toBe('task-3'); // Earliest
      expect(sorted[1].id).toBe('task-2');
      expect(sorted[2].id).toBe('task-1'); // Latest
    });

    it('returns all items when no filters applied', async () => {
      const storedItems = createTestData();
      vi.mocked(getStoredItems).mockReturnValue(storedItems);

      const { result } = renderHook(() => useItems());

      await waitFor(() => expect(result.current.items.length).toBe(3));

      const all = result.current.getItemsByDateRange(
        new Date('2000-01-01'),
        new Date('2100-01-01')
      );

      expect(all.length).toBe(3);
    });
  });

  describe('getAllItems', () => {
    it('returns all items', async () => {
      const storedItems = createTestData();
      vi.mocked(getStoredItems).mockReturnValue(storedItems);

      const { result } = renderHook(() => useItems());

      await waitFor(() => expect(result.current.items.length).toBe(3));

      const all = result.current.getAllItems();
      expect(all.length).toBe(3);
    });

    it('returns empty array when no items', async () => {
      const { result } = renderHook(() => useItems());

      const all = result.current.getAllItems();
      expect(all).toEqual([]);
    });
  });

  describe('importItems', () => {
    it('replaces all items with imported items', async () => {
      const storedItems = [createTask({ id: 'old-1' })];
      vi.mocked(getStoredItems).mockReturnValue(storedItems);

      const { result } = renderHook(() => useItems());

      await waitFor(() => expect(result.current.items.length).toBe(1));

      const newItems = [createTask({ id: 'new-1' }), createAppointment({ id: 'new-2' })];

      act(() => {
        result.current.importItems(newItems);
      });

      await waitFor(() => {
        expect(result.current.items.length).toBe(2);
        expect(result.current.items[0].id).toBe('new-1');
        expect(result.current.items[1].id).toBe('new-2');
      });
    });

    it('handles empty array import', async () => {
      const storedItems = [createTask({ id: 'old-1' })];
      vi.mocked(getStoredItems).mockReturnValue(storedItems);

      const { result } = renderHook(() => useItems());

      await waitFor(() => expect(result.current.items.length).toBe(1));

      act(() => {
        result.current.importItems([]);
      });

      await waitFor(() => {
        expect(result.current.items.length).toBe(0);
      });
    });
  });

  describe('clearAllItems', () => {
    it('removes all items', async () => {
      const storedItems = createTestData();
      vi.mocked(getStoredItems).mockReturnValue(storedItems);

      const { result } = renderHook(() => useItems());

      await waitFor(() => expect(result.current.items.length).toBe(3));

      act(() => {
        result.current.clearAllItems();
      });

      await waitFor(() => {
        expect(result.current.items.length).toBe(0);
      });
    });
  });

  describe('State Management', () => {
    it('provides isLoading state', () => {
      const { result } = renderHook(() => useItems());
      expect(result.current.isLoading).toBeDefined();
    });

    it('returns empty array when no items exist', async () => {
      const { result } = renderHook(() => useItems());
      expect(result.current.items).toEqual([]);
    });

    it('loads initial items from localStorage', async () => {
      const storedItems = [createTask({ id: 'stored-1' })];
      vi.mocked(getStoredItems).mockReturnValue(storedItems);

      const { result } = renderHook(() => useItems());

      await waitFor(() => {
        expect(result.current.items.length).toBe(1);
        expect(result.current.items[0].id).toBe('stored-1');
      });
    });
  });
});