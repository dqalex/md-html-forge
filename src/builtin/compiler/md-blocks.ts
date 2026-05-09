/**
 * 轻量 Markdown 块分割器
 *
 * 目标：识别 MD 中常见的块级元素的"起始位置 + 类型 + 原始内容"，
 *       而**不**深入行内语法。行内语法由已有的 simpleMdToHtml 处理。
 *
 * 支持块类型：
 *   - heading (h1/h2/h3/h4/h5/h6)
 *   - blockquote (> 开头的连续行)
 *   - fenced-code  (```lang ... ```)
 *   - ul-list   (- / * / + 开头)
 *   - ol-list   (1. / 1) 开头)
 *   - table     (| ... | + 分隔行)
 *   - paragraph (非以上类型的连续行)
 *   - blank     (空行，不算 block，仅作分隔)
 *
 * 每个块都保留绝对偏移 + 行号，保证点击定位能回到源码。
 */

import type { SourceLoc } from './ast';

export type MdBlockKind =
  | 'heading'
  | 'blockquote'
  | 'fenced-code'
  | 'ul-list'
  | 'ol-list'
  | 'table'
  | 'paragraph'
  | 'hr';

export interface MdBlock {
  kind: MdBlockKind;
  /** heading 的层级 (1-6)，非 heading 为 0 */
  level: number;
  /** 原始块文本（从块起始到块结束的完整片段，不含尾随空行） */
  raw: string;
  /** 源码位置 */
  loc: SourceLoc;
  /** 代码块语言（仅 fenced-code） */
  lang?: string;
}

/**
 * 在给定字符范围内扫描 MD 块
 * @param source 完整源文件
 * @param fromOffset 扫描起点
 * @param toOffset 扫描终点（不含）
 * @param lineStartsOverride 可选的行起点数组，避免重复计算
 */
