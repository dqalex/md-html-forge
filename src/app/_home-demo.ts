/**
 * 首页 Playground 默认 demo 文档（中/英双语）。
 *
 * 抽到单独文件是因为：
 *   1. page.tsx 本身是 client component，每次渲染都要把这一大坨常量 bundle 进去
 *   2. i18n 要按 lang 切换，两份常量并存在 page.tsx 里太挤
 *   3. 之后还要加"重置到默认"等功能时，只要 import 这里即可
 */

export const DEMO_MARKDOWN_EN = `<!-- @page width=wide -->
<!-- @compose: header, lead, metric, callout, table, comparison, highlights, checklist, footer -->
<!-- @theme editorial -->

<!-- ═══ 01 · header ═══ -->
<!-- @use header -->

# md-html-forge

## Feed :lucide:wand-2: **Markdown** into a curated component library

<!-- @slot:eyebrow -->PLAYGROUND · DEMO<!-- @/slot -->
<!-- @slot:badge -->v0.6<!-- @/slot -->
<!-- @slot:date -->2026-05-11<!-- @/slot -->
<!-- @slot:author -->@alexama<!-- @/slot -->


<!-- ═══ 02 · story ═══ -->
<!-- @use lead variant=lead -->

> AI burns most of its tokens on styling even though every output looks the same.
> md-html-forge moves styling into components so the AI only writes content —
> **saving 50–80% tokens**, producing docs more polished than hand-written HTML
> and more structured than plain Markdown.


<!-- ═══ 03 · four strengths — dark theme ═══ -->
<!-- @theme dark -->

<!-- @use metric variant=band -->

<!-- @slot:metricValue -->
50-80%
realtime
∞
one-click
<!-- @/slot -->

<!-- @slot:metricLabel -->
AI tokens saved
MD → preview
Templates reusable
Export standalone HTML
<!-- @/slot -->

<!-- @slot:metricDelta -->
vs raw HTML
every keystroke
share across docs
zero dependencies
<!-- @/slot -->


<!-- ═══ 04 · why build this — editorial ═══ -->
<!-- @theme editorial -->

<!-- @use callout variant=concept -->

<!-- @slot:calloutTitle -->Why we built this<!-- @/slot -->
<!-- @slot:calloutBody -->
**Problem**: engineers write weekly updates, retros, PR notes — plain Markdown has no style,
hand-written HTML is tedious, and asking the AI for styled HTML burns tokens with inconsistent results.

**forge's answer**: package styles into 30+ curated components. You write content; components handle the look.
Paste the AI's Markdown and use a few \`<!-- @use -->\` directives to pick components — you get beautiful HTML.
<!-- @/slot -->


<!-- ═══ 05 · before / after ═══ -->
<!-- @use comparison variant=ba -->

<!-- @slot:baBefore -->
**Without forge:**

\`\`\`html
<div style="background:#FAF9F5; padding:40px;
  font-family:Georgia,serif; max-width:680px">
  <div style="font-size:11px; color:#87867F;
    text-transform:uppercase; letter-spacing:.1em">
    AUTO-GENERATED
  </div>
  <h1 style="font-size:36px; font-weight:500;
    color:#141413; margin:12px 0 8px">
    Engineering Status
  </h1>
  <!-- 200 lines of HTML for one weekly report -->
  <!-- AI burns 3000+ tokens on styling alone -->
</div>
\`\`\`
<!-- @/slot -->

<!-- @slot:baAfter -->
**With forge:**

\`\`\`md
<!-- @page narrow -->
<!-- @compose: header, highlights, table, footer -->
<!-- @theme editorial -->

<!-- @use header -->

# Engineering Status — Week 11

## birchline/app @ main

<!-- @slot:eyebrow -->auto-generated<!-- @/slot -->
<!-- @slot:date -->Mar 10 – Mar 16, 2025<!-- @/slot -->

<!-- just write content; components handle styling -->
<!-- AI writes ~30 lines of Markdown, saves ~90% tokens -->
\`\`\`
<!-- @/slot -->


<!-- ═══ 06 · three strengths ═══ -->
<!-- @use highlights -->

## Three advantages

- :lucide:bot: **Token-efficient for AI**. Components encapsulate styling so the AI only emits structured Markdown — 50–80% fewer tokens than raw HTML, more output per budget.
- :lucide:pencil: **Polish the final copy freely**. Left pane renders live to the right. Edit text, rearrange lists, swap components — all via plain Markdown operations.
- :lucide:palette: **Brand packs stay consistent**. Save colors, fonts and spacing tokens once; every document reuses the same look, no per-doc style tweaks.


<!-- ═══ 07 · feature matrix ═══ -->
<!-- @use table variant=standard -->

<!-- @slot:heading -->Feature matrix<!-- @/slot -->

| Feature | Description | Typical use |
|---|---|---|
| **30+ built-in components** | header / metric / table / timeline / callout, etc. | Weekly reports, PRs, incidents, explainers |
| **20 scenario templates** | Engineering weekly, PR review, launch plan, design system… | Pick a template, fill in the blanks |
| **Native MD compatible** | All directives are HTML comments; content is pure Markdown | Opens as a real MD file anywhere |
| **Brand packs** | Color / font / spacing tokens saved locally | Consistent look across docs |
| **Standalone HTML export** | Clean single file with no runtime dependencies | Share via email, embed in wiki |
| **Two-way checkbox sync** | Click checkbox in preview → MD updates | Action-item tracking |
| **Click-to-jump** | Click an element in preview → editor jumps to the source line | Fast editing |
| **AI-friendly** | Structured MD is far cheaper than styled HTML | Works great with Claude / GPT |


<!-- ═══ 08 · try it ═══ -->
<!-- @use checklist -->

## Try it

- [x] Edit Markdown on the left, preview updates live on the right
- [x] Use the top "Templates" picker to switch to Engineering Weekly / PR Review / etc.
- [ ] Change the title \`# md-html-forge\` to your project name
- [ ] Click any text in the preview — does the editor jump to that line?
- [ ] **Tick this box**, then check that \`- [ ]\` flips to \`- [x]\` in the MD source
- [ ] Click "Export" in the top-right to download a clean standalone HTML file


<!-- ═══ 09 · footer ═══ -->
<!-- @use footer -->

<!-- @slot:footer -->
md-html-forge · Markdown → Composable HTML · 2026 · MIT License
<!-- @/slot -->
`;


