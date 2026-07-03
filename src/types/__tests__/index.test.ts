import { describe, it, expect } from 'vitest';
import { isTask, isAppointment, getItemDateTime } from '@/types';
import { createTask, createAppointment } from '@/__tests__/utils';

describe('Type Utilities', () => {
  describe('isTask', () => {
    it('returns true for Task items', () => {
      const task = createTask();
      expect(isTask(task)).toBe(true);
    });

    it('returns false for Appointment items', () => {
      const appointment = createAppointment();
      expect(isTask(appointment)).toBe(false);
    });

    it('narrowing type to Task works correctly', () => {
      const task = createTask({ name: 'My Task' });
      if (isTask(task)) {
        expect(task.deadline).toBeDefined();
        expect(task.isComplete).toBeDefined();
      }
    });
  });

  describe('isAppointment', () => {
    it('returns true for Appointment items', () => {
      const appointment = createAppointment();
      expect(isAppointment(appointment)).toBe(true);
    });

    it('returns false for Task items', () => {
      const task = createTask();
      expect(isAppointment(task)).toBe(false);
    });

    it('narrowing type to Appointment works correctly', () => {
      const appointment = createAppointment({ name: 'My Appointment' });
      if (isAppointment(appointment)) {
        expect(appointment.start).toBeDefined();
        expect(appointment.stop).toBeDefined();
        expect(appointment.attendees).toBeDefined();
      }
    });
  });

  describe('getItemDateTime', () => {
    it('returns deadline for Task items', () => {
      const deadline = '2025-06-15T14:30:00.000Z';
      const task = createTask({ deadline });
      const result = getItemDateTime(task);
      expect(result.toISOString()).toBe(deadline);
    });

    it('returns start time for Appointment items', () => {
      const start = '2025-06-15T14:30:00.000Z';
      const appointment = createAppointment({ start });
      const result = getItemDateTime(appointment);
      expect(result.toISOString()).toBe(start);
    });

    it('handles different date formats', () => {
      const dates = [
        '2025-01-01T00:00:00.000Z',
        '2025-12-31T23:59:59.999Z',
        '2024-02-29T12:00:00.000Z',
      ];

      dates.forEach((dateStr) => {
        const task = createTask({ deadline: dateStr });
        const result = getItemDateTime(task);
        expect(result.toISOString()).toBe(dateStr);
      });
    });

    it('returns valid Date object for edge cases', () => {
      const task = createTask({ deadline: '1970-01-01T00:00:00.000Z' });
      const result = getItemDateTime(task);
      expect(result instanceof Date).toBe(true);
      expect(result.getTime()).toBe(0);
    });
  });
});