'use client';

import { useEffect, useCallback } from 'react';

interface KeyboardShortcuts {
  onAddTask?: () => void;
  onAddAppointment?: () => void;
  onSearch?: () => void;
  onToggleSort?: () => void;
  onExport?: () => void;
  onEscape?: () => void;
  onDeleteSelected?: () => void;
  onEditSelected?: () => void;
  onToggleCompleteSelected?: () => void;
}

export function useKeyboardShortcuts({
  onAddTask,
  onAddAppointment,
  onSearch,
  onToggleSort,
  onExport,
  onEscape,
  onDeleteSelected,
  onEditSelected,
  onToggleCompleteSelected,
}: KeyboardShortcuts) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if user is typing in an input field
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Only handle Escape in input fields
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault();
        onEscape();
      }
      return;
    }

    // Ctrl/Cmd + combinations
    if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
        case 'n':
          event.preventDefault();
          if (onAddTask) onAddTask();
          break;
        case 'k':
          event.preventDefault();
          if (onSearch) onSearch();
          break;
        case 'e':
          event.preventDefault();
          if (onExport) onExport();
          break;
        case 's':
          event.preventDefault();
          // Save is automatic with localStorage
          break;
      }
      return;
    }

    // Single key shortcuts
    switch (event.key) {
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;
      case 't':
        if (onAddTask) {
          event.preventDefault();
          onAddTask();
        }
        break;
      case 'a':
        if (onAddAppointment) {
          event.preventDefault();
          onAddAppointment();
        }
        break;
      case 's':
        if (onToggleSort) {
          event.preventDefault();
          onToggleSort();
        }
        break;
      case 'Delete':
      case 'Backspace':
        if (onDeleteSelected) {
          event.preventDefault();
          onDeleteSelected();
        }
        break;
      case 'Enter':
        if (onEditSelected) {
          event.preventDefault();
          onEditSelected();
        }
        break;
      case ' ':
        if (onToggleCompleteSelected) {
          event.preventDefault();
          onToggleCompleteSelected();
        }
        break;
    }
  }, [
    onAddTask,
    onAddAppointment,
    onSearch,
    onToggleSort,
    onExport,
    onEscape,
    onDeleteSelected,
    onEditSelected,
    onToggleCompleteSelected,
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Keyboard shortcuts reference component
export function KeyboardShortcutsHelp() {
  return (
    <div className="text-xs text-gray-400 space-y-1">
      <div className="font-semibold text-gray-300 mb-2">Keyboard Shortcuts</div>
      <div><kbd className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">N</kbd> or <kbd className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">Ctrl+N</kbd> - Add task</div>
      <div><kbd className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">A</kbd> - Add appointment</div>
      <div><kbd className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">K</kbd> or <kbd className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">Ctrl+K</kbd> - Focus search</div>
      <div><kbd className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">S</kbd> - Toggle sort</div>
      <div><kbd className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">E</kbd> or <kbd className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">Ctrl+E</kbd> - Export data</div>
      <div><kbd className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">Enter</kbd> - Edit selected</div>
      <div><kbd className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">Delete</kbd> - Delete selected</div>
      <div><kbd className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">Space</kbd> - Toggle complete</div>
      <div><kbd className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">Esc</kbd> - Close dialogs</div>
    </div>
  );
}
