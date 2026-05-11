/**
 * 槽位同步核心库
 *
 * 移植自 teamclaw/src/shared/lib/slot-sync.ts (GrowthPilot useSync.js)
 *
 * 负责 MD ↔ HTML 的双向槽位同步：
 * - MD 中使用 <!-- @slot:name -->...<!-- @/slot --> 标记槽位
 * - HTML 中使用 data-slot="name" data-slot-type="text|richtext|image" 标记槽位
 *
 * 适配 TRFP 的变更：
 * - 移除 linkedom Node.js polyfill（仅浏览器环境使用）
 * - 移除 icon-render 硬依赖，改为可选 injectable
 * - DOMPurify 按需引入
 */

import DOMPurify from 'dompurify';
import type { SlotDef, SlotType, SlotValue, SlotSyncResult } from './types';

// ===== 可选依赖注入 =====

/** 图标渲染钩子：替换 <i data-lucide="xxx"></i> 为 SVG */
let _renderIconsInHtml: ((html: string) => string) | null = null;

/** 设置图标渲染器（由宿主应用注入，如需要） */
export function setIconRenderer(renderer: (html: string) => string): void {
  _renderIconsInHtml = renderer;
}

// ===== 常量 =====

// MD 槽位标记：<!-- @slot:name -->content<!-- @/slot -->
// 使用非全局正则 + matchAll（避免全局正则 lastIndex 不重置）
const MD_SLOT_PATTERN = /<!-- @slot:(\w+) -->([\s\S]*?)<!-- @\/slot -->/g;

// 备用模式：无结束标记时，从 @slot:name 到下一个 @slot 或文档末尾
const MD_SLOT_PATTERN_OPEN = /<!-- @slot:(\w+) -->\n?([\s\S]*?)(?=<!-- @slot:\w+ -->|$)/g;

// DOMPurify 白名单标签（richtext 允许的 HTML 标签）
const ALLOWED_TAGS = [
  'strong', 'em', 'b', 'i', 'a', 'br', 'p', 'ul', 'ol', 'li', 'code', 'pre', 'span',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'hr', 'del',
  'table', 'thead', 'tbody', 'tr', 'td', 'th',
  'div', 'img', 'mark', 'input', 'section', 'article', 'aside', 'figure', 'figcaption',
  'label', 'button',
  // SVG：给图标 / 自定义 logo / 插图 完整放行
  'svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse',
  'g', 'defs', 'use', 'title', 'desc', 'text', 'tspan', 'textPath',
  'marker', 'symbol', 'clipPath', 'mask', 'pattern', 'filter',
  'linearGradient', 'radialGradient', 'stop', 'foreignObject',
  'animate', 'animateTransform', 'animateMotion', 'mpath', 'set',
];
const ALLOWED_ATTRS = [
  'href', 'target', 'rel', 'class', 'id', 'data-diagram', 'data-value',
  'src', 'alt', 'style', 'type', 'checked', 'disabled', 'role', 'tabindex',
  'name', 'value', 'placeholder', 'for',
  // SVG 常用属性（尽量全）
  'data-lucide', 'xmlns', 'xmlns:xlink', 'xlink:href',
  'width', 'height', 'viewBox', 'preserveAspectRatio',
  'fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-opacity',
  'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'stroke-dashoffset',
  'opacity', 'visibility', 'display',
  'd', 'cx', 'cy', 'cz', 'r', 'rx', 'ry',
  'x', 'y', 'x1', 'y1', 'x2', 'y2', 'dx', 'dy',
  'points', 'transform', 'transform-origin',
  'text-anchor', 'dominant-baseline', 'alignment-baseline',
  'font-family', 'font-size', 'font-weight', 'font-style', 'letter-spacing',
  'marker-start', 'marker-mid', 'marker-end', 'markerWidth', 'markerHeight',
  'refX', 'refY', 'orient', 'gradientUnits', 'gradientTransform',
  'offset', 'stop-color', 'stop-opacity',
  'clip-path', 'mask', 'filter',
  'begin', 'dur', 'from', 'to', 'values', 'keyTimes', 'keySplines',
  'attributeName', 'attributeType', 'repeatCount', 'fill-timing',
  'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-hidden',
  // 交互相关
  'data-mdslot', 'data-mdsrc',
];

/**
 * 被识别为"块级 HTML/SVG"的顶层标签白名单。
 * 出现在 slot 开头/顶行时，simpleMdToHtml 会把它当作整体块原样透传，
 * 由下游 sanitizeHtml 按 ALLOWED_TAGS / ALLOWED_ATTRS 清洗。
 *
 * 用户场景：
 *   - 品牌 logo SVG
 *   - 自定义插图 / 示意图
 *   - 少量自定义 HTML 结构（如 figure、aside）
 */
const RAW_HTML_BLOCK_TAGS = new Set([
  'svg', 'figure', 'aside', 'section', 'article',
  'div', 'details', 'summary',
]);

// ===== MD → Slot 提取 =====

/**
 * 从 MD 内容中提取所有槽位值
 * 支持两种格式：
 * 1. 完整格式：<!-- @slot:name -->content<!-- @/slot -->
 * 2. 简化格式：<!-- @slot:name -->content（到下一个 slot 或文档末尾）
 */
export function extractSlotsFromMd(
  mdContent: string,
  slotDefs: Record<string, SlotDef>,
): Map<string, SlotValue> {
  const slots = new Map<string, SlotValue>();

  const addSlot = (name: string, content: string) => {
    const def = slotDefs[name];
    const type = def?.type || 'content';
    if (slots.has(name)) {
      const existing = slots.get(name)!;
      if (Array.isArray(existing.content)) existing.content.push(content);
      else existing.content = [existing.content as string, content];
    } else {
      slots.set(name, { name, type, content });
    }
  };

  // 先尝试完整格式（有结束标记）
  const closedMatches = [...mdContent.matchAll(MD_SLOT_PATTERN)];

  if (closedMatches.length > 0) {
    for (const match of closedMatches) addSlot(match[1]!, match[2]!.trim());
  } else {
    const openMatches = mdContent.matchAll(MD_SLOT_PATTERN_OPEN);
    for (const match of openMatches) addSlot(match[1]!, match[2]!.trim());
  }

  // 追加属性式 slot：<!-- @slot key="v" other='w' flag -->  (自闭合，无 @/slot)
  // 正则匹配整条指令，再用小解析器拆属性
  const attrSlotRe = /<!--\s*@slot\s+([^:][^\n]*?)\s*-->/g;
  let am: RegExpExecArray | null;
  while ((am = attrSlotRe.exec(mdContent)) !== null) {
    const body = am[1]!;
    for (const [k, v] of extractKeyValues(body)) {
      if (v) addSlot(k, v);
    }
  }

  return slots;
}

/** 属性解析小工具：key="v" key='v' key=bare，只返回键值对 */
function extractKeyValues(input: string): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  const re = /([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(input)) !== null) {
    const key = m[1]!;
    const val = m[2] ?? m[3] ?? m[4] ?? '';
    out.push([key, val]);
  }
  return out;
}

/**
 * 更新 MD 中指定槽位的内容
 */
export function updateMdSlot(
  mdContent: string,
  slotName: string,
  newContent: string,
): string {
  // 先尝试完整格式
  const closedPattern = new RegExp(
    `(<!-- @slot:${escapeRegex(slotName)} -->)[\\s\\S]*?(<!-- @\\/slot -->)`,
    'g',
  );
  if (closedPattern.test(mdContent)) {
    closedPattern.lastIndex = 0;
    return mdContent.replace(closedPattern, `$1\n${newContent}\n$2`);
  }

  // 降级：无结束标记格式
  const openPattern = new RegExp(
    `(<!-- @slot:${escapeRegex(slotName)} -->)\\n?[\\s\\S]*?(?=<!-- @slot:\\w+ -->|$)`,
    'g',
  );
  return mdContent.replace(openPattern, `$1\n${newContent}\n`);
}

