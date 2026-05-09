/**
 * 主题 → CSS 字符串
 *
 * 把 ThemeDef 转成 scoped CSS：
 *   .theme-<id> { --ivory: ...; --slate: ...; ... }
 *   .theme-<id> { background: ...; color: ...; }
 *
 * 作用域只覆盖"段"容器内部，不影响全局 body。
 *
 * 段的视觉样式由两端共同决定：
 *   - ThemeDef.bandStyle（默认）
 *   - PageConfig.band（文档级覆盖）
 *
 * 决策发生在 emitter，这里只按 buildThemeCss(theme, band) 的签名接收结果。
 */

import type { ThemeDef } from './types';
import type { BandStyle } from '../compiler/page-config';

export function buildThemeCss(theme: ThemeDef, band: BandStyle = 'contained'): string {
  const scope = `.theme-${theme.id}`;
  const vars: string[] = [];
  const blockRules: string[] = [];

  // 颜色 token 覆盖
  if (theme.background) vars.push(`--ivory: ${theme.background};`);
  if (theme.text) vars.push(`--gray-700: ${theme.text};`);
  if (theme.heading) vars.push(`--slate: ${theme.heading};`);
  if (theme.strong) vars.push(`--slate: ${theme.strong};`);
  if (theme.accent) vars.push(`--clay: ${theme.accent};`);
  if (theme.accentSoft) vars.push(`--oat: ${theme.accentSoft};`);
  if (theme.muted) vars.push(`--gray-500: ${theme.muted};`);
  if (theme.success) vars.push(`--olive: ${theme.success};`);
  if (theme.warning) vars.push(`--rust: ${theme.warning};`);
  if (theme.surface) vars.push(`--white: ${theme.surface};`);
  if (theme.border) vars.push(`--border: ${theme.border};`);
  if (theme.radius) vars.push(`--radius-panel: ${theme.radius};`);

  // 字体
  if (theme.fontSerif) vars.push(`--serif: ${theme.fontSerif};`);
  if (theme.fontSans) vars.push(`--sans: ${theme.fontSans};`);
  if (theme.fontMono) vars.push(`--mono: ${theme.fontMono};`);

  // 段容器自身的背景/文字色
  if (theme.background) blockRules.push(`background: ${theme.background};`);
  if (theme.text) blockRules.push(`color: ${theme.text};`);

  let css = '';
  if (vars.length) {
    css += `${scope} {\n  ${vars.join('\n  ')}\n}\n`;
  }
  if (blockRules.length) {
    if (band === 'full-bleed') {
      // 通栏模式：段背景延伸到视口两侧，内容仍按页宽居中
      // 我们额外生成一个内层 div，实际内容还是受 .page max-width 约束
      css += `${scope} {\n  ${blockRules.join('\n  ')}\n  margin-left: calc(50% - 50vw);\n  margin-right: calc(50% - 50vw);\n  padding: 28px max(24px, calc(50vw - var(--page-half)));\n}\n`;
    } else {
      // 受限模式：段与其他段宽度一致（默认，推荐）
      css += `${scope} {\n  ${blockRules.join('\n  ')}\n  padding: 24px 28px;\n  border-radius: var(--radius-panel, 12px);\n  margin: 16px 0;\n}\n`;
    }
  }
  if (theme.extraCss) {
    css += `${theme.extraCss}\n`;
  }

  return css;
}

/** 收集多个主题的 CSS（去重） */
export function buildThemesCss(themes: ThemeDef[], band: BandStyle = 'contained'): string {
  const seen = new Set<string>();
  const parts: string[] = [];
  for (const t of themes) {
    if (seen.has(t.id)) continue;
    seen.add(t.id);
    // 主题自己如声明了 bandStyle，优先用它；否则用全局 band
    const finalBand = t.bandStyle ?? band;
    const css = buildThemeCss(t, finalBand);
    if (css) parts.push(css);
  }
  return parts.join('\n');
}
