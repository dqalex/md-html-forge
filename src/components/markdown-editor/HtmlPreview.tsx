'use client';

import { useMemo } from 'react';

import { syncMdToHtml } from '@/lib/markdown-slots';
import type { SlotDef } from '@/lib/markdown-slots';

export interface HtmlPreviewProps {
  /** HTML 模板（含 data-slot 标记） */
  templateHtml: string;
  /** 模板自定义 CSS */
  templateCss?: string;
  /** Slot 定义 */
  slotDefs?: Record<string, SlotDef>;
  /** 当前 Markdown 内容 */
  markdownContent: string;
  /** iframe sandbox 模式 */
  sandbox?: string;
  /** 额外 class */
  className?: string;
}

/**
 * HTML 模板预览组件（iframe sandbox）
 *
 * 将 Markdown 内容通过 slot-sync 注入 HTML 模板，在沙箱 iframe 中渲染。
 */
export function HtmlPreview({
  templateHtml,
  templateCss,
  slotDefs = {},
  markdownContent,
  sandbox = 'allow-same-origin',
  className,
}: HtmlPreviewProps) {
  const srcDoc = useMemo(() => {
    if (!templateHtml) return '';
    const result = syncMdToHtml(markdownContent, templateHtml, slotDefs, templateCss);
    return result.html;
  }, [templateHtml, templateCss, slotDefs, markdownContent]);

  if (!srcDoc) {
    return (
      <div className={`flex items-center justify-center h-full text-muted-foreground ${className ?? ''}`}>
        <p className="text-sm italic">请选择模板以预览 HTML 渲染效果</p>
      </div>
    );
  }

  return (
    <iframe
      className={`block w-full h-full ${className ?? ''}`}
      style={{ border: 'none' }}
      sandbox={sandbox}
      srcDoc={srcDoc}
      title="html-template-preview"
    />
  );
}
