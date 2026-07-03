'use client';

import { useState, useEffect, useCallback } from 'react';
import { Item, Task, isTask } from '@/types';

const NOTIFICATION_KEY = 'tasklist-notifications-enabled';
const CHECK_INTERVAL = 60000; // Check every minute

export function useNotifications(items: Item[]) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [enabled, setEnabled] = useState(false);

  // Sync enabled state with actual permission
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check current permission
    if ('Notification' in window) {
      const currentPermission = Notification.permission;
      setPermission(currentPermission);

      // Only enable if permission is granted and localStorage says so
      const stored = localStorage.getItem(NOTIFICATION_KEY);
      if (currentPermission === 'granted' && stored === 'true') {
        setEnabled(true);
      } else {
        // Clear stale state if permission was revoked
        setEnabled(false);
        localStorage.removeItem(NOTIFICATION_KEY);
      }
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        setEnabled(true);
        localStorage.setItem(NOTIFICATION_KEY, 'true');
        return true;
      } else {
        // Permission denied - ensure UI reflects this
        setEnabled(false);
        localStorage.removeItem(NOTIFICATION_KEY);
        return false;
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }, []);

  const toggleEnabled = useCallback(() => {
    if (permission !== 'granted') {
      requestPermission();
    } else {
      // Toggle only when permission is already granted
      const newEnabled = !enabled;
      setEnabled(newEnabled);
      if (newEnabled) {
        localStorage.setItem(NOTIFICATION_KEY, 'true');
      } else {
        localStorage.removeItem(NOTIFICATION_KEY);
      }
    }
  }, [enabled, permission, requestPermission]);

  // Check for upcoming tasks and send notifications
  useEffect(() => {
    if (!enabled || permission !== 'granted') return;

    const checkUpcomingTasks = () => {
      const now = new Date();
      const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      items.forEach((item) => {
        if (!isTask(item)) return;
        const task = item as Task;
        if (task.isComplete) return;

        const deadline = new Date(task.deadline);

        // Priority: 15 minutes before > 1 hour before
        // Notify 15 minutes before (most urgent)
        if (deadline > now && deadline <= fifteenMinutesFromNow) {
          const fifteenMinKey = `notified-15m-${task.id}`;
          if (!sessionStorage.getItem(fifteenMinKey)) {
            new Notification('Task Due Very Soon!', {
              body: `"${task.name}" is due in 15 minutes`,
              icon: '/favicon.ico',
              tag: fifteenMinKey,
            });
            sessionStorage.setItem(fifteenMinKey, 'true');
          }
        } else if (deadline > now && deadline <= oneHourFromNow) {
          // Notify 1 hour before (less urgent, only if not within 15 min)
          const oneHourKey = `notified-1h-${task.id}`;
          const fifteenMinKey = `notified-15m-${task.id}`;
          // Only send 1-hour notification if 15-minute wasn't already sent
          if (!sessionStorage.getItem(fifteenMinKey) && !sessionStorage.getItem(oneHourKey)) {
            new Notification('Task Due Soon', {
              body: `"${task.name}" is due in 1 hour`,
              icon: '/favicon.ico',
              tag: oneHourKey,
            });
            sessionStorage.setItem(oneHourKey, 'true');
          }
        }
      });
    };

    // Check immediately
    checkUpcomingTasks();

    // Then check periodically
    const interval = setInterval(checkUpcomingTasks, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [items, enabled, permission]);

  return {
    permission,
    enabled,
    requestPermission,
    toggleEnabled,
  };
}
