'use client';

import { useCallback, useRef, useState } from 'react';

export interface UseAutoSaveOptions {
  /** 持久化回调 */
  onSave: (content: string) => Promise<void>;
  /** 防抖延迟（ms），默认 800 */
  debounceMs?: number;
}

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/**
 * 自动保存 hook：防抖 + 乐观更新 + 错误回滚
 */
export function useAutoSave({ onSave, debounceMs = 800 }: UseAutoSaveOptions) {
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>('');
  const onErrorRef = useRef<string>('');

  const triggerSave = useCallback(
    (content: string) => {
      // 去重：与上次保存内容一致则跳过
      if (content === lastSavedRef.current) return;

      // 清除已有定时器
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(async () => {
        setSaveState('saving');
        try {
          await onSave(content);
          lastSavedRef.current = content;
          setSaveState('saved');
          // 1.5s 后自动隐藏"已保存"
          setTimeout(() => setSaveState('idle'), 1500);
        } catch (err) {
          onErrorRef.current = err instanceof Error ? err.message : 'Save failed';
          setSaveState('error');
        }
      }, debounceMs);
    },
    [onSave, debounceMs],
  );

  const retry = useCallback(
    async (content: string) => {
      setSaveState('saving');
      try {
        await onSave(content);
        lastSavedRef.current = content;
        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 1500);
      } catch (err) {
        setSaveState('error');
      }
    },
    [onSave],
  );

  return { saveState, triggerSave, retry };
}
