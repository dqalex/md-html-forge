'use client';

/**
 * 按钮原语
 *
 * 3 种 variant × 3 种 size × 可选 icon + 可选键盘提示
 * 目标：整个 app 的按钮只写一次样式，所有 UI 一致
 */

import React from 'react';

export type ButtonVariant = 'ghost' | 'subtle' | 'solid' | 'outline';
export type ButtonSize = 'xs' | 'sm' | 'md';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  kbd?: string;
  active?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  ghost:
    'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] ' +
    'hover:bg-[color:var(--surface-hover)]',
  subtle:
    'text-[color:var(--text-primary)] bg-[color:var(--surface-sunken)] ' +
    'border border-[color:var(--border-subtle)] hover:bg-[color:var(--surface-hover)] ' +
    'hover:border-[color:var(--border)]',
  solid:
    'bg-[color:var(--accent)] text-[color:var(--accent-foreground)] ' +
    'hover:bg-[color:var(--accent-strong)] shadow-[var(--shadow-xs)]',
  outline:
    'border border-[color:var(--border)] text-[color:var(--text-secondary)] ' +
    'hover:text-[color:var(--text-primary)] hover:bg-[color:var(--surface-hover)] ' +
    'hover:border-[color:var(--border-strong)]',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  xs: 'h-6 px-2 text-[11px] gap-1 rounded',
  sm: 'h-7 px-2.5 text-xs gap-1.5 rounded-md',
  md: 'h-8 px-3 text-sm gap-2 rounded-md',
};

export function Button({
  variant = 'ghost',
  size = 'sm',
  icon,
  iconRight,
  kbd,
  active,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-medium whitespace-nowrap ' +
    'transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)] ' +
    'disabled:opacity-40 disabled:cursor-not-allowed select-none ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]';

  const activeClass = active
    ? 'bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]'
    : '';

  return (
    <button
      type={rest.type ?? 'button'}
      className={`${base} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${activeClass} ${className}`}
      {...rest}
    >
      {icon && <span className="shrink-0 [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>}
      {children && <span>{children}</span>}
      {iconRight && <span className="shrink-0 [&>svg]:h-3 [&>svg]:w-3">{iconRight}</span>}
      {kbd && <Kbd>{kbd}</Kbd>}
    </button>
  );
}

/** 小巧的键盘提示徽标 */
export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center px-1 h-4 text-[10px] font-mono rounded bg-[color:var(--surface-sunken)] border border-[color:var(--border-subtle)] text-[color:var(--text-tertiary)]">
      {children}
    </kbd>
  );
}

/** 按钮组（紧凑排列，共享圆角） */
export function ButtonGroup({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`inline-flex items-center rounded-md bg-[color:var(--surface-sunken)] p-0.5 ${className}`}>
      {children}
    </div>
  );
}
