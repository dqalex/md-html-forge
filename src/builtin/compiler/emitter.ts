/**
 * Emitter
 *
 * 输入：SectionPlan[] + env
 * 输出：完整 HTML 字符串 + 使用到的 CSS
 *
 * 负责：
 *   1. 把 slot 原始 MD 渲染为 HTML (含 sanitize / inline vs block)
 *   2. 调用组件的 html() 函数
 *   3. 套上段级 layout 容器 + theme scope class
 *   4. 收集 component CSS 去重 + 注入 theme CSS
 *   5. 替换 :lucide:name: 图标
 *
 * Emitter 不再扫描原始 MD 字符串，所有输入都来自 resolver 的 plan。
 */

import {
  extractSlotsFromMd,
  inlineMdToHtml,
  sanitizeHtml,
  simpleMdToHtml,
} from '@/lib/markdown-slots/slot-sync';
import type { SlotDef } from '@/lib/markdown-slots/types';
import type { ComponentDef } from '../types';
import type { ThemeDef } from '../themes/types';
import { buildThemesCss, buildRootThemeCss } from '../themes';
import { SHARED_TOKENS_CSS } from '../components/shared-tokens';
import { FORGE_RUNTIME_SCRIPTS } from '../components/forge-registry';
import { forgeRegistry, type InlineRule } from './registry';
import { cachedSlotRender } from './cache';
import type { ComponentPlan, GroupPlan, SectionPlan } from './resolver';

// ===== 公共工具 =====

function isMeaningful(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed) return false;
  const stripped = trimmed.replace(/<!--[\s\S]*?-->/g, '').trim();
  if (!stripped) return false;
  if (/^\[[^\]]+\]$/.test(stripped)) return false;
  return true;
}

/**
 * slot 原始 MD → HTML（按 slot type 决定 block / inline / raw）
 * slot 允许同名多次出现（content 数组），这里拼接后再渲染
 * 走 LRU 缓存：相同 raw + kind 不重复过 sanitize 管线
 */
function renderSlotValue(
  values: string[],
  def: SlotDef | undefined,
): string {
  const joined = values.join('\n');
  if (!isMeaningful(joined)) return '';
  const trimmed = joined.trim();
  if (def?.type === 'content') {
    return cachedSlotRender(trimmed, 'content', () => sanitizeHtml(simpleMdToHtml(trimmed)));
  }
  if (def?.type === 'text') {
    return cachedSlotRender(trimmed, 'text', () => sanitizeHtml(inlineMdToHtml(trimmed)));
  }
  return trimmed;
}

/**
 * 把一个 ComponentPlan 转成"已处理的 slot map"（可直接喂给 comp.html()）
 * 同时对 plan 中"未声明但出现"的 slot 走一次保底渲染（content 处理）。
 */
function processComponentSlots(
  plan: ComponentPlan,
  comp: ComponentDef,
): Record<string, string> {
  const out: Record<string, string> = {};
  // 1. 组件已声明的 slot
  for (const [name, def] of Object.entries(comp.slots)) {
    const values = plan.slotValues[name];
    if (!values || values.length === 0) continue;
    const html = renderSlotValue(values, def);
    if (html) out[name] = html;
  }
  // 2. plan 中额外出现的 slot（比如用户自定义 slot 名）
  for (const [name, values] of Object.entries(plan.slotValues)) {
    if (comp.slots[name]) continue;
    const html = renderSlotValue(values, undefined);
    if (html) out[name] = html;
  }
  return out;
}

// ===== Emitter 主入口 =====

import { DEFAULT_PAGE_CONFIG, type PageConfig } from './page-config';
import { buildDiagramCss } from '../diagrams/styles';

export interface EmitEnv {
  componentMap: Map<string, ComponentDef>;
  themeMap: Map<string, ThemeDef>;
  /**
   * 文档级页面配置（宽度 + band 样式）
   */
  page?: PageConfig;
  /**
   * @deprecated 请使用 page.width
   */
  pageWidth?: number;
  /**
   * 文档默认主题 id（= 文档里首个 @theme；没写则走内置默认）。
   * 该主题会被提升到 :root + body，实现整页换肤；段级 `.theme-<id>` 仍可覆盖它。
   */
  defaultThemeId?: string;
  /**
   * 输出模式
   * - 'preview' (默认)：含交互脚本、诊断辅助属性，供编辑器 iframe 使用
   * - 'standalone'    ：精简独立导出，不含交互脚本 / 编辑属性，适合下载分享
   */
  mode?: 'preview' | 'standalone';
}

export interface EmitInput {
  sections: SectionPlan[];
  orphanSlotValues: Record<string, string[]>;
  usedThemeIds: string[];
  /** 没有任何 @use 上下文的裸 Markdown 文本（兜底渲染） */
  freeText?: string[];
}

export interface EmitResult {
  html: string;
  /** 本次实际用到的 component CSS（用于调试 / 缓存键） */
  usedComponentIds: string[];
}

