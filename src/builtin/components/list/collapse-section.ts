import { defineComponent, isEmpty, any } from '../_base';

/**
 * Collapse Section · 可折叠段落
 *
 * 使用原生 details/summary 实现的可折叠内容区块，
 * 带源码引用徽章和旋转箭头指示器。
 */
export default defineComponent({
  id: 'collapse-section',
  name: '折叠段落',
  description: '带源码引用的可折叠内容区块（details/summary）',
  source: '14',
  category: 'list',
  tags: ['collapse', 'details', 'accordion', 'expandable'],

  slots: {
    sectionTitle: { label: '段落标题', type: 'text', placeholder: '1 · Identify the caller' },
    sectionWhere: { label: '源码引用', type: 'text', placeholder: 'middleware/ratelimit.ts:21' },
    sectionBody: { label: '折叠内容', type: 'content', placeholder: 'The middleware first reduces the request to a `bucketKey`...', bind: 'content' },
  },

  sample: {
    sectionTitle: '1 · Identify the caller',
    sectionWhere: 'middleware/ratelimit.ts:21',
    sectionBody: 'The middleware first reduces the request to a `bucketKey`: API key if an `Authorization` header is present, otherwise the client IP (via the `x-forwarded-for` chain, trusting only our own LB). Anonymous IP traffic gets a much lower default tier.',
  },

  css: `
.comp-collapse-section {
  border: 1.5px solid var(--gray-300);
  border-radius: var(--radius-panel);
  background: var(--white);
  margin: 14px 0;
  overflow: hidden;
}
.comp-collapse-section summary {
  list-style: none;
  cursor: pointer;
  padding: 14px 16px;
  font-family: var(--serif);
  font-size: 16px;
  color: var(--slate);
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.comp-collapse-section summary::-webkit-details-marker { display: none; }
.comp-collapse-section summary::before {
  content: "\\25B8";
  color: var(--clay);
  font-family: var(--sans);
  font-size: 12px;
  transition: transform 120ms;
}
.comp-collapse-section details[open] > summary::before { transform: rotate(90deg); }
.comp-collapse-section .cs-where {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--gray-500);
  margin-left: auto;
}
.comp-collapse-section .cs-body {
  padding: 0 16px 16px;
  font-size: 14px;
  color: var(--gray-700);
}
  `.trim(),

  html: (s) => {
    if (!any(s.sectionTitle, s.sectionBody)) return '';
    return `
<details class="comp-collapse-section" data-section="collapse-section">
  <summary>
    ${!isEmpty(s.sectionTitle) ? `<span data-slot="sectionTitle">${s.sectionTitle}</span>` : ''}
    ${!isEmpty(s.sectionWhere) ? `<span class="cs-where" data-slot="sectionWhere">${s.sectionWhere}</span>` : ''}
  </summary>
  ${!isEmpty(s.sectionBody) ? `<div class="cs-body" data-slot="sectionBody" data-slot-type="content">${s.sectionBody}</div>` : ''}
</details>`.trim();
  },
});
