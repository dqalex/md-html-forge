/**
 * Lexer
 *
 * 单遍扫描 MD → Token[]。
 *
 * 指令语法（两种并存，但**内容永远是纯 MD**）：
 *   冒号式: <!-- @compose: a, b -->     <!-- @slot:name -->
 *   紧凑式: <!-- @compose a, b -->      <!-- @use header -->
 *
 * 关键原则：**forge 指令只是注释，内容仍然是原生 Markdown**。
 * 所以我们**不再支持**属性式 slot (<!-- @slot title="..." -->)，
 * 因为那会把 "内容藏进注释属性"，在裸 MD 编辑器中丢失可读性。
 */

import type { SourceLoc } from './ast';
import { parseAttrs, type ParsedAttrs } from './attr-parser';

export type TokenKind =
  | 'compose'
  | 'layout'
  | 'theme'
  | 'use'
  | 'page'
  | 'slot-open'           // 冒号式 slot 开启
  | 'slot-close'
  | 'group-open'
  | 'group-close'
  | 'item-open'
  | 'item-close'
  | 'text';

export interface Token {
  kind: TokenKind;
  loc: SourceLoc;
  /** 单值 / 标识符（冒号式的值，或属性式的 positional） */
  value: string;
  /** 属性式指令携带的全量属性（目前仅 group/item 会有） */
  attrs?: ParsedAttrs;
}

export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  const n = source.length;
  const lineStarts = computeLineStarts(source);
  // 预扫 fenced code 区间（[start, end)），主循环中遇到 `<!--` 若落在
  // 任一区间内就跳过 —— Markdown 规范：fenced code 内不参与外层解析。
  // 这修了"文档里写 forge 语法示例时，示例里的 `<!-- @slot:x -->` 会被
  // lexer 当真实指令扫进来"的假诊断问题。
  const fencedRanges = collectFencedCodeRanges(source);

  let cursor = 0;
  // 防御性总迭代上限
  const MAX_ITER = Math.max(1000, source.length);
  let iter = 0;

  while (cursor < n) {
    if (++iter > MAX_ITER) break;
    const cursorBefore = cursor;
    const next = source.indexOf('<!--', cursor);

    if (next < 0) {
      pushTextIfAny(tokens, source, cursor, n, lineStarts);
      break;
    }
    // 若 `<!--` 落在 fenced code 内，整体作为 text 吞到 fenced 结束
    const inFence = findFenceContaining(fencedRanges, next);
    if (inFence) {
      pushTextIfAny(tokens, source, cursor, inFence.end, lineStarts);
      cursor = inFence.end;
      if (cursor === cursorBefore) cursor = cursorBefore + 1;
      continue;
    }
    if (next > cursor) {
      pushTextIfAny(tokens, source, cursor, next, lineStarts);
    }

    if (next < 0) {
      pushTextIfAny(tokens, source, cursor, n, lineStarts);
      break;
    }
    if (next > cursor) {
      pushTextIfAny(tokens, source, cursor, next, lineStarts);
    }

    const close = source.indexOf('-->', next + 4);
    if (close < 0) {
      pushTextIfAny(tokens, source, next, n, lineStarts);
      break;
    }
    const commentEnd = close + 3;
    const inner = source.slice(next + 4, close).trim();

    const matched = matchDirective(inner);
    if (matched) {
      tokens.push({
        kind: matched.kind,
        value: matched.value,
        attrs: matched.attrs,
        loc: makeLoc(next, commentEnd, lineStarts),
      });
    }
    // 非 forge 指令的 HTML 注释（如 <!-- ─── 分割线 ─── -->、<!-- TODO -->）
    // 静默丢弃 — 它们对最终渲染无意义，绝不能进入 text token
    // 否则会被 resolver/emitter 当成裸 markdown 兜底渲染出来

    cursor = commentEnd;
    // 全局兜底：游标必须前进
    if (cursor === cursorBefore) cursor = cursorBefore + 1;
  }

  return tokens;
}

// ===== Fenced code block 跳过 =====

interface FenceRange { start: number; end: number }

/**
 * 预扫整份源，返回所有 fenced code 的 [start, end) 区间。
 *
 * 识别规则（与 CommonMark 对齐的最小子集）：
 *   - 起 fence 所在行前导空白 ≤ 3 个
 *   - fence 由 3+ 个连续的 ` 或 ~ 组成
 *   - 闭合 fence 须同字符、同或更多长度，闭合后只能有空白
 *
 * 这样之后，lexer 主循环遇到落在任一区间内的 `<!--`，直接把整块当 text 吞掉，
 * 示例代码里的 `<!-- @slot:x -->` / `<!-- @/slot -->` 就不会被误当真实指令。
 */
