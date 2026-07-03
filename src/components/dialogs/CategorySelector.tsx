'use client';

import { Category, DEFAULT_CATEGORIES } from '@/types';

interface CategorySelectorProps {
  value?: string;
  categories?: Category[];
  onChange: (categoryId: string | undefined) => void;
  onManage?: () => void;
}

export function CategorySelector({ 
  value, 
  categories = DEFAULT_CATEGORIES, 
  onChange,
  onManage 
}: CategorySelectorProps) {
  const selectedCategory = categories.find(c => c.id === value);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        Category
      </label>
      
      <div className="flex gap-2">
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value || undefined)}
          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">No Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        
        {onManage && (
          <button
            type="button"
            onClick={onManage}
            className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md border border-gray-600 transition-colors"
            title="Manage Categories"
          >
            ⚙️
          </button>
        )}
      </div>
      
      {selectedCategory && (
        <div 
          className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs"
          style={{ backgroundColor: `${selectedCategory.color}20`, border: `1px solid ${selectedCategory.color}` }}
        >
          <span 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: selectedCategory.color }}
          />
          <span className="text-gray-300">{selectedCategory.name}</span>
        </div>
      )}
    </div>
  );
}
