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

  let cursor = 0;

  while (cursor < n) {
    const next = source.indexOf('<!--', cursor);

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
    } else {
      tokens.push({
        kind: 'text',
        value: source.slice(next, commentEnd),
        loc: makeLoc(next, commentEnd, lineStarts),
      });
    }

    cursor = commentEnd;
  }

  return tokens;
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
