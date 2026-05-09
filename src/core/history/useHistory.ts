/**
 * useHistory - 版本历史 Hook（v2.1）
 *
 * 用 useReducer 替代分离的 useState，消除：
 * - pushState 中 currentIndex 闭包读旧值的竞态
 * - redo 在 setHistory updater 里嵌套调用 setCurrentIndex 的反模式
 */

import { useReducer, useCallback, useRef } from 'react';

// ===== 类型 =====

export interface HistoryEntry {
  html: string;
  md: string;
  label?: string;
  timestamp: number;
}

export interface UseHistoryReturn {
  currentState: HistoryEntry;
  history: HistoryEntry[];
  currentIndex: number;
  pushState: (html: string, md: string) => void;
  saveSnapshot: (html: string, md: string, label: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: () => void;
  goTo: (index: number) => void;
}

// ===== Reducer =====

const MAX_HISTORY = 50;

interface HistoryState {
  entries: HistoryEntry[];
  index: number;
}

type HistoryAction =
  | { type: 'PUSH'; entry: HistoryEntry }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET'; initial: HistoryEntry }
  | { type: 'GOTO'; index: number };

function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case 'PUSH': {
      // 截断当前位置之后的历史，添加新条目
      const trimmed = state.entries.slice(0, state.index + 1);
      trimmed.push(action.entry);
      const capped = trimmed.length > MAX_HISTORY ? trimmed.slice(-MAX_HISTORY) : trimmed;
      return { entries: capped, index: capped.length - 1 };
    }
    case 'UNDO':
      return state.index > 0
        ? { ...state, index: state.index - 1 }
        : state;
    case 'REDO':
      return state.index < state.entries.length - 1
        ? { ...state, index: state.index + 1 }
        : state;
    case 'RESET':
      return { entries: [action.initial], index: 0 };
    case 'GOTO': {
      const idx = Math.max(0, Math.min(state.entries.length - 1, action.index));
      return { ...state, index: idx };
    }
    default:
      return state;
  }
}

// ===== Hook =====

export function useHistory(
  initialHtml: string,
  initialMd = '',
): UseHistoryReturn {
  const initialEntry: HistoryEntry = {
    html: initialHtml,
    md: initialMd,
    timestamp: Date.now(),
  };

  const [{ entries, index }, dispatch] = useReducer(historyReducer, {
    entries: [initialEntry],
    index: 0,
  });

  // 保存初始值，供 reset 使用
  const initialEntryRef = useRef(initialEntry);

  const currentState = entries[index] ?? initialEntry;
  const canUndo = index > 0;
  const canRedo = index < entries.length - 1;

  const pushState = useCallback((html: string, md: string) => {
    dispatch({ type: 'PUSH', entry: { html, md, timestamp: Date.now() } });
  }, []);

  const saveSnapshot = useCallback((html: string, md: string, label: string) => {
    dispatch({ type: 'PUSH', entry: { html, md, label, timestamp: Date.now() } });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET', initial: initialEntryRef.current });
  }, []);

  const goTo = useCallback((i: number) => {
    dispatch({ type: 'GOTO', index: i });
  }, []);

  return {
    currentState,
    history: entries,
    currentIndex: index,
    pushState,
    saveSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    goTo,
  };
}
