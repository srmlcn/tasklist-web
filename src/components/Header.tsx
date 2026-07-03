'use client';

import { useState, useRef, useEffect } from 'react';
import { Item } from '@/types';
import { getStoredItems, clearStoredItems, setStoredItems } from '@/context/SWRProvider';
import { useTheme } from '@/context/ThemeContext';

interface HeaderProps {
  onSearch: (term: string) => void;
  sortByPriority: boolean;
  onToggleSort: () => void;
  onAddTask: () => void;
  onAddAppointment: () => void;
  onExport: () => void;
  onImport: (items: Item[]) => void;
  onClearAll: () => void;
  onManageCategories?: () => void;
  viewMode?: 'calendar' | 'today';
  onViewModeChange?: (mode: 'calendar' | 'today') => void;
  notificationsEnabled?: boolean;
  onToggleNotifications?: () => void;
}

export function Header({
  onSearch,
  sortByPriority,
  onToggleSort,
  onAddTask,
  onAddAppointment,
  onExport,
  onImport,
  onClearAll,
  onManageCategories,
  viewMode = 'calendar',
  onViewModeChange,
  notificationsEnabled = false,
  onToggleNotifications,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setShowAddMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  const handleExport = () => {
    const items = getStoredItems<Item[]>() || [];
    const dataStr = JSON.stringify(items, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `tasklist-export-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    setShowMenu(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
    setShowMenu(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const items = JSON.parse(content) as Item[];
        if (Array.isArray(items)) {
          onImport(items);
        }
      } catch (error) {
        console.error('Failed to import file:', error);
        alert('Failed to import file. Please ensure it is a valid JSON file.');
      }
    };
    reader.readAsText(file);

    // Reset file input
    e.target.value = '';
    setShowMenu(false);
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
      <div className="flex items-center gap-4">
        {/* Logo/Title */}
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-100">TaskList</h1>
        </div>

        {/* Add button with dropdown */}
        <div className="relative" ref={addMenuRef}>
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAddMenu && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-gray-700 rounded-md shadow-lg border border-gray-600 z-50">
              <button
                onClick={() => {
                  onAddTask();
                  setShowAddMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-600 rounded-t-md transition-colors"
              >
                📋 Add Task
              </button>
              <button
                onClick={() => {
                  onAddAppointment();
                  setShowAddMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-600 rounded-b-md transition-colors"
              >
                📅 Add Appointment
              </button>
            </div>
          )}
        </div>

        {/* Search bar */}
        <div className="flex-1 max-w-md relative">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search tasks and appointments..."
              className="w-full pl-10 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Sort button */}
        <button
          onClick={onToggleSort}
          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
            sortByPriority
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          title={sortByPriority ? 'Sorted by priority' : 'Sorted by time'}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
            />
          </svg>
          <span className="text-sm">{sortByPriority ? 'Priority' : 'Time'}</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-md transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* View mode toggle */}
        {onViewModeChange && (
          <div className="flex rounded-md overflow-hidden border border-gray-600">
            <button
              onClick={() => onViewModeChange('today')}
              className={`px-3 py-1.5 text-sm transition-colors ${
                viewMode === 'today'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title="Today view"
            >
              📅 Today
            </button>
            <button
              onClick={() => onViewModeChange('calendar')}
              className={`px-3 py-1.5 text-sm transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title="Calendar view"
            >
              🗓️ Calendar
            </button>
          </div>
        )}

        {/* Menu button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-md transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {showMenu && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-gray-700 rounded-md shadow-lg border border-gray-600 z-50">
              <button
                onClick={() => {
                  if (onManageCategories) {
                    onManageCategories();
                  }
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-600 rounded-t-md transition-colors"
              >
                🏷️ Manage Categories
              </button>
              <button
                onClick={handleExport}
                className="w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-600 transition-colors"
              >
                📤 Export Data
              </button>
              <button
                onClick={handleImportClick}
                className="w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-600 transition-colors">
                📥 Import Data
              </button>
              {onToggleNotifications && (
                <>
                  <div className="border-t border-gray-600" />
                  <button
                    onClick={() => {
                      onToggleNotifications();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-600 transition-colors"
                  >
                    🔔 {notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications'}
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear all items? This cannot be undone.')) {
                    onClearAll();
                  }
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-600 rounded-b-md transition-colors"
              >
                🗑️ Clear All Data
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </header>
  );
}
