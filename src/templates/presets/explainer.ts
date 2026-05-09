/**
 * 长文讲解 · Feature Explainer
 * 参考：html-effectiveness/14-research-feature-explainer.html
 *
 * 版式：左 sticky TOC + 右正文
 * 关键片段：eyebrow → title → subtitle → TL;DR → body → FAQ
 */

import type { SlotDef, TemplateManifest } from '@/lib/markdown-slots';
import { EFFECTIVENESS_BASE_CSS } from './_shared';

const SLOTS: Record<string, SlotDef> = {
  eyebrow: {
    label: '眉标',
    type: 'text',
    placeholder: '如：ENGINEERING · RATE LIMITING',
  },
  title: {
    label: '主标题',
    type: 'content',
    placeholder: '文章主标题',
  },
  subtitle: {
    label: '副标题',
    type: 'content',
    placeholder: '一句话说明',
  },
  author: {
    label: '作者/日期',
    type: 'text',
    placeholder: 'Thariq · 2026-03-14',
  },
  tldr: {
    label: 'TL;DR',
    type: 'content',
    description: '3 条最重要的结论',
    placeholder: '三条要点',
  },
  body: {
    label: '正文',
    type: 'content',
    description: '主体内容，支持 MD 的 h2/h3/列表/代码块/表格/blockquote',
    placeholder: '## 背景\\n\\n写点什么…',
  },
  faq: {
    label: 'FAQ',
    type: 'content',
    description: '常见问题，建议用 h3 + 段落的结构',
    placeholder: '### Q1. 为什么？\\n回答…',
  },
};

const CSS = `
${EFFECTIVENESS_BASE_CSS}
.page {
  max-width: 1100px;
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr);
  gap: 56px;
}
@media (max-width: 920px) {
  .page { grid-template-columns: 1fr; }
  nav.toc { display: none; }
}
nav.toc {
  position: sticky;
  top: 32px;
  align-self: start;
  font-size: 13px;
}
nav.toc .label {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gray-500);
  margin-bottom: 12px;
}
nav.toc a {
  display: block;
  padding: 5px 0 5px 12px;
  border-left: 2px solid var(--gray-300);
  color: var(--gray-700);
  text-decoration: none;
  font-size: 13px;
}
nav.toc a:hover { color: var(--slate); border-color: var(--slate); }
.hero .eyebrow { color: var(--clay); }
.hero h1 { font-size: 38px; line-height: 1.15; margin: 6px 0 10px; }
.hero .sub {
  font-family: var(--serif);
  font-size: 18px;
  line-height: 1.55;
  color: var(--gray-700);
  margin-bottom: 4px;
}
.hero .meta { margin-top: 14px; }
.tldr {
  margin: 28px 0 8px;
  background: var(--slate);
  color: var(--ivory);
  padding: 18px 22px;
  border-radius: 8px;
}
.tldr .label {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  color: var(--oat);
  margin-bottom: 8px;
}
.tldr h2, .tldr h3 { color: var(--ivory); font-family: var(--sans); font-size: 14px; }
.tldr p, .tldr li { color: var(--oat); font-size: 14.5px; }
.tldr ul { padding-left: 18px; }
section.body { margin-top: 16px; }
section.body h2 {
  border-top: 1px solid var(--gray-300);
  padding-top: 28px;
  margin-top: 32px;
}
section.body h2:first-of-type { border-top: none; padding-top: 0; margin-top: 8px; }
section.faq {
  margin-top: 48px;
  border-top: 1px solid var(--gray-300);
  padding-top: 24px;
}
section.faq .label {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--gray-500);
  margin-bottom: 6px;
}
section.faq h3 {
  font-family: var(--sans);
  font-size: 15px;
  color: var(--slate);
  margin-top: 18px;
}
`;

