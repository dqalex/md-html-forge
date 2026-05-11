'use client';

import { useEffect, useMemo, useRef } from 'react';

import { renderWithFallback } from '@/lib/markdown-slots/fallback-renderer';
import { useI18n } from '@/lib/i18n';
import '@/builtin/bootstrap'; // ensure forge registry init (client-side too)

/**
 * /docs/syntax Client view: compiles source MD into HTML and loads it into an iframe.
 *
 * Supports bilingual rendering:
 *   - Reads `lang` from i18n context
 *   - Picks `markdownZh` or `markdownEn` accordingly
 *
 * The render pipeline is identical to the editor preview:
 *   renderWithFallback(markdown, '', {}, undefined, undefined, 'preview')
 * which recognizes `@compose` → compile pipeline → emits full doc with
 * `window.forge.runtime`, so interactive components work immediately.
 */
export function SyntaxDocView({ markdownZh, markdownEn }: { markdownZh: string; markdownEn: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const scrollYRef = useRef<number>(0);
  const { lang } = useI18n();

  const markdown = lang === 'zh' ? markdownZh : markdownEn;

  const html = useMemo(() => {
    if (!markdown) return '';
    const { html: rendered } = renderWithFallback(
      markdown,
      '',
      {},
      undefined,
      undefined,
      'preview',
    );
    return rendered;
  }, [markdown]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !html) return;
    try {
      scrollYRef.current = iframe.contentWindow?.scrollY ?? 0;
    } catch {
      scrollYRef.current = 0;
    }
    const onLoad = () => {
      try {
        iframe.contentWindow?.scrollTo(0, scrollYRef.current);
      } catch {
        /* cross-origin ignored */
      }
    };
    iframe.addEventListener('load', onLoad, { once: true });
    iframe.srcdoc = html;
    return () => iframe.removeEventListener('load', onLoad);
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      className="block w-full flex-1"
      style={{ border: 'none', minHeight: 'calc(100vh - 52px)' }}
      sandbox="allow-scripts allow-same-origin"
      title="forge syntax doc"
    />
  );
}