/**
 * 批量更新 MD 中的多个槽位
 */
export function updateMdSlots(
  mdContent: string,
  updates: Record<string, string>,
): string {
  let result = mdContent;
  for (const [name, content] of Object.entries(updates)) {
    result = updateMdSlot(result, name, content);
  }
  return result;
}

// ===== HTML → Slot 提取 =====

/**
 * 从 HTML 文档中提取所有槽位值
 */
export function extractSlotsFromHtml(
  htmlContent: string,
  slotDefs: Record<string, SlotDef>,
): Map<string, SlotValue> {
  const slots = new Map<string, SlotValue>();

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const elements = doc.querySelectorAll('[data-slot]');

  elements.forEach((el) => {
    const name = el.getAttribute('data-slot') || '';
    const typeAttr = el.getAttribute('data-slot-type') as SlotType | null;
    const def = slotDefs[name];
    const type = typeAttr || def?.type || 'content';

    let content = '';
    switch (type) {
      case 'content':
      case 'richtext':
      case 'text':
        content = htmlToSimpleMd(el.innerHTML);
        break;
      case 'image': {
        const img = el.querySelector('img');
        content = img?.getAttribute('src') || el.getAttribute('data-src') || '';
        break;
      }
      case 'data':
        content = el.getAttribute('data-value') || el.textContent || '';
        break;
    }

    slots.set(name, { name, type, content: content.trim() });
  });

  return slots;
}

/**
 * MD 渲染的 slot 容器内 HTML 标签的默认样式表
 */
export const MD_RICHTEXT_STYLES = `
[data-slot-type="content"] h1, [data-slot-type="content"] h2,
[data-slot-type="content"] h3, [data-slot-type="content"] h4,
[data-slot-type="content"] h5, [data-slot-type="content"] h6,
[data-slot-type="richtext"] h1, [data-slot-type="richtext"] h2,
[data-slot-type="richtext"] h3, [data-slot-type="richtext"] h4,
[data-slot-type="richtext"] h5, [data-slot-type="richtext"] h6 {
  margin: 0.6em 0 0.3em; font-weight: 600; line-height: 1.4;
}
[data-slot-type="content"] h1, [data-slot-type="richtext"] h1 { font-size: 1.4em; }
[data-slot-type="content"] h2, [data-slot-type="richtext"] h2 { font-size: 1.2em; }
[data-slot-type="content"] h3, [data-slot-type="richtext"] h3 { font-size: 1.1em; }
[data-slot-type="content"] ul, [data-slot-type="content"] ol,
[data-slot-type="richtext"] ul, [data-slot-type="richtext"] ol {
  margin: 0.4em 0; padding-left: 1.6em;
}
[data-slot-type="content"] li, [data-slot-type="richtext"] li {
  margin: 0.15em 0; line-height: 1.7;
}
[data-slot-type="content"] ul, [data-slot-type="richtext"] ul { list-style-type: disc; }
[data-slot-type="content"] ol, [data-slot-type="richtext"] ol { list-style-type: decimal; }
[data-slot-type="content"] blockquote, [data-slot-type="richtext"] blockquote {
  margin: 0.5em 0; padding: 0.4em 1em;
  border-left: 3px solid currentColor; opacity: 0.85;
}
[data-slot-type="content"] hr, [data-slot-type="richtext"] hr {
  border: none; border-top: 1px solid currentColor; opacity: 0.2; margin: 0.8em 0;
}
[data-slot-type="content"] code, [data-slot-type="richtext"] code {
  padding: 0.15em 0.4em; border-radius: 3px;
  background: rgba(0,0,0,0.06); font-size: 0.9em; font-family: 'SF Mono', 'Fira Code', monospace;
}
[data-slot-type="content"] pre, [data-slot-type="richtext"] pre {
  margin: 0.5em 0; padding: 0.8em 1em; border-radius: 6px;
  background: rgba(0,0,0,0.06); overflow-x: auto;
}
[data-slot-type="content"] pre code, [data-slot-type="richtext"] pre code {
  padding: 0; background: none; font-size: 0.85em;
}
[data-slot-type="content"] table, [data-slot-type="richtext"] table {
  width: 100%; border-collapse: collapse; margin: 0.5em 0; font-size: 0.9em;
}
[data-slot-type="content"] th, [data-slot-type="content"] td,
[data-slot-type="richtext"] th, [data-slot-type="richtext"] td {
  padding: 0.4em 0.6em; border: 1px solid rgba(0,0,0,0.1); text-align: left;
}
[data-slot-type="content"] th, [data-slot-type="richtext"] th {
  font-weight: 600; background: rgba(0,0,0,0.03);
}
[data-slot-type="content"] p, [data-slot-type="richtext"] p {
  margin: 0.3em 0; line-height: 1.7;
}
[data-slot-type="content"] a, [data-slot-type="richtext"] a {
  color: inherit; text-decoration: underline; text-underline-offset: 2px;
}
[data-slot-type="content"] del, [data-slot-type="richtext"] del {
  text-decoration: line-through; opacity: 0.6;
}
[data-slot-type="content"] strong, [data-slot-type="richtext"] strong { font-weight: 700; }
[data-slot-type="content"] em, [data-slot-type="richtext"] em { font-style: italic; }
[data-slot-type="content"] mark, [data-slot-type="richtext"] mark {
  background: rgba(255, 213, 79, 0.4); padding: 0.1em 0.2em; border-radius: 2px;
}
[data-slot-type="content"] img, [data-slot-type="richtext"] img {
  max-width: 100%; height: auto; border-radius: 4px; margin: 0.4em 0;
}
[data-slot-type="content"] input[type="checkbox"], [data-slot-type="richtext"] input[type="checkbox"] {
  margin-right: 6px; vertical-align: middle; accent-color: #3b82f6;
}
/* === 语义图表样式（flow / compare / steps）=== */
.sd-flow {
  display: flex; flex-direction: column; align-items: center;
  gap: 0; padding: 1.2em 0; margin: 0.8em 0;
}
.sd-flow-node {
  background: rgba(37,99,235,0.08); border: 1.5px solid rgba(37,99,235,0.25);
  border-radius: 8px; padding: 10px 24px; font-size: 0.9em; text-align: center;
  line-height: 1.5; color: inherit; min-width: 100px;
  box-sizing: border-box;
}
.sd-flow-box {
  background: rgba(37,99,235,0.05); border: 2px solid rgba(37,99,235,0.2);
  border-radius: 10px; padding: 14px 20px; font-size: 0.88em;
  text-align: left; max-width: 90%; line-height: 1.7; color: inherit;
}
.sd-flow-arrow {
  font-size: 1.1em; color: rgba(37,99,235,0.4); line-height: 1; padding: 4px 0;
  flex-shrink: 0;
}
.sd-flow-group {
  display: flex; flex-direction: column; align-items: center; gap: 4px; width: 100%;
  padding: 8px 0;
}
.sd-flow-row {
  display: flex; flex-direction: row; flex-wrap: wrap; justify-content: center;
  align-items: stretch; gap: 0;
}
.sd-flow-row .sd-flow-arrow {
  padding: 0 8px; font-size: 1.4em;
  display: flex; align-items: center;
}
.sd-flow-row .sd-flow-node {
  flex: 1 1 0; min-width: 0;
  display: flex; align-items: center; justify-content: center;
  text-align: center; word-break: keep-all;
}
.sd-flow-label {
  font-size: 0.82em; font-weight: 700; color: rgba(37,99,235,0.8);
  padding: 4px 14px; letter-spacing: 0.5px;
  background: rgba(37,99,235,0.06); border-radius: 4px;
  text-transform: uppercase;
}
.sd-status-success { border-color: #22c55e; background: rgba(34,197,94,0.08); }
.sd-status-error { border-color: #ef4444; background: rgba(239,68,68,0.08); }
.sd-status-warn { border-color: #f59e0b; background: rgba(245,158,11,0.08); }
.sd-compare {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px; margin: 0.8em 0;
}
.sd-compare-col {
  border: 1px solid rgba(0,0,0,0.1); border-radius: 10px;
  overflow: hidden; background: rgba(0,0,0,0.02);
}
.sd-compare-col.sd-compare-success { border-color: rgba(34,197,94,0.3); }
.sd-compare-col.sd-compare-error { border-color: rgba(239,68,68,0.3); }
.sd-compare-col.sd-compare-warn { border-color: rgba(245,158,11,0.3); }
.sd-compare-title {
  font-weight: 700; font-size: 0.95em; padding: 10px 16px;
  background: rgba(0,0,0,0.04); border-bottom: 1px solid rgba(0,0,0,0.08);
  text-align: center;
}
.sd-compare-title.sd-status-success { background: rgba(34,197,94,0.1); color: #15803d; }
.sd-compare-title.sd-status-error { background: rgba(239,68,68,0.1); color: #b91c1c; }
.sd-compare-title.sd-status-warn { background: rgba(245,158,11,0.1); color: #b45309; }
.sd-compare-item {
  padding: 6px 16px; font-size: 0.88em; line-height: 1.6;
  border-bottom: 1px solid rgba(0,0,0,0.04);
}
.sd-compare-item:last-child { border-bottom: none; }
.sd-compare-item.sd-status-success { background: rgba(34,197,94,0.06); }
.sd-compare-item.sd-status-error { background: rgba(239,68,68,0.06); }
.sd-steps {
  display: flex; align-items: flex-start; gap: 0;
  flex-wrap: wrap; justify-content: center; margin: 0.8em 0; padding: 0.5em 0;
}
.sd-step {
  display: flex; flex-direction: column; align-items: center;
  min-width: 80px; max-width: 160px; text-align: center;
}
.sd-step-num {
  width: 32px; height: 32px; border-radius: 50%; display: flex;
  align-items: center; justify-content: center; font-weight: 700;
  font-size: 0.85em; background: rgba(37,99,235,0.12); color: #2563eb;
  margin-bottom: 6px; flex-shrink: 0;
}
.sd-step-label { font-size: 0.85em; font-weight: 600; line-height: 1.4; }
.sd-step-desc { font-size: 0.78em; color: rgba(0,0,0,0.5); margin-top: 2px; line-height: 1.3; }
.sd-step-arrow {
  display: flex; align-items: center; font-size: 1.2em;
  color: rgba(37,99,235,0.4); padding: 0 8px; margin-top: 8px;
}
`.trim();

