'use client';

import { useMemo } from 'react';
import { Item, getItemDateTime } from '@/types';
import { ItemTile } from './ItemTile';

interface TodayViewProps {
  items: Item[];
  onEditItem: (item: Item) => void;
  onDeleteItem: (item: Item) => void;
  onToggleComplete: (item: Item) => void;
  onAddTask: () => void;
  onAddAppointment: () => void;
  selectedItemId?: string;
  onSelectItem?: (item: Item | null) => void;
}

export function TodayView({
  items,
  onEditItem,
  onDeleteItem,
  onToggleComplete,
  onAddTask,
  onAddAppointment,
  selectedItemId,
  onSelectItem,
}: TodayViewProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayItems = useMemo(() => {
    return items.filter((item) => {
      const itemDate = getItemDateTime(item);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate.getTime() === today.getTime();
    }).sort((a, b) => {
      const dateA = getItemDateTime(a);
      const dateB = getItemDateTime(b);
      return dateA.getTime() - dateB.getTime();
    });
  }, [items]);

  return (
    <div className="flex-1 overflow-auto bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Today's header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-100">
            {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h1>
          <p className="text-gray-400 mt-1">
            {todayItems.length} {todayItems.length === 1 ? 'item' : 'items'} scheduled
          </p>
        </div>

        {/* Quick add buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={onAddTask}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>📋</span>
            <span>Add Task</span>
          </button>
          <button
            onClick={onAddAppointment}
            className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>📅</span>
            <span>Add Appointment</span>
          </button>
        </div>

        {/* Today's items */}
        {todayItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-6">
              <svg className="w-24 h-24 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-xl text-gray-400 mb-2">No items for today!</p>
            <p className="text-gray-500 mb-6">Start fresh or add something new</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={onAddTask}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                + Add Task
              </button>
              <button
                onClick={onAddAppointment}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                + Add Appointment
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {todayItems.map((item) => (
              <ItemTile
                key={item.id}
                item={item}
                onEdit={() => onEditItem(item)}
                onDelete={() => onDeleteItem(item)}
                onToggleComplete={() => onToggleComplete(item)}
                isSelected={selectedItemId === item.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
