'use client';

import { useCallback, useState } from 'react';
import { CopyIcon, CheckIcon, DownloadIcon } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

/**
 * /docs/agent interactive layer: copy + download buttons + <pre> display.
 */
export function AgentDocsView({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();

  const copy = useCallback(() => {
    try {
      navigator.clipboard.writeText(content).then(
        () => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        },
        () => setCopied(false),
      );
    } catch {
      setCopied(false);
    }
  }, [content]);

  const download = useCallback(() => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'forge-agent-docs.md';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [content]);

  return (
    <div className="rounded-md border border-[color:var(--border)] overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-[color:var(--border)] bg-[color:var(--surface-sunken, rgba(0,0,0,0.02))]">
        <span className="text-[11px] font-mono uppercase tracking-[0.1em] text-[color:var(--text-tertiary)]">
          forge agent docs · auto-generated
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={copy}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] font-mono border transition-colors ${
              copied
                ? 'border-[color:var(--color-olive,#788C5D)] text-[color:var(--color-olive,#788C5D)]'
                : 'border-[color:var(--border)] text-[color:var(--text-secondary)] hover:text-[color:var(--foreground)] hover:border-[color:var(--accent-strong,#B04A3F)]'
            }`}
          >
            {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
            {copied ? t('agent.copied') : t('agent.copyAll')}
          </button>
          <button
            type="button"
            onClick={download}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] font-mono border border-[color:var(--border)] text-[color:var(--text-secondary)] hover:text-[color:var(--foreground)] hover:border-[color:var(--accent-strong,#B04A3F)] transition-colors"
          >
            <DownloadIcon className="h-3.5 w-3.5" />
            {t('agent.download')}
          </button>
        </div>
      </div>
      <pre className="overflow-auto p-4 text-[12.5px] leading-relaxed font-mono text-[color:var(--foreground)] bg-[color:var(--ivory,#FAF9F5)] whitespace-pre-wrap m-0">
        {content}
      </pre>
    </div>
  );
}
