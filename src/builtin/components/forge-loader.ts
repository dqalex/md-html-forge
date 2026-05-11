/**
 * .forge.md 组件包加载器
 *
 * 把单文件 `.forge.md` 解析为 ComponentDef，供引擎注册。
 *
 * 核心机制（方案 B：按 variant 输出独立 HTML 片段）：
 *   1. HTML 段中可用 `<!-- variant: xxx -->` 注释为变体分块
 *   2. 切片可以放在某个根元素**内部**（推荐）：
 *        <div class="comp-X" data-variant="{{variant}}">
 *          <!-- variant: a -->
 *          <div>...</div>
 *          <!-- variant: b -->
 *          <div>...</div>
 *        </div>
 *      此时 loader 会自动提取根元素作为 wrapper，每个片段渲染时用 wrapper 包回去
 *   3. 切片也可以在顶层（与根并列），此时无 wrapper 自动包装
 *   4. 无切片注释时，整段作为所有 variant 共用模板
 *   5. 自动给最外层元素挂 data-forge-id / data-forge-variant，便于 runtime 找到挂载点
 */

import type { ComponentDef, ComponentCategory } from '../types';
import type { SlotDef, SlotBindKind } from '@/lib/markdown-slots/types';

const VALID_BIND_KINDS = new Set<SlotBindKind>([
  'h1', 'h2', 'h3', 'blockquote', 'ul', 'ol', 'list', 'code', 'table', 'paragraph', 'content',
]);

function toBindKind(v: unknown): SlotBindKind | undefined {
  if (typeof v !== 'string') return undefined;
  return VALID_BIND_KINDS.has(v as SlotBindKind) ? (v as SlotBindKind) : undefined;
}

export interface ForgeMeta {
  id: string;
  category: string;
  tags?: string;
  trust?: 'builtin' | 'user';
  defaultVariant?: string;
  description?: string;
  /** 选型指南字段（在 frontmatter 中用 ; 或 | 分隔多值） */
  whenToUse?: string;
  whenNot?: string;
  keySlots?: string;
}

export interface ForgeComponent {
  meta: ForgeMeta;
  name: string;
  variants: string[];
  variantDescriptions?: Record<string, string>;
  slots: Record<string, SlotDef>;
  /** 整段 HTML 模板（未切片时为单段；切片时为完整带注释串） */
  htmlTemplate: string;
  /** 变体 → 片段 HTML（按切片注释拆分得到；无切片时为空 map） */
  variantTemplates: Record<string, string>;
  /** 切片在根元素内时，根元素的"开标签"（如 `<div class="comp-card" data-variant="{{variant}}">`） */
  wrapperOpen?: string;
  /** 对应的"闭标签"（如 `</div>`） */
  wrapperClose?: string;
  css: string;
  /** mount 函数源码（已是 function (el, api) {...} 字符串） */
  js: string;
  sample: string;
}

// ===================================================================
// 解析 .forge.md
// ===================================================================

/**
 * 解析 .forge.md 全文 → ForgeComponent
 *
 * 支持两种前导元信息格式（二选一）：
 *
 *   【新】YAML frontmatter（推荐，和 UserTemplate 保持一致）：
 *     ---
 *     id: timeline
 *     category: list
 *     tags: timeline, milestones
 *     trust: builtin
 *     defaultVariant: standard
 *     ---
 *
 *     # 时间线
 *
 *     ## Variants
 *     ...
 *
 *   【旧】一级标题 + 松散 key: value 行（向后兼容）：
 *     # 时间线
 *
 *     id: timeline
 *     category: list
 *     ...
 *
 *     ## Variants
 *     ...
 */
