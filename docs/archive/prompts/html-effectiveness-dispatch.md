# 拆任务：html-effectiveness 20 模板

给每个 agent 发送下面这段简短提示（按你要分配的号替换 `$NUM`）。完整规范见
[`html-effectiveness-templates.md`](./html-effectiveness-templates.md)。

---

## 任务卡模板（复制给 agent）

> 请完成 **html-effectiveness 模板 #$NUM** 的还原工作。
>
> 1. 阅读完整规范：`docs/prompts/html-effectiveness-templates.md`
> 2. 查看原 HTML：`src/templates/html-effectiveness/$NUM-*.html`
> 3. 按规范在 `src/builtin/templates/index.ts` 的 `BUILTIN_TEMPLATES` 数组末尾追加一条
>    `makeTemplate({...})`，并**显式提供 starterMarkdown**（不要用 generator）
> 4. 只用已有内置组件拼，缺的组件用 `missingComponents` 字段标注
> 5. 完成后运行 `npx tsc --noEmit && npx next build` 确认通过
> 6. 不要改任何其它已有模板、组件或主题
> 7. 如临时必须新增 `.forge.md` 组件，**必须使用 YAML frontmatter 头部**
>    （文件首行 `---`，与 UserTemplate 对齐；详见规范文档"`.forge.md` 文件格式"章节）
>
> 产出一个 commit：`feat(templates): add he-$NUM <模板中文名>`

---

## 20 个任务（按 group 分批分配效率最高）

### Batch A：report 系（1 个 agent 一次性做完）

- #11 status-report
- #12 incident-report
- #19 editor-feature-flags

### Batch B：code-review 系

- #01 exploration-code-approaches
- #03 code-review-pr
- #17 pr-writeup

### Batch C：plan 系

- #07 prototype-animation
- #08 prototype-interaction
- #13 flowchart-diagram
- #16 implementation-plan

### Batch D：research 系

- #04 code-understanding
- #05 design-system
- #06 component-variants
- #14 research-feature-explainer
- #15 research-concept-explainer

### Batch E：playground / 特殊版面（难度较高，缺组件也最多）

- #02 exploration-visual-designs
- #09 slide-deck
- #10 svg-illustrations
- #18 editor-triage-board
- #20 editor-prompt-tuner

---

## 建议执行顺序

1. **先派 Batch A** — 最接近现有 `status-report` 模板，agent 可抄现成结构，最快验证流程通
2. **再派 Batch B / C** — report 验证通了再批量做这些
3. **最后 Batch D / E** — 大概率会产生 `missingComponents` 列表，为下一轮补组件任务提供输入

---

## 验收 checklist（汇总所有 agent 的产出后整体跑一遍）

- [ ] `BUILTIN_TEMPLATES` 从 8 条增长到 28 条（原 8 + 新 20）
- [ ] 所有新模板 id 都以 `he-` 开头
- [ ] `npx tsc --noEmit` 通过
- [ ] `npx next build` 通过
- [ ] 顶部模板选择器分组展示清晰（report / plan / research / code-review / playground）
- [ ] 每个新模板选中后编辑器加载对应 starter，预览有内容（不是空白）
- [ ] 汇总所有 agent 的 `missingComponents`，形成**下一轮待补组件清单**

---

## 预期的 missingComponents 清单（预估）

根据原 HTML 的复杂度，预计会出现以下缺失组件，供后续任务参考：

| 组件 id | 用途 | 来源模板 |
|---|---|---|
| `flowchart-canvas` | 流程图 + 箭头连线 | #04, #13 |
| `illustration-gallery` | 多 SVG 插图网格展示 | #10 |
| `kanban-column` | 看板列（status → tickets） | #18 |
| `diff-block` | 代码 diff 高亮 | #03, #17 |
| `sketch-card` | 设计草图卡片（含标注） | #02 |
| `feature-flag-row` | flag 开关行（name + env + pct） | #19 |
| `prompt-diff` | prompt A/B 对比 | #20 |
| `interactive-widget` | 原 HTML 的交互占位 | #08, #15 |

这些**不在本轮任务**范围内，由下一轮 agent 独立实现（届时另写 prompt）。
