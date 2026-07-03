import { NextRequest, NextResponse } from 'next/server';
import { Item } from '@/types';

// Simple file-based storage for server-side (works on Vercel, etc.)
const STORAGE_FILE = '.tasklist-data.json';

function getStoredItems(): Item[] {
  // For server-side, return empty array (localStorage is client-side only)
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('tasklist-items');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function setStoredItems(items: Item[]): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('tasklist-items', JSON.stringify(items));
    } catch {
      console.error('Failed to save items');
    }
  }
}

// In-memory storage for server-side API calls
const serverItems: Item[] = [];

// GET /api/items - Get all items
export async function GET() {
  try {
    const items = getStoredItems();
    const allItems = items.length > 0 ? items : serverItems;
    return NextResponse.json(allItems);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

// POST /api/items - Create a new item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items = getStoredItems();

    const newItem: Item = {
      ...body,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    items.push(newItem);
    setStoredItems(items);

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
}

// PUT /api/items - Update an item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    const items = getStoredItems();

    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    items[index] = { ...items[index], ...updates };
    setStoredItems(items);

    return NextResponse.json(items[index]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

// DELETE /api/items - Delete an item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const items = getStoredItems();
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    items.splice(index, 1);
    setStoredItems(items);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
