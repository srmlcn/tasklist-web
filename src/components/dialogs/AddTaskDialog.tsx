'use client';

import { useState, useEffect } from 'react';
import { Task, PRIORITY_LABELS, Recurrence } from '@/types';
import { RecurrenceSelector } from './RecurrenceSelector';

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Omit<Task, 'id'>) => void;
  initialDate?: Date;
}

export function AddTaskDialog({ isOpen, onClose, onAdd, initialDate }: AddTaskDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('23:59');
  const [priority, setPriority] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [recurrence, setRecurrence] = useState<Recurrence | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      const date = initialDate || new Date();
      setDeadline(date.toISOString().split('T')[0]);
      setDeadlineTime('23:59');
      setPriority(0);
      setIsComplete(false);
      setRecurrence(undefined);
    }
  }, [isOpen, initialDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !deadline) return;

    const [hours, minutes] = deadlineTime.split(':').map(Number);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(hours, minutes, 0, 0);

    onAdd({
      type: 'task',
      name: name.trim(),
      description: description.trim(),
      deadline: deadlineDate.toISOString(),
      priority,
      isComplete,
      recurrence,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100">Add New Task</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Task Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task name"
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

          {/* Deadline Date */}
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

          {/* Recurrence */}
          <RecurrenceSelector value={recurrence} onChange={setRecurrence} />

          {/* Actions */}
          <div className="flex gap-3 pt-2">
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
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
