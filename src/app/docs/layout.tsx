import { DocsHeader } from './DocsHeader';

/**
 * /docs/* 子段 layout：统一的文档顶栏 + 自由 body。
 * Playground（/）不受影响，仍用自己的 AppHeader。
 */
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-[color:var(--ivory)]">
      <DocsHeader />
      <div className="flex-1 min-h-0 flex flex-col">{children}</div>
    </div>
  );
}