/**
 * 将 slot 值注入到 HTML 模板中
 * 保留模板结构，只替换 slot 元素的内容
 *
 * 支持循环区域渲染（data-slot-loop）：
 * - HTML 中用 data-slot-loop 标记循环模板，data-slot-loop-items 声明循环项包含的 slot
 * - MD 中重复使用 slot，系统按 data-slot-loop-items 定义的顺序分组，自动复制 HTML 模板
 */
export function injectSlotsToHtml(
  htmlTemplate: string,
  slots: Map<string, SlotValue>,
  cssTemplate?: string,
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlTemplate, 'text/html');

  let hasMdContent = false;

  // ===== 第一步：处理循环区域（data-slot-loop）=====
  const loopContainers = doc.querySelectorAll('[data-slot-loop]');
  loopContainers.forEach((container) => {
    const loopItemsAttr = container.getAttribute('data-slot-loop-items') || '';
    if (!loopItemsAttr) return;

    const loopItemSlots = loopItemsAttr.split(',').map(s => s.trim()).filter(Boolean);
    if (loopItemSlots.length === 0) return;

    const firstSlot = slots.get(loopItemSlots[0]!);
    if (!firstSlot) return;

    const loopCount = Array.isArray(firstSlot.content) ? firstSlot.content.length : 1;
    if (loopCount <= 1) return;

    const templateEl = container.firstElementChild;
    if (!templateEl) return;

    for (let i = 1; i < loopCount; i++) {
      const clone = templateEl.cloneNode(true) as Element;
      container.appendChild(clone);
    }
  });

  // ===== 第二步：填充 slot 内容（包含循环后复制的元素）=====
  const elements = doc.querySelectorAll('[data-slot]');

  const slotElementsByName = new Map<string, Element[]>();
  elements.forEach((el) => {
    const name = el.getAttribute('data-slot') || '';
    if (!slotElementsByName.has(name)) {
      slotElementsByName.set(name, []);
    }
    slotElementsByName.get(name)!.push(el);
  });

  slotElementsByName.forEach((els, name) => {
    const slot = slots.get(name);
    if (!slot) return;

    const slotContents = Array.isArray(slot.content) ? slot.content : [slot.content];

    els.forEach((el, index) => {
      const content = slotContents[index] !== undefined ? slotContents[index] : null;
      if (content === null) return;

      const type = (el.getAttribute('data-slot-type') as SlotType) || slot.type;

      switch (type) {
        case 'content':
        case 'richtext':
        case 'text':
          hasMdContent = true;
          el.innerHTML = sanitizeHtml(simpleMdToHtml(content));
          break;
        case 'image': {
          const img = el.querySelector('img');
          if (img) {
            img.setAttribute('src', content);
          } else if (content) {
            el.innerHTML = `<img src="${escapeAttr(content)}" alt="" style="width:100%;height:auto;" />`;
          }
          break;
        }
        case 'data':
          el.setAttribute('data-value', content);
          el.textContent = content;
          break;
      }
    });
  });

  // 注入 MD 渲染样式表
  if (hasMdContent) {
    let mdStyleEl = doc.querySelector('style[data-md-styles]');
    if (!mdStyleEl) {
      mdStyleEl = doc.createElement('style');
      mdStyleEl.setAttribute('data-md-styles', 'true');
      doc.head.appendChild(mdStyleEl);
    }
    mdStyleEl.textContent = MD_RICHTEXT_STYLES;
  }

  // 注入自定义 CSS
  if (cssTemplate) {
    let styleEl = doc.querySelector('style[data-studio-css]');
    if (!styleEl) {
      styleEl = doc.createElement('style');
      styleEl.setAttribute('data-studio-css', 'true');
      doc.head.appendChild(styleEl);
    }
    styleEl.textContent = cssTemplate;
  }

  const html = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;

  // 可选图标渲染
  return _renderIconsInHtml ? _renderIconsInHtml(html) : html;
}

// ===== MD ↔ HTML 双向同步 =====

/**
 * 从 MD 内容同步到 HTML：提取 MD 槽位 → 注入到 HTML 模板
 */
export function syncMdToHtml(
  mdContent: string,
  htmlTemplate: string,
  slotDefs: Record<string, SlotDef>,
  cssTemplate?: string,
): SlotSyncResult {
  const errors: string[] = [];
  const slots = extractSlotsFromMd(mdContent, slotDefs);

  for (const [name, def] of Object.entries(slotDefs)) {
    if (!slots.has(name)) {
      errors.push(`MD 中缺少槽位 @slot:${name} (${def.label})`);
    }
  }

  const html = injectSlotsToHtml(htmlTemplate, slots, cssTemplate);
  return { html, slots, errors };
}

/**
 * 从 HTML 内容同步到 MD：提取 HTML 槽位 → 更新 MD 中对应标记
 */
