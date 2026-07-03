'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Item, getItemDateTime, isTask, generateRecurringInstances } from '@/types';
import { DayColumn } from './DayColumn';

interface CalendarViewProps {
  items: Item[];
  onEditItem: (item: Item) => void;
  onDeleteItem: (item: Item) => void;
  onToggleComplete: (item: Item) => void;
  onReorderItems: (itemId: string, newOrder: number) => void;
  searchTerm?: string;
  sortByPriority?: boolean;
  selectedItemId?: string;
  onSelectItem?: (item: Item | null) => void;
}

const DAYS_TO_SHOW = 14;
const HOUR_HEIGHT = 60; // pixels per hour

interface TodayViewProps {
  items: Item[];
  onEditItem: (item: Item) => void;
  onDeleteItem: (item: Item) => void;
  onToggleComplete: (item: Item) => void;
  onAddTask: () => void;
  onAddAppointment: () => void;
  searchTerm?: string;
  sortByPriority?: boolean;
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
  searchTerm,
  sortByPriority,
  selectedItemId,
  onSelectItem,
}: TodayViewProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayItems = useMemo(() => {
    let filtered = items.filter((item) => {
      const itemDate = getItemDateTime(item);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate.getTime() === today.getTime();
    });

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term)
      );
    }

    if (sortByPriority) {
      filtered.sort((a, b) => b.priority - a.priority);
    } else {
      filtered.sort((a, b) => {
        const dateA = getItemDateTime(a);
        const dateB = getItemDateTime(b);
        return dateA.getTime() - dateB.getTime();
      });
    }

    return filtered;
  }, [items, searchTerm, sortByPriority]);

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

        {/* Today's items - single DayColumn for all items */}
        {todayItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No items scheduled for today</p>
            <p className="text-sm">Add a task or appointment to get started!</p>
          </div>
        ) : (
          <DayColumn
            date={today}
            items={todayItems}
            isToday={true}
            onEditItem={onEditItem}
            onDeleteItem={onDeleteItem}
            onToggleComplete={onToggleComplete}
            searchTerm={searchTerm}
            sortByPriority={sortByPriority}
            selectedItemId={selectedItemId}
            onSelectItem={onSelectItem}
          />
        )}
      </div>
    </div>
  );
}

export function CalendarView({
  items,
  onEditItem,
  onDeleteItem,
  onToggleComplete,
  onReorderItems,
  searchTerm,
  sortByPriority,
  selectedItemId,
  onSelectItem,
}: CalendarViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [days, setDays] = useState<Date[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      onReorderItems(active.id as string, 0); // Simplified - just trigger reorder
    }
  }, [onReorderItems]);

  // Expand recurring items into instances
  const expandedItems = useMemo(() => {
    if (days.length === 0) return items;
    
    const startDate = days[0];
    const endDate = days[days.length - 1];
    endDate.setHours(23, 59, 59, 999);
    
    const expanded: Item[] = [];
    
    for (const item of items) {
      if (item.recurrence && item.recurrence.pattern !== 'none') {
        const instances = generateRecurringInstances(item, startDate, endDate);
        expanded.push(...instances);
      } else {
        expanded.push(item);
      }
    }
    
    return expanded;
  }, [items, days]);

  // Initialize days array
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newDays: Date[] = [];
    for (let i = 0; i < DAYS_TO_SHOW; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      newDays.push(date);
    }
    setDays(newDays);
  }, []);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to today on mount
  useEffect(() => {
    if (containerRef.current) {
      const todayIndex = days.findIndex((d) => {
        const date = new Date(d);
        const today = new Date();
        return (
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
        );
      });

      if (todayIndex > 0 && todayIndex < DAYS_TO_SHOW) {
        const scrollPosition = todayIndex * 160; // 160px per day column
        containerRef.current.scrollLeft = scrollPosition;
      }
    }
  }, [days]);

  const getItemsForDay = useCallback(
    (date: Date): Item[] => {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      return expandedItems.filter((item) => {
        const itemDate = getItemDateTime(item);
        return itemDate >= dayStart && itemDate <= dayEnd;
      });
    },
    [expandedItems]
  );

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentTimeVisible = (): boolean => {
    const today = days.find((d) => isToday(d));
    return !!today;
  };

  const getCurrentTimePosition = (): number => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return (hours * 60 + minutes); // position in minutes from top
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 overflow-hidden bg-gray-900">
        {/* Day headers */}
        <div className="flex border-b border-gray-700 bg-gray-800">
          {days.map((date, index) => (
            <div
              key={index}
              className={`flex-shrink-0 w-40 p-2 text-center border-r border-gray-700 ${
                isToday(date) ? 'bg-slate-800' : ''
              }`}
            >
              <div className="text-xs text-gray-400 uppercase">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div
                className={`text-lg font-semibold ${
                  isToday(date) ? 'text-slate-400' : 'text-gray-200'
                }`}
              >
                {date.getDate()}
              </div>
              <div className="text-xs text-gray-500">
                {date.toLocaleDateString('en-US', { month: 'short' })}
              </div>
            </div>
          ))}
        </div>

        {/* Scrollable content area */}
        <div
          ref={containerRef}
          className="flex overflow-x-auto overflow-y-auto h-[calc(100vh-140px)] scroll-smooth"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 #1F2937' }}
        >
          {days.map((date, index) => {
            const dayItems = getItemsForDay(date);
            return (
              <DayColumn
                key={index}
                date={date}
                items={dayItems}
                isToday={isToday(date)}
                showCurrentTime={isToday(date)}
                currentTimePosition={
                  isToday(date) ? getCurrentTimePosition() : undefined
                }
                onEditItem={onEditItem}
                onDeleteItem={onDeleteItem}
                onToggleComplete={onToggleComplete}
                searchTerm={searchTerm}
                sortByPriority={sortByPriority}
                isSelected={selectedDate?.getTime() === date.getTime()}
                onSelect={() => setSelectedDate(date)}
                selectedItemId={selectedItemId}
                onSelectItem={onSelectItem}
              />
            );
          })}
        </div>
      </div>
    </DndContext>
  );
}
