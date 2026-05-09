/**
 * 语义图表样式（按需注入）
 *
 * 三种图表的 CSS 抽成独立片段，由 emitter 根据产物中是否出现
 * `data-diagram="flow|compare|steps"` 决定是否注入。
 *
 * 好处：不写流程图的文档，HTML 里就没有这些选择器 —— 精简导出。
 */

export const FLOW_CSS = `
/* === flow diagram === */
.sd-flow {
  display: flex; flex-direction: column; align-items: center;
  gap: 6px; margin: 16px 0; padding: 16px; background: rgba(0,0,0,0.02);
  border-radius: 10px;
}
.sd-flow-node {
  background: rgba(37,99,235,0.08);
  border: 1.5px solid rgba(37,99,235,0.25);
  border-radius: 8px; padding: 10px 24px; min-width: 200px; text-align: center;
  font-size: 0.95em; color: rgba(37,99,235,0.95);
  transition: all 0.2s;
}
.sd-flow-box {
  background: rgba(37,99,235,0.05);
  border: 2px solid rgba(37,99,235,0.2);
  border-radius: 8px; padding: 12px 20px; min-width: 220px;
  line-height: 1.6; font-size: 0.9em;
}
.sd-flow-arrow {
  font-size: 1.1em; color: rgba(37,99,235,0.4); line-height: 1; padding: 4px 0;
  user-select: none;
}
.sd-flow-group {
  display: flex; flex-direction: column; align-items: center; gap: 4px; width: 100%;
}
.sd-flow-row {
  display: flex; flex-direction: row; flex-wrap: wrap; justify-content: center;
  align-items: center; gap: 4px; width: 100%;
}
.sd-flow-row .sd-flow-arrow { padding: 0 8px; font-size: 1.4em; }
.sd-flow-row .sd-flow-node { flex: 1 1 0; min-width: 0; }
.sd-flow-label {
  font-size: 0.82em; font-weight: 700; color: rgba(37,99,235,0.8);
  text-transform: uppercase; letter-spacing: 0.05em;
  padding: 4px 0; margin-top: 4px;
}
.sd-flow-node.sd-status-success,
.sd-flow-box.sd-status-success { border-color: #22c55e; background: rgba(34,197,94,0.08); color: #15803d; }
.sd-flow-node.sd-status-error,
.sd-flow-box.sd-status-error   { border-color: #ef4444; background: rgba(239,68,68,0.08); color: #b91c1c; }
.sd-flow-node.sd-status-warn,
.sd-flow-box.sd-status-warn    { border-color: #f59e0b; background: rgba(245,158,11,0.08); color: #b45309; }
`.trim();

export const COMPARE_CSS = `
/* === compare diagram === */
.sd-compare {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px; margin: 16px 0;
}
.sd-compare-col {
  border: 1px solid rgba(0,0,0,0.1); border-radius: 10px;
  overflow: hidden; display: flex; flex-direction: column;
}
.sd-compare-col.sd-compare-success { border-color: rgba(34,197,94,0.3); }
.sd-compare-col.sd-compare-error   { border-color: rgba(239,68,68,0.3); }
.sd-compare-col.sd-compare-warn    { border-color: rgba(245,158,11,0.3); }
.sd-compare-title {
  font-weight: 700; font-size: 0.95em; padding: 10px 16px;
  border-bottom: 1px solid rgba(0,0,0,0.06);
}
.sd-compare-title.sd-status-success { background: rgba(34,197,94,0.1); color: #15803d; }
.sd-compare-title.sd-status-error   { background: rgba(239,68,68,0.1); color: #b91c1c; }
.sd-compare-title.sd-status-warn    { background: rgba(245,158,11,0.1); color: #b45309; }
.sd-compare-item {
  padding: 6px 16px; font-size: 0.88em; line-height: 1.6;
  border-bottom: 1px solid rgba(0,0,0,0.04);
}
.sd-compare-item:last-child { border-bottom: none; }
.sd-compare-item.sd-status-success { background: rgba(34,197,94,0.06); }
.sd-compare-item.sd-status-error   { background: rgba(239,68,68,0.06); }
.sd-compare-item.sd-status-warn    { background: rgba(245,158,11,0.06); }
`.trim();

export const STEPS_CSS = `
/* === steps diagram === */
.sd-steps {
  display: flex; align-items: flex-start; gap: 0;
  margin: 16px 0; flex-wrap: wrap;
}
.sd-step {
  flex: 1 1 0; min-width: 140px; position: relative;
  padding: 12px 16px; border-left: 3px solid rgba(37,99,235,0.3);
}
.sd-step-number {
  display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 50%;
  background: rgba(37,99,235,0.15); color: rgba(37,99,235,0.95);
  font-size: 0.8em; font-weight: 700;
  margin-bottom: 6px;
}
.sd-step-title { font-size: 0.95em; font-weight: 600; margin-bottom: 4px; }
.sd-step-desc  { font-size: 0.85em; color: rgba(0,0,0,0.6); line-height: 1.5; }
`.trim();

/**
 * 检测 HTML 内容中是否包含指定 diagram
 */
export function detectDiagrams(html: string): { flow: boolean; compare: boolean; steps: boolean } {
  return {
    flow:    html.includes('data-diagram="flow"'),
    compare: html.includes('data-diagram="compare"'),
    steps:   html.includes('data-diagram="steps"'),
  };
}

/**
 * 根据 HTML 内容按需构建 CSS
 */
export function buildDiagramCss(html: string): string {
  const d = detectDiagrams(html);
  const parts: string[] = [];
  if (d.flow) parts.push(FLOW_CSS);
  if (d.compare) parts.push(COMPARE_CSS);
  if (d.steps) parts.push(STEPS_CSS);
  return parts.join('\n\n');
}
