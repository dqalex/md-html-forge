import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';

export const metadata = {
  title: 'Slot 语法 · md-html-forge',
};

export default function SlotDocsPage() {
  return (
    <div className="min-h-screen bg-[color:var(--ivory)] py-12 px-6">
      <article className="max-w-[720px] mx-auto editorial">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] mb-8"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          返回 Playground
        </Link>

        <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[color:var(--text-tertiary)]">
          Docs · Slot Spec
        </span>
        <h1 className="text-4xl font-medium mt-2 mb-3 text-[color:var(--foreground)]">
          Markdown × HTML 的插槽契约
        </h1>
        <p className="text-[color:var(--text-secondary)] text-lg leading-relaxed mb-10">
          一份 Markdown 通过少量标注被切成命名片段，可以被任意 HTML 模板捡起并填入对应位置。
        </p>

        <h2 className="text-xl font-medium mt-8 mb-3 text-[color:var(--foreground)]">MD 端：用注释标记槽位</h2>
        <pre className="bg-[color:var(--ink)] text-[color:var(--ivory)] font-mono text-[13px] p-4 rounded-lg overflow-auto">
{`<!-- @slot:title -->
Birchline 团队周报
<!-- @/slot -->

<!-- @slot:body -->
## 本周亮点
- 限流中间件灰度到 10% 流量
- ...
<!-- @/slot -->`}
        </pre>

        <h2 className="text-xl font-medium mt-10 mb-3 text-[color:var(--foreground)]">HTML 端：用 data-slot 声明插槽</h2>
        <pre className="bg-[color:var(--ink)] text-[color:var(--ivory)] font-mono text-[13px] p-4 rounded-lg overflow-auto">
{`<header>
  <h1 data-slot="title"></h1>
</header>
<main data-slot="body"></main>`}
        </pre>

        <h2 className="text-xl font-medium mt-10 mb-3 text-[color:var(--foreground)]">Slot 类型</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="pb-2 text-[color:var(--text-tertiary)] font-medium">type</th>
              <th className="pb-2 text-[color:var(--text-tertiary)] font-medium">渲染方式</th>
              <th className="pb-2 text-[color:var(--text-tertiary)] font-medium">常见用途</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-[color:var(--border)]">
              <td className="py-2 font-mono">content</td>
              <td>完整 Markdown → HTML</td>
              <td>正文、FAQ、timeline</td>
            </tr>
            <tr className="border-t border-[color:var(--border)]">
              <td className="py-2 font-mono">richtext</td>
              <td>MD → HTML + DOMPurify</td>
              <td>短段富文本</td>
            </tr>
            <tr className="border-t border-[color:var(--border)]">
              <td className="py-2 font-mono">text</td>
              <td>纯 textContent</td>
              <td>标题、眉标</td>
            </tr>
            <tr className="border-t border-[color:var(--border)]">
              <td className="py-2 font-mono">data</td>
              <td>纯数值/短文</td>
              <td>指标值 &quot;62%&quot;</td>
            </tr>
            <tr className="border-t border-[color:var(--border)]">
              <td className="py-2 font-mono">image</td>
              <td>URL 注入到 src</td>
              <td>封面图</td>
            </tr>
          </tbody>
        </table>

        <h2 className="text-xl font-medium mt-10 mb-3 text-[color:var(--foreground)]">核心思想</h2>
        <blockquote className="border-l-[2.5px] border-[color:var(--accent)] bg-[color:var(--color-clay-50)] px-4 py-2 my-4 text-[color:var(--text-secondary)] rounded-r-md">
          MD 是信息的组织单元，HTML 是信息的呈现形态。
          <br />
          插槽是把前者流到后者的水管。
        </blockquote>

        <p className="text-sm text-[color:var(--text-tertiary)] mt-10">
          插槽管线完整实现见{' '}
          <code className="font-mono bg-[color:var(--surface-hover)] px-1.5 py-0.5 rounded text-xs">
            src/lib/markdown-slots/slot-sync.ts
          </code>
          ，该文件无任何外部依赖（仅 DOMPurify），可独立发布。
        </p>
      </article>
    </div>
  );
}
