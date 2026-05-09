import { makeLayout } from './_layout-factory';

export default makeLayout({
  id: 'layout-grid-3',
  name: '3 列网格',
  description: '横向 3 列等宽网格（自适应：移动端单列）',
  source: 'common,landing',
  tags: ['grid', 'layout', '3col'],
  headingSample: 'Why this exists',
  containerCss: `
.comp-layout-grid-3 { margin-bottom: 40px; }
.comp-layout-grid-3 .layout-heading { font-family: var(--serif); font-weight: 500; font-size: 22px; margin: 0 0 14px; color: var(--slate); }
.comp-layout-grid-3 .layout-children {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}
@media (max-width: 880px) {
  .comp-layout-grid-3 .layout-children { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 560px) {
  .comp-layout-grid-3 .layout-children { grid-template-columns: 1fr; }
}
  `.trim(),
  sampleChildren: ['feature-card', 'feature-card', 'feature-card'],
});
