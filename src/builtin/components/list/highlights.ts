import { defineComponent, isEmpty } from '../_base';

export default defineComponent({
  id: 'highlights',
  name: '亮点列表',
  description: 'clay 方块 bullet 的重点列表',
  source: '11',
  category: 'list',
  tags: ['bullet', 'highlights'],
  slots: {
    highlightsHeading: { label: '区块标题', type: 'text', placeholder: 'Highlights', bind: 'h2' },
    highlights: { label: '亮点（Markdown 列表）', type: 'content', placeholder: '- **第一条亮点**：描述\n- **第二条亮点**：描述', bind: 'list' },
  },
  sample: {
    highlightsHeading: 'Highlights',
    highlights: `- **登录超时事故 47 分钟恢复** — 配置回滚生效，后续切换至动态开关
- **API p95 延迟 184ms** — 连续 3 周下降，达到本季度目标
- **Redis 迁移完成** — session 存储从本地内存切换到集群，可用性 99.99%`,
  },
  css: `
.comp-highlights ul { list-style: none; margin: 0; padding: 0; }
.comp-highlights li { position: relative; padding: 0 0 14px 26px; font-size: 15px; color: var(--gray-700); line-height: 1.65; }
.comp-highlights li::before { content: ""; position: absolute; left: 6px; top: 8px; width: 7px; height: 7px; border-radius: 2px; background: var(--clay); }
.comp-highlights li strong { color: var(--slate); font-weight: 600; }
.comp-highlights h2 { font-family: var(--serif); font-weight: 500; font-size: 22px; margin: 0 0 8px; color: var(--slate); }
  `.trim(),
  html: (s) => {
    if (isEmpty(s.highlights)) return '';
    return `
<section class="comp-highlights" data-section="highlights">
  ${!isEmpty(s.highlightsHeading) ? `<h2 data-slot="highlightsHeading">${s.highlightsHeading}</h2><hr class="rule">` : ''}
  <div data-slot="highlights" data-slot-type="content">${s.highlights}</div>
</section>`.trim();
  },
});
