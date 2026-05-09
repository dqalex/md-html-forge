/**
 * html-effectiveness 的编辑质感样式（design tokens + base reset + typography）
 * 所有模板共享这一段 CSS，然后各自补充自己的版式 CSS。
 */
export const EFFECTIVENESS_BASE_CSS = `
:root {
  --ivory: #FAF9F5;
  --paper: #FBFAF5;
  --slate: #141413;
  --ink: #1a1915;
  --clay: #D97757;
  --clay-soft: rgba(217, 119, 87, 0.12);
  --oat: #E3DACC;
  --olive: #788C5D;
  --gray-100: #F5F4EE;
  --gray-150: #F0EEE6;
  --gray-300: #D1CFC5;
  --gray-500: #87867F;
  --gray-700: #3D3D3A;
  --ok: #4f8a6a;
  --warn: #c08a3a;
  --bad: #b45247;
  --serif: "Source Serif 4", ui-serif, Georgia, "Times New Roman", serif;
  --sans:  "Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --mono:  "JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; }
body {
  background: var(--ivory);
  color: var(--gray-700);
  font-family: var(--sans);
  font-size: 15px;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  padding: 48px 24px 96px;
}
h1, h2, h3, h4 {
  font-family: var(--serif);
  color: var(--slate);
  font-weight: 500;
  letter-spacing: -0.005em;
}
h1 { font-size: 32px; line-height: 1.2; }
h2 { font-size: 22px; line-height: 1.3; margin: 28px 0 12px; }
h3 { font-size: 17px; line-height: 1.4; margin: 20px 0 8px; }
p  { margin: 10px 0; color: var(--gray-700); }
a  { color: var(--clay); text-decoration: none; border-bottom: 1px solid transparent; }
a:hover { border-bottom-color: var(--clay); }
code {
  font-family: var(--mono);
  font-size: 13px;
  background: var(--gray-100);
  padding: 2px 5px;
  border-radius: 3px;
  color: var(--slate);
}
pre {
  font-family: var(--mono);
  font-size: 13px;
  background: #1a1915;
  color: #e8e6dd;
  padding: 16px 18px;
  border-radius: 6px;
  overflow: auto;
  margin: 12px 0;
}
pre code { background: transparent; padding: 0; color: inherit; }
ul, ol { padding-left: 22px; margin: 10px 0; }
li { margin: 4px 0; }
blockquote {
  border-left: 2.5px solid var(--clay);
  padding: 4px 16px;
  margin: 14px 0;
  color: var(--gray-700);
  background: var(--clay-soft);
  font-style: normal;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  font-size: 14px;
}
th {
  text-align: left;
  padding: 8px 10px;
  border-bottom: 1px solid var(--gray-300);
  color: var(--gray-500);
  font-weight: 500;
  font-size: 12px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
td {
  padding: 10px;
  border-bottom: 1px solid var(--gray-150);
  vertical-align: top;
}
hr { border: none; border-top: 1px solid var(--gray-300); margin: 24px 0; }
.eyebrow {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gray-500);
  margin-bottom: 10px;
  display: block;
}
.meta {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--gray-500);
}
.page {
  max-width: 960px;
  margin: 0 auto;
}
`;