export const DEMO_MARKDOWN_ZH = `<!-- @page width=wide -->
<!-- @compose: header, lead, metric, callout, table, comparison, highlights, checklist, footer -->
<!-- @theme editorial -->

<!-- ═══ 01 · header ═══ -->
<!-- @use header -->

# md-html-forge

## 把 :lucide:wand-2: **Markdown** 喂进精心设计的组件库

<!-- @slot:eyebrow -->PLAYGROUND · DEMO<!-- @/slot -->
<!-- @slot:badge -->v0.6<!-- @/slot -->
<!-- @slot:date -->2026-05-11<!-- @/slot -->
<!-- @slot:author -->@alexama<!-- @/slot -->


<!-- ═══ 02 · 项目故事 ═══ -->
<!-- @use lead variant=lead -->

> 我们发现 AI 每次生成报告时要花大量 token 在样式上——哪怕输出的格式每次都一样。
> md-html-forge 把样式封进组件，让 AI 只写内容，**节省 50-80% 的 token**，
> 输出的文档比手写 HTML 更精致，比 Markdown 更有层次感。


<!-- ═══ 03 · 四大优势 — 深色主题 ═══ -->
<!-- @theme dark -->

<!-- @use metric variant=band -->

<!-- @slot:metricValue -->
50-80%
实时
∞
一键
<!-- @/slot -->

<!-- @slot:metricLabel -->
AI token 节省
MD 预览更新
模板可复用
导出独立 HTML
<!-- @/slot -->

<!-- @slot:metricDelta -->
vs 直接输出 HTML
每次按键触发
跨文档共享品牌
无任何外部依赖
<!-- @/slot -->


<!-- ═══ 04 · 核心功能 — editorial ═══ -->
<!-- @theme editorial -->

<!-- @use callout variant=concept -->

<!-- @slot:calloutTitle -->为什么要做这个<!-- @/slot -->
<!-- @slot:calloutBody -->
**问题**：工程师写周报、复盘、PR 说明时，要么用 Markdown 没样式，要么手写 HTML 费时间，
要么把内容交给 AI 生成一大段带样式的 HTML——但这样 token 消耗极高，且每次风格不一致。

**forge 的答案**：把样式封进 30+ 个精心设计的组件。你只写内容，组件负责呈现。
AI 生成的 Markdown 直接粘贴进来，用几行 \`<!-- @use -->\` 指令指定组件，就能得到精美 HTML。
<!-- @/slot -->


<!-- ═══ 05 · 对比展示 ═══ -->
<!-- @use comparison variant=ba -->

<!-- @slot:baBefore -->
**没有 forge：**

\`\`\`html
<div style="background:#FAF9F5; padding:40px;
  font-family:Georgia,serif; max-width:680px">
  <div style="font-size:11px; color:#87867F;
    text-transform:uppercase; letter-spacing:.1em">
    AUTO-GENERATED
  </div>
  <h1 style="font-size:36px; font-weight:500;
    color:#141413; margin:12px 0 8px">
    Engineering Status
  </h1>
  <!-- 200 行 HTML 才能渲染一篇周报 -->
  <!-- AI 消耗 3000+ token 在样式上 -->
</div>
\`\`\`
<!-- @/slot -->

<!-- @slot:baAfter -->
**用 forge：**

\`\`\`md
<!-- @page narrow -->
<!-- @compose: header, highlights, table, footer -->
<!-- @theme editorial -->

<!-- @use header -->

# Engineering Status — Week 11

## birchline/app @ main

<!-- @slot:eyebrow -->auto-generated<!-- @/slot -->
<!-- @slot:date -->Mar 10 – Mar 16, 2025<!-- @/slot -->

<!-- 后续写内容即可，样式由组件负责 -->
<!-- AI 只需写 30 行 Markdown，节省 90% token -->
\`\`\`
<!-- @/slot -->


<!-- ═══ 06 · 工作流优势 ═══ -->
<!-- @use highlights -->

## 三大优势

- :lucide:bot: **AI 生成节省 token**。组件封装样式，AI 只输出结构化 Markdown，相比直接生成 HTML 节省 50-80% token。同等预算，生成更多文档。
- :lucide:pencil: **随手修改最终内容**。左侧 Markdown 实时渲染右侧预览，所见即所得。修改文字、调整列表、改变组件——一切都是普通 Markdown 操作。
- :lucide:palette: **品牌包保持一致性**。把颜色、字体、间距保存为品牌包，每次输出自动应用，多篇文档风格统一，不再每次重新调样式。


<!-- ═══ 07 · 功能矩阵 ═══ -->
<!-- @use table variant=standard -->

<!-- @slot:heading -->功能矩阵<!-- @/slot -->

| 功能 | 说明 | 典型场景 |
|---|---|---|
| **30+ 内置组件** | header / metric / table / timeline / callout 等 | 覆盖工程/产品/设计高频场景 |
| **20 个场景模板** | 工程周报、PR 评审、实施计划、设计系统参考… | 直接选模板，填内容即用 |
| **原生 MD 兼容** | 所有指令是 HTML 注释，内容是标准 Markdown | 裸编辑器打开也可读 |
| **品牌包** | 颜色/字体/间距 token 本地保存 | 多文档风格统一 |
| **导出独立 HTML** | 无运行时依赖的精简单文件 | 发邮件、嵌入 Wiki、本地存档 |
| **双向 checkbox** | 点击预览里的 checkbox 实时回写 MD | 行动项跟踪 |
| **点击定位** | 点击预览元素，编辑器跳转对应行 | 快速编辑 |
| **AI 友好** | 结构化 MD 比 HTML 节省大量 token | 与 Claude / GPT 配合使用 |


<!-- ═══ 08 · 试一试 ═══ -->
<!-- @use checklist -->

## 动手试试

- [x] 在左侧编辑 Markdown，预览实时更新
- [x] 点击顶部"选择模板"切换到工程周报、PR 评审等场景
- [ ] 把标题 \`# md-html-forge\` 改成 \`# 你的项目名\`
- [ ] 点击右侧预览中的任意文字，看编辑器是否跳到对应行
- [ ] **勾选这一行**，看 MD 里的 \`- [ ]\` 是否自动变成 \`- [x]\`
- [ ] 点右上角"导出"，下载精简独立 HTML 文件


<!-- ═══ 09 · footer ═══ -->
<!-- @use footer -->

<!-- @slot:footer -->
md-html-forge · Markdown → Composable HTML · 2026 · MIT License
<!-- @/slot -->
`;

export function getDemoMarkdown(lang: 'zh' | 'en'): string {
  return lang === 'zh' ? DEMO_MARKDOWN_ZH : DEMO_MARKDOWN_EN;
}
