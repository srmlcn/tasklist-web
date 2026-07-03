export type ItemType = 'task' | 'appointment';

export interface BaseItem {
  id: string;
  name: string;
  description: string;
  priority: number; // 0-3
  type: ItemType;
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
