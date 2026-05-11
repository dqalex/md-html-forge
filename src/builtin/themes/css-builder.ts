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
 *
 * ---
 *
 * ## Root-scope 生成（buildRootThemeCss）
 *
 * 除了"段内"作用域，我们还需要把"文档默认主题"提升到 `:root` + `body`，
 * 才能让整页的底色、字体、强调色跟随用户选择的"全局主题"。
 * 不这么做的话，body 永远读 shared-tokens 里写死的 `--ivory = #FAF9F5`，
 * 选 dark 主题会出现"只有某段变黑、其他部分依然米色"的割裂感。
 *
 * 层级策略：
 *   shared-tokens(:root 基线)  <  rootTheme(:root 覆盖)  <  .theme-<id>(段级覆盖)
 * 因此段级 @theme 仍可针对性局部覆盖根主题。
 */

import type { ThemeDef } from './types';
import type { BandStyle } from '../compiler/page-config';

/**
 * 把一个 ThemeDef 映射成 `--xxx: value;` 行列表（不含 `:root { }` 或 `.theme-x { }` 包裹）。
 *
 * 单一事实源：任何主题变量新增只需在这里加一行，`buildThemeCss` / `buildRootThemeCss`
 * 自动跟进，避免"根作用域和段作用域两份逻辑漂移"。
 */
function buildThemeVars(theme: ThemeDef): string[] {
  const vars: string[] = [];

  // 语义 token
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

  // 中性层级：浅底表面 + 细分割线
  // 没有这两条时，深色主题下组件里大量 `background: var(--gray-100)` 和
  // `border: ... var(--gray-300)` 会变成"深底上的米色方块 + 扎眼亮边"。
  if (theme.surfaceSunken) vars.push(`--gray-100: ${theme.surfaceSunken};`);
  if (theme.borderSubtle) vars.push(`--gray-300: ${theme.borderSubtle};`);

  if (theme.border) vars.push(`--border: ${theme.border};`);
  if (theme.radius) vars.push(`--radius-panel: ${theme.radius};`);

  // 字体
  if (theme.fontSerif) vars.push(`--serif: ${theme.fontSerif};`);
  if (theme.fontSans) vars.push(`--sans: ${theme.fontSans};`);
  if (theme.fontMono) vars.push(`--mono: ${theme.fontMono};`);

  return vars;
}

export function buildThemeCss(theme: ThemeDef, band: BandStyle = 'contained'): string {
  const scope = `.theme-${theme.id}`;
  const vars = buildThemeVars(theme);
  const blockRules: string[] = [];

  // 段容器自身的背景/文字色
  if (theme.background) blockRules.push(`background: ${theme.background};`);
  if (theme.text) blockRules.push(`color: ${theme.text};`);

  // 留白默认值：
  //   - sectionGap  外围 margin → 段与段 / 段与其他内容之间的呼吸
  //   - sectionInset 内边距 padding → 段内内容与段边缘之间的呼吸
  // 背景色与外层不同时（dark 插入 ivory 页面），这两个值撑起视觉喘息。
  const sectionGap = theme.sectionGap ?? '24px 0';
  const sectionInset = theme.sectionInset ?? '28px 32px';

  let css = '';
  if (vars.length) {
    css += `${scope} {\n  ${vars.join('\n  ')}\n}\n`;
  }
  if (blockRules.length) {
    if (band === 'full-bleed') {
      // 通栏模式：段背景延伸到视口两侧，内容仍按页宽居中
      // 我们额外生成一个内层 div，实际内容还是受 .page max-width 约束
      css += `${scope} {\n  ${blockRules.join('\n  ')}\n  margin: ${sectionGap};\n  margin-left: calc(50% - 50vw);\n  margin-right: calc(50% - 50vw);\n  padding: ${sectionInset === '28px 32px' ? '28px max(24px, calc(50vw - var(--page-half)))' : sectionInset};\n}\n`;
    } else {
      // 受限模式：段与其他段宽度一致（默认，推荐）
      css += `${scope} {\n  ${blockRules.join('\n  ')}\n  padding: ${sectionInset};\n  border-radius: var(--radius-panel, 12px);\n  margin: ${sectionGap};\n}\n`;
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

/**
 * 为"文档默认主题"生成提升到 :root + body 的全局 CSS。
 *
 * 作用：
 *   - 覆盖 shared-tokens 里写死的 `:root` 变量，把整页的底色、字体、强调色
 *     换成用户选的全局主题
 *   - 直接设置 body 的 background / color，让 iframe 整页换肤
 *   - 不处理 padding / margin / radius —— 那些是段级视觉，继续在 .theme-<id> 里生效
 *
 * 与 buildThemeCss 的区别：
 *   - buildThemeCss 产物作用域是 `.theme-<id>`，只覆盖段容器
 *   - 本函数产物作用域是 `:root` + `body`，覆盖整页
 *   - 同时保留 `.theme-<id>` 以便嵌套段级主题能再覆盖根主题
 */
export function buildRootThemeCss(theme: ThemeDef): string {
  const vars = buildThemeVars(theme);
  const bodyRules: string[] = [];

  // body 基础色：背景 + 正文色
  if (theme.background) bodyRules.push(`background: ${theme.background};`);
  if (theme.text) bodyRules.push(`color: ${theme.text};`);
  if (theme.fontSans) bodyRules.push(`font-family: ${theme.fontSans};`);

  let css = '';
  if (vars.length) {
    css += `:root {\n  ${vars.join('\n  ')}\n}\n`;
  }
  if (bodyRules.length) {
    css += `body {\n  ${bodyRules.join('\n  ')}\n}\n`;
  }
  return css;
}
