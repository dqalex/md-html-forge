/**
 * 内置组件库 · 根注册表
 *
 * 组织方式：
 *   components/
 *     _base.ts           → defineComponent() 工厂 + 工具
 *     shared-tokens.ts   → 共享 CSS tokens
 *     header/            ← 每个 category 一个目录
 *       index.ts         →   导出 HEADER_COMPONENTS = [...]
 *       header.ts        →   一个组件一个文件
 *       meta-pills.ts
 *     summary/ ...
 *     content/ ...
 *     data/    ...
 *     list/    ...
 *     visual/  ...
 *     footer/  ...
 *
 * 新增组件流程：
 *   1. 在对应 category 目录下新建 xxx.ts
 *      ```ts
 *      export default defineComponent({ id: 'xxx', ... });
 *      ```
 *   2. 在该 category 的 index.ts 里 import 并加到数组
 *   3. 自动出现在组件库浏览器，自动支持 @compose 引用
 *
 * 新增 category：
 *   1. mkdir components/<new-cat>/
 *   2. 添加 index.ts 导出 XXX_COMPONENTS 数组
 *   3. 在本文件的 GROUPS 里加一行
 *   4. 在 types.ts 的 ComponentCategory 联合类型里加一项
 */

import type { ComponentDef } from '../types';

import { HEADER_COMPONENTS } from './header';
import { SUMMARY_COMPONENTS } from './summary';
import { CONTENT_COMPONENTS } from './content';
import { CARD_COMPONENTS } from './card';
import { DATA_COMPONENTS } from './data';
import { LIST_COMPONENTS } from './list';
import { VISUAL_COMPONENTS } from './visual';
import { LAYOUT_COMPONENTS } from './layout';
import { FOOTER_COMPONENTS } from './footer';
import { SPECIAL_COMPONENTS } from './special';
import { FORGE_COMPONENTS } from './forge-registry';

// ===== 聚合点（新 category 在这里加一行即可） =====

const GROUPS: ReadonlyArray<readonly ComponentDef[]> = [
  HEADER_COMPONENTS,
  SUMMARY_COMPONENTS,
  DATA_COMPONENTS,
  CONTENT_COMPONENTS,
  CARD_COMPONENTS,
  LIST_COMPONENTS,
  VISUAL_COMPONENTS,
  LAYOUT_COMPONENTS,
  FOOTER_COMPONENTS,
  SPECIAL_COMPONENTS,
  FORGE_COMPONENTS,
];

// ===== 扁平化 + 唯一性校验（开发态）=====

function flatten(): ComponentDef[] {
  const all: ComponentDef[] = [];
  const seen = new Set<string>();
  for (const group of GROUPS) {
    for (const comp of group) {
      if (seen.has(comp.id)) {
        console.warn(`[builtin] 重复的组件 id: "${comp.id}" — 后者将覆盖前者`);
      }
      seen.add(comp.id);
      all.push(comp);
    }
  }
  return all;
}

const _registry: Map<string, ComponentDef> = new Map(
  flatten().map(c => [c.id, c]),
);

// ===== 公共导出 =====

export type { ComponentDef, ComponentCategory } from '../types';
export { SHARED_TOKENS_CSS, isEmpty, any } from './shared-tokens';
export { defineComponent } from './_base';

/** 所有内置组件（展示顺序 = GROUPS 顺序） */
export const BUILTIN_COMPONENTS: readonly ComponentDef[] = Object.freeze([..._registry.values()]);

export function getBuiltinComponent(id: string): ComponentDef | undefined {
  return _registry.get(id);
}

export function hasBuiltinComponent(id: string): boolean {
  return _registry.has(id);
}

/**
 * 运行时注册（供模板 customComponents 或第三方扩展使用）
 * 只影响内存 registry
 */
export function registerComponent(comp: ComponentDef): void {
  if (_registry.has(comp.id)) {
    console.warn(`[builtin] Component "${comp.id}" already registered, overwriting`);
  }
  _registry.set(comp.id, comp);
}

/** 按 category 分组（组件浏览器用） */
export function groupBuiltinByCategory(): Record<string, ComponentDef[]> {
  const map: Record<string, ComponentDef[]> = {};
  for (const c of BUILTIN_COMPONENTS) {
    (map[c.category] ||= []).push(c);
  }
  return map;
}
