'use client';

import { useState } from 'react';
import { Item, Task, Appointment, isTask, PRIORITY_LABELS, PRIORITY_COLORS } from '@/types';

interface ItemTileProps {
  item: Item;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete?: () => void;
  compact?: boolean;
  isSelected?: boolean;
}

export function ItemTile({
  item,
  onEdit,
  onDelete,
  onToggleComplete,
  compact = false,
  isSelected = false,
}: ItemTileProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const priorityColor = PRIORITY_COLORS[item.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS[0];
  const priorityLabel = PRIORITY_LABELS[item.priority] || PRIORITY_LABELS[0];

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getItemTimeDisplay = (): string => {
    if (isTask(item)) {
      const deadline = new Date(item.deadline);
      return `Due: ${formatDate(deadline)} ${formatTime(deadline)}`;
    } else {
      const appointment = item as Appointment;
      const start = new Date(appointment.start);
      const stop = new Date(appointment.stop);
      return `${formatTime(start)} - ${formatTime(stop)}`;
    }
  };

  const getItemTypeIcon = (): string => {
    return isTask(item) ? '📋' : '📅';
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleComplete && isTask(item)) {
      onToggleComplete();
    }
  };

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`rounded-md border transition-all duration-200 cursor-pointer ${
        isTask(item) && (item as Task).isComplete
          ? 'bg-gray-700/50 border-gray-600 opacity-60'
          : 'bg-gray-800 border-gray-700 hover:border-gray-600'
      } ${isExpanded ? 'shadow-lg' : ''}`}
      onClick={handleExpand}
    >
      {/* Header */}
      <div className="p-2">
        <div className="flex items-center gap-2">
          {/* Checkbox for tasks */}
          {isTask(item) && onToggleComplete && (
            <button
              onClick={handleToggle}
              className={`flex-shrink-0 w-4 h-4 rounded border ${
                (item as Task).isComplete
                  ? 'bg-green-600 border-green-600'
                  : 'border-gray-500 hover:border-gray-400'
              } flex items-center justify-center`}
            >
              {(item as Task).isComplete && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          )}

          {/* Priority indicator */}
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityColor}`} />

          {/* Type icon */}
          <span className="text-sm">{getItemTypeIcon()}</span>

          {/* Name */}
          <span
            className={`flex-1 text-sm font-medium truncate ${
              isTask(item) && (item as Task).isComplete
                ? 'line-through text-gray-400'
                : 'text-gray-200'
            }`}
          >
            {item.name}
          </span>
        </div>

        {/* Time display */}
        <div className="mt-1 text-xs text-gray-400">
          {getItemTimeDisplay()}
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-2 pb-2 pt-0 border-t border-gray-700 mt-1">
          {/* Description */}
          {item.description && (
            <div className="mt-2 text-sm text-gray-300">
              {item.description}
            </div>
          )}

          {/* Appointment-specific: Attendees */}
          {!isTask(item) && (item as Appointment).attendees.length > 0 && (
            <div className="mt-2">
              <span className="text-xs text-gray-500">Attendees:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {(item as Appointment).attendees.map((attendee, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 text-xs bg-gray-700 rounded-full text-gray-300"
                  >
                    {attendee}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Priority */}
          <div className="mt-2 text-xs text-gray-500">
            Priority: {priorityLabel}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="flex-1 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex-1 px-3 py-1.5 text-xs bg-red-600/80 hover:bg-red-600 text-white rounded transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
