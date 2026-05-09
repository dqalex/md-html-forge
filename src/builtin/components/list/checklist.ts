import { defineComponent, isEmpty } from '../_base';

export default defineComponent({
  id: 'checklist',
  name: '待办清单',
  description: '简洁版 checkbox 列表',
  source: '17',
  category: 'list',
  tags: ['todo', 'checklist'],
  slots: {
    checklistHeading: { label: '区块标题', type: 'text', placeholder: 'Test Plan' },
    checklist: { label: '清单（Markdown checkbox）', type: 'content', placeholder: '- [x] 已完成\n- [ ] 待完成' },
  },
  sample: {
    checklistHeading: 'Review Checklist',
    checklist: `- [x] 单测覆盖新增代码路径
- [x] 预发环境通跑，无 regression
- [ ] Staging 灰度 1h 观察 p95 / 错误率
- [ ] 准备 rollback 脚本 + 通知文案`,
  },
  css: `
.comp-checklist { margin-bottom: 40px; }
.comp-checklist h2 { font-family: var(--serif); font-weight: 500; font-size: 22px; margin: 0 0 8px; color: var(--slate); }
.comp-checklist ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.comp-checklist li { padding: 12px 16px; background: var(--white); border: var(--border); border-radius: 10px; font-size: 14px; color: var(--slate); display: flex; align-items: flex-start; gap: 10px; }
.comp-checklist li input[type="checkbox"] { margin-top: 3px; accent-color: var(--olive); }
  `.trim(),
  html: (s) => {
    if (isEmpty(s.checklist)) return '';
    return `
<section class="comp-checklist" data-section="checklist">
  ${!isEmpty(s.checklistHeading) ? `<h2 data-slot="checklistHeading">${s.checklistHeading}</h2><hr class="rule">` : ''}
  <div data-slot="checklist" data-slot-type="content">${s.checklist}</div>
</section>`.trim();
  },
});
