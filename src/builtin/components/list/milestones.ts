import { defineComponent, isEmpty } from '../_base';

export default defineComponent({
  id: 'milestones',
  name: '里程碑',
  description: '`## Week N` 标题 + 说明的阶段推进',
  source: '16',
  category: 'list',
  tags: ['milestones', 'plan'],
  slots: {
    milestonesHeading: { label: '区块标题', type: 'text', placeholder: 'Milestones' },
    milestones: { label: '里程碑（每个 ## 标题为一个）', type: 'content', placeholder: '## Week 1\n架构设计\n\n## Week 2\n核心实现' },
  },
  sample: {
    milestonesHeading: 'Milestones',
    milestones: `## Week 1 · Foundations
搭建组件库脚手架，完成前 8 个 category 目录和 \`defineComponent\` 工厂。

## Week 2 · Core 20
从 html-effectiveness 抽离并实现 20 个核心组件，建立 sample 内容标准。

## Week 3 · Library 40+
补齐 chip / callout / feature-card / flow-diagram / kanban 等高频组件。

## Week 4 · Polish
组件浏览器搜索优化 + starter markdown 生成器 + 全量截图测试。`,
  },
  css: `
.comp-milestones { margin-bottom: 40px; }
.comp-milestones h2.title { font-family: var(--serif); font-weight: 500; font-size: 22px; margin: 0 0 8px; color: var(--slate); }
.comp-milestones h2 { font-family: var(--serif); font-weight: 500; font-size: 19px; color: var(--slate); margin: 14px 0 4px; }
.comp-milestones h2::before { content: '◆'; color: var(--clay); margin-right: 8px; font-size: 12px; vertical-align: middle; }
  `.trim(),
  html: (s) => {
    if (isEmpty(s.milestones)) return '';
    return `
<section class="comp-milestones" data-section="milestones">
  ${!isEmpty(s.milestonesHeading) ? `<h2 class="title" data-slot="milestonesHeading">${s.milestonesHeading}</h2><hr class="rule">` : ''}
  <div data-slot="milestones" data-slot-type="content">${s.milestones}</div>
</section>`.trim();
  },
});
