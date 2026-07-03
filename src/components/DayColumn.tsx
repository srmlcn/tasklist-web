'use client';

import { useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Item, isTask, getItemDateTime } from '@/types';
import { ItemTile } from './ItemTile';

interface SortableItemWrapperProps {
  item: Item;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

function SortableItemWrapper({ item, onEdit, onDelete, onToggleComplete, isSelected, onSelect }: SortableItemWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      onClick={onSelect}
      className={isSelected ? 'ring-2 ring-blue-500 rounded-md' : ''}
    >
      <ItemTile
        item={item}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleComplete={onToggleComplete}
        compact={false}
        isSelected={isSelected}
      />
    </div>
  );
}

interface DayColumnProps {
  date: Date;
  items: Item[];
  isToday: boolean;
  showCurrentTime?: boolean;
  currentTimePosition?: number;
  onEditItem: (item: Item) => void;
  onDeleteItem: (item: Item) => void;
  onToggleComplete: (item: Item) => void;
  isSelected?: boolean;
  onSelect?: () => void;
  onReorderItems?: (items: Item[]) => void;
  selectedItemId?: string;
  onSelectItem?: (item: Item | null) => void;
}

export function DayColumn({
  date,
  items,
  isToday,
  showCurrentTime,
  currentTimePosition,
  onEditItem,
  onDeleteItem,
  onToggleComplete,
  isSelected,
  onSelect,
  selectedItemId,
  onSelectItem,
}: DayColumnProps) {
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const dateA = getItemDateTime(a);
      const dateB = getItemDateTime(b);
      return dateA.getTime() - dateB.getTime();
    });
  }, [items]);

  const formatDayHeader = (): string => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  return (
    <div
      className={`flex-shrink-0 w-40 border-r border-gray-700 relative ${
        isSelected ? 'bg-gray-800/50' : ''
      } ${isToday ? 'bg-slate-900/30' : ''}`}
      onClick={onSelect}
    >
      {/* Time slots (visual guide) */}
      <div className="relative h-[1440px]">
        {/* Hour lines */}
        {Array.from({ length: 24 }).map((_, hour) => (
          <div
            key={hour}
            className="absolute left-0 right-0 border-t border-gray-800"
            style={{ top: `${hour * 60}px` }}
          >
            <span className="absolute -top-3 left-1 text-[10px] text-gray-600">
              {hour.toString().padStart(2, '0')}:00
            </span>
          </div>
        ))}

        {/* Current time indicator */}
        {showCurrentTime && currentTimePosition !== undefined && (
          <div
            className="absolute left-0 right-0 z-20 pointer-events-none"
            style={{ top: `${currentTimePosition}px` }}
          >
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
              <div className="flex-1 h-0.5 bg-red-500" />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="relative z-10 p-1 space-y-1">
          {sortedItems.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-gray-600">No items</span>
            </div>
          ) : (
            sortedItems.map((item) => (
              <SortableItemWrapper
                key={item.id}
                item={item}
                onEdit={() => onEditItem(item)}
                onDelete={() => onDeleteItem(item)}
                onToggleComplete={() => onToggleComplete(item)}
                isSelected={selectedItemId === item.id}
                onSelect={() => onSelectItem?.(item)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
