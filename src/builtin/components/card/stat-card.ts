import { defineComponent, isEmpty, any } from '../_base';

/**
 * Stat Card · 单个数据卡片
 *
 * 用于布局组件循环时的"自由数据卡"，比 summary-band 更灵活
 * （summary-band 强制 4 列固定结构，stat-card 可放进任意布局）
 */
export default defineComponent({
  id: 'stat-card',
  name: '指标卡片',
  description: '可放进任意布局的单个数据卡（数值 + 标签 + 趋势）',
  source: '11,16',
  category: 'card',
  tags: ['stat', 'kpi', 'metric'],
  slots: {
    statValue: { label: '数值', type: 'text', placeholder: '184ms' },
    statLabel: { label: '指标名', type: 'text', placeholder: 'API p95 延迟' },
    statDelta: { label: '趋势（可选）', type: 'text', placeholder: '↓ 12% wk/wk' },
  },
  sample: {
    statValue: '184ms',
    statLabel: 'API p95 延迟',
    statDelta: '↓ 12% wk/wk',
  },
  css: `
.comp-stat-card {
  background: var(--white);
  border: var(--border);
  border-radius: var(--radius-panel);
  padding: 20px 22px 18px;
  height: 100%;
}
.comp-stat-card .stat-num {
  font-family: var(--serif);
  font-size: 36px;
  font-weight: 500;
  line-height: 1;
  color: var(--slate);
  margin-bottom: 8px;
}
.comp-stat-card .stat-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gray-500);
}
.comp-stat-card .stat-delta {
  font-family: var(--mono);
  font-size: 11px;
  margin-top: 6px;
  color: var(--olive);
}
  `.trim(),
  html: (s) => {
    if (!any(s.statValue, s.statLabel)) return '';
    return `
<div class="comp-stat-card" data-section="stat-card">
  ${!isEmpty(s.statValue) ? `<div class="stat-num" data-slot="statValue">${s.statValue}</div>` : ''}
  ${!isEmpty(s.statLabel) ? `<div class="stat-label" data-slot="statLabel">${s.statLabel}</div>` : ''}
  ${!isEmpty(s.statDelta) ? `<div class="stat-delta" data-slot="statDelta">${s.statDelta}</div>` : ''}
</div>`.trim();
  },
});