export function parseForgeMd(source: string): ForgeComponent {
  // 先剥 BOM，方便 frontmatter 检测
  const normalized = source.replace(/^\uFEFF/, '');

  let meta: Record<string, string> = {};
  let body = normalized;

  // --- 分支 A：YAML frontmatter ---
  if (body.trimStart().startsWith('---')) {
    const parsed = extractFrontmatter(body);
    if (parsed) {
      meta = parsed.meta;
      body = parsed.rest;
    }
  }

  const lines = body.split('\n');
  let i = 0;

  // 1. 一级标题 = name
  let name = '';
  // 跳过 frontmatter 之后可能的空行
  while (i < lines.length && !lines[i].trim()) i++;
  if (lines[i]?.startsWith('# ')) {
    name = lines[i].slice(2).trim();
    i++;
  }

  // 2. 前导元信息（仅旧格式才读；frontmatter 已填好 meta）
  if (Object.keys(meta).length === 0) {
    while (i < lines.length && !lines[i].startsWith('## ')) {
      const line = lines[i].trim();
      if (line) {
        const m = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
        if (m) meta[m[1]] = m[2].trim();
      }
      i++;
    }
  } else {
    // 新格式：直接推进到第一个 ## 之前
    while (i < lines.length && !lines[i].startsWith('## ')) i++;
  }

  // 3. 按 ## 分段
  const sections: Record<string, string> = {};
  let current = '';
  const bodyLines: string[] = [];

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('## ')) {
      if (current) sections[current] = bodyLines.join('\n').trim();
      current = line.slice(3).trim();
      bodyLines.length = 0;
    } else {
      bodyLines.push(line);
    }
    i++;
  }
  if (current) sections[current] = bodyLines.join('\n').trim();

  // 4. 解析 Variants（每行 `- \`id\` — 描述`）
  const variants: string[] = [];
  const variantDescriptions: Record<string, string> = {};
  const vBody = sections['Variants'] ?? '';
  for (const line of vBody.split('\n')) {
    const m = line.match(/`([^`]+)`\s*[—–-]?\s*(.*)$/);
    if (m) {
      variants.push(m[1]!);
      const desc = m[2]?.trim();
      if (desc) variantDescriptions[m[1]!] = desc;
    }
  }

  // 5. 解析 Slots（YAML 代码块）
  const slots = parseSlots(extractCodeBlock(sections['Slots'] ?? '', 'yaml'));

  // 6. 提取 HTML / CSS / JS / Sample
  const htmlTemplate = extractCodeBlock(sections['HTML'] ?? '', 'html');
  const css = extractCodeBlock(sections['CSS'] ?? '', 'css');
  const js =
    extractCodeBlock(sections['JS'] ?? '', 'js') ||
    extractCodeBlock(sections['JS'] ?? '', 'javascript');
  const sample =
    extractCodeBlock(sections['Sample'] ?? '', 'markdown') ||
    (sections['Sample'] ?? '');

  // 7. 切片：按 `<!-- variant: xxx -->` 切分 HTML，并提取根 wrapper（如果切片在根元素内）
  const sliced = sliceVariants(htmlTemplate);

  return {
    meta: {
      id: meta['id'] ?? '',
      category: meta['category'] ?? '',
      tags: meta['tags'],
      trust: (meta['trust'] as 'builtin' | 'user') ?? 'builtin',
      defaultVariant: meta['defaultVariant'] ?? variants[0] ?? '',
      description: meta['description'],
      whenToUse: meta['whenToUse'],
      whenNot: meta['whenNot'],
      keySlots: meta['keySlots'],
    },
    name,
    variants,
    variantDescriptions: Object.keys(variantDescriptions).length ? variantDescriptions : undefined,
    slots,
    htmlTemplate,
    variantTemplates: sliced.slices,
    wrapperOpen: sliced.wrapperOpen,
    wrapperClose: sliced.wrapperClose,
    css,
    js,
    sample,
  };
}

/**
 * 切片解析：
 *   1. 找出 `<!-- variant: xxx -->` 出现的位置
 *   2. 检测它们是否都被同一个根元素包裹（典型情况）
 *      - 若是：把根开标签 / 闭标签提取出来，每个片段就是裸内容
 *      - 若否：每个片段为切片注释之间的内容，无 wrapper
 *   3. 切片之间的"间隔空白"不归属任何变体
 */
function sliceVariants(template: string): {
  slices: Record<string, string>;
  wrapperOpen?: string;
  wrapperClose?: string;
} {
  const re = /<!--\s*variant:\s*([a-zA-Z0-9_-]+)\s*-->/g;
  const matches: Array<{ name: string; index: number; endIndex: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(template))) {
    matches.push({
      name: m[1]!,
      index: m.index,
      endIndex: m.index + m[0].length,
    });
  }

  if (matches.length === 0) return { slices: {} };

  // 检测根 wrapper：
  // 模式 = 模板以 `<some-tag ...>` 开头，且第一个切片注释在该开标签之后；
  // 模板以 `</some-tag>` 结尾，且最后一个切片之后只有空白 + 该闭标签。
  let wrapperOpen: string | undefined;
  let wrapperClose: string | undefined;
  let innerStart = 0;
  let innerEnd = template.length;

  const headMatch = template.match(/^\s*(<[a-zA-Z][a-zA-Z0-9-]*\b[^>]*>)/);
  if (headMatch) {
    const openTag = headMatch[1]!;
    const tagNameMatch = openTag.match(/^<([a-zA-Z][a-zA-Z0-9-]*)/);
    const tagName = tagNameMatch?.[1];
    if (tagName) {
      // 找最后一个对应闭标签
      const closeRe = new RegExp(`</${tagName}\\s*>\\s*$`);
      const tail = template.match(closeRe);
      if (tail) {
        // 验证第一个切片注释 index > openTag 末尾
        const openEnd = (headMatch.index ?? 0) + headMatch[0].length;
        const closeStart = template.length - tail[0].length;
        if (matches[0]!.index >= openEnd && matches[matches.length - 1]!.endIndex <= closeStart) {
          wrapperOpen = openTag;
          wrapperClose = `</${tagName}>`;
          innerStart = openEnd;
          innerEnd = closeStart;
        }
      }
    }
  }

  const slices: Record<string, string> = {};
  for (let k = 0; k < matches.length; k++) {
    const cur = matches[k]!;
    const next = matches[k + 1];
    const start = cur.endIndex;
    const end = next ? next.index : innerEnd;
    if (start < innerStart || end > innerEnd) continue;
    const slice = template.slice(start, end).trim();
    if (slice) slices[cur.name] = slice;
  }
  return { slices, wrapperOpen, wrapperClose };
}

function extractCodeBlock(body: string, lang: string): string {
  const re = new RegExp('```' + lang + '\\n([\\s\\S]*?)\\n```', 'i');
  const m = body.match(re);
  return m ? m[1] : '';
}

function parseSlots(yaml: string): Record<string, SlotDef> {
  const slots: Record<string, SlotDef> = {};
  if (!yaml.trim()) return slots;

  const lines = yaml.split('\n');
  let currentName = '';
  let current: Record<string, unknown> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const indent = line.match(/^(\s*)/)?.[1].length ?? 0;
    const trimmed = line.trim();

    if (!trimmed) continue;

    if (indent === 0 && trimmed.endsWith(':')) {
      if (currentName) {
        slots[currentName] = makeSlotDef(current);
      }
      currentName = trimmed.slice(0, -1);
      current = {};
      continue;
    }

    if (indent >= 2 && trimmed.includes(':')) {
      const idx = trimmed.indexOf(':');
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      // 去除 YAML 字符串引号
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      current[key] = val;
    }
  }

  if (currentName) {
    slots[currentName] = makeSlotDef(current);
  }

  return slots;
}

function makeSlotDef(raw: Record<string, unknown>): SlotDef {
  const type = (raw['type'] as 'text' | 'content' | 'data') ?? 'text';
  return {
    label: String(raw['label'] ?? ''),
    type,
    placeholder: raw['placeholder'] ? String(raw['placeholder']) : undefined,
    bind: toBindKind(raw['bind']),
    description: raw['description'] ? String(raw['description']) : undefined,
  };
}

// ===================================================================
// ForgeComponent → ComponentDef
// ===================================================================

export function forgeToComponentDef(forge: ForgeComponent): ComponentDef {
  const { meta, name, variants, variantDescriptions, slots, htmlTemplate, variantTemplates, wrapperOpen, wrapperClose, css, js, sample } = forge;

  // sample 字段：placeholder 直接转成 Record<string,string>（启动器示例填充）
  const sampleMap: Record<string, string> = {};
  for (const [n, def] of Object.entries(slots)) {
    if (def.placeholder) sampleMap[n] = def.placeholder;
  }

  const hasSlices = Object.keys(variantTemplates).length > 0;
  const hasMount = !!js.trim();

  // 选型指南字段：frontmatter 里允许用 `;` 或 `|` 分隔多值
  // 例：whenToUse: 周进度展示; 横排 KPI 汇总; 季度指标看板
  const splitList = (raw: string | undefined): string[] | undefined => {
    if (!raw) return undefined;
    const items = raw.split(/[;|]/).map((s) => s.trim()).filter(Boolean);
    return items.length ? items : undefined;
  };

  return {
    id: meta.id,
    name: name || meta.id,
    description: meta.description,
    source: 'forge',
    category: meta.category as ComponentCategory,
    tags: meta.tags ? meta.tags.split(',').map((s) => s.trim()) : undefined,
    slots,
    sample: sampleMap,
    variants: variants.length ? variants : undefined,
    defaultVariant: meta.defaultVariant || undefined,
    variantDescriptions,
    trust: meta.trust ?? 'builtin',
    whenToUse: splitList(meta.whenToUse),
    whenNot: splitList(meta.whenNot),
    keySlots: splitList(meta.keySlots),
    css,
    html(slotMap: Record<string, string>, variant?: string) {
      const useVariant = variant || meta.defaultVariant || variants[0] || '';

      let template: string;
      if (hasSlices) {
        // 优先选当前 variant 的片段；不存在则尝试 default；再不行用第一个
        const inner =
          variantTemplates[useVariant] ||
          (meta.defaultVariant ? variantTemplates[meta.defaultVariant] : '') ||
          Object.values(variantTemplates)[0] ||
          '';

        // 如果切片是包在根 wrapper 里，每个片段输出时用 wrapper 包回去
        if (wrapperOpen && wrapperClose) {
          template = `${wrapperOpen}\n${inner}\n${wrapperClose}`;
        } else {
          template = inner;
        }
      } else {
        // 无切片：整段共享
        template = stripVariantComments(htmlTemplate);
      }

      if (!template) return '';
      return renderForgeHtml(template, slotMap, useVariant, meta.id, hasMount);
    },
  };
}

// 独立保留 forge JS 提取，供 emitter 集中收集注入
export function getForgeJs(forge: ForgeComponent): { id: string; trust: 'builtin' | 'user'; js: string } | null {
  if (!forge.js.trim()) return null;
  return {
    id: forge.meta.id,
    trust: forge.meta.trust ?? 'builtin',
    js: forge.js,
  };
}

// ===================================================================
// 渲染：模板 → HTML
// ===================================================================

/**
 * 渲染 HTML 模板：
 *   1. 替换 `{{variant}}` 占位符
 *   2. 注入 slot 值（按 data-slot="name" 匹配）
 *   3. 自动在最外层元素挂 data-forge-id / data-forge-variant（如果有 mount JS）
 */
export function renderForgeHtml(
  template: string,
  slotMap: Record<string, string>,
  variant: string,
  componentId: string,
  hasMount: boolean,
): string {
  let html = template;

  // 1. 占位符
  html = html.replace(/\{\{\s*variant\s*\}\}/g, variant);

  // 2. slot 注入
  //
  // 匹配 `<tag ... data-slot="name" ...>...</tag>`，把中间内容替换为 slot 值。
  //
  // 旧实现用非贪婪 `[\s\S]*?` + `</[^>]+>`，会错误地匹配到内部第一个闭合标签
  // （例如模板里有 `<div data-slot="x"><em></em></div>`，正则会把 `</em>` 当成
  // 外层 div 的闭合，破坏结构）。这里改为：先识别开标签的 tagName，再用 stack 找
  // **对应的**闭合标签。
  for (const [name, value] of Object.entries(slotMap)) {
    html = injectSlot(html, name, value);
  }

  // 3. 标记最外层元素，便于 runtime 挂载
  if (hasMount) {
    html = html.replace(
      /^(\s*<[a-zA-Z][^>]*?)(\s*\/?>)/,
      (_match, head: string, tail: string) => {
        if (/data-forge-id=/.test(head)) return _match;
        return `${head} data-forge-id="${componentId}" data-forge-variant="${variant}"${tail}`;
      },
    );
  }

  return html;
}

/**
 * 在 HTML 中查找 `<tag ... data-slot="name" ...>` 开标签，定位其**对应的**闭合标签
 * （处理嵌套），把中间内容替换为 value。
 *
 * 注意：模板里同一个 slot 名可能出现在多个 variant 容器里（如 metric 的 metricValue
 * 在 band/hero/slide 三处都有），这里要替换**所有**出现，所以走 while 循环。
 */
function injectSlot(html: string, name: string, value: string): string {
  // 匹配开标签：<tag ... data-slot="name" ...>
  const openRe = new RegExp(`<([a-zA-Z][a-zA-Z0-9-]*)\\b[^>]*?\\sdata-slot="${escapeRegExp(name)}"[^>]*?>`, 'g');
  let result = '';
  let cursor = 0;
  let m: RegExpExecArray | null;
  while ((m = openRe.exec(html))) {
    const tagName = m[1]!;
    const openStart = m.index;
    const openEnd = m.index + m[0].length;
    // 自闭合（如 <input data-slot="x" />）— 没有 inner，直接保留并跳过
    if (m[0].endsWith('/>')) {
      result += html.slice(cursor, openEnd);
      cursor = openEnd;
      continue;
    }
    // 用 stack 找对应的闭合标签
    const closeIdx = findMatchingClose(html, openEnd, tagName);
    if (closeIdx < 0) {
      // 找不到闭合（可能是 void element 或畸形），保持原样
      result += html.slice(cursor, openEnd);
      cursor = openEnd;
      continue;
    }
    const closeEnd = closeIdx + tagName.length + 3; // </tag>
    // 替换 inner
    result += html.slice(cursor, openEnd) + value + `</${tagName}>`;
    cursor = closeEnd;
    // 推进 openRe 游标到 cursor 之后，避免重新匹配同一开标签
    openRe.lastIndex = cursor;
  }
  result += html.slice(cursor);
  return result;
}

/** 从 fromIdx 开始扫描 html，找与 tagName 对应的闭合标签位置（返回 < 起点）；找不到返回 -1。 */
function findMatchingClose(html: string, fromIdx: number, tagName: string): number {
  const lower = tagName.toLowerCase();
  // 同名嵌套深度
  let depth = 1;
  // 用单个正则边走边匹配同名开/闭标签
  const re = new RegExp(`<(/?)${escapeRegExp(tagName)}\\b[^>]*?>`, 'gi');
  re.lastIndex = fromIdx;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const isClose = m[1] === '/';
    const isSelfClose = m[0].endsWith('/>');
    if (isSelfClose) continue;
    if (isClose) {
      depth--;
      if (depth === 0) return m.index;
    } else {
      depth++;
    }
    void lower;
  }
  return -1;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripVariantComments(html: string): string {
  return html.replace(/<!--\s*variant:\s*[a-zA-Z0-9_-]+\s*-->/g, '');
}

// ===================================================================
// YAML frontmatter（与 userTemplates.ts 保持一致的最小实现）
// ===================================================================
//
// 只支持：
//   - 顶层 `key: value` 标量
//   - 单/双引号字符串
//   - 数字 / true / false
//   - 行内注释（` #`，仅当前面是空格）
// 不支持：嵌套对象、多行字符串、数组（用逗号分隔的字符串表达即可，如 tags）

