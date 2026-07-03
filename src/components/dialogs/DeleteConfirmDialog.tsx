'use client';

import { Item } from '@/types';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item: Item | null;
}

export function DeleteConfirmDialog({ isOpen, onClose, onConfirm, item }: DeleteConfirmDialogProps) {
  if (!isOpen || !item) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm bg-gray-800 rounded-lg shadow-xl border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100">Delete Item</h2>
        </div>

        <div className="p-4">
          <p className="text-gray-300 mb-2">
            Are you sure you want to delete this {item.type}?
          </p>
          <p className="text-lg font-medium text-gray-100 mb-4">
            &ldquo;{item.name}&rdquo;
          </p>
          <p className="text-sm text-gray-400 mb-4">
            This action cannot be undone.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
