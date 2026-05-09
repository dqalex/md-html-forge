import { defineComponent, isEmpty } from '../_base';

export default defineComponent({
  id: 'metrics',
  name: '大指标卡（Hero）',
  description: '52px serif 数字的 2 列大指标',
  source: '09',
  category: 'data',
  tags: ['kpi', 'metric', 'hero'],
  slots: {
    heroMetricValue: { label: '指标数值（多行=多个）', type: 'data', placeholder: '184ms\n0.21%' },
    heroMetricLabel: { label: '指标名称（多行=多个）', type: 'data', placeholder: 'API p95 延迟\n后台任务错误率' },
    heroMetricDelta: { label: '变化趋势（多行=多个）', type: 'data', placeholder: '↓ 12% wk/wk\n↓ 0.08pp' },
  },
  sample: {
    heroMetricValue: '184ms\n0.21%',
    heroMetricLabel: 'API p95 延迟\n后台任务错误率',
    heroMetricDelta: '↓ 12% wk/wk\n↓ 0.08pp',
  },
  css: `
.comp-metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 48px; margin-bottom: 40px; }
@media (max-width: 600px) { .comp-metrics { grid-template-columns: 1fr; gap: 28px; } }
.comp-metrics .metric-label { font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gray-500); margin-bottom: 14px; }
.comp-metrics .metric-value { font-family: var(--serif); font-size: 52px; font-weight: 500; line-height: 1; letter-spacing: -0.01em; color: var(--slate); }
.comp-metrics .metric-delta { font-family: var(--mono); font-size: 13px; margin-top: 12px; color: var(--olive); }
  `.trim(),
  html: (s) => {
    if (isEmpty(s.heroMetricValue) && isEmpty(s.heroMetricLabel)) return '';
    const values = (s.heroMetricValue || '').split('\n').map(v => v.trim()).filter(Boolean);
    const labels = (s.heroMetricLabel || '').split('\n').map(v => v.trim()).filter(Boolean);
    const deltas = (s.heroMetricDelta || '').split('\n').map(v => v.trim()).filter(Boolean);
    const count  = Math.max(values.length, labels.length);
    if (count === 0) return '';
    const cards = Array.from({ length: count }, (_, i) => `
    <div class="metric">
      ${labels[i] ? `<div class="metric-label" data-slot="heroMetricLabel">${labels[i]}</div>` : ''}
      ${values[i] ? `<div class="metric-value" data-slot="heroMetricValue" data-slot-type="data">${values[i]}</div>` : ''}
      ${deltas[i] ? `<div class="metric-delta" data-slot="heroMetricDelta">${deltas[i]}</div>` : ''}
    </div>`).join('');
    return `<section class="comp-metrics" data-section="metrics">${cards}</section>`;
  },
});
