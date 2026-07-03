'use client';

import useSWR, { mutate } from 'swr';
import { useCallback, useMemo } from 'react';
import { Item, Task, Appointment, isTask, getItemDateTime } from '@/types';
import { getStoredItems, setStoredItems } from '@/context/SWRProvider';

const ITEMS_KEY = 'items';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

interface ItemsState {
  items: Item[];
}

function getInitialData(): ItemsState {
  const stored = getStoredItems<Item[]>();
  return { items: stored || [] };
}

export function useItems() {
  const { data, error, isLoading, mutate: localMutate } = useSWR<ItemsState>(
    ITEMS_KEY,
    () => getInitialData(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
      fallbackData: getInitialData(),
    }
  );

  const items = data?.items || [];

  const saveItems = useCallback((newItems: Item[]) => {
    setStoredItems(newItems);
    localMutate({ items: newItems }, false);
    mutate(ITEMS_KEY, { items: newItems }, false);
  }, [localMutate]);

  const addItem = useCallback((item: Omit<Item, 'id'>): Item => {
    const newItem = { ...item, id: generateId() } as Item;
    const newItems = [...items, newItem];
    saveItems(newItems);
    return newItem;
  }, [items, saveItems]);

  const updateItem = useCallback((id: string, updates: Partial<Item>): Item | null => {
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    
    const updatedItem = { ...items[index], ...updates } as Item;
    const newItems = [...items];
    newItems[index] = updatedItem;
    saveItems(newItems);
    return updatedItem;
  }, [items, saveItems]);

  const deleteItem = useCallback((id: string): boolean => {
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return false;
    
    const newItems = items.filter((item) => item.id !== id);
    saveItems(newItems);
    return true;
  }, [items, saveItems]);

  const toggleTaskComplete = useCallback((id: string): Item | null => {
    const item = items.find((i) => i.id === id);
    if (!item || !isTask(item)) return null;
    
    return updateItem(id, { isComplete: !item.isComplete } as Partial<Task>);
  }, [items, updateItem]);

  const getItemsByDateRange = useCallback((
    startDate: Date,
    endDate: Date,
    searchTerm?: string,
    sortByPriority?: boolean
  ) => {
    let filtered = items.filter((item) => {
      const itemDate = getItemDateTime(item);
      return itemDate >= startDate && itemDate <= endDate;
    });

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term)
      );
    }

    filtered.sort((a, b) => {
      if (sortByPriority) {
        const priorityDiff = b.priority - a.priority;
        if (priorityDiff !== 0) return priorityDiff;
      }
      const dateA = getItemDateTime(a);
      const dateB = getItemDateTime(b);
      return dateA.getTime() - dateB.getTime();
    });

    return filtered;
  }, [items]);

  const getAllItems = useCallback(() => items, [items]);

  const importItems = useCallback((importedItems: Item[]) => {
    saveItems(importedItems);
  }, [saveItems]);

  const clearAllItems = useCallback(() => {
    saveItems([]);
  }, [saveItems]);

  return {
    items,
    isLoading,
    error,
    addItem,
    updateItem,
    deleteItem,
    toggleTaskComplete,
    getItemsByDateRange,
    getAllItems,
    importItems,
    clearAllItems,
    mutate: localMutate,
  };
}
