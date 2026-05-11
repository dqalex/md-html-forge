/**
 * 共享设计 Tokens — 所有组件共用
 *
 * 抽取自 html-effectiveness 项目的 editorial 设计语言：
 * - ivory 底色 + slate 主文字 + clay 强调
 * - serif 标题 + sans 正文 + mono 数据
 * - 880px 内容宽度 + 12px panel 圆角
 */

export const SHARED_TOKENS_CSS = `
:root {
  --ivory:   #FAF9F5;
  --slate:   #141413;
  --clay:    #D97757;
  --oat:     #E3DACC;
  --olive:   #788C5D;
  --rust:    #B04A3F;
  --gray-100: #F0EEE6;
  --gray-300: #D1CFC5;
  --gray-500: #87867F;
  --gray-700: #3D3D3A;
  --white:   #FFFFFF;
  --serif: ui-serif, Georgia, serif;
  --sans:  system-ui, -apple-system, sans-serif;
  --mono:  ui-monospace, 'SF Mono', Menlo, monospace;
  --radius-panel: 12px;
  --border: 1.5px solid var(--gray-300);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: var(--ivory);
  color: var(--slate);
  font-family: var(--sans);
  font-size: 15px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
.page { max-width: 880px; margin: 0 auto; padding: 56px 24px 120px; }
section { margin-bottom: 44px; }
section:last-child { margin-bottom: 0; }
hr.rule { border: none; border-top: 1px solid var(--gray-300); margin: 0 0 22px; }
p { margin: 0 0 14px; line-height: 1.7; color: var(--gray-700); }
code { font-family: var(--mono); font-size: 0.88em; background: var(--gray-100); padding: 1.5px 5px; border-radius: 4px; }
ul, ol { padding-left: 1.4em; margin: 0 0 14px; }
li { line-height: 1.7; color: var(--gray-700); margin-bottom: 4px; }
strong { color: var(--slate); }
a { color: var(--clay); text-decoration: none; border-bottom: 1px solid transparent; }
a:hover { border-bottom-color: var(--clay); }
blockquote { border-left: 2.5px solid var(--clay); padding: 4px 16px; margin: 14px 0; background: color-mix(in srgb, var(--clay) 6%, transparent); border-radius: 0 6px 6px 0; }
table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 14px; }
th { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--gray-300); color: var(--gray-500); font-weight: 500; font-size: 12px; letter-spacing: 0.03em; text-transform: uppercase; }
td { padding: 10px; border-bottom: 1px solid var(--gray-100); vertical-align: top; }

/* ===== 编辑器选中态（仅预览模式生效，导出时被 stripEditorAttrs 移除选中） ===== */
[data-forge-component-id] { position: relative; transition: outline 0.12s ease; }
[data-forge-component-id]:hover { outline: 1px dashed color-mix(in srgb, var(--clay) 50%, transparent); outline-offset: 4px; }
[data-forge-component-id].forge-selected { outline: 2px solid var(--clay); outline-offset: 4px; }
`.trim();

// ===== 共享工具：判空（注释/占位符也算空） =====

export function isEmpty(s: string | undefined): boolean {
  if (!s) return true;
  const trimmed = s.trim();
  if (!trimmed) return true;
  const stripped = trimmed.replace(/<!--[\s\S]*?-->/g, '').trim();
  if (!stripped) return true;
  if (/^\[[^\]]+\]$/.test(stripped)) return true;
  return false;
}

export function any(...vals: (string | undefined)[]): boolean {
  return vals.some(v => !isEmpty(v));
}
