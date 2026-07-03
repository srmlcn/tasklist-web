'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Item, getItemDateTime, isTask } from '@/types';
import { DayColumn } from './DayColumn';

interface CalendarViewProps {
  items: Item[];
  onEditItem: (item: Item) => void;
  onDeleteItem: (item: Item) => void;
  onToggleComplete: (item: Item) => void;
  searchTerm?: string;
  sortByPriority?: boolean;
}

const DAYS_TO_SHOW = 14;
const HOUR_HEIGHT = 60; // pixels per hour

export function CalendarView({
  items,
  onEditItem,
  onDeleteItem,
  onToggleComplete,
  searchTerm,
  sortByPriority,
}: CalendarViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [days, setDays] = useState<Date[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

      return items.filter((item) => {
        const itemDate = getItemDateTime(item);
        return itemDate >= dayStart && itemDate <= dayEnd;
      });
    },
    [items]
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
            />
          );
        })}
      </div>
    </div>
  );
}
