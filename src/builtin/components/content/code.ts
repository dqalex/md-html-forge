import { defineComponent, isEmpty } from '../_base';

export default defineComponent({
  id: 'code',
  name: '代码块',
  description: '独立的深色代码 panel，含文件路径',
  source: '12,16,17',
  category: 'content',
  tags: ['code', 'snippet'],
  slots: {
    codePath: { label: '文件路径', type: 'text', placeholder: 'src/worker.ts' },
    codeContent: { label: '代码', type: 'content', placeholder: '```js\nconsole.log("hello")\n```', bind: 'code' },
  },
  sample: {
    codePath: 'src/builtin/renderer.ts',
    codeContent: `\`\`\`typescript
export function renderComposed(
  md: string,
  options: { template?: TemplateDef } = {},
): ComposeResult {
  const composeIds = parseComposeDirective(md) ?? options.template?.componentIds ?? [];
  // ... 解析组件、提取 slot、拼装 HTML
}
\`\`\``,
  },
  css: `
.comp-code { margin-bottom: 32px; }
.comp-code .code-panel { background: var(--slate); color: var(--gray-100); border-radius: var(--radius-panel); padding: 18px 20px; font-family: var(--mono); font-size: 13px; line-height: 1.7; overflow-x: auto; }
.comp-code .code-path { color: var(--gray-500); font-size: 12px; margin-bottom: 10px; display: block; }
.comp-code .code-panel pre { background: transparent; color: inherit; padding: 0; margin: 0; }
.comp-code .code-panel code { background: transparent; color: inherit; padding: 0; }
  `.trim(),
  html: (s) => {
    if (isEmpty(s.codeContent)) return '';
    return `
<div class="comp-code" data-section="code">
  <div class="code-panel">
    ${!isEmpty(s.codePath) ? `<span class="code-path" data-slot="codePath">${s.codePath}</span>` : ''}
    <div data-slot="codeContent" data-slot-type="content">${s.codeContent}</div>
  </div>
</div>`.trim();
  },
});
