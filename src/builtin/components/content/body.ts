import { defineComponent, isEmpty } from '../_base';

export default defineComponent({
  id: 'body',
  name: '正文',
  description: '标准 Markdown 正文（标题/列表/代码/引用/表格）',
  source: '14,15',
  category: 'content',
  tags: ['text', 'article'],
  slots: {
    body: { label: '正文（支持完整 Markdown）', type: 'content', placeholder: '## 章节\n\n正文内容...', bind: 'content' },
  },
  sample: {
    body: `## 为什么做这个

我们厌倦了两种极端：

- 纯 Markdown 渲染出来像 GitHub README，**没有气质**
- 手写 HTML + CSS 又意味着每写一个文档都要重新调版式

> **折中方案不存在，但一个有限组件库 + 自由组合的系统可以无限趋近**

## 工作方式

1. 选一个内置模板，或者完全从 \`@compose\` 开始
2. 在 MD 里写 \`<!-- @slot:xxx -->内容<!-- @/slot -->\`
3. 右侧实时预览，所见即所得

## 代码片段

\`\`\`typescript
// 预处理 slot 值：根据 type 决定用块级还是行内 MD 渲染
if (def?.type === 'content') {
  slots[name] = sanitizeHtml(simpleMdToHtml(raw.trim()));
} else if (def?.type === 'text') {
  slots[name] = sanitizeHtml(inlineMdToHtml(raw.trim()));
}
\`\`\``,
  },
  css: `
.comp-body { max-width: 720px; margin-bottom: 40px; }
.comp-body h2 { font-family: var(--serif); font-weight: 500; font-size: 22px; letter-spacing: -0.01em; margin: 28px 0 8px; color: var(--slate); }
.comp-body h2:first-child { margin-top: 0; }
.comp-body h3 { font-family: var(--serif); font-weight: 500; font-size: 17px; margin: 22px 0 6px; color: var(--slate); }
.comp-body p { font-size: 15px; line-height: 1.75; margin: 0 0 12px; color: var(--gray-700); }
.comp-body ul, .comp-body ol { padding-left: 1.4em; margin: 8px 0 14px; }
.comp-body li { line-height: 1.7; color: var(--gray-700); margin-bottom: 4px; }
.comp-body blockquote { border-left: 2.5px solid var(--clay); padding: 6px 16px; margin: 14px 0; background: rgba(217,119,87,0.06); }
.comp-body strong { color: var(--slate); }
.comp-body pre { background: var(--slate); color: #E8E6DE; border-radius: var(--radius-panel); padding: 16px 18px; overflow-x: auto; margin: 14px 0; font-family: var(--mono); font-size: 13px; line-height: 1.6; }
.comp-body pre code { background: transparent; color: inherit; padding: 0; }
  `.trim(),
  html: (s) => {
    if (isEmpty(s.body)) return '';
    return `
<section class="comp-body" data-section="body">
  <div data-slot="body" data-slot-type="content">${s.body}</div>
</section>`.trim();
  },
});
