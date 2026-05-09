/**
 * 事故复盘 · Incident Report
 * 参考：html-effectiveness/12-incident-report.html
 *
 * 版式：severity pill + 元信息网格 + body + 分钟级 timeline + action 清单
 */

import type { SlotDef, TemplateManifest } from '@/lib/markdown-slots';
import { EFFECTIVENESS_BASE_CSS } from './_shared';

const SLOTS: Record<string, SlotDef> = {
  eyebrow: { label: '眉标', type: 'text', placeholder: 'INCIDENT · POST-MORTEM' },
  title: { label: '主标题', type: 'content', placeholder: 'Login 服务 503 — 2026-03-12' },
  severity: {
    label: '严重度',
    type: 'text',
    placeholder: 'SEV-2',
    description: '取值会映射为 pill 颜色：SEV-1（red）、SEV-2（amber）、SEV-3（olive）',
  },
  status: { label: '状态', type: 'text', placeholder: 'Resolved' },
  duration: { label: '持续时长', type: 'text', placeholder: '42 min' },
  impact: { label: '影响范围', type: 'text', placeholder: '约 12% 登录请求失败' },
  owner: { label: '负责人', type: 'text', placeholder: 'Alice · Backend' },
  summary: {
    label: '摘要',
    type: 'content',
    description: '一段话说清发生了什么',
  },
  body: {
    label: '详细分析',
    type: 'content',
    description: '根因 / 复现 / 修复',
  },
  timeline: {
    label: '时间线',
    type: 'content',
    description: '建议用带时间戳的列表：`- 14:02 · 监控告警触发`',
  },
  actions: {
    label: '后续行动',
    type: 'content',
    description: '行动项清单（建议任务语法 `- [ ] ...`）',
  },
};

const CSS = `
${EFFECTIVENESS_BASE_CSS}
.page { max-width: 960px; }
header.hero { margin-bottom: 24px; }
.hero .eyebrow { color: var(--clay); }
.hero h1 { font-size: 32px; line-height: 1.18; margin: 6px 0 14px; }
.metagrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  padding: 16px 20px;
  background: var(--paper);
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  margin-top: 8px;
}
.metagrid .item { }
.metagrid .k {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gray-500);
  display: block;
  margin-bottom: 4px;
}
.metagrid .v {
  font-size: 14.5px;
  color: var(--slate);
  font-weight: 500;
}
.pill {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  font-weight: 500;
}
.pill[data-sev^="SEV-1"] { background: #f8d7d0; color: var(--bad); }
.pill[data-sev^="SEV-2"] { background: #f5e0bf; color: var(--warn); }
.pill[data-sev^="SEV-3"] { background: #dfe6d1; color: var(--olive); }
.pill[data-sev=""], .pill:not([data-sev]) { background: var(--gray-150); color: var(--gray-700); }
section.summary {
  margin-top: 28px;
  padding: 16px 20px;
  background: var(--clay-soft);
  border-left: 2.5px solid var(--clay);
  border-radius: 0 6px 6px 0;
}
section.summary p:first-child { margin-top: 0; }
section.body { margin-top: 28px; }
section.timeline, section.actions { margin-top: 36px; }
section.timeline .label,
section.actions .label {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--gray-500);
  margin-bottom: 12px;
}
/* timeline 样式：让 li 左侧出现圆点 */
section.timeline ul { list-style: none; padding: 0; border-left: 1.5px solid var(--gray-300); margin-left: 6px; }
section.timeline li {
  position: relative;
  padding: 6px 0 6px 18px;
  font-size: 14px;
  color: var(--gray-700);
}
section.timeline li::before {
  content: "";
  position: absolute;
  left: -5px;
  top: 14px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--clay);
  border: 2px solid var(--ivory);
}
section.timeline strong, section.timeline code {
  font-family: var(--mono);
  background: transparent;
  color: var(--slate);
  padding: 0;
}
section.actions ul { padding-left: 18px; }
section.actions li { margin: 4px 0; }
section.actions input[type="checkbox"] { margin-right: 6px; accent-color: var(--clay); }
`;

