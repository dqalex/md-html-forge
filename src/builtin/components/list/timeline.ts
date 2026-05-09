import { defineComponent, isEmpty } from '../_base';

export default defineComponent({
  id: 'timeline',
  name: '时间线',
  description: '竖线 + 圆点时间节点',
  source: '12',
  category: 'list',
  tags: ['timeline', 'events'],
  slots: {
    timelineHeading: { label: '区块标题', type: 'text', placeholder: 'Timeline' },
    timeline: { label: '时间线内容（每条以时间开头）', type: 'content', placeholder: '- `14:02` · 监控告警触发\n- `14:14` · 回滚配置\n- `14:44` · 全量恢复' },
  },
  sample: {
    timelineHeading: 'Timeline',
    timeline: `- \`14:02\` · 监控触发 **p95 飙到 3.2s**，on-call 介入
- \`14:08\` · 定位到 Redis 连接池耗尽
- \`14:14\` · 回滚上一版配置（连接池从 20 → 100）
- \`14:31\` · 错误率回落到正常
- \`14:44\` · **全量恢复** · 复盘 doc 创建`,
  },
  css: `
.comp-timeline { margin-bottom: 40px; }
.comp-timeline h2 { font-family: var(--serif); font-weight: 500; font-size: 22px; margin: 0 0 8px; color: var(--slate); }
.comp-timeline ul { list-style: none; padding: 0; border-left: 1.5px solid var(--gray-300); margin: 12px 0 0 6px; }
.comp-timeline li { position: relative; padding: 6px 0 14px 18px; font-size: 14px; color: var(--gray-700); line-height: 1.6; }
.comp-timeline li::before { content: ""; position: absolute; left: -5px; top: 14px; width: 8px; height: 8px; border-radius: 50%; background: var(--clay); border: 2px solid var(--ivory); }
.comp-timeline strong, .comp-timeline code { font-family: var(--mono); background: transparent; color: var(--slate); padding: 0; font-size: 13px; }
  `.trim(),
  html: (s) => {
    if (isEmpty(s.timeline)) return '';
    return `
<section class="comp-timeline" data-section="timeline">
  ${!isEmpty(s.timelineHeading) ? `<h2 data-slot="timelineHeading">${s.timelineHeading}</h2><hr class="rule">` : ''}
  <div data-slot="timeline" data-slot-type="content">${s.timeline}</div>
</section>`.trim();
  },
});
