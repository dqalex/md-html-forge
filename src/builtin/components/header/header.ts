import { defineComponent, isEmpty, any } from '../_base';

export default defineComponent({
  id: 'header',
  name: '文档标题头',
  description: '主标题 + 副标题 + 眉标 + 徽章 + 日期/作者',
  source: '11,12,14',
  category: 'header',
  tags: ['title', 'heading', 'hero'],
  slots: {
    title:    { label: '主标题',      type: 'text',    placeholder: '文档标题',    bind: 'h1' },
    subtitle: { label: '副标题',      type: 'content', placeholder: '一句话描述',  bind: 'h2' },
    eyebrow:  { label: '眉标',        type: 'text',    placeholder: 'CATEGORY · TYPE' },
    badge:    { label: '徽章/版本',   type: 'text',    placeholder: 'v1.0' },
    date:     { label: '日期',        type: 'text',    placeholder: '2026-01-01' },
    author:   { label: '作者',        type: 'text',    placeholder: 'Author Name' },
  },
  sample: {
    title:    'md-html-forge',
    subtitle: '把 Markdown 喂进精心设计的 HTML 模板，输出**像一本书而不是一个网页**的单文件页面。',
    eyebrow:  'PLAYGROUND · DEMO',
    badge:    'v0.3',
    date:     '2026-05-09',
    author:   '@alexama',
  },
  css: `
.comp-header { margin-bottom: 40px; }
.comp-header h1 { font-family: var(--serif); font-weight: 500; font-size: 38px; letter-spacing: -0.01em; line-height: 1.18; margin: 0 0 10px; color: var(--slate); }
.comp-header .header-top { display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 8px; }
.comp-header .header-meta { display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: center; font-size: 14px; color: var(--gray-500); margin-top: 6px; }
.comp-header .badge { font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--gray-500); background: var(--gray-100); border: var(--border); border-radius: 999px; padding: 5px 11px; white-space: nowrap; }
.comp-header .eyebrow { font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--clay); margin-bottom: 8px; display: block; }
.comp-header .subtitle { font-size: 16px; color: var(--gray-700); margin-top: 6px; max-width: 720px; }
  `.trim(),
  html: (s) => {
    if (!any(s.title, s.subtitle, s.eyebrow, s.badge, s.date, s.author)) return '';
    return `
<header class="comp-header" data-section="header">
  ${!isEmpty(s.eyebrow) ? `<span class="eyebrow" data-slot="eyebrow">${s.eyebrow}</span>` : ''}
  <div class="header-top">
    ${!isEmpty(s.title) ? `<h1 data-slot="title">${s.title}</h1>` : ''}
    ${!isEmpty(s.badge) ? `<span class="badge" data-slot="badge">${s.badge}</span>` : ''}
  </div>
  ${!isEmpty(s.subtitle) ? `<div class="subtitle" data-slot="subtitle">${s.subtitle}</div>` : ''}
  ${any(s.date, s.author) ? `
  <div class="header-meta">
    ${!isEmpty(s.date) ? `<span data-slot="date">${s.date}</span>` : ''}
    ${!isEmpty(s.author) ? `<span data-slot="author">${s.author}</span>` : ''}
  </div>` : ''}
</header>`.trim();
  },
});
