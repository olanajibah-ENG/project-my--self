import { useState, useCallback } from 'react';

export interface UndoableAction {
  id: string;
  type: 'delete_lesson' | 'delete_module';
  timestamp: number;
  data: any; // Will be typed as Lesson | Module
  parentId: number; // moduleId for lessons, courseId for modules
}

export interface UseUndoStackReturn {
  undoStack: UndoableAction[];
  pushUndo: (action: UndoableAction) => void;
  popUndo: () => UndoableAction | undefined;
  hasUndo: boolean;
  clearUndo: () => void;
}

/**
 * Session-based undo stack for deletion operations
 * Stack clears automatically on page refresh/logout (React state behavior)
 */
export function useUndoStack(): UseUndoStackReturn {
  const [undoStack, setUndoStack] = useState<UndoableAction[]>([]);

  const pushUndo = useCallback((action: UndoableAction) => {
    setUndoStack((prev) => [...prev, action]);
  }, []);

  const popUndo = useCallback((): UndoableAction | undefined => {
    if (undoStack.length === 0) return undefined;

    const action = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    return action;
  }, [undoStack]);

  const clearUndo = useCallback(() => {
    setUndoStack([]);
  }, []);

  return {
    undoStack,
    pushUndo,
    popUndo,
    hasUndo: undoStack.length > 0,
    clearUndo,
  };
}