const FM_FENCE = /^---\s*$/;

function extractFrontmatter(source: string): {
  meta: Record<string, string>;
  rest: string;
} | null {
  const trimmed = source.trimStart();
  const leading = source.length - trimmed.length; // 保留前置空白，便于重新拼 rest
  const lines = trimmed.split('\n');
  if (!FM_FENCE.test(lines[0] ?? '')) return null;

  // 找到关闭的 --- 行
  let endLine = -1;
  for (let k = 1; k < lines.length; k++) {
    if (FM_FENCE.test(lines[k]!)) {
      endLine = k;
      break;
    }
  }
  if (endLine < 0) return null;

  const meta: Record<string, string> = {};
  for (let k = 1; k < endLine; k++) {
    const raw = lines[k]!;
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^([a-zA-Z0-9_-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const key = m[1]!;
    let val = m[2]!.trim();
    // 行内注释
    const hashIdx = val.indexOf(' #');
    if (hashIdx > 0) val = val.slice(0, hashIdx).trim();
    // 引号
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    meta[key] = val;
  }

  // rest = frontmatter 之后的内容（保留原始前置空白）
  const rest = source.slice(leading) // 去掉最前的空白前缀
    .split('\n')
    .slice(endLine + 1)
    .join('\n');

  return { meta, rest };
}
