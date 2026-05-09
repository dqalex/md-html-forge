import { defineComponent, isEmpty } from '../_base';

export default defineComponent({
  id: 'options',
  name: '方案对比 (Decision)',
  description: '带上下文的方案对比卡片',
  source: '09,01',
  category: 'visual',
  tags: ['decision', 'options'],
  slots: {
    optionTitle: { label: '决策问题', type: 'text', placeholder: '本周是否发布？' },
    optionContext: { label: '上下文', type: 'content', placeholder: '提前发布 → X 收益，但有 Y 风险...' },
    options: { label: '选项（每行一个，第一项默认高亮）', type: 'data', placeholder: 'A — 本周发布\nB — 推迟到下版本' },
  },
  sample: {
    optionTitle: '是否继续拆分到 122 个组件？',
    optionContext: '当前 20 个核心组件已覆盖 80% 文档场景，但 html-effectiveness 里还有 100+ 个小众视觉模式（看板、幻灯片、特效等）未实现。继续拆会让 SKU 膨胀，但能覆盖更多表达需求。',
    options: `A — 推进到 122 个，作为长期目标
B — 停在 20-40 个，保持精炼
C — 允许模板提供 customComponents，用户自选扩展`,
  },
  css: `
.comp-options { margin-bottom: 40px; }
.comp-options .decision-card { border: 1.5px solid var(--clay); border-radius: 14px; padding: 28px 32px; background: rgba(217,119,87,0.04); }
.comp-options .decision-q { font-family: var(--serif); font-size: 22px; line-height: 1.4; margin-bottom: 10px; color: var(--slate); }
.comp-options .decision-context { font-size: 14px; line-height: 1.65; color: var(--gray-700); margin-bottom: 20px; }
.comp-options .opts { display: flex; gap: 10px; flex-wrap: wrap; }
.comp-options .chip { font-family: var(--mono); font-size: 12px; padding: 8px 14px; border-radius: 999px; border: 1.5px solid var(--gray-300); color: var(--gray-700); background: var(--white); }
.comp-options .chip.primary { border-color: var(--clay); color: var(--clay); background: rgba(217,119,87,0.06); }
  `.trim(),
  html: (s) => {
    if (isEmpty(s.optionTitle) && isEmpty(s.options)) return '';
    const optChips = !isEmpty(s.options)
      ? s.options.split('\n').map(v => v.trim()).filter(Boolean).map((line, i) =>
          `<span class="chip${i === 0 ? ' primary' : ''}">${line}</span>`
        ).join('')
      : '';
    return `
<section class="comp-options" data-section="options">
  <div class="decision-card">
    ${!isEmpty(s.optionTitle) ? `<div class="decision-q" data-slot="optionTitle">${s.optionTitle}</div>` : ''}
    ${!isEmpty(s.optionContext) ? `<div class="decision-context" data-slot="optionContext" data-slot-type="content">${s.optionContext}</div>` : ''}
    ${optChips ? `<div class="opts" data-slot="options">${optChips}</div>` : ''}
  </div>
</section>`.trim();
  },
});
