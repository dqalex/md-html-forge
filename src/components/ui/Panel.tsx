'use client';

/**
 * Panel 原语
 *
 * - Popover: 轻浮层（dropdown / picker），带背景遮罩 + 淡入
 * - Drawer:  侧边抽屉（组件库用）
 * - Card:    卡片容器
 *
 * 不做 portal（直接 z-index 叠加即可），focus trap 留给未来。
 */

import React, { useEffect } from 'react';

// ===== Popover =====

export interface PopoverProps {
  open: boolean;
  onClose: () => void;
  /** 相对视口的位置：'top-center' / 'top-right' / 'bottom-right' */
  anchor?: 'top-center' | 'top-right' | 'bottom-right' | 'center';
  /** 自定义定位 */
  style?: React.CSSProperties;
  className?: string;
  width?: number | string;
  children: React.ReactNode;
}

const ANCHOR_CLASSES: Record<NonNullable<PopoverProps['anchor']>, string> = {
  'top-center':   'left-1/2 top-[64px] -translate-x-1/2',
  'top-right':    'right-4 top-[56px]',
  'bottom-right': 'right-4 bottom-4',
  'center':       'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
};

export function Popover({
  open,
  onClose,
  anchor = 'top-center',
  style,
  className = '',
  width = 420,
  children,
}: PopoverProps) {
  // ESC 关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        className={`absolute ${ANCHOR_CLASSES[anchor]} bg-[color:var(--surface)] border border-[color:var(--border)] rounded-[var(--radius-panel)] shadow-[var(--shadow-lg)] overflow-hidden animate-fade-in ${className}`}
        style={{ width, ...style }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ===== Drawer =====

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: 'right' | 'left';
  width?: number | string;
  children: React.ReactNode;
}

export function Drawer({ open, onClose, side = 'right', width = 420, children }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const sideClass = side === 'right' ? 'right-0' : 'left-0';

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      {/* backdrop */}
      <div className="absolute inset-0 bg-[color:var(--color-ivory-900)]/20 backdrop-blur-[2px]" />
      {/* drawer */}
      <div
        className={`absolute top-0 bottom-0 ${sideClass} bg-[color:var(--surface)] border-l border-[color:var(--border)] shadow-[var(--shadow-xl)] flex flex-col animate-fade-in`}
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ===== PanelSection =====

/** 面板内部的小节，带 header */
export function PanelSection({
  title,
  action,
  children,
  className = '',
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {title && (
        <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
          <h3 className="text-[10px] font-semibold text-[color:var(--text-tertiary)] uppercase tracking-[0.08em]">
            {title}
          </h3>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

/** 面板底部提示行（占据满宽，sunken 背景） */
export function PanelFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-2.5 border-t border-[color:var(--border-subtle)] bg-[color:var(--surface-sunken)] text-[11px] text-[color:var(--text-tertiary)] flex items-center gap-2">
      {children}
    </div>
  );
}
