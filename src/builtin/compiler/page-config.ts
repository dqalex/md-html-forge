/**
 * Page 全局配置
 *
 * 通过 `<!-- @page: <preset> [band=<style>] -->` 指令配置文档级渲染参数。
 *
 * 支持形式：
 *   <!-- @page: wide -->               宽度预设
 *   <!-- @page: 960 -->                像素数字
 *   <!-- @page: 100% -->               百分比 / vw / fr（CSS 宽度语法直传）
 *   <!-- @page: wide band=full-bleed -->   同时指定主题段样式
 *   <!-- @page: 1080 band=contained -->    完全自定义
 *
 * 优先级（从高到低）：
 *   @page 指令 > 模板 defaultPage > 内置默认 (narrow=880 + contained)
 *
 * 一份文档只有一个 PageConfig（出现多次以最后一次为准）。
 * 不像 @layout/@theme 是"作用域指令"，@page 是"文档级一次性配置"。
 */

/** 预设宽度 */
export const PAGE_WIDTH_PRESETS = {
  mobile:  '420px',
  narrow:  '680px',   // 适合纯文章/博客
  reading: '760px',   // 阅读器
  default: '880px',   // 当前默认
  wide:    '1080px',  // 宽屏 PC
  xwide:   '1280px',  // 超宽
  full:    '100%',    // 无限制（配合容器自身 padding）
} as const;

export type PageWidthPreset = keyof typeof PAGE_WIDTH_PRESETS;

export type BandStyle = 'contained' | 'full-bleed';

export interface PageConfig {
  /** CSS 宽度值（直接用作 .page 的 max-width） */
  width: string;
  /**
   * 主题段样式：
   * - contained: 段背景受页宽约束（默认，视觉最协调）
   * - full-bleed: 段背景通栏，内容仍按 page 宽度居中
   */
  band: BandStyle;
}

export const DEFAULT_PAGE_CONFIG: PageConfig = {
  width: PAGE_WIDTH_PRESETS.default,
  band: 'contained',
};

const PAGE_DIRECTIVE = /<!--\s*@page\s*(?::|\s)\s*([^-][^\n]*?)\s*-->/g;

/**
 * 从 MD 源码解析 @page 指令；返回所有出现过的配置（最后一个生效）
 *
 * 支持：
 *   <!-- @page: wide -->             冒号式
 *   <!-- @page wide -->              属性式（positional）
 *   <!-- @page width=wide band=full-bleed -->   属性式多属性
 *
 * 放在 lexer 之前跑是最快的，因为 @page 是文档级配置，不影响 AST。
 */
export function parsePageConfig(source: string): PageConfig | null {
  let m: RegExpExecArray | null;
  const re = new RegExp(PAGE_DIRECTIVE.source, PAGE_DIRECTIVE.flags);
  let last: PageConfig | null = null;

  while ((m = re.exec(source)) !== null) {
    const raw = m[1]!.trim();
    const parsed = parsePageValue(raw);
    if (parsed) last = parsed;
  }

  return last;
}

/**
 * 解析 @page 值（两种形态都支持）：
 *   "wide"                      → width=1080, band=contained
 *   "960"                       → width=960px
 *   "100%"                      → width=100%
 *   "wide band=full"            → width=1080, band=full-bleed
 *   "band=full-bleed"           → 只改 band
 *   "width=wide band=full-bleed" → 全属性式
 */
function parsePageValue(raw: string): PageConfig | null {
  if (!raw) return null;

  const tokens = raw.split(/\s+/).filter(Boolean);
  let width: string | undefined;
  let band: BandStyle | undefined;

  for (const tok of tokens) {
    // width=xxx
    const widthMatch = tok.match(/^width=(.+)$/);
    if (widthMatch) {
      width = resolveWidth(widthMatch[1]!);
      continue;
    }

    // band=xxx
    const bandMatch = tok.match(/^band=(.+)$/);
    if (bandMatch) {
      const v = bandMatch[1]!.toLowerCase();
      if (v === 'full-bleed' || v === 'full' || v === 'bleed') band = 'full-bleed';
      else if (v === 'contained' || v === 'narrow') band = 'contained';
      continue;
    }

    // 其他：位置值（width 的简写）
    const w = resolveWidth(tok);
    if (w) width = w;
  }

  if (!width && !band) return null;
  return {
    width: width ?? DEFAULT_PAGE_CONFIG.width,
    band: band ?? DEFAULT_PAGE_CONFIG.band,
  };
}

/** 把一个 token 解析为 CSS 宽度值（预设名 / 纯数字 / 完整 CSS 值） */
function resolveWidth(tok: string): string | undefined {
  // 纯数字 → 像素
  if (/^\d+$/.test(tok)) return `${tok}px`;
  // CSS 值（px/rem/em/vw/%/ch 等）
  if (/^\d+(\.\d+)?(px|rem|em|vw|vh|%|ch)$/i.test(tok)) return tok;
  // 预设
  const preset = PAGE_WIDTH_PRESETS[tok as PageWidthPreset];
  if (preset) return preset;
  return undefined;
}

/** 合并：指令 > 模板默认 > 内置默认 */
export function resolvePageConfig(
  fromDirective: PageConfig | null,
  fromTemplate: Partial<PageConfig> | undefined,
  builtin: PageConfig = DEFAULT_PAGE_CONFIG,
): PageConfig {
  return {
    width: fromDirective?.width ?? fromTemplate?.width ?? builtin.width,
    band:  fromDirective?.band  ?? fromTemplate?.band  ?? builtin.band,
  };
}