const HTML = `<!doctype html>
<html lang="zh">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Feature Explainer</title>
<style>${CSS}</style>
</head>
<body class="editorial">
<div class="page">
  <nav class="toc" aria-label="TOC">
    <div class="label">On this page</div>
    <a href="#body">正文</a>
    <a href="#faq">FAQ</a>
  </nav>
  <main>
    <header class="hero">
      <span class="eyebrow" data-slot="eyebrow"></span>
      <h1 data-slot="title"></h1>
      <p class="sub" data-slot="subtitle"></p>
      <div class="meta" data-slot="author"></div>
    </header>

    <aside class="tldr" data-slot-shell>
      <div class="label">TL;DR</div>
      <div data-slot="tldr"></div>
    </aside>

    <section class="body" id="body" data-slot="body"></section>

    <section class="faq" id="faq" data-slot-shell>
      <div class="label">FAQ</div>
      <div data-slot="faq"></div>
    </section>
  </main>
</div>
</body>
</html>`;

const STARTER = `<!-- @slot:eyebrow -->
ENGINEERING · RATE LIMITING
<!-- @/slot -->

<!-- @slot:title -->
速率限制是如何在 birchline/api 里工作的
<!-- @/slot -->

<!-- @slot:subtitle -->
基于滑动窗口 + Redis 的单机/多机一致性设计
<!-- @/slot -->

<!-- @slot:author -->
Thariq · 2026-03-14
<!-- @/slot -->

<!-- @slot:tldr -->
- 按 API key + 路由双维度限流，默认 60 rpm
- 多机部署时由 Redis 滑动窗口做全局计数，单机失效时 fail-open
- 命中限流时返回 \`429\` + \`Retry-After\`，并在响应头暴露剩余配额
<!-- @/slot -->

<!-- @slot:body -->
## 背景

当 API 服务被大量客户端调用时，需要一套**既保护后端资源、又对调用方可预测**的限流机制。行业里常见的有固定窗口、滑动窗口、漏桶、令牌桶等策略，本文要讨论的是其中最平衡的一种——**滑动窗口**。

## 关键设计

> 全局计数不必精确到微秒，但必须让同一 key 的两次请求看到一致的剩余配额。

我们把每次请求的时间戳塞到一个 Redis \`ZSET\` 里，\`score\` 就是 unix ms。每次新请求来时：

1. \`ZREMRANGEBYSCORE key 0 (now - window)\` 清理过期
2. \`ZCARD key\` 拿当前窗口内的计数
3. 若超限直接 429；否则 \`ZADD key now now\` + \`EXPIRE key window\`

\`\`\`python
async def allow(key: str, limit: int, window_ms: int) -> tuple[bool, int]:
    now = int(time.time() * 1000)
    pipe = redis.pipeline()
    pipe.zremrangebyscore(key, 0, now - window_ms)
    pipe.zcard(key)
    pipe.zadd(key, {str(now): now})
    pipe.pexpire(key, window_ms)
    _, count, *_ = await pipe.execute()
    return count < limit, max(0, limit - count - 1)
\`\`\`

## 响应头契约

| 头字段 | 含义 | 示例 |
| --- | --- | --- |
| \`X-RateLimit-Limit\` | 当前窗口上限 | \`60\` |
| \`X-RateLimit-Remaining\` | 剩余配额 | \`42\` |
| \`X-RateLimit-Reset\` | 窗口重置 unix 时间戳 | \`1710400000\` |
| \`Retry-After\` | 建议等待秒数（仅 429） | \`12\` |
<!-- @/slot -->

<!-- @slot:faq -->
### Q1. 为什么不用令牌桶？
令牌桶对突发友好，但会把短时过载延后到下一秒再爆发。我们的业务希望"60 秒内总量不超过 60"——滑动窗口能严格满足这一语义。

### Q2. Redis 宕了怎么办？
单机内存里保留最近 5 秒的 shadow 计数；Redis 不可达时切到 fail-open 并上报告警，避免业务完全挂掉。
<!-- @/slot -->
`;

export const explainerManifest: { manifest: TemplateManifest; starterMarkdown: string } = {
  manifest: {
    version: '1.0',
    skillMd: '',
    templateHtml: HTML,
    references: {},
    slots: SLOTS,
  },
  starterMarkdown: STARTER,
};
