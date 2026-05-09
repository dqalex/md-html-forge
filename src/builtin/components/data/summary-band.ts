import { defineComponent, isEmpty } from '../_base';

export default defineComponent({
  id: 'summary-band',
  name: '4 列指标卡',
  description: 'KPI 指标带，横向 4 列等宽卡片',
  source: '11,16',
  category: 'data',
  tags: ['kpi', 'metrics', 'stats'],
  slots: {
    metricValue: { label: '指标数值（多行=多列）', type: 'data', placeholder: '14\n6\n1\n3' },
    metricLabel: { label: '指标说明（多行=多列）', type: 'data', placeholder: 'PRs merged\nDeploys\nIncidents\nFlaky tests' },
    metricDelta: { label: '变化趋势（多行=多列，可选）', type: 'data', placeholder: '+3 vs wk10\n±0\nSEV-2 · 47m\nsuite 99.1%' },
  },
  sample: {
    metricValue: '14\n6\n1\n99.1%',
    metricLabel: 'PRs merged\nDeploys\nIncidents\nSuite green',
    metricDelta: '+3 vs wk10\n±0\nSEV-2 · 47m\n+0.3pp',
  },
  css: `
.comp-summary-band { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 32px; }
@media (max-width: 720px) { .comp-summary-band { grid-template-columns: repeat(2, 1fr); } }
.comp-summary-band .stat-card { background: var(--white); border: var(--border); border-radius: var(--radius-panel); padding: 20px 22px 18px; }
.comp-summary-band .stat-num { font-family: var(--serif); font-size: 44px; font-weight: 500; line-height: 1; color: var(--slate); margin-bottom: 8px; }
.comp-summary-band .stat-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--gray-500); }
.comp-summary-band .stat-delta { font-family: var(--mono); font-size: 11px; margin-top: 6px; color: var(--gray-500); }
  `.trim(),
  html: (s) => {
    if (isEmpty(s.metricValue) && isEmpty(s.metricLabel)) return '';
    const values = (s.metricValue || '').split('\n').map(v => v.trim()).filter(Boolean);
    const labels = (s.metricLabel || '').split('\n').map(v => v.trim()).filter(Boolean);
    const deltas = (s.metricDelta || '').split('\n').map(v => v.trim()).filter(Boolean);
    const count  = Math.max(values.length, labels.length);
    if (count === 0) return '';
    const cards = Array.from({ length: count }, (_, i) => `
    <div class="stat-card">
      ${values[i] ? `<div class="stat-num" data-slot="metricValue" data-slot-type="data">${values[i]}</div>` : ''}
      ${labels[i] ? `<div class="stat-label" data-slot="metricLabel">${labels[i]}</div>` : ''}
      ${deltas[i] ? `<div class="stat-delta" data-slot="metricDelta">${deltas[i]}</div>` : ''}
    </div>`).join('');
    return `<section class="comp-summary-band" data-section="summary-band">${cards}</section>`;
  },
});
