import { defineComponent, isEmpty } from '../_base';

export default defineComponent({
  id: 'actions',
  name: '行动清单',
  description: '卡片式 checkbox 清单（带 owner）',
  source: '12',
  category: 'list',
  tags: ['todo', 'actions'],
  slots: {
    actionsHeading: { label: '区块标题', type: 'text', placeholder: 'Action Items', bind: 'h2' },
    actions: { label: '清单内容（建议用 Markdown checkbox）', type: 'content', placeholder: '- [ ] 修复 Bug A — Alice\n- [x] 已完成项', bind: 'list' },
  },
  sample: {
    actionsHeading: 'Action Items',
    actions: `- [x] 事故影响面公告 — @alice · 已发站内信
- [x] 回滚预案脚本化 — @bob · PR #1301
- [ ] 连接池阈值写入告警 — @chen · 预计 next week
- [ ] 引入 circuit breaker 到 session store — @dana · 待评估`,
  },
  css: `
.comp-actions { margin-bottom: 40px; }
.comp-actions h2 { font-family: var(--serif); font-weight: 500; font-size: 22px; margin: 0 0 8px; color: var(--slate); }
.comp-actions ul { list-style: none; padding: 0; background: var(--white); border: var(--border); border-radius: var(--radius-panel); overflow: hidden; }
.comp-actions li { padding: 14px 18px; border-bottom: 1px solid var(--gray-100); font-size: 14px; color: var(--slate); display: flex; align-items: flex-start; gap: 12px; }
.comp-actions li:last-child { border-bottom: none; }
.comp-actions li input[type="checkbox"] { margin-top: 4px; accent-color: var(--olive); }
  `.trim(),
  html: (s) => {
    if (isEmpty(s.actions)) return '';
    return `
<section class="comp-actions" data-section="actions">
  ${!isEmpty(s.actionsHeading) ? `<h2 data-slot="actionsHeading">${s.actionsHeading}</h2><hr class="rule">` : ''}
  <div data-slot="actions" data-slot-type="content">${s.actions}</div>
</section>`.trim();
  },
});
