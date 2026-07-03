'use client';

import { useState, useEffect, useCallback } from 'react';
import { Item, Task, isTask } from '@/types';

const NOTIFICATION_KEY = 'tasklist-notifications-enabled';
const CHECK_INTERVAL = 60000; // Check every minute

export function useNotifications(items: Item[]) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check stored preference
    const stored = localStorage.getItem(NOTIFICATION_KEY);
    setEnabled(stored === 'true');
    
    // Check current permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
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
      }
      return false;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }, []);

  const toggleEnabled = useCallback(() => {
    if (permission !== 'granted') {
      requestPermission();
      return;
    }
    
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    localStorage.setItem(NOTIFICATION_KEY, String(newEnabled));
  }, [enabled, permission, requestPermission]);

  // Check for upcoming tasks and send notifications
  useEffect(() => {
    if (!enabled || permission !== 'granted') return;

    const checkUpcomingTasks = () => {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

      items.forEach((item) => {
        if (!isTask(item)) return;
        const task = item as Task;
        if (task.isComplete) return;

        const deadline = new Date(task.deadline);
        const notificationId = `notified-${task.id}`;

        // Check if already notified
        if (sessionStorage.getItem(notificationId)) return;

        // Notify 1 hour before
        if (deadline > now && deadline <= oneHourFromNow) {
          new Notification('Task Due Soon', {
            body: `"${task.name}" is due in 1 hour`,
            icon: '/favicon.ico',
            tag: notificationId,
          });
          sessionStorage.setItem(notificationId, '1h');
        }

        // Notify 15 minutes before
        if (deadline > now && deadline <= fifteenMinutesFromNow) {
          new Notification('Task Due Very Soon!', {
            body: `"${task.name}" is due in 15 minutes`,
            icon: '/favicon.ico',
            tag: notificationId,
          });
          sessionStorage.setItem(notificationId, '15m');
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
