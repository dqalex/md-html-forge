import { defineComponent, isEmpty } from '../_base';

export default defineComponent({
  id: 'before-after',
  name: 'Before / After',
  description: '两列对比卡片',
  source: '17',
  category: 'visual',
  tags: ['diff', 'comparison'],
  slots: {
    before: { label: 'Before 内容', type: 'content', placeholder: '- 旧方式 1\n- 旧方式 2' },
    after:  { label: 'After 内容',  type: 'content', placeholder: '- 新方式 1\n- 新方式 2' },
  },
  sample: {
    before: `- 所有组件挤在 catalog.ts 一个 800 行文件里
- 新增组件要到唯一文件找插入位置
- Git diff 范围大，多人协作容易冲突`,
    after: `- 一个组件 = 一个文件，路径即类目
- \`defineComponent\` 工厂统一签名，模板化新增
- 类目 \`index.ts\` 只做 import + 数组聚合`,
  },
  css: `
.comp-ba { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 22px 0 40px; }
@media (max-width: 640px) { .comp-ba { grid-template-columns: 1fr; } }
.comp-ba .panel { background: var(--white); border: var(--border); border-radius: var(--radius-panel); padding: 18px 20px; }
.comp-ba .panel.after { border-color: var(--olive); }
.comp-ba .k { font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--gray-500); margin-bottom: 10px; }
.comp-ba .after .k { color: var(--olive); }
.comp-ba ul { list-style: none; padding: 0; margin: 0; }
.comp-ba li { padding-left: 14px; position: relative; line-height: 1.65; margin-bottom: 6px; font-size: 14px; }
.comp-ba li::before { content: '·'; position: absolute; left: 0; color: var(--gray-500); }
.comp-ba .after li::before { color: var(--olive); }
  `.trim(),
  html: (s) => {
    if (isEmpty(s.before) && isEmpty(s.after)) return '';
    return `
<section class="comp-ba" data-section="before-after">
  ${!isEmpty(s.before) ? `
  <div class="panel">
    <div class="k">Before</div>
    <div data-slot="before" data-slot-type="content">${s.before}</div>
  </div>` : ''}
  ${!isEmpty(s.after) ? `
  <div class="panel after">
    <div class="k">After</div>
    <div data-slot="after" data-slot-type="content">${s.after}</div>
  </div>` : ''}
</section>`.trim();
  },
});
