---
id: timeline
category: list
tags: timeline, milestones, incident, events
trust: builtin
defaultVariant: standard
---

# 时间线

## Variants

- `standard` — 竖线 + 圆点时间节点，列表形式
- `milestones` — 里程碑阶段，带菱形标记的标题列表
- `incident` — 事件时间线条目，支持彩色圆点（impact / mitigated）

## Slots

```yaml
timelineHeading:
  label: 区块标题
  type: text
  placeholder: Timeline
  bind: h2
timelineBody:
  label: 时间线内容
  type: content
  bind: content
  placeholder: '- `14:02` · 监控告警触发'
  description: standard / milestones 变体使用完整 Markdown 内容
timelineTime:
  label: 时间戳
  type: text
  placeholder: '14:06'
  description: incident 变体专用
timelineDot:
  label: 圆点类型
  type: text
  placeholder: impact / mitigated / 空
  description: incident 变体专用，决定圆点颜色
timelineEntry:
  label: 条目内容
  type: content
  placeholder: Impact starts. Sync workers begin queueing.
  description: incident 变体专用
```

## HTML

```html
<section class="comp-timeline" data-section="timeline" data-variant="{{variant}}">
  <h2 data-slot="timelineHeading"></h2>
  <hr class="rule">
  <div class="tl-body" data-slot="timelineBody" data-slot-type="content"></div>
  <div class="tl-entry" data-slot="timelineEntry" data-slot-type="content"></div>
  <span class="tl-time" data-slot="timelineTime"></span>
  <span class="tl-dot" data-slot="timelineDot"></span>
</section>
```

## CSS

```css
.comp-timeline {
  margin-bottom: 40px;
}
.comp-timeline h2 {
  font-family: var(--serif);
  font-weight: 500;
  font-size: 22px;
  margin: 0 0 8px;
  color: var(--slate);
}
.comp-timeline .rule {
  border: none;
  border-top: 1px solid var(--gray-300);
  margin: 0 0 16px;
}

/* ===== variant: standard ===== */
.comp-timeline[data-variant="standard"] .tl-body ul {
  list-style: none;
  padding: 0;
  border-left: 1.5px solid var(--gray-300);
  margin: 12px 0 0 6px;
}
.comp-timeline[data-variant="standard"] .tl-body li {
  position: relative;
  padding: 6px 0 14px 18px;
  font-size: 14px;
  color: var(--gray-700);
  line-height: 1.6;
}
.comp-timeline[data-variant="standard"] .tl-body li::before {
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
.comp-timeline[data-variant="standard"] .tl-body strong,
.comp-timeline[data-variant="standard"] .tl-body code {
  font-family: var(--mono);
  background: transparent;
  color: var(--slate);
  padding: 0;
  font-size: 13px;
}
.comp-timeline[data-variant="standard"] .tl-entry,
.comp-timeline[data-variant="standard"] .tl-time,
.comp-timeline[data-variant="standard"] .tl-dot {
  display: none;
}

/* ===== variant: milestones ===== */
.comp-timeline[data-variant="milestones"] .tl-body h2 {
  font-family: var(--serif);
  font-weight: 500;
  font-size: 19px;
  color: var(--slate);
  margin: 14px 0 4px;
}
.comp-timeline[data-variant="milestones"] .tl-body h2::before {
  content: '◆';
  color: var(--clay);
  margin-right: 8px;
  font-size: 12px;
  vertical-align: middle;
}
.comp-timeline[data-variant="milestones"] .tl-entry,
.comp-timeline[data-variant="milestones"] .tl-time,
.comp-timeline[data-variant="milestones"] .tl-dot {
  display: none;
}

/* ===== variant: incident ===== */
.comp-timeline[data-variant="incident"] .tl-body {
  display: none;
}
/* 空 slot 兜底：当用户没填 timelineDot / timelineTime 时不出空圆点和空徽章
   （比如 incident 用 timelineEntry 写整段 list，没用单条目模式） */
.comp-timeline[data-variant="incident"] .tl-dot:empty,
.comp-timeline[data-variant="incident"] .tl-time:empty {
  display: none;
}
.comp-timeline[data-variant="incident"] .tl-entry {
  position: relative;
  padding: 0 0 22px 28px;
  font-size: 14px;
  color: var(--gray-700);
  line-height: 1.6;
}
.comp-timeline[data-variant="incident"] .tl-entry:last-child {
  padding-bottom: 0;
}
.comp-timeline[data-variant="incident"] .tl-dot {
  position: absolute;
  left: -5px;
  top: 6px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--gray-500);
  border: 2px solid var(--ivory);
  box-sizing: content-box;
}
.comp-timeline[data-variant="incident"] .tl-dot.impact {
  background: var(--clay);
}
.comp-timeline[data-variant="incident"] .tl-dot.mitigated {
  background: var(--olive);
}
.comp-timeline[data-variant="incident"] .tl-time {
  display: inline-block;
  font-family: var(--mono);
  font-size: 12px;
  color: var(--gray-700);
  background: var(--gray-100);
  border: 1px solid var(--gray-300);
  border-radius: 6px;
  padding: 2px 8px;
  margin-bottom: 6px;
}
.comp-timeline[data-variant="incident"] .tl-entry strong {
  color: var(--slate);
  font-weight: 600;
}
```

## Sample

```markdown
<!-- @use timeline variant=standard -->

### Timeline

- `14:02` · 监控触发 **p95 飙到 3.2s**，on-call 介入
- `14:08` · 定位到 Redis 连接池耗尽
- `14:14` · 回滚上一版配置（连接池从 20 → 100）
- `14:31` · 错误率回落到正常
- `14:44` · **全量恢复** · 复盘 doc 创建

<!-- @use timeline variant=milestones -->

### Milestones

## Week 1 · Foundations
搭建组件库脚手架，完成前 8 个 category 目录。

## Week 2 · Core 20
从 html-effectiveness 抽离并实现 20 个核心组件。

## Week 3 · Library 40+
补齐 chip / callout / feature-card / flow-diagram 等高频组件。

## Week 4 · Polish
组件浏览器搜索优化 + starter markdown 生成器 + 全量截图测试。

<!-- @use timeline variant=incident -->

### Incident Timeline

<!-- @slot:timelineTime -->14:06<!-- @/slot -->
<!-- @slot:timelineDot -->impact<!-- @/slot -->
<!-- @slot:timelineEntry --><strong>Impact starts.</strong> Sync workers begin queueing on pool checkout; p95 latency climbs past 4s.<!-- @/slot -->
```
