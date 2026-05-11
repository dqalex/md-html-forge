'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { AgentDocsView } from './AgentDocsView';

/**
 * /docs/agent client view — picks zh/en content based on i18n lang.
 */
export function AgentDocsPageView({
  contentZh,
  contentEn,
}: {
  contentZh: string;
  contentEn: string;
}) {
  const { lang, t } = useI18n();
  const content = lang === 'zh' ? contentZh : contentEn;
  const sizeBytes = new TextEncoder().encode(content).length;
  const sizeKb = (sizeBytes / 1024).toFixed(1);

  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <article className="max-w-[960px] mx-auto p-6">
        <header className="mb-4">
          <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[color:var(--text-tertiary)]">
            {t('agent.eyebrow')}
          </span>
          <h1 className="text-3xl font-medium mt-2 mb-2 text-[color:var(--foreground)]">
            {t('agent.title')}
          </h1>
          <p className="text-[13px] text-[color:var(--text-secondary)] leading-relaxed">
            {t('agent.desc')}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
            <span className="text-[color:var(--text-tertiary)] font-mono">
              {sizeKb} {t('agent.sizeInfo').replace('{lines}', String(content.split('\n').length))}
            </span>
            <span className="text-[color:var(--text-tertiary)]">·</span>
            <Link
              href="/llms.txt"
              className="font-mono text-[color:var(--accent-strong,#B04A3F)] hover:underline"
            >
              /llms.txt
            </Link>
            <span className="text-[color:var(--text-tertiary)]">{t('agent.plainTextLabel')}</span>
            <span className="text-[color:var(--text-tertiary)]">·</span>
            <Link
              href="/api/catalog.json"
              className="font-mono text-[color:var(--accent-strong,#B04A3F)] hover:underline"
            >
              /api/catalog.json
            </Link>
            <span className="text-[color:var(--text-tertiary)]">{t('agent.jsonLabel')}</span>
          </div>
        </header>

        <AgentDocsView content={content} />
      </article>
    </div>
  );
}
