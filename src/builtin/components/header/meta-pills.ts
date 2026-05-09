import { defineComponent, isEmpty } from '../_base';

export default defineComponent({
  id: 'meta-pills',
  name: '状态标签行',
  description: '彩色胶囊标签（SEV / Resolved / Neutral）',
  source: '12',
  category: 'header',
  tags: ['tags', 'chips', 'status'],
  slots: {
    pills: { label: '标签（每行：文本|类型 sev/resolved/neutral）', type: 'content', placeholder: 'SEV-2|sev\nResolved|resolved\n47 min|neutral' },
  },
  sample: {
    pills: 'SEV-2|sev\nResolved|resolved\n47 min · 14:02–14:49|neutral\nowner · @alice|neutral',
  },
  css: `
.comp-meta-pills { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 12px; margin-bottom: 32px; }
.comp-meta-pills .pill { display: inline-flex; align-items: baseline; gap: 6px; font-size: 12px; font-weight: 600; border-radius: 999px; padding: 5px 12px; line-height: 1; }
.comp-meta-pills .pill.sev { background: var(--clay); color: var(--white); letter-spacing: 0.03em; }
.comp-meta-pills .pill.resolved { background: var(--olive); color: var(--white); }
.comp-meta-pills .pill.neutral { background: var(--gray-100); color: var(--gray-700); border: var(--border); }
  `.trim(),
  html: (s) => {
    if (isEmpty(s.pills)) return '';
    // pills 经过 content 类型预处理后是 HTML，需剥标签再按行解析
    const raw = s.pills.replace(/<[^>]+>/g, '\n').replace(/\n+/g, '\n');
    const pills = raw.split('\n').map(line => {
      const parts = line.split('|').map(v => v.trim());
      const text = parts[0] || '';
      const type = parts[1] || 'neutral';
      if (!text) return '';
      return `<span class="pill ${type}">${text}</span>`;
    }).filter(Boolean).join('');
    if (!pills) return '';
    return `<div class="comp-meta-pills" data-slot="pills" data-section="meta-pills">${pills}</div>`;
  },
});
