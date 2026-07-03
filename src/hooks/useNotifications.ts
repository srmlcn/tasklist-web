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

      items.forEach((item) => {
        if (!isTask(item)) return;
        const task = item as Task;
        if (task.isComplete) return;

        const deadline = new Date(task.deadline);
        const notificationId = `notified-${task.id}`;

        // Check if already notified
        if (sessionStorage.getItem(notificationId)) return;

        // Notify only with the most urgent timing that applies
        const fifteenMinutes = 15 * 60 * 1000;
        const oneHour = 60 * 60 * 1000;

        // Priority: 15 min > 1 hour
        if (deadline > now && deadline.getTime() - now.getTime() <= fifteenMinutes) {
          // Most urgent - 15 minutes or less
          new Notification('Task Due Very Soon!', {
            body: `"${task.name}" is due in 15 minutes`,
            icon: '/favicon.ico',
            tag: notificationId,
          });
          sessionStorage.setItem(notificationId, 'notified');
        } else if (deadline > now && deadline.getTime() - now.getTime() <= oneHour) {
          // Less urgent - within 1 hour but not within 15 minutes
          new Notification('Task Due Soon', {
            body: `"${task.name}" is due in 1 hour`,
            icon: '/favicon.ico',
            tag: notificationId,
          });
          sessionStorage.setItem(notificationId, 'notified');
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
