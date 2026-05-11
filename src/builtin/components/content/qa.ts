import { defineComponent, isEmpty } from '../_base';

export default defineComponent({
  id: 'qa',
  name: '问答 / 开放问题',
  description: 'FAQ 风格的 ## 问题 + 回答',
  source: '14,16',
  category: 'content',
  tags: ['faq', 'questions'],
  slots: {
    qaHeading: { label: '区块标题', type: 'text', placeholder: 'FAQ / Open Questions', bind: 'h2' },
    qa: { label: '内容（## 为问题）', type: 'content', placeholder: '## 问题 1?\n回答 1\n\n## 问题 2?\n回答 2', bind: 'content' },
  },
  sample: {
    qaHeading: 'Open Questions',
    qa: `## 为什么不直接用 MDX？

MDX 需要编译 + 运行 React。我们的目标场景是"一份 MD 生成单文件 HTML"，不需要客户端运行时。

## 组件之间能嵌套吗？

当前版本不能。为了保持"自由组合"的心智简单，我们选择**扁平组合**：\`@compose\` 里的每个组件都是一个独立的 section。

## 如何新增组件？

在 \`src/builtin/components/<category>/\` 下新建一个文件，\`export default defineComponent({...})\`，然后在该 category 的 \`index.ts\` 里 import 并注册即可。`,
  },
  css: `
.comp-qa { margin-bottom: 40px; }
.comp-qa h2.title { font-family: var(--serif); font-weight: 500; font-size: 22px; margin: 0 0 8px; color: var(--slate); }
.comp-qa h2 { font-weight: 600; font-size: 15px; color: var(--slate); margin: 14px 0 4px; padding: 14px 18px 0; background: var(--white); border: var(--border); border-left: 4px solid var(--clay); border-bottom: none; border-radius: 10px 10px 0 0; }
.comp-qa h2 + p { padding: 0 18px 14px; background: var(--white); border: var(--border); border-left: 4px solid var(--clay); border-top: none; border-radius: 0 0 10px 10px; margin-top: 0; margin-bottom: 12px; font-size: 14px; color: var(--gray-700); }
  `.trim(),
  html: (s) => {
    if (isEmpty(s.qa)) return '';
    return `
<section class="comp-qa" data-section="qa">
  ${!isEmpty(s.qaHeading) ? `<h2 class="title" data-slot="qaHeading">${s.qaHeading}</h2><hr class="rule">` : ''}
  <div data-slot="qa" data-slot-type="content">${s.qa}</div>
</section>`.trim();
  },
});
