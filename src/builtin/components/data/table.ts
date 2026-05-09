import { defineComponent, isEmpty } from '../_base';

export default defineComponent({
  id: 'table',
  name: '数据表格',
  description: '带卡片边框的 Markdown 表格',
  source: '11',
  category: 'data',
  tags: ['table', 'grid'],
  slots: {
    tableHeading: { label: '表格标题', type: 'text', placeholder: 'Shipped' },
    tableContent: { label: '表格（Markdown 表格）', type: 'content', placeholder: '| PR | Title | Author |\n|---|---|---|\n| #1234 | Fix login | Alice |' },
  },
  sample: {
    tableHeading: 'Shipped This Week',
    tableContent: `| PR | Title | Author | Impact |
|---|---|---|---|
| #1234 | Login retries + circuit breaker | @alice | p0 |
| #1240 | Move session store to Redis | @bob | p1 |
| #1244 | Worker graceful shutdown | @chen | p1 |
| #1247 | New metric: DAU by plan | @dana | p2 |`,
  },
  css: `
.comp-table { margin-bottom: 40px; }
.comp-table h2 { font-family: var(--serif); font-weight: 500; font-size: 22px; margin: 0 0 8px; color: var(--slate); }
.comp-table table { width: 100%; border-collapse: separate; border-spacing: 0; background: var(--white); border: var(--border); border-radius: var(--radius-panel); overflow: hidden; }
.comp-table table th { text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--gray-500); background: var(--gray-100); padding: 12px 16px; border-bottom: 1px solid var(--gray-300); }
.comp-table table td { padding: 13px 16px; border-bottom: 1px solid var(--gray-100); font-size: 14px; }
.comp-table table tr:last-child td { border-bottom: none; }
.comp-table table tr:hover { background: var(--ivory); }
  `.trim(),
  html: (s) => {
    if (isEmpty(s.tableContent)) return '';
    return `
<section class="comp-table" data-section="table">
  ${!isEmpty(s.tableHeading) ? `<h2 data-slot="tableHeading">${s.tableHeading}</h2><hr class="rule">` : ''}
  <div data-slot="tableContent" data-slot-type="content">${s.tableContent}</div>
</section>`.trim();
  },
});