function collectFencedCodeRanges(source: string): FenceRange[] {
  const ranges: FenceRange[] = [];
  const n = source.length;
  let i = 0;
  while (i < n) {
    // 推进到行首
    // i 如果不是行首，先找下一行首
    if (i > 0 && source.charCodeAt(i - 1) !== 10) {
      const nl = source.indexOf('\n', i);
      if (nl < 0) break;
      i = nl + 1;
      continue;
    }
    // 读取前导 0-3 空格
    let p = i;
    let leading = 0;
    while (leading < 4 && p < n && source.charCodeAt(p) === 32) { p++; leading++; }
    if (leading >= 4) { // 视为 indented code，不是 fenced；直接跳到下一行
      const nl = source.indexOf('\n', p);
      i = nl < 0 ? n : nl + 1;
      continue;
    }
    const fenceChar = source.charCodeAt(p);
    if (fenceChar !== 96 /* ` */ && fenceChar !== 126 /* ~ */) {
      const nl = source.indexOf('\n', p);
      i = nl < 0 ? n : nl + 1;
      continue;
    }
    let fenceLen = 0;
    while (p + fenceLen < n && source.charCodeAt(p + fenceLen) === fenceChar) fenceLen++;
    if (fenceLen < 3) {
      const nl = source.indexOf('\n', p + fenceLen);
      i = nl < 0 ? n : nl + 1;
      continue;
    }
    const start = i; // 连 fence 开行一起算入
    // 到本行末
    let lineEnd = source.indexOf('\n', p + fenceLen);
    if (lineEnd < 0) { ranges.push({ start, end: n }); break; }
    // 开始扫闭合
    let scan = lineEnd + 1;
    let closed = false;
    while (scan < n) {
      const nextNl = source.indexOf('\n', scan);
      const lineEndAbs = nextNl < 0 ? n : nextNl;
      let q = scan;
      let pad = 0;
      while (pad < 4 && q < lineEndAbs && source.charCodeAt(q) === 32) { q++; pad++; }
      if (pad < 4 && source.charCodeAt(q) === fenceChar) {
        let closeLen = 0;
        while (q + closeLen < lineEndAbs && source.charCodeAt(q + closeLen) === fenceChar) closeLen++;
        if (closeLen >= fenceLen) {
          let after = q + closeLen;
          let tailOk = true;
          while (after < lineEndAbs) {
            const cc = source.charCodeAt(after);
            if (cc !== 32 && cc !== 9) { tailOk = false; break; }
            after++;
          }
          if (tailOk) {
            const end = nextNl < 0 ? n : nextNl + 1;
            ranges.push({ start, end });
            i = end;
            closed = true;
            break;
          }
        }
      }
      if (nextNl < 0) break;
      scan = nextNl + 1;
    }
    if (!closed) {
      ranges.push({ start, end: n });
      break;
    }
  }
  return ranges;
}

/** 二分找包含 offset 的 fenced code 区间（不在则返回 null）。 */
function findFenceContaining(ranges: FenceRange[], offset: number): FenceRange | null {
  // 线性即可（文档级通常不过几十个 fence）
  for (const r of ranges) {
    if (offset >= r.start && offset < r.end) return r;
    if (r.start > offset) break;
  }
  return null;
}

// ===== 指令识别 =====

/** 支持的指令关键字（长度降序，避免 `compose-group` 被 `compose` 吞掉） */
const DIRECTIVE_KEYWORDS = [
  'compose-group',
  'compose',
  'layout',
  'theme',
  'page',
  'use',
  'slot',
  'item',
] as const;

function matchDirective(inner: string): { kind: TokenKind; value: string; attrs?: ParsedAttrs } | null {
  if (inner === '@/slot') return { kind: 'slot-close', value: '' };
  if (inner === '@/compose-group') return { kind: 'group-close', value: '' };
  if (inner === '@/item') return { kind: 'item-close', value: '' };

  if (inner.charCodeAt(0) !== 64 /* @ */) return null;

  const body = inner.slice(1);
  let keyword: string | null = null;
  for (const kw of DIRECTIVE_KEYWORDS) {
    if (body === kw || body.startsWith(kw + ':') || body.startsWith(kw + ' ') || body.startsWith(kw + '\t')) {
      keyword = kw;
      break;
    }
  }
  if (!keyword) return null;

  const rest = body.slice(keyword.length).trimStart();
  let colonMode = false;
  let rawValue = rest;
  if (rawValue.startsWith(':')) {
    colonMode = true;
    rawValue = rawValue.slice(1).trim();
  }

  if (keyword === 'slot') {
    // 只支持冒号式：<!-- @slot:name -->...<!-- @/slot -->
    // 紧凑属性式已废弃（违反 MD 兼容原则）
    if (colonMode) return { kind: 'slot-open', value: rawValue };
    // 裸 @slot name 也当 slot-open（name 取 positional token）
    const first = rawValue.split(/\s+/)[0];
    return { kind: 'slot-open', value: first ?? '' };
  }

  if (keyword === 'compose-group') {
    if (colonMode) return { kind: 'group-open', value: rawValue };
    const attrs = parseAttrs(rawValue);
    return { kind: 'group-open', value: attrs.positional ?? '', attrs };
  }

  if (keyword === 'item') {
    if (colonMode) return { kind: 'item-open', value: rawValue };
    const attrs = parseAttrs(rawValue);
    return { kind: 'item-open', value: attrs.positional ?? '', attrs };
  }

  if (keyword === 'compose') {
    return { kind: 'compose', value: rawValue };
  }

  if (keyword === 'page') {
    return { kind: 'page', value: rawValue };
  }

  if (keyword === 'layout' || keyword === 'theme' || keyword === 'use') {
    if (colonMode) return { kind: keyword, value: rawValue };
    const attrs = parseAttrs(rawValue);
    return { kind: keyword, value: attrs.positional ?? rawValue.trim(), attrs };
  }

  return null;
}

// ===== 工具 =====

function computeLineStarts(source: string): number[] {
  const starts: number[] = [0];
  for (let i = 0; i < source.length; i++) {
    if (source.charCodeAt(i) === 10) starts.push(i + 1);
  }
  return starts;
}

function makeLoc(start: number, end: number, lineStarts: number[]): SourceLoc {
  let lo = 0, hi = lineStarts.length - 1, line = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (lineStarts[mid]! <= start) {
      line = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return {
    start,
    end,
    line: line + 1,
    col: start - lineStarts[line]! + 1,
  };
}

function pushTextIfAny(
  tokens: Token[],
  source: string,
  start: number,
  end: number,
  lineStarts: number[],
): void {
  if (end <= start) return;
  const text = source.slice(start, end);
  if (!text) return;
  tokens.push({ kind: 'text', value: text, loc: makeLoc(start, end, lineStarts) });
}
