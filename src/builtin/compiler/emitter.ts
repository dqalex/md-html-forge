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
import { buildThemesCss } from '../themes';
import { SHARED_TOKENS_CSS } from '../components/shared-tokens';
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
      const html = comp.html(slots);
      if (html) parts.push(annotateSourceLines(html, plan.slotLines));
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
          { componentId: item.childId, slotValues: item.slotValues },
          childComp,
        );
        const childHtml = childComp.html(childSlots);
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

  // 5. 孤儿 slot
  const orphans = renderOrphans(input.orphanSlotValues);

  // 6. 解析 page 配置 + 输出模式
  const pageConfig: PageConfig = env.page
    ?? (env.pageWidth ? { width: `${env.pageWidth}px`, band: 'contained' } : DEFAULT_PAGE_CONFIG);
  const mode = env.mode ?? 'preview';

  // 7. CSS 拼装
  const themes: ThemeDef[] = input.usedThemeIds
    .map(id => env.themeMap.get(id))
    .filter((t): t is ThemeDef => !!t);
  const themesCss = buildThemesCss(themes, pageConfig.band);

  // 先拼内容 HTML 以便按需注入 diagram CSS
  const bodyInner = `${sectionHtmls.join('\n\n')}\n${orphans.body}`;
  const diagramCss = buildDiagramCss(bodyInner);

  const allCss = [SHARED_TOKENS_CSS, ...usedCss.values(), themesCss, diagramCss]
    .filter(Boolean)
    .join('\n\n');

  const pageHalfCss = computePageHalf(pageConfig.width);

  // standalone 模式：不注入交互脚本、清洗编辑用属性
  const finalBodyInner = mode === 'standalone'
    ? stripEditorAttrs(bodyInner)
    : bodyInner;

  const scriptTag = mode === 'standalone' ? '' : INTERACTION_SCRIPT;

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
${orphans.css}
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
.forge-orphan {
  margin-top: 24px; padding: 16px 20px;
  background: rgba(217,119,87,0.04);
  border: 1px dashed rgba(217,119,87,0.35);
  border-radius: 10px;
}
.forge-orphan-label {
  font-family: var(--mono); font-size: 10px;
  text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--clay); margin-bottom: 6px; display: block;
}
.forge-orphan-body { font-size: 14px; color: var(--gray-700); line-height: 1.6; }
`.trim(),
    body: sections.join('\n'),
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
    // 把交互 checkbox 的 cursor:pointer 去掉（visual-only）
    .replace(/cursor:pointer;?/g, '');
}

// ===== Iframe 交互脚本 =====

const INTERACTION_SCRIPT = `<script>
(function () {
  // checkbox 勾选 → 回写 MD
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (!t || t.type !== 'checkbox' || t.getAttribute('data-md-checkbox') !== '1') return;
    var li = t.closest('li');
    if (!li) return;
    var clone = li.cloneNode(true);
    clone.querySelectorAll('input[type="checkbox"]').forEach(function (n) { n.remove(); });
    var text = (clone.textContent || '').trim();
    if (!text) return;
    window.parent.postMessage({
      type: 'forge:checkbox-toggle',
      checked: !!t.checked,
      text: text,
    }, '*');
  });

  // 点击 slot 元素 → 跳转到源码对应行
  document.addEventListener('click', function (e) {
    var el = e.target;
    while (el && el !== document.body) {
      var line = el.getAttribute && el.getAttribute('data-src-line');
      if (line) {
        window.parent.postMessage({
          type: 'forge:jump-to-line',
          line: parseInt(line, 10),
          col: 1,
        }, '*');
        return;
      }
      el = el.parentElement;
    }
  });
})();
</script>`;