export function syncHtmlToMd(
  htmlContent: string,
  mdContent: string,
  slotDefs: Record<string, SlotDef>,
): { md: string; slots: Map<string, SlotValue>; errors: string[] } {
  const errors: string[] = [];
  const slots = extractSlotsFromHtml(htmlContent, slotDefs);

  const updates: Record<string, string> = {};
  for (const [name, slot] of slots) {
    updates[name] = Array.isArray(slot.content) ? slot.content[0] || '' : slot.content;
  }

  const md = updateMdSlots(mdContent, updates);
  return { md, slots, errors };
}

// ===== 简易 MD ↔ HTML 转换 =====

/**
 * 内联 MD 格式转 HTML（加粗、斜体、删除线、代码、链接）
 *
 * 用于"text 类"slot：只渲染行内 MD 标记，不处理块级（标题、列表、代码块）
 */
export function inlineMdToHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;height:auto;" />')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/(?<!\w)_(.+?)_(?!\w)/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/==(.+?)==/g, '<mark>$1</mark>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/(^|[\s(])((https?:\/\/)[^\s<)]+)/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>')
    .replace(/:lucide:([a-z0-9-]+):/g, '<i data-lucide="$1"></i>');
}

/**
 * MD → HTML（用于 richtext slot，支持常用 Markdown 块级和内联语法）
 *
 * 自实现而非引入 marked/remark，因为只在 slot 注入场景使用，
 * 内容规模小、需配合 DOMPurify 清洗，无需完整解析器的复杂度和体积。
 */
export function simpleMdToHtml(md: string): string {
  if (!md) return '';

  const lines = md.split('\n');
  const html: string[] = [];
  let i = 0;
  // 防御性总迭代上限：以 lines.length * 4 作为合理上限。
  // 即使存在 bug 让游标停滞，也会在合理次数后退出，并把剩余文本作为 fallback 抛出。
  const MAX_ITER = Math.max(1000, lines.length * 4);
  let iter = 0;

  while (i < lines.length) {
    if (++iter > MAX_ITER) {
      // 兜底退出：把剩余行原样输出，避免无限循环
      const rest = lines.slice(i).join('\n').trim();
      if (rest) html.push(`<p>${inlineMdToHtml(rest)}</p>`);
      break;
    }
    const cursorBefore = i;

    const line = lines[i]!;

    if (line.trim() === '') { i++; continue; }

    // HTML/SVG 块透传：用户直接写 <svg>...</svg> 或 <div>...</div> 等块级 HTML
    // 为了支持品牌 logo / 插图 / 自定义容器，原样输出（由后续 sanitizeHtml 做安全清洗）
    const rawBlockOpen = line.match(/^\s*<([a-zA-Z][a-zA-Z0-9-]*)(\s[^>]*)?>/);
    if (rawBlockOpen && RAW_HTML_BLOCK_TAGS.has(rawBlockOpen[1]!.toLowerCase())) {
      const tag = rawBlockOpen[1]!;
      const closeRe = new RegExp(`</${tag}\\s*>`, 'i');
      // 单行自闭合 <tag ... /> 或 <tag ...></tag> 同一行结束
      if (/\/>\s*$/.test(line.trim()) || closeRe.test(line)) {
        html.push(line);
        i++;
        continue;
      }
      // 多行：一直读到闭合标签所在的行
      const blockLines: string[] = [line];
      i++;
      let depth = (line.match(new RegExp(`<${tag}[\\s>]`, 'gi')) || []).length
                - (line.match(closeRe) || []).length;
      while (i < lines.length) {
        const cur = lines[i]!;
        blockLines.push(cur);
        depth += (cur.match(new RegExp(`<${tag}[\\s>]`, 'gi')) || []).length
              -  (cur.match(closeRe) || []).length;
        i++;
        if (depth <= 0) break;
      }
      html.push(blockLines.join('\n'));
      continue;
    }

    // 水平线
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line.trim())) {
      html.push('<hr />');
      i++;
      continue;
    }

    // 标题
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1]!.length;
      html.push(`<h${level}>${inlineMdToHtml(headingMatch[2]!)}</h${level}>`);
      i++;
      continue;
    }

    // 代码块
    if (line.trim().startsWith('```')) {
      const langMatch = line.trim().match(/^```(\w*)/);
      const lang = langMatch?.[1] || '';
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i]!.trim().startsWith('```')) {
        codeLines.push(lines[i]!);
        i++;
      }
      if (i < lines.length) i++;

      if (lang === 'flow') {
        html.push(parseFlowDiagram(codeLines));
      } else if (lang === 'compare') {
        html.push(parseCompareDiagram(codeLines));
      } else if (lang === 'steps') {
        html.push(parseStepsDiagram(codeLines));
      } else {
        const escaped = codeLines.map(l => l.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
        html.push(`<pre><code>${escaped.join('\n')}</code></pre>`);
      }
      continue;
    }

    // 表格
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableRows: string[] = [];
      let isHeader = true;
      while (i < lines.length && lines[i]!.trim().startsWith('|') && lines[i]!.trim().endsWith('|')) {
        const row = lines[i]!.trim();
        // 分隔行：每个单元格只含 -、: 和空白（如 |---|---| 或 |:---:|---:|）
        const cellsRaw = row.slice(1, -1).split('|').map(c => c.trim());
        if (cellsRaw.length > 0 && cellsRaw.every(c => /^:?-{2,}:?$/.test(c))) {
          i++;
          isHeader = false;
          continue;
        }
        const cells = cellsRaw.map(c => inlineMdToHtml(c));
        const tag = isHeader ? 'th' : 'td';
        tableRows.push(`<tr>${cells.map(c => `<${tag}>${c}</${tag}>`).join('')}</tr>`);
        if (isHeader) isHeader = false;
        i++;
      }
      html.push(`<table>${tableRows.join('')}</table>`);
      continue;
    }

    // 引用块
    if (line.trim().startsWith('> ') || line.trim() === '>') {
      const quoteLines: string[] = [];
      while (i < lines.length && (lines[i]!.trim().startsWith('> ') || lines[i]!.trim() === '>')) {
        quoteLines.push(lines[i]!.trim().replace(/^>\s?/, ''));
        i++;
      }
      html.push(`<blockquote>${inlineMdToHtml(quoteLines.join('<br />'))}</blockquote>`);
      continue;
    }

    // 无序列表
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      let hasCheckbox = false;
      while (i < lines.length) {
        if (/^\s*[-*]\s+/.test(lines[i]!)) {
          let itemText = lines[i]!.replace(/^\s*[-*]\s+/, '');
          i++;
          const contLines: string[] = [];
          while (i < lines.length && /^\s+/.test(lines[i]!) && !/^\s*[-*]\s+/.test(lines[i]!)) {
            contLines.push(lines[i]!.trim());
            i++;
          }
          const checkMatch = itemText.match(/^\[([ xX])\]\s+(.*)/);
          if (checkMatch) {
            hasCheckbox = true;
            const checked = (checkMatch[1] ?? '').toLowerCase() === 'x';
            // 保留交互能力：不加 disabled。用 data-md-checkbox 标记给前端 JS 钩子识别
            const checkbox = `<input type="checkbox" ${checked ? 'checked' : ''} data-md-checkbox="1" style="margin-right:6px;vertical-align:middle;cursor:pointer;" />`;
            const content = contLines.length > 0
              ? `${checkbox}${inlineMdToHtml(checkMatch[2] ?? '')}` + `<p>${inlineMdToHtml(contLines.join(' '))}</p>`
              : `${checkbox}${inlineMdToHtml(checkMatch[2] ?? '')}`;
            items.push(content);
          } else {
            const headingInItem = itemText.match(/^(#{1,6})\s+(.+)$/);
            if (headingInItem && contLines.length > 0) {
              const level = (headingInItem[1] ?? '').length;
              items.push(`<h${level}>${inlineMdToHtml(headingInItem[2] ?? '')}</h${level}>\n<p>${inlineMdToHtml(contLines.join(' '))}</p>`);
            } else if (contLines.length > 0) {
              items.push(`${inlineMdToHtml(itemText)}<p>${inlineMdToHtml(contLines.join(' '))}</p>`);
            } else {
              items.push(inlineMdToHtml(itemText));
            }
          }
        } else {
          break;
        }
      }
      const listStyle = hasCheckbox ? ' style="list-style:none;padding-left:0.4em;"' : '';
      html.push(`<ul${listStyle}>${items.map(item => `<li>${item}</li>`).join('')}</ul>`);
      continue;
    }

    // 有序列表
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i]!)) {
        items.push(inlineMdToHtml(lines[i]!.replace(/^\s*\d+\.\s+/, '')));
        i++;
      }
      html.push(`<ol>${items.map(item => `<li>${item}</li>`).join('')}</ol>`);
      continue;
    }

    // 普通段落
    const paraStart = i;
    const paraLines: string[] = [];
    while (i < lines.length && lines[i]!.trim() !== '' &&
      !lines[i]!.trim().startsWith('#') &&
      !lines[i]!.trim().startsWith('```') &&
      !lines[i]!.trim().startsWith('> ') &&
      !lines[i]!.trim().startsWith('|') &&
      !/^\s*[-*]\s+/.test(lines[i]!) &&
      !/^\s*\d+\.\s+/.test(lines[i]!) &&
      !/^(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i]!.trim()) &&
      // 不吞 HTML 块起始行（避免把 <svg ...> 当段落）
      !(() => {
        const m = lines[i]!.match(/^\s*<([a-zA-Z][a-zA-Z0-9-]*)/);
        return !!(m && RAW_HTML_BLOCK_TAGS.has(m[1]!.toLowerCase()));
      })()) {
      paraLines.push(inlineMdToHtml(lines[i]!));
      i++;
    }
    if (paraLines.length > 0) {
      html.push(`<p>${paraLines.join('<br />')}</p>`);
    } else {
      // 当前行同时被所有"块识别"分支拒绝（例如 #4211 这种带 # 但不是标题的内容）
      // 把它当成一行段落输出，避免主循环死循环
      const fallback = inlineMdToHtml(lines[i]!);
      if (fallback.trim()) html.push(`<p>${fallback}</p>`);
      i++;
      // sanity check：确保游标始终在前进
      if (i === paraStart) i = paraStart + 1;
    }

    // 总循环防御：本轮如果 i 没推进则强制 +1，避免任何意外死循环
    if (i === cursorBefore) i = cursorBefore + 1;
  }

  return html.join('\n');
}

