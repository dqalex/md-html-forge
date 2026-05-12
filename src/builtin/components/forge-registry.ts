/**
 * Forge 组件注册表
 *
 * 通过 `?raw` query 把每个 `.forge.md` 作为原始文本导入，
 * 在模块加载时统一解析为 ComponentDef。
 *
 * 添加新组件包：在下面 IMPORTS 区追加一行 import + 在 SOURCES 数组里登记。
 *
 * 已注册组件包（27 个）：
 *   card / product-card / info-panel / list-item / list-row / timeline / table /
 *   callout / panel / metric / pr-summary / comparison / progress /
 *   code-block / chip / design-spec / illustration / lead /
 *   cta-banner / steps-horizontal / chart-line / icon-nav / stat-badges / rating /
 *   product-grid / category-panel / compare-table
 */

import { parseForgeMd, forgeToComponentDef, getForgeJs } from './forge-loader';
import type { ComponentDef } from '../types';

// ===== 原始文本导入 =====
// 每个 .forge.md 都以 ?raw 形式导入；类型在 src/builtin/forge-md.d.ts 中声明

import card from './card/card.forge.md?raw';
import productCard from './card/product-card.forge.md?raw';
import infoPanel from './card/info-panel.forge.md?raw';
import listItem from './list/list-item.forge.md?raw';
import listRow from './list/list-row.forge.md?raw';
import timeline from './list/timeline.forge.md?raw';
import stepsHorizontal from './list/steps-horizontal.forge.md?raw';
import table from './data/table.forge.md?raw';
import metric from './data/metric.forge.md?raw';
import prSummary from './data/pr-summary.forge.md?raw';
import chartLine from './data/chart-line.forge.md?raw';
import statBadges from './data/stat-badges.forge.md?raw';
import rating from './data/rating.forge.md?raw';
import compareTable from './data/compare-table.forge.md?raw';
import callout from './visual/callout.forge.md?raw';
import ctaBanner from './visual/cta-banner.forge.md?raw';
import productGrid from './visual/product-grid.forge.md?raw';
import categoryPanel from './visual/category-panel.forge.md?raw';
import iconNav from './visual/icon-nav.forge.md?raw';
import panel from './visual/panel.forge.md?raw';
import comparison from './visual/comparison.forge.md?raw';
import progress from './visual/progress.forge.md?raw';
import codeBlock from './visual/code-block.forge.md?raw';
import chip from './visual/chip.forge.md?raw';
import designSpec from './visual/design-spec.forge.md?raw';
import illustration from './visual/illustration.forge.md?raw';
import lead from './summary/lead.forge.md?raw';

const SOURCES: string[] = [
  card,
  productCard,
  infoPanel,
  listItem,
  listRow,
  timeline,
  stepsHorizontal,
  table,
  metric,
  prSummary,
  chartLine,
  statBadges,
  rating,
  compareTable,
  callout,
  ctaBanner,
  productGrid,
  categoryPanel,
  iconNav,
  panel,
  comparison,
  progress,
  codeBlock,
  chip,
  designSpec,
  illustration,
  lead,
];

// ===== 解析为 ComponentDef =====

const parsed = SOURCES.map((src) => parseForgeMd(src));

/** 所有注册的 forge 组件（按声明顺序） */
export const FORGE_COMPONENTS: ComponentDef[] = parsed
  .filter((p) => p.meta.id) // 过滤解析失败
  .map((p) => forgeToComponentDef(p));

/**
 * 所有携带 mount JS 的组件，供 emitter 注入到预览页运行时
 */
export const FORGE_RUNTIME_SCRIPTS: Array<{ id: string; trust: 'builtin' | 'user'; js: string }> =
  parsed
    .map((p) => getForgeJs(p))
    .filter((x): x is { id: string; trust: 'builtin' | 'user'; js: string } => !!x);

/**
 * 各组件的 ## Sample 原始 Markdown 文本（id → sample 源码）
 *
 * 选型指南页 /docs/slots 用这个喂给 renderWithFallback 出"mini 预览"。
 * 注意 sample 里通常不含 `@compose` —— 页面渲染时会动态把这个 id
 * 作为 `@compose` 唯一项包一层。
 */
export const FORGE_SAMPLES: Record<string, string> = Object.fromEntries(
  parsed
    .filter((p) => p.meta.id && p.sample)
    .map((p) => [p.meta.id, p.sample]),
);

/**
 * 运行时新增 / 替换某个 forge 组件的 mount JS（按 id）
 *
 * 用于品牌包动态加载用户组件时，把其 mount JS 注入到下次 emit 的预览中
 */
export function registerForgeRuntimeScript(s: { id: string; trust: 'builtin' | 'user'; js: string }): void {
  const idx = FORGE_RUNTIME_SCRIPTS.findIndex((x) => x.id === s.id);
  if (idx >= 0) FORGE_RUNTIME_SCRIPTS[idx] = s;
  else FORGE_RUNTIME_SCRIPTS.push(s);
}

export function unregisterForgeRuntimeScript(id: string): void {
  const idx = FORGE_RUNTIME_SCRIPTS.findIndex((x) => x.id === id);
  if (idx >= 0) FORGE_RUNTIME_SCRIPTS.splice(idx, 1);
}
