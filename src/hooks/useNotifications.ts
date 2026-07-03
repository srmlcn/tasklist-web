'use client';

import { useState, useEffect, useCallback } from 'react';
import { Item, Task, isTask } from '@/types';

const NOTIFICATION_ENABLED_KEY = 'tasklist-notifications-enabled';
const NOTIFICATION_TIMING_KEY = 'tasklist-notification-timing';
const CHECK_INTERVAL = 60000; // Check every minute

export type NotificationTiming = 5 | 15 | 30 | 60; // minutes before deadline

export function useNotifications(items: Item[]) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [enabled, setEnabled] = useState(false);
  const [timing, setTiming] = useState<NotificationTiming[]>([15, 60]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check stored preferences
    const storedEnabled = localStorage.getItem(NOTIFICATION_ENABLED_KEY);
    setEnabled(storedEnabled === 'true');
    
    const storedTiming = localStorage.getItem(NOTIFICATION_TIMING_KEY);
    if (storedTiming) {
      try {
        setTiming(JSON.parse(storedTiming));
      } catch {
        setTiming([15, 60]);
      }
    }
    
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
        localStorage.setItem(NOTIFICATION_ENABLED_KEY, 'true');
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
    localStorage.setItem(NOTIFICATION_ENABLED_KEY, String(newEnabled));
  }, [enabled, permission, requestPermission]);

  const updateTiming = useCallback((newTiming: NotificationTiming[]) => {
    setTiming(newTiming);
    localStorage.setItem(NOTIFICATION_TIMING_KEY, JSON.stringify(newTiming));
  }, []);

  const toggleTiming = useCallback((minutes: NotificationTiming) => {
    const newTiming = timing.includes(minutes)
      ? timing.filter(t => t !== minutes)
      : [...timing, minutes].sort((a, b) => b - a);
    updateTiming(newTiming);
  }, [timing, updateTiming]);

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

        // Check each timing option
        timing.forEach((minutes) => {
          const notifyTime = new Date(deadline.getTime() - minutes * 60 * 1000);
          const timingKey = `${notificationId}-${minutes}m`;
          
          // Skip if already notified for this timing
          if (sessionStorage.getItem(timingKey)) return;
          
          // Notify if within the notification window
          if (now >= notifyTime && deadline > now) {
            const timeLabel = minutes < 60 
              ? `${minutes} minute${minutes > 1 ? 's' : ''}`
              : `${minutes / 60} hour${minutes > 60 ? 's' : ''}`;
            
            new Notification('Task Reminder', {
              body: `"${task.name}" is due in ${timeLabel}`,
              icon: '/favicon.ico',
              tag: timingKey,
            });
            sessionStorage.setItem(timingKey, 'true');
          }
        });
      });
    };

    // Check immediately
    checkUpcomingTasks();

    // Then check periodically
    const interval = setInterval(checkUpcomingTasks, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [items, enabled, permission, timing]);

  return {
    permission,
    enabled,
    timing,
    requestPermission,
    toggleEnabled,
    updateTiming,
    toggleTiming,
  };
}
