/**
 * 状态周报 · Status Report
 * 参考：html-effectiveness/11-status-report.html
 *
 * 版式：eyebrow + 大标题 + 4 列 summary band + 正文 + 模块卡片
 */

import type { SlotDef, TemplateManifest } from '@/lib/markdown-slots';
import { EFFECTIVENESS_BASE_CSS } from './_shared';

const SLOTS: Record<string, SlotDef> = {
  eyebrow: { label: '眉标', type: 'text', placeholder: 'WEEKLY · W11 2026' },
  title: { label: '主标题', type: 'content', placeholder: 'Birchline 团队周报' },
  period: { label: '周期', type: 'text', placeholder: '2026-03-09 → 2026-03-15' },
  author: { label: '撰写人', type: 'text', placeholder: 'Alice · Tech Lead' },
  stat1Label: { label: '指标 1 标签', type: 'text', placeholder: '已完成任务' },
  stat1Value: { label: '指标 1 值', type: 'data', placeholder: '12' },
  stat2Label: { label: '指标 2 标签', type: 'text', placeholder: '进行中' },
  stat2Value: { label: '指标 2 值', type: 'data', placeholder: '4' },
  stat3Label: { label: '指标 3 标签', type: 'text', placeholder: '阻塞问题' },
  stat3Value: { label: '指标 3 值', type: 'data', placeholder: '1' },
  stat4Label: { label: '指标 4 标签', type: 'text', placeholder: 'OKR 进度' },
  stat4Value: { label: '指标 4 值', type: 'data', placeholder: '62%' },
  highlights: {
    label: '亮点',
    type: 'content',
    description: '本周最值得高亮的 2-3 件事',
  },
  body: {
    label: '正文',
    type: 'content',
    description: '详细进展，建议按 h2 分模块',
  },
  risks: {
    label: '风险与阻塞',
    type: 'content',
  },
  nextWeek: {
    label: '下周计划',
    type: 'content',
  },
};

const CSS = `
${EFFECTIVENESS_BASE_CSS}
.page { max-width: 980px; }
header.hero { margin-bottom: 28px; }
.hero .eyebrow { color: var(--clay); }
.hero h1 { font-size: 34px; line-height: 1.18; margin: 6px 0 10px; }
.hero .meta { display: flex; gap: 22px; margin-top: 10px; color: var(--gray-500); }

/* summary band */
.summary-band {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--gray-300);
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  overflow: hidden;
  margin: 16px 0 28px;
}
@media (max-width: 720px) { .summary-band { grid-template-columns: repeat(2, 1fr); } }
.summary-band .cell {
  background: var(--paper);
  padding: 18px 20px;
}
.summary-band .k {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gray-500);
  margin-bottom: 8px;
  display: block;
}
.summary-band .v {
  font-family: var(--serif);
  font-size: 28px;
  color: var(--slate);
  font-weight: 500;
  letter-spacing: -0.01em;
}

section.block {
  margin-top: 36px;
  padding-top: 20px;
  border-top: 1px solid var(--gray-300);
}
section.block .label {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--gray-500);
  margin-bottom: 10px;
}
section.block h2:first-of-type { margin-top: 0; }

section.highlights {
  background: var(--clay-soft);
  border-left: 2.5px solid var(--clay);
  padding: 14px 18px;
  margin: 16px 0 8px;
  border-radius: 0 6px 6px 0;
}
section.highlights p:first-child { margin-top: 0; }

section.risks li { color: var(--gray-700); }
section.risks li strong, section.risks li b { color: var(--bad); }
`;

const HTML = `<!doctype html>
<html lang="zh">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Status Report</title>
<style>${CSS}</style>
</head>
<body class="editorial">
<div class="page">
  <header class="hero">
    <span class="eyebrow" data-slot="eyebrow"></span>
    <h1 data-slot="title"></h1>
    <div class="meta">
      <span data-slot="period"></span>
      <span data-slot="author"></span>
    </div>
  </header>

  <div class="summary-band">
    <div class="cell"><span class="k" data-slot="stat1Label"></span><span class="v" data-slot="stat1Value"></span></div>
    <div class="cell"><span class="k" data-slot="stat2Label"></span><span class="v" data-slot="stat2Value"></span></div>
    <div class="cell"><span class="k" data-slot="stat3Label"></span><span class="v" data-slot="stat3Value"></span></div>
    <div class="cell"><span class="k" data-slot="stat4Label"></span><span class="v" data-slot="stat4Value"></span></div>
  </div>

  <section class="highlights" data-slot="highlights"></section>

  <section class="block body">
    <div class="label">Progress</div>
    <div data-slot="body"></div>
  </section>

  <section class="block risks">
    <div class="label">Risks & Blockers</div>
    <div data-slot="risks"></div>
  </section>

  <section class="block">
    <div class="label">Next Week</div>
    <div data-slot="nextWeek"></div>
  </section>
</div>
</body>
</html>`;

const STARTER = `<!-- @slot:eyebrow -->
WEEKLY · W11 2026
<!-- @/slot -->

<!-- @slot:title -->
Birchline 团队周报
<!-- @/slot -->

<!-- @slot:period -->
2026-03-09 → 2026-03-15
<!-- @/slot -->

<!-- @slot:author -->
Alice · Tech Lead
<!-- @/slot -->

<!-- @slot:stat1Label -->
已完成任务
<!-- @/slot -->
<!-- @slot:stat1Value -->
12
<!-- @/slot -->

<!-- @slot:stat2Label -->
进行中
<!-- @/slot -->
<!-- @slot:stat2Value -->
4
<!-- @/slot -->

<!-- @slot:stat3Label -->
阻塞问题
<!-- @/slot -->
<!-- @slot:stat3Value -->
1
<!-- @/slot -->

<!-- @slot:stat4Label -->
OKR 进度
<!-- @/slot -->
<!-- @slot:stat4Value -->
62%
<!-- @/slot -->

<!-- @slot:highlights -->
**本周亮点**：完成滑动窗口限流的灰度发布，线上 p99 降低 18%；SDK v2 的第一版开发者文档上线。
<!-- @/slot -->

<!-- @slot:body -->
## 基建

- 限流中间件 v1 完成，已灰度到 10% 流量
- 指标平台接入成本拆分看板
- Redis 集群扩容到 6 节点，主从延迟 < 5ms

## 产品

- SDK v2 首版开发者文档上线
- CLI 支持离线 token 校验
- 新 onboarding 流程点击率 +22%

## 质量

| 指标 | 上周 | 本周 | 趋势 |
| --- | ---: | ---: | :---: |
| 线上 p99 | 320ms | 262ms | ↓ |
| 错误率 | 0.12% | 0.09% | ↓ |
| 发布次数 | 4 | 6 | ↑ |
<!-- @/slot -->

<!-- @slot:risks -->
- **阻塞**：\`login-503\` 事故复盘 action item 3 项仍未开始
- **风险**：SDK v2 的 Python 端依赖冲突，可能延期到 W13
<!-- @/slot -->

<!-- @slot:nextWeek -->
- 限流中间件灰度到 50%
- 完成 SDK v2 Python 依赖收敛
- 启动 Q2 OKR 对齐会议
<!-- @/slot -->
`;

export const statusReportManifest: { manifest: TemplateManifest; starterMarkdown: string } = {
  manifest: {
    version: '1.0',
    skillMd: '',
    templateHtml: HTML,
    references: {},
    slots: SLOTS,
  },
  starterMarkdown: STARTER,
};