/**
 * HTML → MD（从 richtext slot 提取 MD）
 */
export function htmlToSimpleMd(html: string): string {
  if (!html) return '';

  let md = html
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ');

  // 语义图表反向转换
  md = md.replace(/<div[^>]*data-diagram="flow"[^>]*>([\s\S]*?)<\/div>\s*(?=<|$)/gi, (_m, content) => {
    const nodes = content.replace(/<div[^>]*class="sd-flow-arrow"[^>]*>[\s\S]*?<\/div>/gi, '  ▼\n');
    const text = nodes.replace(/<div[^>]*class="sd-flow-[^"]*"[^>]*>([\s\S]*?)<\/div>/gi, (_m2: string, inner: string) => {
      return inner.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim() + '\n';
    });
    return '\n```flow\n' + text.replace(/<[^>]+>/g, '').trim() + '\n```\n';
  });
  md = md.replace(/<div[^>]*data-diagram="compare"[^>]*>([\s\S]*?)<\/div>\s*(?=<|$)/gi, (_m, content) => {
    const text = content.replace(/<div[^>]*class="sd-compare-[^"]*"[^>]*>([\s\S]*?)<\/div>/gi, (_m2: string, inner: string) => {
      return inner.replace(/<[^>]+>/g, '').trim() + '\n';
    });
    return '\n```compare\n' + text.replace(/<[^>]+>/g, '').trim() + '\n```\n';
  });
  md = md.replace(/<div[^>]*data-diagram="steps"[^>]*>([\s\S]*?)<\/div>\s*(?=<|$)/gi, (_m, content) => {
    const text = content.replace(/<div[^>]*class="sd-step[^"]*"[^>]*>([\s\S]*?)<\/div>/gi, (_m2: string, inner: string) => {
      return inner.replace(/<[^>]+>/g, '').trim() + '\n';
    });
    return '\n```steps\n' + text.replace(/<[^>]+>/g, '').trim() + '\n```\n';
  });

  md = md.replace(/<hr\s*\/?>/gi, '\n---\n');
  md = md.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_m, level, content) => {
    return '\n' + '#'.repeat(parseInt(level)) + ' ' + content.trim() + '\n';
  });
  md = md.replace(/<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi, (_m, content) => {
    const decoded = content.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    return '\n```\n' + decoded + '\n```\n';
  });
  md = md.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_m, tableContent) => {
    const rows: string[][] = [];
    const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;
    while ((rowMatch = rowPattern.exec(tableContent)) !== null) {
      const cells: string[] = [];
      const cellPattern = /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi;
      let cellMatch;
      while ((cellMatch = cellPattern.exec(rowMatch[1] ?? '')) !== null) {
        cells.push((cellMatch[1] ?? '').replace(/<[^>]+>/g, '').trim());
      }
      rows.push(cells);
    }
    if (rows.length === 0) return '';
    const lines: string[] = [];
    rows.forEach((row, idx) => {
      lines.push('| ' + row.join(' | ') + ' |');
      if (idx === 0) lines.push('| ' + row.map(() => '---').join(' | ') + ' |');
    });
    return '\n' + lines.join('\n') + '\n';
  });
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_m, content) => {
    const text = content.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
    return '\n' + text.split('\n').map((l: string) => '> ' + l).join('\n') + '\n';
  });
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_m, content) => {
    const items: string[] = [];
    const liPattern = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let liMatch;
    let num = 1;
    while ((liMatch = liPattern.exec(content)) !== null) {
      items.push(`${num}. ` + (liMatch[1] ?? '').replace(/<[^>]+>/g, '').trim());
      num++;
    }
    return '\n' + items.join('\n') + '\n';
  });
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_m, content) => {
    const items: string[] = [];
    const liPattern = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let liMatch;
    while ((liMatch = liPattern.exec(content)) !== null) {
      let liContent: string = liMatch[1] ?? '';
      const checkedMatch = liContent.match(/<input[^>]*checked[^>]*>/i);
      const uncheckedMatch = !checkedMatch && liContent.match(/<input[^>]*type=["']checkbox["'][^>]*>/i);
      if (checkedMatch) {
        liContent = liContent.replace(/<input[^>]*>/gi, '').trim();
        items.push('- [x] ' + liContent.replace(/<[^>]+>/g, '').trim());
      } else if (uncheckedMatch) {
        liContent = liContent.replace(/<input[^>]*>/gi, '').trim();
        items.push('- [ ] ' + liContent.replace(/<[^>]+>/g, '').trim());
      } else {
        items.push('- ' + liContent.replace(/<[^>]+>/g, '').trim());
      }
    }
    return '\n' + items.join('\n') + '\n';
  });

  // 内联元素
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<img[^>]+src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]+alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gi, '![$1]($2)');
  md = md.replace(/<mark>(.*?)<\/mark>/gi, '==$1==');
  md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i>(.*?)<\/i>/gi, '*$1*');
  md = md.replace(/<del>(.*?)<\/del>/gi, '~~$1~~');
  md = md.replace(/<code>(.*?)<\/code>/gi, '`$1`');
  md = md.replace(/<a[^>]+href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n');
  md = md.replace(/<[^>]+>/g, '');
  md = md.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n');
  md = md.replace(/<[^>]+>/g, '');
  md = md.replace(/\n{3,}/g, '\n\n');

  return md.trim();
}