export function emit(input: EmitInput, env: EmitEnv): EmitResult {
  const usedCss = new Map<string, string>();
  const usedComponentIds: string[] = [];

  const sectionHtmls: string[] = [];

  for (const section of input.sections) {
    const parts: string[] = [];

    // 1. 渲染段内普通组件（非 layout）
    for (const plan of section.components) {
      const comp = env.componentMap.get(plan.componentId);
      if (!comp) continue;
      if (!usedCss.has(comp.id)) {
        usedCss.set(comp.id, comp.css);
        usedComponentIds.push(comp.id);
      }

      if (comp.isLayout) {
        // layout 组件在这里先不渲染，等 groups 阶段处理
        continue;
      }

      const slots = processComponentSlots(plan, comp);
      const html = comp.html(slots, plan.variant);
      if (html) {
        const annotated = annotateSourceLines(html, plan.slotLines);
        // 在根元素上挂 data-component-id / data-use-line，便于宿主选中后定位 @use 那一行
        const withRootMeta = injectRootMeta(annotated, comp.id, plan.variant, plan.useLine);
        // user trust 组件：把 mount JS 放进沙箱 iframe，HTML 也复制一份进去
        const finalHtml = comp.trust === 'user'
          ? wrapUserInIframe(withRootMeta, comp.id, comp.css, plan.variant)
          : withRootMeta;
        parts.push(finalHtml);
      }
    }

    // 2. 渲染段内 group（显式循环）
    for (const group of section.groups) {
      const layoutComp = env.componentMap.get(group.layoutId);
      if (!layoutComp || !layoutComp.isLayout) continue;

      if (!usedCss.has(layoutComp.id)) {
        usedCss.set(layoutComp.id, layoutComp.css);
        usedComponentIds.push(layoutComp.id);
      }

      const childHtmls: string[] = [];
      for (const item of group.items) {
        const childComp = env.componentMap.get(item.childId);
        if (!childComp) continue;
        if (!usedCss.has(childComp.id)) {
          usedCss.set(childComp.id, childComp.css);
          usedComponentIds.push(childComp.id);
        }
        const childSlots = processComponentSlots(
          { componentId: item.childId, slotValues: item.slotValues, variant: item.variant },
          childComp,
        );
        const childHtml = childComp.html(childSlots, item.variant);
        if (childHtml) childHtmls.push(annotateSourceLines(childHtml, item.slotLines));
      }

      if (childHtmls.length === 0) continue;

      // layout 组件自身的 slots（如 heading）—— 当前版本不走 outer 传递，group 内部如需可再扩展
      const html = layoutComp.html({ __children__: childHtmls.join('\n') });
      if (html) parts.push(html);
    }

    if (parts.length === 0) continue;

    // 3. 段级布局包装（当段 layoutId 不是 stack 时）
    const wrapped = wrapInLayout(section.layoutId, parts.join('\n'), env.componentMap, usedCss, usedComponentIds);

    // 4. 主题包装
    sectionHtmls.push(`<div class="theme-section theme-${section.themeId}">${wrapped}</div>`);
  }

  // 5. 孤儿 slot + 裸文本兜底
  const orphans = renderOrphans(input.orphanSlotValues);
  const freeTextHtml = renderFreeText(input.freeText ?? []);

  // 6. 解析 page 配置 + 输出模式
  const pageConfig: PageConfig = env.page
    ?? (env.pageWidth ? { width: `${env.pageWidth}px`, band: 'contained' } : DEFAULT_PAGE_CONFIG);
  const mode = env.mode ?? 'preview';

  // 7. CSS 拼装
  const themes: ThemeDef[] = input.usedThemeIds
    .map(id => env.themeMap.get(id))
    .filter((t): t is ThemeDef => !!t);
  const themesCss = buildThemesCss(themes, pageConfig.band);

  // 7.1 根主题（= 文档默认主题）提升到 :root + body，实现整页换肤
  //
  // 顺序：shared-tokens(基线) → rootThemeCss(:root 覆盖) → themesCss(段级覆盖)
  // 因此段级 .theme-<id> 仍然能在其作用域内再次覆盖根主题的变量。
  const rootTheme = env.defaultThemeId ? env.themeMap.get(env.defaultThemeId) : undefined;
  const rootThemeCss = rootTheme ? buildRootThemeCss(rootTheme) : '';

  // 先拼内容 HTML 以便按需注入 diagram CSS
  const bodyInner = `${sectionHtmls.join('\n\n')}\n${freeTextHtml.body}\n${orphans.body}`;
  const diagramCss = buildDiagramCss(bodyInner);

  const allCss = [SHARED_TOKENS_CSS, rootThemeCss, ...usedCss.values(), themesCss, diagramCss, freeTextHtml.css, orphans.css]
    .filter(Boolean)
    .join('\n\n');

  const pageHalfCss = computePageHalf(pageConfig.width);

  // standalone 模式：不注入交互脚本、清洗编辑用属性
  const finalBodyInner = mode === 'standalone'
    ? stripEditorAttrs(bodyInner)
    : bodyInner;

  const scriptTag = mode === 'standalone' ? '' : buildInteractionScript();

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
:root { --page-half: ${pageHalfCss}; }
${allCss}
.page { max-width: ${pageConfig.width}; margin: 0 auto; padding: 56px 24px 120px; box-sizing: border-box; }
.theme-section { padding: 8px 0; }
.theme-section + .theme-section { margin-top: 4px; }
.lucide-icon { color: var(--clay); width: 1.05em; height: 1.05em; }
h1 .lucide-icon, h2 .lucide-icon, h3 .lucide-icon { width: 0.95em; height: 0.95em; margin-right: 0.3em; }
</style>
</head>
<body>
<div class="page">
${finalBodyInner}
</div>
${scriptTag}
</body>
</html>`;

  const finalHtml = applyInlineRules(html, forgeRegistry.getAllInlineRules());

  return { html: finalHtml, usedComponentIds };
}

/**
 * 对最终 HTML 应用所有已注册的 inline rule（线性顺序）
 */
function applyInlineRules(html: string, rules: readonly InlineRule[]): string {
  let out = html;
  for (const rule of rules) {
    const pattern = new RegExp(rule.pattern.source, rule.pattern.flags);
    out = out.replace(pattern, (...args: unknown[]) => {
      // String.replace 回调：match, p1, p2, ..., offset, string(, groups)
      // 这里构造一个"仿 RegExpMatchArray"对象传给 rule.render
      const match = args[0] as string;
      const groups: string[] = [];
      for (let i = 1; i < args.length - 2; i++) {
        if (typeof args[i] === 'string') groups.push(args[i] as string);
      }
      const fakeMatch = [match, ...groups] as unknown as RegExpMatchArray;
      return rule.render(fakeMatch);
    });
  }
  return out;
}

// ===== 布局包装 =====

function wrapInLayout(
  layoutId: string,
  innerHtml: string,
  componentMap: Map<string, ComponentDef>,
  cssAccumulator: Map<string, string>,
  usedIds: string[],
): string {
  if (layoutId === 'stack' || !layoutId) return innerHtml;
  const layoutComp = componentMap.get(layoutId);
  if (!layoutComp || !layoutComp.isLayout) return innerHtml;
  if (!cssAccumulator.has(layoutComp.id)) {
    cssAccumulator.set(layoutComp.id, layoutComp.css);
    usedIds.push(layoutComp.id);
  }
  return layoutComp.html({ __children__: innerHtml });
}

// ===== 孤儿 slot =====

function renderOrphans(orphanSlotValues: Record<string, string[]>): { css: string; body: string } {
  const entries = Object.entries(orphanSlotValues).filter(([, vs]) => vs.some(isMeaningful));
  if (entries.length === 0) return { css: '', body: '' };

  const sections = entries.map(([name, values]) => {
    // orphan slot 没有 def，统一当 content 处理
    const html = sanitizeHtml(simpleMdToHtml(values.join('\n').trim()));
    if (!html) return '';
    return `
<div class="forge-orphan">
  <span class="forge-orphan-label">@slot:${name}</span>
  <div class="forge-orphan-body">${html}</div>
</div>`.trim();
  }).filter(Boolean);

  if (sections.length === 0) return { css: '', body: '' };

  return {
    css: `
/* 孤儿 slot 兜底样式 — 跟随品牌包 tokens */
.forge-orphan {
  margin: 24px 0;
  padding: 20px 24px;
  background: var(--white, #fff);
  border: 1px solid var(--gray-300, #D1CFC5);
  border-left: 3px solid var(--clay, #D97757);
  border-radius: 0 var(--radius-panel, 10px) var(--radius-panel, 10px) 0;
}
.forge-orphan-label {
  font-family: var(--mono, monospace);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--clay, #D97757);
  margin-bottom: 8px;
  display: block;
}
.forge-orphan-body {
  font-family: var(--sans, system-ui, sans-serif);
  font-size: 14px;
  color: var(--gray-700, #3D3D3A);
  line-height: 1.65;
}
.forge-orphan-body h1, .forge-orphan-body h2, .forge-orphan-body h3 {
  font-family: var(--serif, Georgia, serif);
  color: var(--slate, #141413);
  margin: 0.5em 0 0.25em;
}
.forge-orphan-body h1 { font-size: 22px; }
.forge-orphan-body h2 { font-size: 18px; }
.forge-orphan-body h3 { font-size: 15px; }
.forge-orphan-body p { margin: 0 0 10px; }
.forge-orphan-body p:last-child { margin-bottom: 0; }
.forge-orphan-body ul, .forge-orphan-body ol { padding-left: 20px; margin: 0 0 10px; }
.forge-orphan-body li { margin-bottom: 4px; }
.forge-orphan-body code {
  font-family: var(--mono, monospace);
  font-size: 12px;
  background: var(--gray-100, #F0EEE6);
  border: 1px solid var(--gray-300, #D1CFC5);
  padding: 1px 5px;
  border-radius: 4px;
}
.forge-orphan-body pre {
  background: var(--slate, #141413);
  color: var(--ivory, #FAF9F5);
  font-family: var(--mono, monospace);
  font-size: 12.5px;
  line-height: 1.7;
  border-radius: var(--radius-panel, 10px);
  padding: 14px 16px;
  overflow-x: auto;
  margin: 10px 0;
}
.forge-orphan-body table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  margin: 10px 0;
}
.forge-orphan-body th {
  text-align: left;
  padding: 8px 12px;
  background: var(--gray-100, #F0EEE6);
  border-bottom: 1px solid var(--gray-300, #D1CFC5);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gray-500, #87867F);
}
.forge-orphan-body td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--gray-100, #F0EEE6);
}`.trim(),
    body: sections.join('\n'),
  };
}

// ===== 裸文本兜底渲染 =====

/**
 * 渲染没有 @use 上下文的裸 Markdown 内容
 * 使用品牌包 CSS tokens 的 editorial 样式，不加任何标签/标记
 */
function renderFreeText(segments: string[]): { css: string; body: string } {
  const meaningful = segments.filter(s => s.trim());
  if (meaningful.length === 0) return { css: '', body: '' };

  const htmlParts = meaningful.map(raw => {
    const html = sanitizeHtml(simpleMdToHtml(raw));
    if (!html) return '';
    return `<div class="forge-free-text">${html}</div>`;
  }).filter(Boolean);

  if (htmlParts.length === 0) return { css: '', body: '' };

  return {
    css: `
/* 裸文本兜底样式 — editorial 风格，跟随品牌包 tokens */
.forge-free-text {
  margin: 24px 0;
  font-family: var(--sans, system-ui, sans-serif);
  font-size: 15px;
  color: var(--gray-700, #3D3D3A);
  line-height: 1.65;
}
.forge-free-text h1 {
  font-family: var(--serif, Georgia, serif);
  font-size: 34px;
  font-weight: 500;
  color: var(--slate, #141413);
  margin: 0 0 16px;
  letter-spacing: -0.01em;
}
.forge-free-text h2 {
  font-family: var(--serif, Georgia, serif);
  font-size: 22px;
  font-weight: 500;
  color: var(--slate, #141413);
  margin: 32px 0 10px;
}
.forge-free-text h3 {
  font-family: var(--sans, system-ui, sans-serif);
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--gray-500, #87867F);
  margin: 24px 0 8px;
}
.forge-free-text p { margin: 0 0 14px; }
.forge-free-text p:last-child { margin-bottom: 0; }
.forge-free-text ul, .forge-free-text ol { padding-left: 24px; margin: 0 0 14px; }
.forge-free-text li { margin-bottom: 6px; line-height: 1.6; }
.forge-free-text strong { color: var(--slate, #141413); font-weight: 600; }
.forge-free-text em { color: var(--gray-700, #3D3D3A); }
.forge-free-text code {
  font-family: var(--mono, monospace);
  font-size: 12.5px;
  background: var(--gray-100, #F0EEE6);
  border: 1px solid var(--gray-300, #D1CFC5);
  padding: 1px 5px;
  border-radius: 4px;
  color: var(--slate, #141413);
}
.forge-free-text pre {
  background: var(--slate, #141413);
  color: var(--ivory, #FAF9F5);
  font-family: var(--mono, monospace);
  font-size: 13px;
  line-height: 1.7;
  border-radius: var(--radius-panel, 10px);
  padding: 16px 20px;
  overflow-x: auto;
  margin: 16px 0;
}
.forge-free-text pre code {
  background: transparent;
  border: none;
  padding: 0;
  color: inherit;
  font-size: inherit;
}
.forge-free-text blockquote {
  border-left: 3px solid var(--oat, #E3DACC);
  padding-left: 18px;
  color: var(--gray-500, #87867F);
  margin: 16px 0;
  font-style: italic;
}
.forge-free-text hr {
  border: none;
  border-top: 1px solid var(--gray-300, #D1CFC5);
  margin: 28px 0;
}
.forge-free-text table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid var(--gray-300, #D1CFC5);
  border-radius: var(--radius-panel, 10px);
  overflow: hidden;
  background: var(--white, #fff);
  margin: 16px 0;
  font-size: 14px;
}
.forge-free-text th {
  text-align: left;
  padding: 10px 16px;
  background: var(--gray-100, #F0EEE6);
  border-bottom: 1px solid var(--gray-300, #D1CFC5);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gray-500, #87867F);
}
.forge-free-text td {
  padding: 10px 16px;
  border-bottom: 1px solid var(--gray-100, #F0EEE6);
}
.forge-free-text tr:last-child td { border-bottom: none; }
.forge-free-text tr:hover { background: var(--ivory, #FAF9F5); }`.trim(),
    body: htmlParts.join('\n'),
  };
}

// 保留 extractSlotsFromMd 以便未来 inline rule plugin 可能需要（目前不直接用）
void extractSlotsFromMd;

/**
 * 把页宽转成 full-bleed 段 padding 计算需要的"页宽一半"值
 */
function computePageHalf(pageWidth: string): string {
  const m = pageWidth.match(/^(\d+(?:\.\d+)?)(px|rem|em|vw|vh|%|ch)$/i);
  if (!m) return '0px';
  const n = parseFloat(m[1]!);
  const unit = m[2]!.toLowerCase();
  if (unit === '%') return `${(n / 2).toFixed(2)}%`;
  return `${(n / 2).toFixed(2)}${unit}`;
}

/**
 * 在组件 HTML 上叠加源码行号
 * 机制：匹配 `data-slot="name"`，追加 `data-src-line="<line>"` 属性
 */
function annotateSourceLines(
  html: string,
  slotLines?: Record<string, number>,
): string {
  if (!slotLines) return html;
  return html.replace(
    /data-slot="([\w-]+)"/g,
    (match, name: string) => {
      const line = slotLines[name];
      if (!line) return match;
      return `${match} data-src-line="${line}"`;
    },
  );
}

/**
 * 在组件根元素上注入元信息属性：
 *   - data-forge-component-id：组件 id（用于 PropertyPanel 查找定义）
 *   - data-forge-use-line：@use 指令所在 MD 行号（用于定位 / 改 variant）
 *
 * 当根元素已有 data-section（forge.md 组件特征）时才注入，避免污染 layout 组件等。
 */
function injectRootMeta(
  html: string,
  componentId: string,
  variant?: string,
  useLine?: number,
): string {
  if (useLine === undefined && !variant) return html;
  // 只对第一处含 data-section 的开标签注入
  return html.replace(
    /^(\s*<[a-zA-Z][^>]*?\sdata-section="[^"]+")([^>]*?>)/,
    (_match, head: string, tail: string) => {
      let extra = ` data-forge-component-id="${componentId}"`;
      if (useLine !== undefined) extra += ` data-forge-use-line="${useLine}"`;
      if (variant) extra += ` data-forge-variant-current="${variant}"`;
      return `${head}${extra}${tail}`;
    },
  );
}

/**
 * 精简导出：去掉所有"编辑器辅助属性"
 * - data-src-line  (点击定位用)
 * - data-md-checkbox (checkbox 同步用)
 * - contenteditable / data-editable (编辑态)
 * - data-slot / data-slot-type / data-section (slot-sync 反向同步用)
 *   → 保留 data-slot 因为未来可能用于 A11y；只去掉 editor 专用的
 */
function stripEditorAttrs(html: string): string {
  return html
    .replace(/\s+data-src-line="[^"]*"/g, '')
    .replace(/\s+data-md-checkbox="[^"]*"/g, '')
    .replace(/\s+contenteditable="[^"]*"/g, '')
    .replace(/\s+data-editable="[^"]*"/g, '')
    .replace(/\s+data-forge-component-id="[^"]*"/g, '')
    .replace(/\s+data-forge-use-line="[^"]*"/g, '')
    .replace(/\s+data-forge-variant-current="[^"]*"/g, '')
    // 把交互 checkbox 的 cursor:pointer 去掉（visual-only）
    .replace(/cursor:pointer;?/g, '');
}

/**
 * 把 user trust 组件包进 sandbox iframe
 *
 * 隔离原则：
 *   - HTML / CSS / JS 全部塞进 iframe srcdoc
 *   - sandbox="allow-scripts"：允许 JS 但不能访问父文档 DOM、cookie、localStorage
 *   - 通过 postMessage 与父文档桥接 forge.api（emit/on）
 *   - 子 frame 通过 ResizeObserver + postMessage 报告内容高度，父文档调整 iframe 高度
 *   - SHARED_TOKENS_CSS 复制到 iframe（CSS 变量无法跨 frame 继承）
 */
function wrapUserInIframe(
  componentHtml: string,
  componentId: string,
  componentCss: string,
  variant?: string,
): string {
  const userScript = FORGE_RUNTIME_SCRIPTS.find((s) => s.id === componentId && s.trust === 'user');
  // 没有 mount JS 的 user 组件直接渲染（CSS 隔离已经够）
  if (!userScript) return componentHtml;

  const escAttr = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

  const childRuntime = `<script>
(function(){
  var compEl = document.querySelector('[data-forge-component-id]');
  if (!compEl) return;
  var componentId = ${JSON.stringify(componentId)};
  var variant = ${JSON.stringify(variant || '')};

  var api = {
    emit: function(event, payload){
      try { parent.postMessage({ type: 'forge:user-emit', componentId: componentId, variant: variant, event: event, payload: payload }, '*'); } catch(_){}
    },
    on: function(event, handler){
      var listener = function(e){
        var d = e.data;
        if (!d || d.type !== 'forge:user-host-event') return;
        if (d.targetId !== componentId) return;
        if (d.event !== event) return;
        handler(d.payload);
      };
      window.addEventListener('message', listener);
      return function(){ window.removeEventListener('message', listener); };
    },
    el: compEl,
  };

  ${userScript.js.replace(/^\s*export\s+/m, '')}
  if (typeof mount === 'function') {
    try { mount(compEl, api); } catch(err){ console.error('[forge user mount]', err); }
  }

  function reportHeight(){
    var h = document.documentElement.scrollHeight;
    parent.postMessage({ type: 'forge:user-resize', componentId: componentId, height: h }, '*');
  }
  reportHeight();
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(reportHeight).observe(document.documentElement);
  }
  setTimeout(reportHeight, 120);
})();
</script>`;

  const iframeDoc = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
${SHARED_TOKENS_CSS}
html, body { background: transparent; padding: 0; margin: 0; overflow: hidden; }
${componentCss}
</style>
</head>
<body>
${componentHtml}
${childRuntime}
</body>
</html>`;

  return `<iframe class="forge-user-frame" sandbox="allow-scripts" data-forge-user-frame="${componentId}" style="display:block; width:100%; border:none; min-height:60px;" srcdoc="${escAttr(iframeDoc)}"></iframe>`;
}

// ===== Iframe 交互脚本 =====

/**
 * 把所有 forge 组件的 mount JS 注入到预览页运行时
 *
 * 运行模式（按 trust 字段）：
 * - builtin（默认）: 直接在预览页主文档运行 → 0ms 通信延迟
 * - user        : 在 sandboxed iframe 中运行 → 强隔离（待实现，预留扩展点）
 *
 * forge.api 提供给 mount 函数的能力：
 *   - emit(eventName, payload): 向编辑器宿主发送事件（如 slot 内容变更）
 *   - on(eventName, handler):    监听 MD 端的反向事件（如内容更新触发 re-mount）
 */
function buildInteractionScript(): string {
  // 仅注入 builtin trust 组件（user 组件 → iframe，未来再做）
  const builtinScripts = FORGE_RUNTIME_SCRIPTS.filter((s) => s.trust === 'builtin');

  // 把 ESM `export function mount` 转换为对象字面量条目：'id': function(el, api) {...}
  // 简单做法：把 export 关键字去掉，包装为命名函数表达式注册到 forgeMounts
  const mountRegistrations = builtinScripts
    .map((s) => {
      // 去掉 export 关键字、确保是 function mount(...) 形式
      const body = s.js.replace(/^\s*export\s+/m, '');
      return `(function () {
  ${body}
  if (typeof mount === 'function') window.__forgeMounts['${s.id}'] = mount;
})();`;
    })
    .join('\n');

  return `<script>
(function () {
  // ============================================================
  // forge runtime（统一交互基础设施）
  // ============================================================
  // 设计目标：
  // 1) 集中事件分发：组件之间、组件与宿主的所有 click/change/postMessage 走统一通道
  // 2) 集中跳转决策：shouldJumpToSource 决定是否触发"定位到源码"，避免和组件交互冲突
  // 3) 状态持久化：iframe 在 markdown 变化时会被 srcdoc 重置，组件交互状态（折叠、active tab、
  //    排序方向等）需要在重 mount 时恢复 → 走 parent 内存桥（forge:state-pull/push）
  // 4) 工具方法：copy / postToParent / 等
  //
  // 这个对象仅在 builtin 预览页存在；user trust 的 iframe 用的是各自独立的 child runtime。
  // ============================================================

  window.__forgeMounts = window.__forgeMounts || {};

  // ----- 跳转决策：哪些点击要触发"跳转到源码行"，哪些要让组件交互独占 -----
  function shouldJumpToSource(target) {
    if (!target || target.nodeType !== 1) return false;
    var el = target;
    // 显式标记：组件作者可以加 data-no-jump 关掉这一支 DOM 子树的定位
    if (el.closest && el.closest('[data-no-jump]')) return false;
    var tag = (el.tagName || '').toLowerCase();
    var type = (el.getAttribute('type') || '').toLowerCase();
    var role = (el.getAttribute('role') || '').toLowerCase();
    // 表单类原生交互
    if (tag === 'input' || tag === 'button' || tag === 'select' || tag === 'textarea') return false;
    if (tag === 'a' && el.getAttribute('href')) return false;
    // ARIA 角色
    if (role === 'button' || role === 'link' || role === 'tab' || role === 'switch' ||
        role === 'menuitem' || role === 'checkbox' || role === 'radio') return false;
    if (type === 'checkbox' || type === 'radio') return false;
    // details/summary 原生折叠
    if (tag === 'summary') return false;
    // 父链上是 summary（用户可能点了 summary 内的 span）
    if (el.closest && el.closest('summary')) return false;
    return true;
  }

  // ----- 事件总线 -----
  var listenersByType = {};
  function on(type, handler) {
    (listenersByType[type] = listenersByType[type] || []).push(handler);
    return function off() {
      var arr = listenersByType[type] || [];
      var i = arr.indexOf(handler);
      if (i >= 0) arr.splice(i, 1);
    };
  }
  function emit(type, payload) {
    var arr = listenersByType[type] || [];
    for (var i = 0; i < arr.length; i++) {
      try { arr[i](payload); } catch (err) { console.error('[forge] listener error:', type, err); }
    }
  }
  function postToParent(type, data) {
    try {
      var msg = Object.assign ? Object.assign({ type: type }, data || {}) : (function(){
        var m = { type: type };
        if (data) for (var k in data) if (Object.prototype.hasOwnProperty.call(data, k)) m[k] = data[k];
        return m;
      })();
      window.parent && window.parent.postMessage(msg, '*');
    } catch (_) {}
  }

  // ----- 状态持久化（跨 srcdoc 重载） -----
  // 机制：iframe 内本地有一份 cache；每次 set 都同步 push 到 parent；
  // 启动时主动 pull 一次（parent 回 forge:state-snapshot），合并到本地。
  var stateCache = {};
  function stateSet(key, val) {
    stateCache[key] = val;
    postToParent('forge:state-push', { key: key, value: val });
  }
  function stateGet(key, fallback) {
    return Object.prototype.hasOwnProperty.call(stateCache, key) ? stateCache[key] : fallback;
  }
  function stateRequestSnapshot(cb) {
    var done = false;
    function listener(e) {
      var d = e.data;
      if (!d || d.type !== 'forge:state-snapshot') return;
      if (d.snapshot && typeof d.snapshot === 'object') {
        for (var k in d.snapshot) {
          if (Object.prototype.hasOwnProperty.call(d.snapshot, k)) stateCache[k] = d.snapshot[k];
        }
      }
      done = true;
      window.removeEventListener('message', listener);
      cb && cb(stateCache);
    }
    window.addEventListener('message', listener);
    postToParent('forge:state-pull', {});
    // 50ms 兜底（parent 没响应也别永远卡着）
    setTimeout(function(){ if (!done) { window.removeEventListener('message', listener); cb && cb(stateCache); } }, 80);
  }

  // ----- 工具：复制到剪贴板 -----
  function copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(function(){ return true; }, function(){ return fallbackCopy(text); });
      }
    } catch (_) {}
    return Promise.resolve(fallbackCopy(text));
  }
  function fallbackCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (_) { return false; }
  }

  // ----- 暴露 forge 命名空间 -----
  window.forge = {
    runtime: {
      on: on,
      off: function(type, handler){
        var arr = listenersByType[type] || [];
        var i = arr.indexOf(handler);
        if (i >= 0) arr.splice(i, 1);
      },
      emit: emit,
      postToParent: postToParent,
      shouldJumpToSource: shouldJumpToSource,
      copy: copyToClipboard,
      state: { get: stateGet, set: stateSet },
    },
  };

  // ----- 单组件 mount 时拿到的 api（每个组件独立闭包） -----
  function makeApi(componentId, variant, el) {
    var stateKeyPrefix = 'c:' + componentId + ':' + (variant || '') + ':';
    return {
      el: el,
      runtime: window.forge.runtime,
      // 兼容老 api：emit 仍是发到 parent 的 'forge:component-event'
      emit: function (event, payload) {
        postToParent('forge:component-event', {
          componentId: componentId, variant: variant, event: event, payload: payload,
        });
      },
      on: function (event, handler) {
        var listener = function (e) {
          var d = e.data;
          if (!d || d.type !== 'forge:host-event') return;
          if (d.targetId !== componentId) return;
          if (d.event !== event) return;
          handler(d.payload);
        };
        window.addEventListener('message', listener);
        return function () { window.removeEventListener('message', listener); };
      },
      // 组件级状态（自动加前缀，避免不同组件相互污染）
      state: {
        get: function(k, fb){ return stateGet(stateKeyPrefix + k, fb); },
        set: function(k, v){ stateSet(stateKeyPrefix + k, v); },
      },
    };
  }

  // ----- mountAll -----
  function mountAll(root) {
    var scope = root || document;
    var nodes = scope.querySelectorAll('[data-forge-id]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.__forgeMounted) continue;
      var id = el.getAttribute('data-forge-id');
      var variant = el.getAttribute('data-forge-variant') || '';
      var fn = window.__forgeMounts[id];
      if (typeof fn !== 'function') continue;
      try {
        fn(el, makeApi(id, variant, el));
        el.__forgeMounted = true;
      } catch (err) {
        console.error('[forge] mount failed:', id, err);
      }
    }
  }

  // ===== 注册所有 builtin 组件的 mount =====
${mountRegistrations}

  // ===== 顶层 change：保留 checkbox 回写 MD =====
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (!t || t.type !== 'checkbox' || t.getAttribute('data-md-checkbox') !== '1') return;
    var li = t.closest('li');
    if (!li) return;
    var clone = li.cloneNode(true);
    clone.querySelectorAll('input[type="checkbox"]').forEach(function (n) { n.remove(); });
    var text = (clone.textContent || '').trim();
    if (!text) return;
    postToParent('forge:checkbox-toggle', { checked: !!t.checked, text: text });
  });

  // ===== 顶层 click：定位跳转 + 组件选中（统一走 shouldJumpToSource） =====
  document.addEventListener('click', function (e) {
    if (!shouldJumpToSource(e.target)) return;
    var el = e.target;
    var jumped = false;
    var componentEl = null;
    while (el && el !== document.body) {
      if (!componentEl && el.getAttribute && el.getAttribute('data-forge-component-id')) {
        componentEl = el;
      }
      if (!jumped) {
        var line = el.getAttribute && el.getAttribute('data-src-line');
        if (line) {
          postToParent('forge:jump-to-line', { line: parseInt(line, 10), col: 1 });
          jumped = true;
        }
      }
      el = el.parentElement;
    }
    if (componentEl) {
      var prev = document.querySelectorAll('.forge-selected');
      for (var i = 0; i < prev.length; i++) prev[i].classList.remove('forge-selected');
      componentEl.classList.add('forge-selected');
      postToParent('forge:select-component', {
        componentId: componentEl.getAttribute('data-forge-component-id'),
        variant: componentEl.getAttribute('data-forge-variant-current') || componentEl.getAttribute('data-forge-variant') || '',
        useLine: parseInt(componentEl.getAttribute('data-forge-use-line') || '0', 10) || null,
      });
      if (!jumped) {
        var ul = componentEl.getAttribute('data-forge-use-line');
        if (ul) postToParent('forge:jump-to-line', { line: parseInt(ul, 10), col: 1 });
      }
    } else {
      var prev2 = document.querySelectorAll('.forge-selected');
      for (var j = 0; j < prev2.length; j++) prev2[j].classList.remove('forge-selected');
      postToParent('forge:select-component', { componentId: null });
    }
  });

  // ===== 顶层 input：contenteditable → MD =====
  document.addEventListener('input', function (e) {
    var el = e.target;
    if (!el || !el.getAttribute) return;
    var line = el.getAttribute('data-src-line');
    var slot = el.getAttribute('data-slot');
    if (!line || !slot) return;
    postToParent('forge:slot-edit', {
      slot: slot, line: parseInt(line, 10), text: (el.textContent || '').trim(),
    });
  }, true);

  // ===== 启动：先拉一次 state 快照，再 mountAll =====
  function start() {
    stateRequestSnapshot(function () {
      mountAll();
      restoreDetailsState();
      bindDetailsTracking();
      emit('forge:after-mount-all', {});
    });
  }

  // ----- 原生 details/summary 折叠状态持久化 -----
  // 任意 <details> 都自动获得"刷新后保留展开状态"能力；
  // key = "details:" + 在文档中的索引（按 DOM 顺序）
  function detailsKey(detailsEl) {
    var all = document.querySelectorAll('details');
    for (var i = 0; i < all.length; i++) if (all[i] === detailsEl) return 'details:' + i;
    return null;
  }
  function restoreDetailsState() {
    var all = document.querySelectorAll('details');
    for (var i = 0; i < all.length; i++) {
      var key = 'details:' + i;
      var saved = stateGet(key, undefined);
      if (saved === true) all[i].setAttribute('open', '');
      else if (saved === false) all[i].removeAttribute('open');
    }
  }
  function bindDetailsTracking() {
    document.addEventListener('toggle', function (e) {
      var t = e.target;
      if (!t || t.tagName !== 'DETAILS') return;
      var key = detailsKey(t);
      if (key) stateSet(key, !!t.open);
    }, true);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
  window.__forgeMountAll = mountAll;

  // ===== user 组件 iframe 桥接（不变） =====
  window.addEventListener('message', function(e){
    var d = e.data;
    if (!d) return;
    if (d.type === 'forge:user-resize' && d.componentId && typeof d.height === 'number') {
      var frames = document.querySelectorAll('iframe[data-forge-user-frame="' + d.componentId + '"]');
      for (var i = 0; i < frames.length; i++) {
        if (frames[i].contentWindow === e.source || frames.length === 1) {
          frames[i].style.height = (d.height + 4) + 'px';
        }
      }
    } else if (d.type === 'forge:user-emit') {
      postToParent('forge:component-event', {
        componentId: d.componentId, variant: d.variant, event: d.event, payload: d.payload,
      });
    }
  });
})();
</script>`;
}