export function scanMdBlocks(
  source: string,
  fromOffset: number,
  toOffset: number,
  lineStartsOverride?: number[],
): MdBlock[] {
  const lineStarts = lineStartsOverride ?? computeLineStarts(source);
  const blocks: MdBlock[] = [];

  // 把目标区间按 \n 切成行（含偏移）
  const lines: Array<{ text: string; start: number; end: number; line: number }> = [];
  let cursor = fromOffset;
  while (cursor < toOffset) {
    const nl = source.indexOf('\n', cursor);
    const end = nl < 0 || nl >= toOffset ? toOffset : nl;
    lines.push({
      text: source.slice(cursor, end),
      start: cursor,
      end,
      line: lineIndexAt(cursor, lineStarts) + 1,
    });
    if (nl < 0 || nl >= toOffset) break;
    cursor = nl + 1;
  }

  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    const trimmed = line.text.trim();

    // 空行
    if (!trimmed) { i++; continue; }

    // HTML 注释行（forge 指令等）整段跳过，不当作块
    if (/^<!--[\s\S]*?-->\s*$/.test(trimmed)) { i++; continue; }

    // Fenced code: ``` or ~~~
    const fenceMatch = trimmed.match(/^(`{3,}|~{3,})\s*(\S*)\s*$/);
    if (fenceMatch) {
      const fence = fenceMatch[1]!;
      const lang = fenceMatch[2] || undefined;
      const startLine = line;
      let j = i + 1;
      let endLine = line;
      while (j < lines.length) {
        const closeMatch = lines[j]!.text.trim().match(/^(`{3,}|~{3,})\s*$/);
        if (closeMatch && closeMatch[1]!.startsWith(fence[0]!) && closeMatch[1]!.length >= fence.length) {
          endLine = lines[j]!;
          j++;
          break;
        }
        endLine = lines[j]!;
        j++;
      }
      blocks.push({
        kind: 'fenced-code',
        level: 0,
        lang,
        raw: source.slice(startLine.start, endLine.end),
        loc: makeLoc(startLine.start, endLine.end, lineStarts),
      });
      i = j;
      continue;
    }

    // Heading: # / ## ... ######
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (headingMatch) {
      blocks.push({
        kind: 'heading',
        level: headingMatch[1]!.length,
        raw: line.text,
        loc: makeLoc(line.start, line.end, lineStarts),
      });
      i++;
      continue;
    }

    // HR
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(trimmed)) {
      blocks.push({
        kind: 'hr',
        level: 0,
        raw: line.text,
        loc: makeLoc(line.start, line.end, lineStarts),
      });
      i++;
      continue;
    }

    // Blockquote: 连续 > 开头
    if (/^>/.test(trimmed)) {
      const startLine = line;
      let j = i;
      let endLine = line;
      while (j < lines.length && /^\s*>/.test(lines[j]!.text)) {
        endLine = lines[j]!;
        j++;
      }
      blocks.push({
        kind: 'blockquote',
        level: 0,
        raw: source.slice(startLine.start, endLine.end),
        loc: makeLoc(startLine.start, endLine.end, lineStarts),
      });
      i = j;
      continue;
    }

    // UL: - / * / +
    if (/^[-*+]\s+/.test(trimmed)) {
      const startLine = line;
      let j = i;
      let endLine = line;
      while (j < lines.length) {
        const t = lines[j]!.text;
        if (/^[-*+]\s+/.test(t.trim()) || /^\s{2,}\S/.test(t)) {
          endLine = lines[j]!;
          j++;
        } else if (!t.trim()) {
          break;
        } else {
          break;
        }
      }
      blocks.push({
        kind: 'ul-list',
        level: 0,
        raw: source.slice(startLine.start, endLine.end),
        loc: makeLoc(startLine.start, endLine.end, lineStarts),
      });
      i = j;
      continue;
    }

    // OL: 1. / 1)
    if (/^\d+[.)]\s+/.test(trimmed)) {
      const startLine = line;
      let j = i;
      let endLine = line;
      while (j < lines.length) {
        const t = lines[j]!.text;
        if (/^\d+[.)]\s+/.test(t.trim()) || /^\s{2,}\S/.test(t)) {
          endLine = lines[j]!;
          j++;
        } else if (!t.trim()) {
          break;
        } else {
          break;
        }
      }
      blocks.push({
        kind: 'ol-list',
        level: 0,
        raw: source.slice(startLine.start, endLine.end),
        loc: makeLoc(startLine.start, endLine.end, lineStarts),
      });
      i = j;
      continue;
    }

    // Table: 当前行 | ... | 且下一行是分隔行 | --- | --- |
    if (/^\|.+\|\s*$/.test(trimmed) && i + 1 < lines.length &&
        /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(lines[i + 1]!.text.trim())) {
      const startLine = line;
      let j = i;
      let endLine = line;
      while (j < lines.length && /^\|/.test(lines[j]!.text.trim())) {
        endLine = lines[j]!;
        j++;
      }
      blocks.push({
        kind: 'table',
        level: 0,
        raw: source.slice(startLine.start, endLine.end),
        loc: makeLoc(startLine.start, endLine.end, lineStarts),
      });
      i = j;
      continue;
    }

    // Paragraph: 其他连续非空行（直到遇到空行 / 块起始标记）
    const startLine = line;
    let j = i;
    let endLine = line;
    while (j < lines.length) {
      const t = lines[j]!.text;
      const tt = t.trim();
      if (!tt) break;
      if (/^#{1,6}\s+/.test(tt)) break;
      if (/^>/.test(tt)) break;
      if (/^(`{3,}|~{3,})/.test(tt)) break;
      if (/^[-*+]\s+/.test(tt) || /^\d+[.)]\s+/.test(tt)) break;
      if (/^<!--/.test(tt)) break;
      endLine = lines[j]!;
      j++;
    }
    blocks.push({
      kind: 'paragraph',
      level: 0,
      raw: source.slice(startLine.start, endLine.end),
      loc: makeLoc(startLine.start, endLine.end, lineStarts),
    });
    i = j;
  }

  return blocks;
}

// ===== 工具 =====

function computeLineStarts(source: string): number[] {
  const starts: number[] = [0];
  for (let i = 0; i < source.length; i++) {
    if (source.charCodeAt(i) === 10) starts.push(i + 1);
  }
  return starts;
}

function lineIndexAt(offset: number, lineStarts: number[]): number {
  let lo = 0, hi = lineStarts.length - 1, line = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (lineStarts[mid]! <= offset) { line = mid; lo = mid + 1; }
    else hi = mid - 1;
  }
  return line;
}

function makeLoc(start: number, end: number, lineStarts: number[]): SourceLoc {
  const line = lineIndexAt(start, lineStarts);
  return {
    start,
    end,
    line: line + 1,
    col: start - lineStarts[line]! + 1,
  };
}
