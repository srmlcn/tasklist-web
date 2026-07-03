'use client';

import { useState, useCallback, useMemo } from 'react';
import { Item, Task, Appointment, isTask, getItemDateTime } from '@/types';
import { useItems } from '@/hooks/useItems';
import { useCategories } from '@/hooks/useCategories';
import { useKeyboardShortcuts, KeyboardShortcutsHelp } from '@/hooks/useKeyboardShortcuts';
import { Header, FloatingActionButton } from '@/components/Header';
import { CalendarView } from '@/components/CalendarView';
import { TodayView } from '@/components/TodayView';
import { AddTaskDialog } from '@/components/dialogs/AddTaskDialog';
import { AddAppointmentDialog } from '@/components/dialogs/AddAppointmentDialog';
import { EditItemDialog } from '@/components/dialogs/EditItemDialog';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { useNotifications } from '@/hooks/useNotifications';
import { CategoryManager } from '@/components/dialogs/CategoryManager';

// Filter types
type ItemFilter = 'all' | 'tasks' | 'appointments';
type SortOption = 'time' | 'priority' | 'name' | 'deadline';

// Stats display component
function StatsBar({ items }: { items: Item[] }) {
  const stats = useMemo(() => {
    const tasks = items.filter(isTask);
    const completedTasks = tasks.filter(t => t.isComplete);
    const now = new Date();
    const overdueItems = items.filter(item => {
      const deadline = getItemDateTime(item);
      return deadline < now && isTask(item) && !(item as Task).isComplete;
    });
    
    return {
      total: items.length,
      tasks: tasks.length,
      appointments: items.length - tasks.length,
      completed: completedTasks.length,
      overdue: overdueItems.length,
    };
  }, [items]);
  
  return (
    <div className="flex items-center gap-6 px-4 py-2 bg-gray-800/50 border-b border-gray-700 text-sm">
      <div className="flex items-center gap-1">
        <span className="text-gray-400">Total:</span>
        <span className="font-semibold text-gray-200">{stats.total}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-gray-400">Tasks:</span>
        <span className="font-semibold text-blue-400">{stats.tasks}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-gray-400">Done:</span>
        <span className="font-semibold text-green-400">{stats.completed}</span>
      </div>
      {stats.overdue > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-gray-400">Overdue:</span>
          <span className="font-semibold text-red-400">{stats.overdue}</span>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const {
    items,
    addItem,
    updateItem,
    deleteItem,
    toggleTaskComplete,
    importItems,
    clearAllItems,
    reorderItems,
  } = useItems();

  const { categories, updateCategories } = useCategories();
  const { permission, enabled, toggleEnabled, requestPermission } = useNotifications(items);

  // Dialog states
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<Item | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [itemFilter, setItemFilter] = useState<ItemFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('time');
  const [viewMode, setViewMode] = useState<'calendar' | 'today'>('calendar');

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let filtered = [...items];
    
    // Filter by type
    if (itemFilter === 'tasks') {
      filtered = filtered.filter(isTask);
    } else if (itemFilter === 'appointments') {
      filtered = filtered.filter((item): item is Appointment => !isTask(item));
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term)
      );
    }
    
    // Filter by category
    if (categoryFilter) {
      filtered = filtered.filter(item => item.categoryId === categoryFilter);
    }
    
    // Sort items
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'priority':
          return b.priority - a.priority;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'deadline':
          return getItemDateTime(a).getTime() - getItemDateTime(b).getTime();
        case 'time':
        default:
          return a.order - b.order;
      }
    });
    
    return filtered;
  }, [items, itemFilter, searchTerm, categoryFilter, sortOption]);

  // Check if sort by priority is active (for Header compatibility)
  const sortByPriority = sortOption === 'priority';

  const handleAddTask = useCallback((task: Omit<Task, 'id' | 'order'>) => {
    addItem(task);
  }, [addItem]);

  const handleAddAppointment = useCallback((appointment: Omit<Appointment, 'id' | 'order'>) => {
    addItem(appointment);
  }, [addItem]);

  const handleEditItem = useCallback((item: Item) => {
    setEditItem(item);
  }, []);

  const handleDuplicateItem = useCallback((item: Omit<Item, 'id' | 'order'>) => {
    addItem(item);
  }, [addItem]);

  const handleSaveEdit = useCallback((updatedItem: Item) => {
    updateItem(updatedItem.id, updatedItem);
    setEditItem(null);
  }, [updateItem]);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteConfirmItem) {
      deleteItem(deleteConfirmItem.id);
      setDeleteConfirmItem(null);
    }
  }, [deleteConfirmItem, deleteItem]);

  const handleToggleComplete = useCallback((item: Item) => {
    toggleTaskComplete(item.id);
  }, [toggleTaskComplete]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleToggleSort = useCallback(() => {
    setSortOption((prev) => (prev === 'priority' ? 'time' : 'priority'));
  }, []);

  const handleSortChange = useCallback((option: SortOption) => {
    setSortOption(option);
  }, []);

  const handleFilterChange = useCallback((filter: ItemFilter) => {
    setItemFilter(filter);
  }, []);

  const handleCategoryFilterChange = useCallback((categoryId: string | null) => {
    setCategoryFilter(categoryId);
  }, []);

  const handleExport = useCallback(() => {
    // Export is handled in Header component directly
  }, []);

  const handleImport = useCallback((importedItems: Item[]) => {
    importItems(importedItems);
  }, [importItems]);

  const handleClearAll = useCallback(() => {
    clearAllItems();
  }, [clearAllItems]);

  const handleToggleNotifications = useCallback(() => {
    if (permission !== 'granted') {
      requestPermission();
    } else {
      toggleEnabled();
    }
  }, [permission, requestPermission, toggleEnabled]);

  const handleReorderItems = useCallback((itemId: string, newOrder: number) => {
    const itemIndex = items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return;

    // Simple reorder: increment all items with order >= newOrder
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        return { ...item, order: newOrder };
      }
      if (newOrder > 0 && item.order >= newOrder && item.order < items[itemIndex].order) {
        return { ...item, order: item.order + 1 };
      }
      return item;
    });

    reorderItems(updatedItems);
  }, [items, reorderItems]);

  // Close all dialogs helper
  const closeAllDialogs = useCallback(() => {
    setShowAddTask(false);
    setShowAddAppointment(false);
    setEditItem(null);
    setDeleteConfirmItem(null);
    setShowCategoryManager(false);
  }, []);

  // Register keyboard shortcuts
  useKeyboardShortcuts({
    onAddTask: () => setShowAddTask(true),
    onAddAppointment: () => setShowAddAppointment(true),
    onSearch: () => document.querySelector<HTMLInputElement>('input[type="search"]')?.focus(),
    onToggleSort: handleToggleSort,
    onExport: handleExport,
    onEscape: closeAllDialogs,
    onDeleteSelected: () => selectedItem && setDeleteConfirmItem(selectedItem),
    onEditSelected: () => selectedItem && setEditItem(selectedItem),
    onToggleCompleteSelected: () => {
      if (selectedItem) {
        toggleTaskComplete(selectedItem.id);
      }
    },
  });

  return (
    <div className="flex flex-col h-screen">
      <Header
        onSearch={handleSearch}
        sortOption={sortOption}
        onSortChange={handleSortChange}
        onToggleSort={handleToggleSort}
        onAddTask={() => setShowAddTask(true)}
        onAddAppointment={() => setShowAddAppointment(true)}
        onExport={handleExport}
        onImport={handleImport}
        onClearAll={handleClearAll}
        onManageCategories={() => setShowCategoryManager(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        notificationsEnabled={enabled}
        onToggleNotifications={handleToggleNotifications}
        categories={categories}
        itemFilter={itemFilter}
        onFilterChange={handleFilterChange}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={handleCategoryFilterChange}
      />

      <StatsBar items={items} />

      {viewMode === 'today' ? (
        <TodayView
          items={filteredItems}
          onEditItem={handleEditItem}
          onDeleteItem={(item) => setDeleteConfirmItem(item)}
          onToggleComplete={handleToggleComplete}
          onAddTask={() => setShowAddTask(true)}
          onAddAppointment={() => setShowAddAppointment(true)}
          selectedItemId={selectedItem?.id}
          onSelectItem={setSelectedItem}
        />
      ) : (
        <CalendarView
          items={filteredItems}
          onEditItem={handleEditItem}
          onDeleteItem={(item) => setDeleteConfirmItem(item)}
          onToggleComplete={handleToggleComplete}
          onReorderItems={handleReorderItems}
          selectedItemId={selectedItem?.id}
          onSelectItem={setSelectedItem}
        />
      )}

      {/* Dialogs */}
      <AddTaskDialog
        isOpen={showAddTask}
        onClose={() => setShowAddTask(false)}
        onAdd={handleAddTask}
        categories={categories}
      />

      <AddAppointmentDialog
        isOpen={showAddAppointment}
        onClose={() => setShowAddAppointment(false)}
        onAdd={handleAddAppointment}
        categories={categories}
      />

      <EditItemDialog
        isOpen={editItem !== null}
        onClose={() => setEditItem(null)}
        onSave={handleSaveEdit}
        onDuplicate={handleDuplicateItem}
        item={editItem}
      />

      <DeleteConfirmDialog
        isOpen={deleteConfirmItem !== null}
        onClose={() => setDeleteConfirmItem(null)}
        onConfirm={handleDeleteConfirm}
        item={deleteConfirmItem}
      />

      <CategoryManager
        isOpen={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
        categories={categories}
        onSave={updateCategories}
      />

      <FloatingActionButton
        onAddTask={() => setShowAddTask(true)}
        onAddAppointment={() => setShowAddAppointment(true)}
      />
    </div>
  );
}
