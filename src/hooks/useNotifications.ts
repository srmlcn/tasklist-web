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

      items.forEach((item) => {
        if (!isTask(item)) return;
        const task = item as Task;
        if (task.isComplete) return;

        const deadline = new Date(task.deadline);
        const notificationId = `notified-${task.id}`;

        // Check if already notified
        if (sessionStorage.getItem(notificationId)) return;

        const timeUntilDue = deadline.getTime() - now.getTime();

        // Notify with accurate time remaining
        if (deadline > now) {
          let body: string;
          let title: string;
          
          if (timeUntilDue <= 5 * 60 * 1000) {
            title = 'Task Due Now!';
            body = `"${task.name}" is due now`;
          } else if (timeUntilDue <= 15 * 60 * 1000) {
            title = 'Task Due Very Soon!';
            body = `"${task.name}" is due in ${Math.ceil(timeUntilDue / 60000)} minutes`;
          } else if (timeUntilDue <= 60 * 60 * 1000) {
            title = 'Task Due Soon';
            body = `"${task.name}" is due in ${Math.ceil(timeUntilDue / 60000)} minutes`;
          } else {
            title = 'Task Due Reminder';
            body = `"${task.name}" is due in ${Math.ceil(timeUntilDue / 3600000)} hours`;
          }
          
          new Notification(title, {
            body,
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
