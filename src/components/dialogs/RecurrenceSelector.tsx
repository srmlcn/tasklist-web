'use client';

import { useState } from 'react';
import { Recurrence, RecurrencePattern, RECURRENCE_LABELS } from '@/types';

interface RecurrenceSelectorProps {
  value?: Recurrence;
  onChange: (recurrence: Recurrence | undefined) => void;
}

export function RecurrenceSelector({ value, onChange }: RecurrenceSelectorProps) {
  const [showOptions, setShowOptions] = useState(false);

  const pattern = value?.pattern || 'none';
  const endDate = value?.endDate || '';
  const occurrences = value?.occurrences || '';

  const handlePatternChange = (newPattern: RecurrencePattern) => {
    if (newPattern === 'none') {
      onChange(undefined);
      setShowOptions(false);
    } else {
      onChange({
        pattern: newPattern,
        endDate: endDate || undefined,
        occurrences: occurrences ? parseInt(occurrences.toString(), 10) : undefined,
      });
      setShowOptions(true);
    }
  };

  const handleEndDateChange = (newEndDate: string) => {
    onChange({
      pattern,
      endDate: newEndDate || undefined,
      occurrences: occurrences ? parseInt(occurrences.toString(), 10) : undefined,
    });
  };

  const handleOccurrencesChange = (newOccurrences: string) => {
    onChange({
      pattern,
      endDate: endDate || undefined,
      occurrences: newOccurrences ? parseInt(newOccurrences, 10) : undefined,
    });
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        Repeat
      </label>
      
      <select
        value={pattern}
        onChange={(e) => handlePatternChange(e.target.value as RecurrencePattern)}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {Object.entries(RECURRENCE_LABELS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>

      {showOptions && pattern !== 'none' && (
        <div className="pl-4 space-y-2 border-l-2 border-gray-600">
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              End Date (optional)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
