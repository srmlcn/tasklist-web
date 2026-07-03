'use client';

import { useState, useEffect } from 'react';
import { Category, DEFAULT_CATEGORIES } from '@/types';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSave: (categories: Category[]) => void;
}

function generateId(): string {
  return `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function CategoryManager({ isOpen, onClose, categories, onSave }: CategoryManagerProps) {
  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');

  useEffect(() => {
    setLocalCategories(categories.length > 0 ? categories : DEFAULT_CATEGORIES);
  }, [categories, isOpen]);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const newCategory: Category = {
      id: generateId(),
      name: newCategoryName.trim(),
      color: newCategoryColor,
    };
    
    setLocalCategories([...localCategories, newCategory]);
    setNewCategoryName('');
    setNewCategoryColor('#3B82F6');
  };

  const handleRemoveCategory = (id: string) => {
    setLocalCategories(localCategories.filter(c => c.id !== id));
  };

  const handleUpdateCategory = (id: string, updates: Partial<Category>) => {
    setLocalCategories(
      localCategories.map(c => c.id === id ? { ...c, ...updates } : c)
    );
  };

  const handleSave = () => {
    onSave(localCategories);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl border border-gray-700 max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100">Manage Categories</h2>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {/* Existing categories */}
          {localCategories.map((category) => (
            <div key={category.id} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-md">
              <input
                type="color"
                value={category.color}
                onChange={(e) => handleUpdateCategory(category.id, { color: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={category.name}
                onChange={(e) => handleUpdateCategory(category.id, { name: e.target.value })}
                className="flex-1 px-3 py-1.5 bg-gray-600 border border-gray-500 rounded text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleRemoveCategory(category.id)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"
                title="Remove category"
              >
                🗑️
              </button>
            </div>
          ))}

          {/* Add new category */}
          <div className="border-t border-gray-600 pt-4">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Add New Category</h3>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={newCategoryColor}
                onChange={(e) => setNewCategoryColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                placeholder="Category name"
                className="flex-1 px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddCategory}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
