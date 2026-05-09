import { makeLayout } from './_layout-factory';

export default makeLayout({
  id: 'layout-grid-4',
  name: '4 列网格',
  description: '横向 4 列等宽网格，常用于指标卡片墙',
  source: 'common',
  tags: ['grid', 'layout', '4col', 'kpi'],
  containerCss: `
.comp-layout-grid-4 { margin-bottom: 40px; }
.comp-layout-grid-4 .layout-heading { font-family: var(--serif); font-weight: 500; font-size: 22px; margin: 0 0 14px; color: var(--slate); }
.comp-layout-grid-4 .layout-children {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
@media (max-width: 880px) {
  .comp-layout-grid-4 .layout-children { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .comp-layout-grid-4 .layout-children { grid-template-columns: 1fr; }
}
  `.trim(),
  sampleChildren: ['stat-card', 'stat-card', 'stat-card', 'stat-card'],
});
