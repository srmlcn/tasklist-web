'use client';

import { useState, useEffect } from 'react';
import { Item, Task, Appointment, PRIORITY_LABELS, isTask } from '@/types';

interface EditItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Item) => void;
  onDuplicate?: (item: Omit<Item, 'id' | 'order'>) => void;
  item: Item | null;
}

export function EditItemDialog({ isOpen, onClose, onSave, onDuplicate, item }: EditItemDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Task-specific fields
  const [deadline, setDeadline] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  // Appointment-specific fields
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [attendeesText, setAttendeesText] = useState('');

  useEffect(() => {
    if (isOpen && item) {
      setName(item.name);
      setDescription(item.description);
      setPriority(item.priority);
      setTags(item.tags || []);
      setTagInput('');

      if (isTask(item)) {
        const task = item as Task;
        const deadlineDate = new Date(task.deadline);
        setDeadline(deadlineDate.toISOString().split('T')[0]);
        setDeadlineTime(
          `${deadlineDate.getHours().toString().padStart(2, '0')}:${deadlineDate.getMinutes().toString().padStart(2, '0')}`
        );
        setIsComplete(task.isComplete);
      } else {
        const appointment = item as Appointment;
        const startDateTime = new Date(appointment.start);
        const endDateTime = new Date(appointment.stop);
        setStartDate(startDateTime.toISOString().split('T')[0]);
        setStartTime(
          `${startDateTime.getHours().toString().padStart(2, '0')}:${startDateTime.getMinutes().toString().padStart(2, '0')}`
        );
        setEndDate(endDateTime.toISOString().split('T')[0]);
        setEndTime(
          `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}`
        );
        setAttendeesText(appointment.attendees.join(', '));
      }
    }
  }, [isOpen, item]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Build current form state for duplicate functionality
  const getCurrentFormState = (): Omit<Item, 'id' | 'order'> | null => {
    if (!name.trim() || !item) return null;

    const currentItem = item;

    if (isTask(currentItem)) {
      const [hours, minutes] = deadlineTime.split(':').map(Number);
      const deadlineDate = new Date(deadline);
      deadlineDate.setHours(hours, minutes, 0, 0);

      return {
        type: 'task',
        name: name.trim(),
        description: description.trim(),
        deadline: deadlineDate.toISOString(),
        priority,
        isComplete,
        recurrence: currentItem.recurrence,
        categoryId: currentItem.categoryId,
        tags,
      } as Omit<Task, 'id' | 'order'>;
    } else {
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);

      const startDateTime = new Date(startDate);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(endDate);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      const attendees = attendeesText
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a.length > 0);

      return {
        type: 'appointment',
        name: name.trim(),
        description: description.trim(),
        start: startDateTime.toISOString(),
        stop: endDateTime.toISOString(),
        priority,
        attendees,
        recurrence: currentItem.recurrence,
        categoryId: currentItem.categoryId,
        tags,
      } as Omit<Appointment, 'id' | 'order'>;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !item) return;

    if (isTask(item)) {
      const [hours, minutes] = deadlineTime.split(':').map(Number);
      const deadlineDate = new Date(deadline);
      deadlineDate.setHours(hours, minutes, 0, 0);

      onSave({
        ...item,
        name: name.trim(),
        description: description.trim(),
        deadline: deadlineDate.toISOString(),
        priority,
        isComplete,
        tags,
      } as Task);
    } else {
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);

      const startDateTime = new Date(startDate);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(endDate);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      const attendees = attendeesText
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a.length > 0);

      onSave({
        ...item,
        name: name.trim(),
        description: description.trim(),
        start: startDateTime.toISOString(),
        stop: endDateTime.toISOString(),
        priority,
        attendees,
        tags,
      } as Appointment);
    }

    onClose();
  };

  const handleDuplicate = () => {
    const formState = getCurrentFormState();
    if (formState && onDuplicate) {
      onDuplicate({ ...formState, name: `${formState.name} (Copy)` } as Omit<Item, 'id' | 'order'>);
      onClose();
    }
  };

  if (!isOpen || !item) return null;

  const isTaskItem = isTask(item);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100">
            Edit {isTaskItem ? 'Task' : 'Appointment'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {isTaskItem ? 'Task' : 'Appointment'} Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter name"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              placeholder="Enter description (optional)"
            />
          </div>

          {/* Task-specific: Deadline */}
          {isTaskItem && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Due Time
                  </label>
                  <input
                    type="time"
                    value={deadlineTime}
                    onChange={(e) => setDeadlineTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Completed checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isComplete"
                  checked={isComplete}
                  onChange={(e) => setIsComplete(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isComplete" className="text-sm text-gray-300">
                  Mark as completed
                </label>
              </div>
            </>
          )}

          {/* Appointment-specific: Start/End */}
          {!isTaskItem && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (!endDate || e.target.value > endDate) {
                        setEndDate(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Attendees */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Attendees
                </label>
                <input
                  type="text"
                  value={attendeesText}
                  onChange={(e) => setAttendeesText(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John, Jane, Bob (comma-separated)"
                />
              </div>
            </>
          )}

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Priority
            </label>
            <div className="flex gap-2">
              {PRIORITY_LABELS.map((label, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setPriority(index)}
                  className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                    priority === index
                      ? index === 0
                        ? 'bg-gray-600 border-gray-500 text-gray-100'
                        : index === 1
                        ? 'bg-green-600/80 border-green-500 text-white'
                        : index === 2
                        ? 'bg-yellow-600/80 border-yellow-500 text-white'
                        : 'bg-red-600/80 border-red-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-200"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-gray-400 hover:text-gray-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {onDuplicate && (
              <button
                type="button"
                onClick={handleDuplicate}
                className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md transition-colors"
              >
                📋 Duplicate
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
