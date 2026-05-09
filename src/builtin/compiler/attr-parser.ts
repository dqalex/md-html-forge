/**
 * 属性字符串解析器
 *
 * 支持形态（兼容 HTML + shell 风格）：
 *   key="value"        双引号，可含空格
 *   key='value'        单引号
 *   key=bare           裸值（不含空格/引号/=）
 *   bare               裸 flag（没有值，视为 ""）
 *
 * 第一个不带 = 的 bare token 会**额外**记录为 positional，便于上层识别
 * "@compose-group layout-grid-3 heading=Why"  →  positional='layout-grid-3', attrs={heading: 'Why'}
 *
 * 实现：手写小型 tokenizer，避免引入依赖；O(n) 单遍。
 */

export interface ParsedAttrs {
  /** 第一个无 key 的 bare token（若存在） */
  positional?: string;
  /** 所有 key=value 对（bare flag 值为 ''） */
  attrs: Record<string, string>;
  /** 所有 bare 值（按出现顺序，包含 positional） */
  bare: string[];
}

export function parseAttrs(input: string): ParsedAttrs {
  const out: ParsedAttrs = { attrs: {}, bare: [] };
  const n = input.length;
  let i = 0;

  while (i < n) {
    // 跳过空白
    while (i < n && isSpace(input.charCodeAt(i))) i++;
    if (i >= n) break;

    // 读 key（到 '=' / 空白 / 引号 / 结尾）
    const keyStart = i;
    while (i < n) {
      const c = input.charCodeAt(i);
      if (isSpace(c) || c === 61 /* = */ || c === 34 || c === 39) break;
      i++;
    }
    const key = input.slice(keyStart, i);
    if (!key) {
      // 跳过无法识别的字符
      i++;
      continue;
    }

    // 检查是否 key=...
    if (i < n && input.charCodeAt(i) === 61 /* = */) {
      i++; // 吃掉 '='
      const value = readValue(input, i);
      out.attrs[key] = value.value;
      i = value.nextIndex;
    } else {
      // 裸 flag：当作 bare value
      out.bare.push(key);
      if (out.positional === undefined) out.positional = key;
      // 保留进 attrs 方便上层随意读
      if (!(key in out.attrs)) out.attrs[key] = '';
    }
  }

  return out;
}

function readValue(input: string, start: number): { value: string; nextIndex: number } {
  if (start >= input.length) return { value: '', nextIndex: start };
  const ch = input.charCodeAt(start);

  if (ch === 34 || ch === 39) {
    // 引号字符串；支持 \" \\ 简单转义
    const quote = ch;
    let i = start + 1;
    let result = '';
    while (i < input.length) {
      const c = input.charCodeAt(i);
      if (c === 92 /* \\ */ && i + 1 < input.length) {
        const next = input.charCodeAt(i + 1);
        if (next === quote || next === 92) {
          result += input[i + 1];
          i += 2;
          continue;
        }
      }
      if (c === quote) return { value: result, nextIndex: i + 1 };
      result += input[i];
      i++;
    }
    // 未闭合：读到末尾
    return { value: result, nextIndex: input.length };
  }

  // 裸值：到下一个空白
  let i = start;
  while (i < input.length && !isSpace(input.charCodeAt(i))) i++;
  return { value: input.slice(start, i), nextIndex: i };
}

function isSpace(c: number): boolean {
  return c === 32 || c === 9 || c === 10 || c === 13;
}

/**
 * 判断字符串是否"像属性式"
 * - 含 = 表示有键值对
 * - 或含空白 + 无冒号开头
 *
 * 用于区分 `@slot:name` (冒号定位) 和 `@slot name=...` (属性式)
 */
export function looksLikeAttrStyle(input: string): boolean {
  return /=/.test(input) || /^[\w-]+(\s+[\w-]+)/.test(input);
}