// ===== 安全 =====

/**
 * HTML 内容清洗（DOMPurify）
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') return html;
  try {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS,
      ALLOWED_ATTR: ALLOWED_ATTRS,
    });
  } catch {
    return html;
  }
}

/**
 * 清理 iframe 注入的编辑属性（导出/保存前必须调用）
 */
export function cleanEditorAttributes(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  doc.querySelectorAll('[contenteditable]').forEach((el) => el.removeAttribute('contenteditable'));
  doc.querySelectorAll('[data-editable]').forEach((el) => el.removeAttribute('data-editable'));
  doc.querySelectorAll('.element-selected, .element-hover').forEach((el) => {
    el.classList.remove('element-selected', 'element-hover');
  });
  doc.querySelectorAll('[class=""]').forEach((el) => el.removeAttribute('class'));
  doc.querySelectorAll('script[data-studio-inject]').forEach((el) => el.remove());

  return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
}

// ===== 模板生成 =====

/**
 * 从渲染模板生成初始 MD 内容（含 slot 标记）
 */
export function generateMdFromTemplate(
  mdTemplate: string,
  slotDefs: Record<string, SlotDef>,
): string {
  if (mdTemplate) return mdTemplate;

  const lines: string[] = [];
  for (const [name, def] of Object.entries(slotDefs)) {
    lines.push(`<!-- @slot:${name} -->`);
    lines.push(def.placeholder || `[${def.label}]`);
    lines.push('<!-- @/slot -->');
    lines.push('');
  }
  return lines.join('\n');
}

/**
 * 生成 iframe 注入脚本（用于 HtmlPreview 组件的编辑模式）
 * 处理：元素选中、内容编辑、样式修改、图片替换
 */
export function generateIframeScript(): string {
  return `
(function() {
  'use strict';

  let selectedElement = null;
  let editMode = false;
  const DEBOUNCE_MS = 100;
  let notifyTimer = null;

  // 轻量 sanitizer：剔除 <script>、event handler 属性、javascript: 链接
  // 用于 setText / replaceImage 等 innerHTML 注入入口的二次防线。
  function sanitizeFragment(html) {
    const tpl = document.createElement('template');
    tpl.innerHTML = String(html == null ? '' : html);
    const walker = document.createTreeWalker(tpl.content, NodeFilter.SHOW_ELEMENT);
    const remove = [];
    let node;
    while ((node = walker.nextNode())) {
      const tag = node.tagName.toLowerCase();
      if (tag === 'script' || tag === 'iframe' || tag === 'object' || tag === 'embed') {
        remove.push(node);
        continue;
      }
      for (const attr of Array.from(node.attributes)) {
        const name = attr.name.toLowerCase();
        const val = String(attr.value || '').trim().toLowerCase();
        if (name.startsWith('on')) {
          node.removeAttribute(attr.name);
        } else if ((name === 'href' || name === 'src' || name === 'xlink:href') &&
                   (val.startsWith('javascript:') || val.startsWith('data:text/html'))) {
          node.removeAttribute(attr.name);
        }
      }
    }
    remove.forEach(n => n.remove());
    return tpl.innerHTML;
  }

  function escapeAttr(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function initElements() {
    const elements = document.querySelectorAll('[data-slot]');
    elements.forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', handleClick);
      el.addEventListener('dblclick', handleDblClick);
      el.addEventListener('mouseover', handleMouseOver);
      el.addEventListener('mouseout', handleMouseOut);

      const slotType = el.getAttribute('data-slot-type');
      if (slotType === 'image') {
        Array.from(el.children).forEach(child => {
          child.style.pointerEvents = 'none';
        });
      }
    });
  }

  function handleClick(e) {
    e.stopPropagation();
    const el = e.currentTarget;
    if (el.getAttribute('contenteditable') === 'true') return;
    deselectElement();
    selectedElement = el;
    el.classList.add('element-selected');

    window.parent.postMessage({
      type: 'elementSelected',
      slotName: el.getAttribute('data-slot'),
      slotType: el.getAttribute('data-slot-type') || 'content',
      styles: getComputedStyles(el),
      content: getSlotContent(el),
    }, '*');
  }

  function handleDblClick(e) {
    e.stopPropagation();
    if (!editMode) return;

    const el = e.currentTarget;
    const slotType = el.getAttribute('data-slot-type') || 'content';

    if (slotType === 'image') {
      window.parent.postMessage({
        type: 'requestImageReplace',
        slotName: el.getAttribute('data-slot'),
      }, '*');
      return;
    }

    const hasBlockChildren = el.querySelector('div,p,h1,h2,h3,h4,h5,h6,ul,ol,blockquote');
    if (hasBlockChildren) return;

    el.setAttribute('contenteditable', 'true');
    el.setAttribute('data-editable', 'true');
    el.focus();

    const onInput = () => { notifyChange(); };
    el.addEventListener('input', onInput);

    const onFinish = () => {
      el.removeAttribute('contenteditable');
      el.removeAttribute('data-editable');
      el.removeEventListener('blur', onFinish);
      el.removeEventListener('focusout', onFinish);
      el.removeEventListener('input', onInput);
      notifyChange();
    };
    el.addEventListener('blur', onFinish);
    el.addEventListener('focusout', onFinish);
  }

  function handleMouseOver(e) {
    if (selectedElement === e.currentTarget) return;
    e.currentTarget.classList.add('element-hover');
  }

  function handleMouseOut(e) {
    e.currentTarget.classList.remove('element-hover');
  }

  function deselectElement() {
    if (selectedElement) {
      selectedElement.classList.remove('element-selected');
      selectedElement = null;
      window.parent.postMessage({ type: 'elementDeselected' }, '*');
    }
  }

  function getSlotContent(el) {
    const type = el.getAttribute('data-slot-type') || 'content';
    switch (type) {
      case 'content':
      case 'richtext':
      case 'text':
        return el.innerHTML;
      case 'image': {
        const img = el.querySelector('img');
        return img ? img.src : '';
      }
      default: return el.innerHTML;
    }
  }

  function getComputedStyles(el) {
    const cs = window.getComputedStyle(el);
    return {
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      color: cs.color,
      backgroundColor: cs.backgroundColor,
      textAlign: cs.textAlign,
      fontFamily: cs.fontFamily,
      letterSpacing: cs.letterSpacing,
      lineHeight: cs.lineHeight,
    };
  }

  function notifyChange() {
    if (notifyTimer) clearTimeout(notifyTimer);
    notifyTimer = setTimeout(() => {
      const slotValues = {};
      const slotCounters = {};
      document.querySelectorAll('[data-slot]').forEach(el => {
        const slotName = el.getAttribute('data-slot');
        const isInLoop = el.closest('[data-slot-loop]') !== null;
        if (isInLoop) {
          slotCounters[slotName] = (slotCounters[slotName] || 0) + 1;
          const uniqueKey = slotName + '_' + slotCounters[slotName];
          slotValues[uniqueKey] = getSlotContent(el);
        } else {
          slotValues[slotName] = getSlotContent(el);
        }
      });
      window.parent.postMessage({ type: 'contentChanged', slotValues, hasLoopSlots: Object.keys(slotCounters).length > 0 }, '*');
    }, DEBOUNCE_MS);
  }

  window.addEventListener('message', (e) => {
    const { type, slotName, value, styles } = e.data || {};

    switch (type) {
      case 'setStyle': {
        const el = slotName ? document.querySelector('[data-slot="' + slotName + '"]') : selectedElement;
        if (!el || !styles) return;
        Object.entries(styles).forEach(([prop, val]) => {
          el.style[prop] = val;
        });
        notifyChange();
        break;
      }
      case 'setText': {
        const el = document.querySelector('[data-slot="' + slotName + '"]');
        if (!el) return;
        const slotType = el.getAttribute('data-slot-type') || 'content';
        if (slotType === 'data') {
          el.textContent = value;
        } else {
          el.innerHTML = sanitizeFragment(value);
        }
        notifyChange();
        break;
      }
      case 'replaceImage': {
        const el = document.querySelector('[data-slot="' + slotName + '"]');
        if (!el) return;
        const img = el.querySelector('img');
        if (img) {
          img.src = value;
        } else {
          el.innerHTML = '<img src="' + escapeAttr(value) + '" alt="" style="width:100%;height:auto;" />';
        }
        notifyChange();
        break;
      }
      case 'toggleEditMode':
        editMode = !!value;
        document.body.classList.toggle('studio-edit-mode', editMode);
        break;
      case 'deselectAll':
        deselectElement();
        break;
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-slot]')) {
      deselectElement();
    }
  });

  const style = document.createElement('style');
  style.setAttribute('data-studio-inject', 'true');
  style.textContent = \`
    .element-selected {
      outline: 2px solid #3b82f6 !important;
      outline-offset: 2px;
    }
    .element-hover {
      outline: 1px dashed #93c5fd !important;
      outline-offset: 1px;
    }
    .studio-edit-mode [data-slot] {
      cursor: text !important;
    }
    .studio-edit-mode [data-slot][data-slot-type="image"] {
      cursor: pointer !important;
    }
    [contenteditable="true"] {
      outline: 2px solid #f59e0b !important;
      outline-offset: 2px;
    }
  \`;
  document.head.appendChild(style);

  function init() {
    initElements();
    editMode = true;
    document.body.classList.add('studio-edit-mode');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
  `.trim();
}

