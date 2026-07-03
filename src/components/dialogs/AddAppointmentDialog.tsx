'use client';

import { useState, useEffect } from 'react';
import { Appointment, PRIORITY_LABELS, Recurrence } from '@/types';
import { RecurrenceSelector } from './RecurrenceSelector';

interface AddAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (appointment: Omit<Appointment, 'id'>) => void;
  initialDate?: Date;
}

export function AddAppointmentDialog({ isOpen, onClose, onAdd, initialDate }: AddAppointmentDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('10:00');
  const [priority, setPriority] = useState(0);
  const [attendeesText, setAttendeesText] = useState('');
  const [recurrence, setRecurrence] = useState<Recurrence | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      const date = initialDate || new Date();
      setStartDate(date.toISOString().split('T')[0]);
      setStartTime('09:00');
      setEndDate(date.toISOString().split('T')[0]);
      setEndTime('10:00');
      setPriority(0);
      setAttendeesText('');
      setRecurrence(undefined);
    }
  }, [isOpen, initialDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate) return;

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

    onAdd({
      type: 'appointment',
      name: name.trim(),
      description: description.trim(),
      start: startDateTime.toISOString(),
      stop: endDateTime.toISOString(),
      priority,
      attendees,
      recurrence,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100">Add New Appointment</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Appointment Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter appointment name"
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

          {/* Start Date/Time */}
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

          {/* End Date/Time */}
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
              Add Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
