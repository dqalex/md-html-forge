import { defineComponent, isEmpty } from '../_base';

export default defineComponent({
  id: 'rollout',
  name: '发布阶段',
  description: '连续的发布阶段条带',
  source: '17',
  category: 'visual',
  tags: ['rollout', 'release'],
  slots: {
    rolloutHeading: { label: '区块标题', type: 'text', placeholder: 'Rollout' },
    rolloutSteps: { label: '阶段（每行：when|pct|描述）', type: 'data', placeholder: 'Day 0|internal|仅团队\nDay 2|10%|抽样\nDay 4|100%|全量' },
  },
  sample: {
    rolloutHeading: 'Rollout Plan',
    rolloutSteps: `Day 0|internal|仅团队，观察 30 min
Day 1|5%|抽样用户，错误率 < 0.1%
Day 3|30%|扩大样本，p95 不劣化
Day 5|100%|全量切换，保留 flag 一周`,
  },
  css: `
.comp-rollout { margin-bottom: 40px; }
.comp-rollout h2 { font-family: var(--serif); font-weight: 500; font-size: 22px; margin: 0 0 14px; color: var(--slate); }
.comp-rollout .steps { display: flex; gap: 0; }
@media (max-width: 640px) { .comp-rollout .steps { flex-direction: column; } }
.comp-rollout .step { flex: 1; background: var(--white); border: var(--border); padding: 16px 18px; }
.comp-rollout .step:first-child { border-radius: 12px 0 0 12px; }
.comp-rollout .step:last-child { border-radius: 0 12px 12px 0; }
.comp-rollout .step + .step { border-left: none; }
@media (max-width: 640px) {
  .comp-rollout .step, .comp-rollout .step:first-child, .comp-rollout .step:last-child { border-radius: 12px; }
  .comp-rollout .step + .step { border-left: var(--border); margin-top: 10px; }
}
.comp-rollout .pct { font-family: var(--mono); font-size: 22px; font-weight: 600; color: var(--clay); margin-bottom: 6px; }
.comp-rollout .when { font-family: var(--mono); font-size: 11px; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
.comp-rollout .d { font-size: 13px; color: var(--gray-500); }
  `.trim(),
  html: (s) => {
    if (isEmpty(s.rolloutSteps)) return '';
    const steps = s.rolloutSteps.split('\n').map(line => {
      const parts = line.split('|').map(v => v.trim());
      const when = parts[0] || ''; const pct = parts[1] || ''; const d = parts[2] || '';
      if (!when && !pct && !d) return '';
      return `<div class="step">${when ? `<div class="when">${when}</div>` : ''}${pct ? `<div class="pct">${pct}</div>` : ''}${d ? `<div class="d">${d}</div>` : ''}</div>`;
    }).filter(Boolean).join('');
    if (!steps) return '';
    return `
<section class="comp-rollout" data-section="rollout">
  ${!isEmpty(s.rolloutHeading) ? `<h2 data-slot="rolloutHeading">${s.rolloutHeading}</h2>` : ''}
  <div class="steps" data-slot="rolloutSteps">${steps}</div>
</section>`.trim();
  },
});