const HTML = `<!doctype html>
<html lang="zh">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Incident Report</title>
<style>${CSS}</style>
</head>
<body class="editorial">
<div class="page">
  <header class="hero">
    <span class="eyebrow" data-slot="eyebrow"></span>
    <h1 data-slot="title"></h1>
    <div class="metagrid">
      <div class="item">
        <span class="k">Severity</span>
        <span class="v"><span class="pill" data-slot="severity"></span></span>
      </div>
      <div class="item"><span class="k">Status</span><span class="v" data-slot="status"></span></div>
      <div class="item"><span class="k">Duration</span><span class="v" data-slot="duration"></span></div>
      <div class="item"><span class="k">Impact</span><span class="v" data-slot="impact"></span></div>
      <div class="item"><span class="k">Owner</span><span class="v" data-slot="owner"></span></div>
    </div>
  </header>

  <section class="summary" data-slot="summary"></section>

  <section class="body" data-slot="body"></section>

  <section class="timeline">
    <div class="label">Timeline</div>
    <div data-slot="timeline"></div>
  </section>

  <section class="actions">
    <div class="label">Follow-up Actions</div>
    <div data-slot="actions"></div>
  </section>
</div>
<script>
  // 把 severity pill 的内容同步到 data-sev 属性上，驱动 CSS 颜色
  (function () {
    var pill = document.querySelector('.pill');
    if (!pill) return;
    var t = (pill.textContent || '').trim();
    pill.setAttribute('data-sev', t);
  })();
</script>
</body>
</html>`;

const STARTER = `<!-- @slot:eyebrow -->
INCIDENT · POST-MORTEM
<!-- @/slot -->

<!-- @slot:title -->
Login 服务 503 — 2026-03-12
<!-- @/slot -->

<!-- @slot:severity -->
SEV-2
<!-- @/slot -->

<!-- @slot:status -->
Resolved
<!-- @/slot -->

<!-- @slot:duration -->
42 min
<!-- @/slot -->

<!-- @slot:impact -->
约 12% 登录请求失败
<!-- @/slot -->

<!-- @slot:owner -->
Alice · Backend
<!-- @/slot -->

<!-- @slot:summary -->
2026-03-12 14:02 UTC，Login 服务因一次数据库连接池配置回滚未生效，导致 503 率飙升至 12%。值班同学在 14:14 回滚到上一 stable 配置，14:44 完全恢复。
<!-- @/slot -->

<!-- @slot:body -->
## 根因

上一次发布时把 \`pool.min_size\` 从 10 调到 2，本意是降低空闲连接数量，但配置变更在热加载时未被 Login 服务读取；连接池在高峰时刻达到上限并开始抛 \`ConnectionPoolExhausted\`。

## 复现步骤

1. 在 staging 把 \`pool.min_size\` 临时调到 2
2. 构造 QPS 500+ 的登录压力
3. 观察 \`login_503_total\` 指标在 90s 内突破阈值

## 修复

- 临时：回滚 \`pool.min_size\` 到 10
- 永久：给 Login 服务加上配置热加载失败告警，任何热加载失败必须分钟级上报
<!-- @/slot -->

<!-- @slot:timeline -->
- \`14:02\` · 监控告警：\`login_503_rate > 5%\`
- \`14:05\` · OnCall 确认告警，开始排查
- \`14:11\` · 定位到数据库连接池告警，但热加载无异常日志
- \`14:14\` · 回滚至上一 stable 配置
- \`14:22\` · 503 率回落到 <1%
- \`14:44\` · 全量恢复，告警自动关闭
<!-- @/slot -->

<!-- @slot:actions -->
- [x] 回滚 \`pool.min_size\` 到 10
- [ ] 给配置热加载加失败告警（Alice, due 2026-03-15）
- [ ] Runbook 增加"连接池耗尽"条目（Bob, due 2026-03-20）
- [ ] 压测脚本覆盖 Login 高并发场景（Carol, due 2026-03-25）
<!-- @/slot -->
`;

export const incidentReportManifest: { manifest: TemplateManifest; starterMarkdown: string } = {
  manifest: {
    version: '1.0',
    skillMd: '',
    templateHtml: HTML,
    references: {},
    slots: SLOTS,
  },
  starterMarkdown: STARTER,
};
