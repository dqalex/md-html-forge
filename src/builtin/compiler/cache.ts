/**
 * Compile Cache
 *
 * 两层缓存：
 *   1. 顶层 LRU：source+env 指纹 → CompileResult
 *   2. Slot 渲染 LRU：raw MD → 已处理 HTML
 *
 * 编辑器场景：用户连续敲键 → 大部分帧 source 变化，但小片段未变的 slot
 * 命中 slot 级缓存；切换模板 / 撤销到历史状态时命中顶层。
 *
 * 全部基于 JS 字符串 hash（FNV-1a），避免引入 crypto。
 * LRU 由简单 Map + size cap 实现（Map 保留插入顺序，移除最旧 O(1)）。
 */

// ===== FNV-1a 32-bit 字符串哈希 =====

export function fnv1aHash(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    // 32-bit FNV prime: 16777619
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}

/** 字符串指纹：长度 + 两遍 FNV（左到右 + 右到左），碰撞概率极低 */
export function fingerprint(str: string): string {
  if (!str) return '0:0:0';
  const forward = fnv1aHash(str);
  let reverse = 0x811c9dc5;
  for (let i = str.length - 1; i >= 0; i--) {
    reverse ^= str.charCodeAt(i);
    reverse = (reverse + ((reverse << 1) + (reverse << 4) + (reverse << 7) + (reverse << 8) + (reverse << 24))) >>> 0;
  }
  return `${str.length}:${forward.toString(36)}:${(reverse >>> 0).toString(36)}`;
}

// ===== LRU =====

export class LRU<K, V> {
  private map = new Map<K, V>();
  constructor(private readonly capacity = 128) {}

  get(k: K): V | undefined {
    const v = this.map.get(k);
    if (v === undefined) return undefined;
    // touch: 删再插 → 变成最新
    this.map.delete(k);
    this.map.set(k, v);
    return v;
  }

  set(k: K, v: V): void {
    if (this.map.has(k)) this.map.delete(k);
    this.map.set(k, v);
    while (this.map.size > this.capacity) {
      const oldest = this.map.keys().next().value;
      if (oldest === undefined) break;
      this.map.delete(oldest);
    }
  }

  has(k: K): boolean {
    return this.map.has(k);
  }

  clear(): void {
    this.map.clear();
  }

  get size(): number {
    return this.map.size;
  }
}

// ===== Slot 渲染缓存（按 raw+kind 键） =====

const slotRenderCache = new LRU<string, string>(512);

export function cachedSlotRender(
  raw: string,
  kind: 'content' | 'text' | 'raw',
  compute: () => string,
): string {
  const key = `${kind}:${fingerprint(raw)}`;
  const hit = slotRenderCache.get(key);
  if (hit !== undefined) return hit;
  const result = compute();
  slotRenderCache.set(key, result);
  return result;
}

// ===== 顶层 CompileResult 缓存 =====

import type { CompileResult } from './index';

const compileCache = new LRU<string, CompileResult>(32);

export function cachedCompile(
  key: string,
  compute: () => CompileResult,
): CompileResult {
  const hit = compileCache.get(key);
  if (hit !== undefined) return hit;
  const result = compute();
  compileCache.set(key, result);
  return result;
}

/** 调试：打印命中情况（开发期用） */
export function debugCacheStats(): { slot: number; compile: number } {
  return { slot: slotRenderCache.size, compile: compileCache.size };
}
