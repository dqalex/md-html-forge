'use client';

import { useEffect, useState } from 'react';

import { MarkdownEditor } from '@/components/markdown-editor';
import { AppHeader } from '@/components/app/AppHeader';
import type { TemplateManifest } from '@/lib/markdown-slots';
import { PRESETS, type PresetTemplate } from '@/templates/presets/registry';

/**
 * 首屏 demo：分 4 段展示不同布局 + 不同主题
 */
const DEMO_MARKDOWN = `<!-- @page width=wide -->
<!-- @compose: header, tldr, lead, layout-grid-4, layout-grid-3, body, footer -->

<!-- ═══ 段 1：header —— 直接用原生 # / ## 标题即可 ═══ -->
<!-- @theme editorial -->
<!-- @use header -->

# md-html-forge

## 把 :lucide:wand-2: **Markdown** 喂进精心设计的组件库

<!-- @slot:eyebrow -->PLAYGROUND · DEMO<!-- @/slot -->
<!-- @slot:badge -->v0.5<!-- @/slot -->
<!-- @slot:date -->2026-05-10<!-- @/slot -->
<!-- @slot:author -->@alexama<!-- @/slot -->


<!-- ═══ 段 2：tldr —— 直接用原生列表即可 ═══ -->
<!-- @use tldr -->

- :lucide:zap: **作用域指令** — 用 \`@layout\` / \`@theme\` 分段
- :lucide:layers: **30+ 内置组件** — 自由组合，未来扩展到 122+
- :lucide:sparkles: **6 个主题** — editorial / dark / sage / cobalt / sunset / mono
- :lucide:monitor: **全局页宽可配** — \`@page width=wide / mobile / 100%\`
- :lucide:file-text: **MD 原生兼容** — 源文件在任何 MD 编辑器里都可读
- :lucide:check-square: **交互双向同步** — 勾选 checkbox 直接回写 MD


<!-- ═══ 段 3：lead —— 用 > 引用块 ═══ -->
<!-- @use lead -->

> 我们相信文档的质感应当与它承载的思考同等重要。这个 Playground 是为那些既不愿写堆 CSS、又不满足于"像个网页"的人准备的。


<!-- ═══ 段 4：深色主题 + 4 列指标卡循环 ═══ -->
<!-- @theme dark -->

<!-- @compose-group layout-grid-4 -->
<!-- @item stat-card statValue="30+" statLabel="Built-in Components" statDelta="expanding to 122" --><!-- @/item -->
<!-- @item stat-card statValue="8" statLabel="Templates" statDelta="all composable" --><!-- @/item -->
<!-- @item stat-card statValue="6" statLabel="Themes" statDelta="scoped to section" --><!-- @/item -->
<!-- @item stat-card statValue="80+" statLabel="Lucide Icons" statDelta="tree-shaken" --><!-- @/item -->
<!-- @/compose-group -->


<!-- ═══ 段 5：sage 主题 + 3 列功能卡（富文本卡片用块级 slot）═══ -->
<!-- @theme sage -->

<!-- @compose-group layout-grid-3 -->
<!-- @item feature-card cardIcon=zap cardTitle="作用域指令" -->
<!-- @slot:cardBody -->\`@layout\` / \`@theme\` 一次声明，**直到下次声明**为止；段与段之间自然切换。<!-- @/slot -->
<!-- @/item -->
<!-- @item feature-card cardIcon=layers cardTitle="组件自由组合" -->
<!-- @slot:cardBody -->\`@compose\` 列表 + 段内顺序，每个 slot 独立编辑，**所见即所得**。<!-- @/slot -->
<!-- @/item -->
<!-- @item feature-card cardIcon=file-text cardTitle="MD 原生兼容" -->
<!-- @slot:cardBody -->标题、列表、引用**直接就是 slot**，裸 MD 编辑器也可读。<!-- @/slot -->
<!-- @/item -->
<!-- @/compose-group -->


<!-- ═══ 段 6：body —— 整段原生 MD 作为正文 ═══ -->
<!-- @theme editorial -->
<!-- @use body -->

## 工作方式

1. 选一个内置模板，或者完全从 \`@compose\` 开始
2. 直接写原生 Markdown —— 标题、列表、引用**自动归入组件 slot**
3. 富文本卡片用 \`<!-- @slot:name -->\` 显式绑定
4. 用 \`@layout\` / \`@theme\` 给段落切风格

## 编译管线（声明式图表）

\`\`\`flow
用户写 Markdown
  ▼
Lexer · 单遍扫描产 Token
  ▼
Parser · Token → AST + 诊断
  ▼
bindNativeMd · 原生块 → slot
  ▼
Resolver · 段切割 + 归属
  ▼
Emitter · 按需 CSS + HTML
  ▼
✅ 单文件 HTML 可独立运行
\`\`\`

## 方案对比

\`\`\`compare
✅ Markdown 原生
- 裸 MD 编辑器也可读
- 语义完整，可点击定位
- 学习成本低

❌ 属性藏内容
- 裸 MD 编辑器看不到内容
- 源码与输出脱钩
- 已从 v0.5 移除
\`\`\`

## 核心原则

> **源文件在裸 MD 编辑器里打开也应当是合理的、可读的 Markdown 文档。**
> 所有 forge 指令只是注释，内容永远是原生 MD。

## Try it

- [x] 编辑左侧 MD，预览实时更新
- [x] 把 \`# md-html-forge\` 改成 \`# Your Title\` 看 header 自动同步
- [ ] 点击右侧任意元素看 CodeMirror 跳转
- [ ] 点右上角"导出 HTML"试试精简模式导出

\`\`\`typescript
// 编译管线（编译器风格）
source → tokenize → parse → bindNativeMd → resolve → emit → HTML
\`\`\`


<!-- ═══ 段 7：footer ═══ -->
<!-- @slot:footer -->
md-html-forge · Markdown → Composable HTML · 2026
<!-- @/slot -->
`;

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [markdown, setMarkdown] = useState(DEMO_MARKDOWN);
  const [manifest, setManifest] = useState<TemplateManifest | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  // 避免 SSR / 客户端水合差异：CodeMirror 只在客户端挂载
  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePresetChange = (preset: PresetTemplate) => {
    setManifest(preset.manifest);
    setSelectedPresetId(preset.id);
    // 只在 MD 为空时才加载 starter markdown
    // 用户已有内容时保留，兜底渲染器会把匹配的 slot 填入新模板，不匹配的显示在末尾
    if (!markdown.trim()) {
      setMarkdown(preset.starterMarkdown);
    }
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--background)' }}>
      <AppHeader
        selectedPreset={PRESETS.find(p => p.id === selectedPresetId) ?? null}
        onSelectPreset={handlePresetChange}
      />

      <main className="flex-1 min-h-0 overflow-hidden">
        {mounted ? (
          <MarkdownEditor
            value={markdown}
            onChange={setMarkdown}
            templateManifest={manifest}
            selectedPresetId={selectedPresetId}
            onPresetChange={handlePresetChange}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-[color:var(--text-tertiary)] text-sm">
            加载编辑器…
          </div>
        )}
      </main>
    </div>
  );
}
