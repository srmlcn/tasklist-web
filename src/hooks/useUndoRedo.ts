'use client';

import { useState, useCallback, useRef } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface UseUndoRedoResult<T> {
  state: T;
  setState: (newState: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: (newState: T) => void;
}

const MAX_HISTORY_SIZE = 50;

export function useUndoRedo<T>(initialState: T): UseUndoRedoResult<T> {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const lastUpdateRef = useRef<number>(0);

  const setState = useCallback((newState: T) => {
    const now = Date.now();
    // Debounce: don't create history entry if updated within 100ms
    // This prevents rapid changes (like typing) from creating too many entries
    const shouldCreateHistory = now - lastUpdateRef.current > 100;
    lastUpdateRef.current = now;

    setHistory((prev) => {
      if (!shouldCreateHistory) {
        return { ...prev, present: newState };
      }

      const newPast = [...prev.past, prev.present].slice(-MAX_HISTORY_SIZE);
      return {
        past: newPast,
        present: newState,
        future: [],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;

      const newPast = [...prev.past];
      const previous = newPast.pop()!;

      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future].slice(0, MAX_HISTORY_SIZE),
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;

      const newFuture = [...prev.future];
      const next = newFuture.shift()!;

      return {
        past: [...prev.past, prev.present].slice(-MAX_HISTORY_SIZE),
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const reset = useCallback((newState: T) => {
    lastUpdateRef.current = Date.now();
    setHistory({
      past: [],
      present: newState,
      future: [],
    });
  }, []);

  return {
    state: history.present,
    setState,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    reset,
  };
}
