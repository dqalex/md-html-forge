import { defineComponent, isEmpty } from '../_base';

export default defineComponent({
  id: 'progress',
  name: '进度条列表',
  description: '项目进度列表（标题 + 百分比 + 说明）',
  source: '09',
  category: 'visual',
  tags: ['progress', 'status'],
  slots: {
    progressHeading: { label: '区块标题', type: 'text', placeholder: 'In Progress' },
    progressItems: { label: '进度（每行：标题|百分比|说明）', type: 'data', placeholder: '功能开发|70%|核心完成\n测试覆盖|35%|单测通过' },
  },
  sample: {
    progressHeading: 'In Progress',
    progressItems: `组件库 Core 20|100%|已完成，可用于组合
组件库扩展到 40+|45%|进行中，优先补齐 chip/callout/flow
组件浏览器搜索 & 多选|25%|原型已跑通，待打磨
模板导入/导出|0%|设计阶段`,
  },
  css: `
.comp-progress { margin-bottom: 40px; }
.comp-progress h2 { font-family: var(--serif); font-weight: 500; font-size: 22px; margin: 0 0 8px; color: var(--slate); }
.comp-progress ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 28px; margin: 12px 0 0; }
.comp-progress .prog-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
.comp-progress .prog-title { font-family: var(--serif); font-size: 17px; font-weight: 500; color: var(--slate); }
.comp-progress .prog-pct { font-family: var(--mono); font-size: 12px; color: var(--gray-500); }
.comp-progress .prog-track { width: 100%; height: 5px; background: var(--gray-100); border-radius: 3px; overflow: hidden; margin-bottom: 8px; }
.comp-progress .prog-fill { height: 100%; background: var(--clay); border-radius: 3px; }
.comp-progress .prog-note { font-size: 13px; line-height: 1.6; color: var(--gray-700); }
  `.trim(),
  html: (s) => {
    if (isEmpty(s.progressItems)) return '';
    const items = s.progressItems.split('\n').map(line => {
      const parts = line.split('|').map(v => v.trim());
      const title = parts[0]; const pct = parts[1] || ''; const note = parts[2] || '';
      if (!title) return '';
      const numPct = Math.max(0, Math.min(100, parseInt(pct) || 0));
      return `
      <li>
        <div class="prog-head">
          <span class="prog-title">${title}</span>
          ${pct ? `<span class="prog-pct">${pct}</span>` : ''}
        </div>
        <div class="prog-track"><div class="prog-fill" style="width:${numPct}%"></div></div>
        ${note ? `<p class="prog-note">${note}</p>` : ''}
      </li>`;
    }).filter(Boolean).join('');
    if (!items) return '';
    return `
<section class="comp-progress" data-section="progress">
  ${!isEmpty(s.progressHeading) ? `<h2 data-slot="progressHeading">${s.progressHeading}</h2><hr class="rule">` : ''}
  <ul data-slot="progressItems">${items}</ul>
</section>`.trim();
  },
});