// ===== 语义代码块解析器 =====

function parseFlowDiagram(lines: string[]): string {
  const groups: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '') {
      if (current.length > 0) { groups.push(current); current = []; }
    } else {
      current.push(trimmed);
    }
  }
  if (current.length > 0) groups.push(current);

  if (groups.length <= 1) {
    return `<div class="sd-flow" data-diagram="flow">${parseFlowGroup(groups[0] || [])}</div>`;
  }

  const rendered: string[] = [];
  for (let g = 0; g < groups.length; g++) {
    if (g > 0) rendered.push('<div class="sd-flow-arrow">▼</div>');
    rendered.push(`<div class="sd-flow-group">${parseFlowGroup(groups[g] ?? [])}</div>`);
  }
  return `<div class="sd-flow" data-diagram="flow">${rendered.join('\n')}</div>`;
}

function parseFlowGroup(lines: string[]): string {
  const items: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i]!;

    if (trimmed.startsWith('┌')) {
      const boxLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.startsWith('└')) {
        const boxLine = lines[i]!.replace(/^│\s*/, '').replace(/\s*│$/, '');
        if (boxLine) boxLines.push(escapeHtmlText(boxLine));
        i++;
      }
      if (i < lines.length) i++;
      items.push(`<div class="sd-flow-box">${boxLines.join('<br/>')}</div>`);
      continue;
    }

    if (/^[→▼│▶\-|↓]$/.test(trimmed) || /^->$/.test(trimmed)) {
      items.push('<div class="sd-flow-arrow">▼</div>');
      i++;
      continue;
    }

    if (/^(?:✅|❌|⚠️)/.test(trimmed)) {
      const statusMatch = trimmed.match(/^(✅|❌|⚠️)\s*(.*)/);
      if (statusMatch) {
        const cls = statusMatch[1] === '✅' ? 'success' : statusMatch[1] === '❌' ? 'error' : 'warn';
        items.push(`<div class="sd-flow-node sd-status-${cls}">${escapeHtmlText(statusMatch[2] ?? '')}</div>`);
      }
      i++;
      continue;
    }

    if (trimmed.includes('→') && trimmed.split('→').length > 1) {
      const rowItems: string[] = [];
      const parts = trimmed.split('→').map(p => p.trim()).filter(Boolean);
      parts.forEach((part, idx) => {
        rowItems.push(`<div class="sd-flow-node">${escapeHtmlText(part)}</div>`);
        if (idx < parts.length - 1) {
          rowItems.push('<div class="sd-flow-arrow">→</div>');
        }
      });
      items.push(`<div class="sd-flow-row">${rowItems.join('')}</div>`);
      i++;
      continue;
    }

    items.push(`<div class="sd-flow-label">${escapeHtmlText(trimmed)}</div>`);
    i++;
  }

  return items.join('\n');
}

function parseCompareDiagram(lines: string[]): string {
  const boxes: { title: string; items: string[] }[] = [];
  let currentTitle = '';
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i]!.trim();
    if (trimmed === '') { i++; continue; }

    if (trimmed.startsWith('┌')) {
      const boxTitle = trimmed.replace(/[┌┐─]/g, '').trim();
      const boxItems: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.trim().startsWith('└')) {
        const boxLine = lines[i]!.trim().replace(/^│\s*/, '').replace(/\s*│$/, '');
        if (boxLine) boxItems.push(boxLine);
        i++;
      }
      if (i < lines.length) i++;
      const title = boxTitle || currentTitle || (boxItems.length > 0 ? (boxItems[0] ?? '') : '');
      const content = (!boxTitle && !currentTitle && boxItems.length > 0)
        ? boxItems.slice(1) : boxItems;
      boxes.push({ title: escapeHtmlText(title), items: content.map(escapeHtmlText) });
      continue;
    }

    if (!/^[┌┐└┘│─┬┴├┤╔╗╚╝║═]/.test(trimmed)) {
      currentTitle = trimmed;
    }
    i++;
  }

  if (boxes.length === 0) {
    const leftItems: string[] = [];
    const rightItems: string[] = [];
    let leftTitle = '';
    let rightTitle = '';
    let phase: 'left' | 'gap' | 'right' = 'left';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === '') {
        if (phase === 'left' && leftItems.length > 0) phase = 'gap';
        continue;
      }
      const twoColMatch = line.match(/^(.{15,}?)\s{4,}(.+)$/);
      if (twoColMatch) {
        leftItems.push(escapeHtmlText((twoColMatch[1] ?? '').trim()));
        rightItems.push(escapeHtmlText((twoColMatch[2] ?? '').trim()));
        continue;
      }
      if (phase === 'left' || phase === 'gap') {
        if (leftItems.length === 0 && !trimmed.startsWith('✅') && !trimmed.startsWith('❌')) {
          leftTitle = trimmed;
        } else {
          leftItems.push(escapeHtmlText(trimmed));
        }
        if (phase === 'gap') phase = 'right';
      } else {
        if (rightItems.length === 0 && !trimmed.startsWith('✅') && !trimmed.startsWith('❌')) {
          rightTitle = trimmed;
        } else {
          rightItems.push(escapeHtmlText(trimmed));
        }
      }
    }

    if (leftItems.length > 0 || rightItems.length > 0) {
      boxes.push({ title: leftTitle || '方案 A', items: leftItems });
      boxes.push({ title: rightTitle || '方案 B', items: rightItems });
    }
  }

  const boxesHtml = boxes.map(box => {
    const itemsHtml = box.items.map(item => {
      const cls = item.startsWith('✅') ? 'sd-status-success' : item.startsWith('❌') ? 'sd-status-error' : item.startsWith('⚠️') ? 'sd-status-warn' : '';
      return `<div class="sd-compare-item ${cls}">${item}</div>`;
    }).join('\n');
    const titleCls = box.title.startsWith('✅') ? 'sd-status-success' : box.title.startsWith('❌') ? 'sd-status-error' : box.title.startsWith('⚠️') ? 'sd-status-warn' : '';
    return `<div class="sd-compare-col${titleCls ? ' sd-compare-' + titleCls.replace('sd-status-', '') : ''}"><div class="sd-compare-title ${titleCls}">${box.title}</div>${itemsHtml}</div>`;
  }).join('\n');

  return `<div class="sd-compare" data-diagram="compare">${boxesHtml}</div>`;
}

