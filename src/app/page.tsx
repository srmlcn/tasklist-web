'use client';

import { useState, useCallback } from 'react';
import { Item, Task, Appointment } from '@/types';
import { useItems } from '@/hooks/useItems';
import { useCategories } from '@/hooks/useCategories';
import { Header } from '@/components/Header';
import { CalendarView } from '@/components/CalendarView';
import { AddTaskDialog } from '@/components/dialogs/AddTaskDialog';
import { AddAppointmentDialog } from '@/components/dialogs/AddAppointmentDialog';
import { EditItemDialog } from '@/components/dialogs/EditItemDialog';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { CategoryManager } from '@/components/dialogs/CategoryManager';

export default function Home() {
  const {
    items,
    addItem,
    updateItem,
    deleteItem,
    toggleTaskComplete,
    importItems,
    clearAllItems,
  } = useItems();

  const { categories, updateCategories } = useCategories();

  // Dialog states
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<Item | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  // Search and sort
  const [searchTerm, setSearchTerm] = useState('');
  const [sortByPriority, setSortByPriority] = useState(false);

  const handleAddTask = useCallback((task: Omit<Task, 'id'>) => {
    addItem(task);
  }, [addItem]);

  const handleAddAppointment = useCallback((appointment: Omit<Appointment, 'id'>) => {
    addItem(appointment);
  }, [addItem]);

  const handleEditItem = useCallback((item: Item) => {
    setEditItem(item);
  }, []);

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
    setSortByPriority((prev) => !prev);
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

  return (
    <div className="flex flex-col h-screen">
      <Header
        onSearch={handleSearch}
        sortByPriority={sortByPriority}
        onToggleSort={handleToggleSort}
        onAddTask={() => setShowAddTask(true)}
        onAddAppointment={() => setShowAddAppointment(true)}
        onExport={handleExport}
        onImport={handleImport}
        onClearAll={handleClearAll}
        onManageCategories={() => setShowCategoryManager(true)}
      />

      <CalendarView
        items={items}
        onEditItem={handleEditItem}
        onDeleteItem={(item) => setDeleteConfirmItem(item)}
        onToggleComplete={handleToggleComplete}
        searchTerm={searchTerm}
        sortByPriority={sortByPriority}
      />

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
    </div>
  );
}
