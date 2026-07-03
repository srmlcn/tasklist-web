import type { Item, Task, Appointment } from '@/types';

export function createTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    name: 'Test Task',
    description: 'Test task description',
    priority: 1,
    type: 'task',
    deadline: '2025-01-15T10:00:00.000Z',
    isComplete: false,
    ...overrides,
  };
}

export function createAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 'appt-1',
    name: 'Test Appointment',
    description: 'Test appointment description',
    priority: 2,
    type: 'appointment',
    start: '2025-01-15T10:00:00.000Z',
    stop: '2025-01-15T11:00:00.000Z',
    attendees: ['test@example.com'],
    ...overrides,
  };
}

export function createItem(overrides: Partial<Item> = {}): Item {
  if (overrides.type === 'appointment' || overrides.type === undefined && (overrides as Partial<Appointment>).start !== undefined) {
    return createAppointment(overrides as Partial<Appointment>);
  }
  return createTask(overrides as Partial<Task>);
}

export function createTaskList(count: number, baseDate: Date = new Date()): Task[] {
  return Array.from({ length: count }, (_, i) => 
    createTask({
      id: `task-${i + 1}`,
      name: `Task ${i + 1}`,
      deadline: new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString(),
      priority: i % 4,
    })
  );
}

export function createAppointmentList(count: number, baseDate: Date = new Date()): Appointment[] {
  return Array.from({ length: count }, (_, i) => 
    createAppointment({
      id: `appt-${i + 1}`,
      name: `Appointment ${i + 1}`,
      start: new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString(),
      stop: new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
      priority: i % 4,
    })
  );
}

export function createMixedItemList(count: number, baseDate: Date = new Date()): Item[] {
  const tasks = createTaskList(Math.floor(count / 2), baseDate).map(t => ({ ...t, id: `mixed-task-${t.id}` }));
  const appointments = createAppointmentList(Math.ceil(count / 2), baseDate).map(a => ({ ...a, id: `mixed-appt-${a.id}` }));
  return [...tasks, ...appointments].sort((a, b) => a.name.localeCompare(b.name));
}