function parseStepsDiagram(lines: string[]): string {
  const steps: { num: string; label: string; desc: string }[] = [];
  let currentDesc: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '') continue;
    if (/^[│▼→↓\-|]+$/.test(trimmed)) continue;

    const circleMatch = trimmed.match(/^([①②③④⑤⑥⑦⑧⑨⑩])\s*(.*)/);
    if (circleMatch) {
      if (currentDesc.length > 0 && steps.length > 0) {
        steps[steps.length - 1]!.desc = currentDesc.join(' ');
        currentDesc = [];
      }
      const numMap: Record<string, string> = { '①': '1', '②': '2', '③': '3', '④': '4', '⑤': '5', '⑥': '6', '⑦': '7', '⑧': '8', '⑨': '9', '⑩': '10' };
      steps.push({ num: numMap[circleMatch[1] ?? ''] ?? circleMatch[1] ?? '?', label: escapeHtmlText(circleMatch[2] ?? ''), desc: '' });
      continue;
    }

    const numMatch = trimmed.match(/^(\d+)[.)]\s*(.*)/);
    if (numMatch) {
      if (currentDesc.length > 0 && steps.length > 0) {
        steps[steps.length - 1]!.desc = currentDesc.join(' ');
        currentDesc = [];
      }
      steps.push({ num: numMatch[1] ?? '?', label: escapeHtmlText(numMatch[2] ?? ''), desc: '' });
      continue;
    }

    if (steps.length > 0) {
      currentDesc.push(escapeHtmlText(trimmed));
    } else {
      steps.push({ num: '1', label: escapeHtmlText(trimmed), desc: '' });
    }
  }

  if (currentDesc.length > 0 && steps.length > 0) {
    steps[steps.length - 1]!.desc = currentDesc.join(' ');
  }

  const stepsHtml = steps.map((step, idx) => {
    const descHtml = step.desc ? `<div class="sd-step-desc">${step.desc}</div>` : '';
    const arrow = idx < steps.length - 1 ? '<div class="sd-step-arrow">→</div>' : '';
    return `<div class="sd-step"><div class="sd-step-num">${step.num}</div><div class="sd-step-label">${step.label}</div>${descHtml}</div>${arrow}`;
  }).join('\n');

  return `<div class="sd-steps" data-diagram="steps">${stepsHtml}</div>`;
}

// ===== 工具函数 =====

function escapeHtmlText(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeAttr(str: string): string {
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ===== 预览生成 =====

/**
 * 生成完整的预览 HTML（用于 iframe 预览）
 */
export function generatePreviewHtml(injectedHtml: string, cssTemplate?: string): string {
  const htmlWithIcons = _renderIconsInHtml ? _renderIconsInHtml(injectedHtml) : injectedHtml;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* 基础样式重置 */
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    /* MD 渲染样式 */
    ${MD_RICHTEXT_STYLES}
    /* 自定义模板样式 */
    ${cssTemplate || ''}
  </style>
</head>
<body>
  ${htmlWithIcons}
</body>
</html>`;
}

// ===== 模板工具（消除 viewer 重复代码）=====

/**
 * 插槽高亮样式（预览模式下显示 data-slot 边框和标签）
 * 可注入到 <head> 中，方便调试和可视化
 */
export const SLOT_HIGHLIGHT_CSS = `
[data-slot] {
  outline: 1.5px dashed #818cf8;
  outline-offset: 2px;
  border-radius: 3px;
  position: relative;
  min-height: 1.2em;
  transition: outline-color 0.15s, background 0.15s;
}
[data-slot]:hover {
  outline-color: #6366f1;
  background: rgba(99, 102, 241, 0.04);
}
[data-slot]::before {
  content: attr(data-slot);
  position: absolute;
  top: -18px;
  left: 0;
  font-size: 9px;
  color: #818cf8;
  font-family: "SF Mono", "Fira Code", monospace;
  background: rgba(99, 102, 241, 0.08);
  padding: 1px 4px;
  border-radius: 3px;
  white-space: nowrap;
  pointer-events: none;
}
`.trim();

/**
 * 从 HTML 模板字符串中提取所有 data-slot 名称（去重有序）
 */
export function extractHtmlSlotNames(html: string): string[] {
  const re = /data-slot="([^"]+)"/g;
  const names = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) names.add(m[1]!);
  return [...names];
}

/**
 * 将旧格式 {{varName}} 变量注入到 HTML 模板
 * 同时兼容 data-slot 属性内容替换
 */
export function injectVarsToHtml(
  htmlTemplate: string,
  vars: Record<string, string>,
): string {
  let filled = htmlTemplate;
  // 替换 {{varName}} 语法
  filled = filled.replace(/\{\{(\w+)\}\}/g, (_, name: string) => vars[name] ?? `{{${name}}}`);
  // 替换 data-slot 元素内容
  Object.entries(vars).forEach(([name, value]) => {
    const re = new RegExp(`(<[^>]+data-slot="${escapeRegex(name)}"[^>]*>)([^<]*)(</)`, 'g');
    filled = filled.replace(re, `$1${escapeAttr(value)}$3`);
  });
  return filled;
}

/**
 * 生成空预览 HTML（无内容时的占位）
 */
export function buildEmptyPreviewHtml(): string {
  return `<!DOCTYPE html><html><body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#94a3b8;">无预览内容</body></html>`;
}

/**
 * 生成带插槽高亮的 MD 预览 HTML
 * 从 MD 内容提取 slot → 注入 HTML 模板 → 追加高亮样式
 */
export function buildMdPreviewHtml(
  htmlTemplate: string,
  mdContent: string,
  slotDefs: Record<string, SlotDef>,
  highlight = true,
): string {
  if (!htmlTemplate) return buildEmptyPreviewHtml();

  const slots = extractSlotsFromMd(mdContent, slotDefs);
  const injected = injectSlotsToHtml(htmlTemplate, slots);

  if (!highlight) return injected;

  // 注入高亮样式到 </head> 前
  const highlightStyle = `<style data-preview-highlight>\n${SLOT_HIGHLIGHT_CSS}\n</style>`;
  if (injected.includes('</head>')) {
    return injected.replace('</head>', `${highlightStyle}\n</head>`);
  }
  return injected;
}

/**
 * 生成带插槽高亮的变量预览 HTML（旧格式兼容）
 */
export function buildVarsPreviewHtml(
  htmlTemplate: string,
  vars: Record<string, string>,
  highlight = true,
): string {
  if (!htmlTemplate) return buildEmptyPreviewHtml();

  const filled = injectVarsToHtml(htmlTemplate, vars);
  const highlightStyle = highlight
    ? `<style data-preview-highlight>\n${SLOT_HIGHLIGHT_CSS}\n</style>`
    : '';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
${highlightStyle}
<style>
* { box-sizing: border-box; }
body {
  margin: 0; padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 14px; line-height: 1.7; color: #1a1a2e; background: #fff;
}
</style>
</head>
<body>${filled}</body>
</html>`;
}