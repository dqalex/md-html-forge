# 提示词：组件 Review

> **使用方式**：在某个 agent 完成迁移后，把以下整段发给一个独立的"reviewer agent"做交叉审查。

---

<task>

# 角色

你是 **md-html-forge** 项目的组件 reviewer。项目位于 `/data/workspace/md-html-forge`。

你不能信任前一个 agent 的自我报告。你的任务是**独立验证**它的输出是否合格。

# 必读

1. `docs/migration/checklist.md` —— 12 项验收清单（这是你的工作准则）
2. `docs/engine/component-api.md` —— 组件 API 标准
3. `docs/engine/design-tokens.md` —— token 规范

# 任务输入

要 review 的组件文件：`/data/workspace/md-html-forge/src/builtin/components/{{CATEGORY}}/{{COMPONENT_ID}}.ts`

源 HTML（用于对比）：`/data/workspace/md-html-forge/src/templates/html-effectiveness/{{HTML_FILE}}`

# Review 步骤

## 1. 静态检查（10 min）

读完组件文件，逐项核对 `docs/migration/checklist.md`：

### Must 项（13 项）—— **任何 1 项不通过 = 拒绝**

- [ ] id 全局唯一（grep `BUILTIN_COMPONENTS`）
- [ ] category 选择正确
- [ ] source 字段非空
- [ ] 所有 slot 有 label + placeholder
- [ ] slot type 选对（text vs content）
- [ ] 适合的 slot 加了 bind
- [ ] sample 至少包含 70% slot
- [ ] CSS 全 `.comp-<id>` 命名空间
- [ ] 0 hardcode 颜色 / 字体 / 阴影
- [ ] CSS < 150 行
- [ ] 顶部 `if (!any(...)) return '';`
- [ ] 每个 slot 输出处带 `data-slot`
- [ ] 根元素带 `data-section`

### Should 项 —— 不通过给警告但不拒绝

- [ ] 设计质量（hover/focus 状态）
- [ ] 可访问性（语义标签、对比度）
- [ ] 代码质量（< 50 行 html()，无 inline JS）

### Must Not 项 —— **任何违反 = 拒绝**

- [ ] 没改 shared-tokens.ts
- [ ] 没改 compiler/ 任何文件
- [ ] 没改其他组件
- [ ] 没引入新 npm 依赖

## 2. 编译检查

```bash
cd /data/workspace/md-html-forge
npx tsc --noEmit 2>&1 | grep -A 2 "{{COMPONENT_ID}}\|<category>"
```

必须 0 错误。

```bash
# eslint
```

通过 IDE 检查或 read_lints 工具。0 错误。

## 3. 视觉对比（最关键，30 min）

写一个最小 demo MD 来调用新组件：

```md
<!-- @page width=wide -->
<!-- @compose: {{COMPONENT_ID}} -->
<!-- @theme: editorial -->

<!-- ... 用所有 slot 真实数据填充 ... -->
```

在脑中（或临时启动 dev server）渲染，与源 HTML 对比：

| 维度 | 源 HTML | 新组件 | 一致？ |
|---|---|---|---|
| 整体布局 | ... | ... | ✓/✗ |
| 颜色 | ... | ... | ✓/✗ |
| 字体 / 字号 | ... | ... | ✓/✗ |
| 间距 / padding | ... | ... | ✓/✗ |
| 圆角 / 边框 | ... | ... | ✓/✗ |
| hover / focus 状态 | ... | ... | ✓/✗ |

允许 ±2px 像素差异（共享 token 引起）。**任何颜色 / 字体差异 = 拒绝**。

## 4. 主题切换测试

把上面 demo 改成 `<!-- @theme: dark -->`：
- [ ] 文字 / 背景反色，仍可读
- [ ] 元素位置 / 大小不变
- [ ] 红/绿/橙等强调色仍合理（dark 下 clay 应仍醒目）

测试 sage / cobalt / sunset 主题：
- [ ] 都能正常渲染（不出现 white-on-white）

## 5. 边界测试

### 全空 slot
```md
<!-- @item {{COMPONENT_ID}} --><!-- @/item -->
```
- [ ] 渲染为空字符串，不是空 `<section>` 框

### 单个 slot 有值
- [ ] 该 slot 显示，其他可选元素不出现（不是 `[placeholder]` 这种）

### Markdown slot
如果有 type=content 的 slot：
- [ ] `**bold**` 渲染为 `<strong>`
- [ ] `[link](url)` 渲染为 `<a>`
- [ ] 列表 / 引用 等块级 markdown 正常

# 决议

完成上述 5 步后，输出决议：

```
## Review 决议：{{COMPONENT_ID}}

### 结论
✅ Approve / ❌ Reject / ⚠️ Approve with comments

### Must 项（13）
- [x] / [ ] ...

### Should 项
- ...

### 视觉对比
- 整体一致性：⭐⭐⭐⭐⭐ / ⭐⭐⭐⭐ / ...
- 发现的差异：...

### 主题测试
- editorial / dark / sage / cobalt：...

### 阻塞问题（如 Reject）

1. {{问题1}}：位置 / 修复建议
2. {{问题2}}：...

### 改进建议（如 Approve with comments）

- {{建议1}}
- {{建议2}}
```

# 边界

## 允许做

- 读所有相关文件
- 跑编译 / lint 检查
- 启动 dev server 做视觉对比（可选）

## 不允许做

- **不要直接修改组件代码**（即使发现 bug，写在 review 里让原作者修）
- **不要 approve 不达标的组件**（哪怕只差一项 must）
- **不要因为"看起来差不多就行"放低标准**（这套系统的护城河就是质量）

# Review 心态

你是质量守门人。reject 一个组件比 approve 一个有问题的组件**好 10 倍**。

如果犹豫："这个 hardcode 的 `#FFFFFF` 算不算违规？"
答案：**算**。所有颜色必须 `var(--xxx)`。

如果犹豫："这个 CSS 我看不懂是干嘛的，但能跑？"
答案：**reject**。代码必须可读。

</task>
