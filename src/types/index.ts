export type ItemType = 'task' | 'appointment';

export type RecurrencePattern = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Recurrence {
  pattern: RecurrencePattern;
  endDate?: string; // Optional end date for recurrence
  occurrences?: number; // Optional max occurrences
}

export interface Category {
  id: string;
  name: string;
  color: string; // Hex color
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: 'Work', color: '#3B82F6' },
  { id: 'personal', name: 'Personal', color: '#10B981' },
  { id: 'health', name: 'Health', color: '#EF4444' },
  { id: 'finance', name: 'Finance', color: '#F59E0B' },
];

export interface BaseItem {
  id: string;
  name: string;
  description: string;
  priority: number; // 0-3
  type: ItemType;
  recurrence?: Recurrence;
  parentId?: string; // For recurring instances, links to the original item
  color?: string;
  categoryId?: string; // Category ID reference
  order: number; // For drag-and-drop ordering within a day
}

export interface Task extends BaseItem {
  type: 'task';
  deadline: string; // ISO date string
  isComplete: boolean;
}

export interface Appointment extends BaseItem {
  type: 'appointment';
  start: string; // ISO date string
  stop: string; // ISO date string
  attendees: string[];
}

export type Item = Task | Appointment;

export function isTask(item: Item): item is Task {
  return item.type === 'task';
}

export function isAppointment(item: Item): item is Appointment {
  return item.type === 'appointment';
}

export function getItemDateTime(item: Item): Date {
  if (isTask(item)) {
    return new Date(item.deadline);
  }
  return new Date(item.start);
}

export const PRIORITY_LABELS = ['Low', 'Medium', 'High', 'Urgent'];
export const PRIORITY_COLORS = {
  0: 'bg-gray-500',
  1: 'bg-green-500',
  2: 'bg-yellow-500',
  3: 'bg-red-500',
};

export const DEFAULT_ITEM_COLOR = '#6B7280';

export const RECURRENCE_LABELS: Record<RecurrencePattern, string> = {
  none: 'Does not repeat',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

export function getNextOccurrence(item: Task | Appointment, fromDate: Date = new Date()): Date | null {
  if (!item.recurrence || item.recurrence.pattern === 'none') {
    return null;
  }

  const currentDate = new Date(fromDate);
  const itemDate = getItemDateTime(item);

  if (itemDate >= currentDate) {
    return itemDate;
  }

  const pattern = item.recurrence.pattern;
  const nextDate = new Date(itemDate);

  while (nextDate < currentDate) {
    switch (pattern) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        return null;
    }

    if (item.recurrence.endDate && nextDate > new Date(item.recurrence.endDate)) {
      return null;
    }
  }

  return nextDate;
}

export function generateRecurringInstances(
  item: Task | Appointment,
  startDate: Date,
  endDate: Date
): (Task | Appointment)[] {
  if (!item.recurrence || item.recurrence.pattern === 'none') {
    return [item];
  }

  const instances: (Task | Appointment)[] = [];
  const maxOccurrences = item.recurrence.occurrences || 365; // Default max 1 year of instances
  const recurrenceEnd = item.recurrence.endDate
    ? new Date(item.recurrence.endDate)
    : new Date(endDate);

  const maxDate = recurrenceEnd < endDate ? recurrenceEnd : endDate;
  const itemDate = getItemDateTime(item);
  let currentDate = new Date(itemDate);
  let count = 0;

  // If the original item is within range, add it
  if (currentDate >= startDate && currentDate <= endDate) {
    instances.push({ ...item, parentId: item.id });
    count++;
  }

  // Generate future instances
  currentDate = new Date(itemDate);
  while (count < maxOccurrences) {
    switch (item.recurrence.pattern) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'yearly':
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        break;
      default:
        break;
    }

    if (currentDate > maxDate) break;

    if (currentDate >= startDate && currentDate <= endDate) {
      const newInstance = { ...item, id: `${item.id}-${currentDate.getTime()}`, parentId: item.id };
      instances.push(newInstance);
      count++;
    }
  }

  return instances;
}
