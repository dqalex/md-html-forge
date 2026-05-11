'use client';

/**
 * 用户自定义组件存储（localStorage）
 *
 * 由 F5「AI 生成组件流程」写入，由 F4「品牌包」读取并打包。
 * 也可在 BrandPack 应用时被注册到引擎。
 */

import type { UserComponent } from './brandpack';

const STORAGE_KEY = 'forge:user-components';

export function loadUserComponents(): UserComponent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (c): c is UserComponent =>
        c && typeof c.source === 'string' && typeof c.id === 'string',
    );
  } catch {
    return [];
  }
}

export function saveUserComponents(comps: UserComponent[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(comps));
}

export function upsertUserComponent(comp: UserComponent): UserComponent[] {
  const all = loadUserComponents();
  const idx = all.findIndex((c) => c.id === comp.id);
  if (idx >= 0) all[idx] = comp;
  else all.push(comp);
  saveUserComponents(all);
  return all;
}

export function removeUserComponent(id: string): UserComponent[] {
  const next = loadUserComponents().filter((c) => c.id !== id);
  saveUserComponents(next);
  return next;
}
