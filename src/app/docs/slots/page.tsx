'use client';

import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { CatalogSection } from './CatalogSection';

/**
 * Syntax cheatsheet (/docs/slots)
 *
 * For users who've seen the demo and need quick directive reference.
 * Full spec: docs/engine/syntax.md (the canonical reference).
 */
export default function SlotDocsPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[color:var(--ivory)] py-12 px-6">
      <article className="max-w-[760px] mx-auto editorial">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] mb-8"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          {t('slots.backToPlayground')}
        </Link>

        <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[color:var(--text-tertiary)]">
          {t('slots.eyebrow')}
        </span>
        <h1 className="text-4xl font-medium mt-2 mb-3 text-[color:var(--foreground)]">
          {t('slots.title')}
        </h1>
        <p className="text-[color:var(--text-secondary)] text-lg leading-relaxed mb-2">
          {t('slots.desc')}
        </p>
        <p className="text-[12px] text-[color:var(--text-tertiary)] mb-10">
          {t('slots.syntaxLink')}{' '}
          <Link href="/docs/syntax" className="underline hover:text-[color:var(--text-primary)]">
            /docs/syntax
          </Link>
          。{t('slots.deepContract')}{' '}
          <code className="font-mono bg-[color:var(--surface-hover)] px-1.5 py-0.5 rounded text-xs">
            docs/engine/syntax.md
          </code>
          {t('slots.deepContractSuffix')}
        </p>

        {/* ===== 1. 5 Directives ===== */}
        <h2 className="text-xl font-medium mt-8 mb-3 text-[color:var(--foreground)]">
          {t('slots.section1Title')}
        </h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left">
              <th className="pb-2 pr-4 text-[color:var(--text-tertiary)] font-medium">{t('slots.colDirective')}</th>
              <th className="pb-2 pr-4 text-[color:var(--text-tertiary)] font-medium">{t('slots.colPurpose')}</th>
              <th className="pb-2 text-[color:var(--text-tertiary)] font-medium">{t('slots.colScope')}</th>
            </tr>
          </thead>
          <tbody>
            <Row code="@page" desc={t('slots.directivePage')} scope={t('slots.directivePageScope')} />
            <Row code="@compose" desc={t('slots.directiveCompose')} scope={t('slots.directiveComposeScope')} />
            <Row code="@theme" desc={t('slots.directiveTheme')} scope={t('slots.directiveThemeScope')} />
            <Row code="@use" desc={t('slots.directiveUse')} scope={t('slots.directiveUseScope')} />
            <Row code="@slot" desc={t('slots.directiveSlot')} scope={t('slots.directiveSlotScope')} />
          </tbody>
        </table>

        {/* ===== 2. Minimal Example ===== */}
        <h2 className="text-xl font-medium mt-10 mb-3 text-[color:var(--foreground)]">
          {t('slots.section2Title')}
        </h2>
        <Code>
{`<!-- @page width=wide -->
<!-- @compose: header, card, footer -->
<!-- @theme editorial -->

<!-- @use header -->
# Weekly Report · 2026-W19
## 4 items shipped, no P0 incidents

<!-- @use card variant=stat -->
<!-- @slot:statValue -->184ms<!-- @/slot -->
<!-- @slot:statLabel -->API p95<!-- @/slot -->
<!-- @slot:statDelta -->↓ 12%<!-- @/slot -->

<!-- @slot:footer -->
forge · 2026
<!-- @/slot -->`}
        </Code>

        {/* ===== 3. Variants ===== */}
        <h2 className="text-xl font-medium mt-10 mb-3 text-[color:var(--foreground)]">
          {t('slots.section3Title')}
        </h2>
        <p className="text-sm text-[color:var(--text-secondary)] leading-relaxed mb-3">
          {t('slots.variantDesc')} <code className="font-mono text-[color:var(--accent)]">@use</code> {t('slots.variantDescAfter')}{' '}
          <code className="font-mono text-[color:var(--accent)]">variant=xxx</code>。
        </p>
        <Code>
{`<!-- @use card variant=standard -->   icon+title+description+link
<!-- @use card variant=stat -->        big number+metric name+trend
<!-- @use card variant=decision -->    decision card: question+context+options
<!-- @use card variant=ticket -->      ticket card: ID+label+estimate

<!-- @use callout variant=note -->     icon + note
<!-- @use callout variant=warning -->  warning

<!-- @use table variant=impact -->     key-value impact table
<!-- @use table variant=risk -->       risk assessment table (desc|severity|mitigation)`}
        </Code>
        <p className="text-[11px] text-[color:var(--text-tertiary)] mt-2">
          {t('slots.variantOmitNote')}
        </p>

        {/* ===== 4. Slot Types ===== */}
        <h2 className="text-xl font-medium mt-10 mb-3 text-[color:var(--foreground)]">
          {t('slots.section4Title')}
        </h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left">
              <th className="pb-2 pr-4 text-[color:var(--text-tertiary)] font-medium">{t('slots.colType')}</th>
              <th className="pb-2 pr-4 text-[color:var(--text-tertiary)] font-medium">{t('slots.colRender')}</th>
              <th className="pb-2 text-[color:var(--text-tertiary)] font-medium">{t('slots.colUsage')}</th>
            </tr>
          </thead>
          <tbody>
            <Row code="text" desc={t('slots.slotTypeText')} scope={t('slots.slotTypeTextUsage')} />
            <Row code="content" desc={t('slots.slotTypeContent')} scope={t('slots.slotTypeContentUsage')} />
            <Row code="data" desc={t('slots.slotTypeData')} scope={t('slots.slotTypeDataUsage')} />
          </tbody>
        </table>
        <p className="text-[11px] text-[color:var(--text-tertiary)] mt-3">
          {t('slots.slotHistoricalNote')} <code className="font-mono">image</code> /{' '}
          <code className="font-mono">richtext</code> {t('slots.slotHistoricalNoteAfter')}
        </p>

        {/* ===== 5. Auto-binding ===== */}
        <h2 className="text-xl font-medium mt-10 mb-3 text-[color:var(--foreground)]">
          {t('slots.section5Title')}
        </h2>
        <p className="text-sm text-[color:var(--text-secondary)] leading-relaxed mb-3">
          {t('slots.autoBindDesc')}
        </p>
        <Code>
{`<!-- @use header -->

# This line auto-binds to cardTitle slot (if declared bind: h1)
## This line goes into subtitle
> Quote block auto-binds to lead slot`}
        </Code>

        {/* ===== 6. Component Loop ===== */}
        <h2 className="text-xl font-medium mt-10 mb-3 text-[color:var(--foreground)]">
          {t('slots.section6Title')}
        </h2>
        <Code>
{`<!-- @compose-group layout-grid-4 -->
<!-- @item card variant=stat statValue="30+" statLabel="Components" --><!-- @/item -->
<!-- @item card variant=stat statValue="54"  statLabel="Variants" --><!-- @/item -->
<!-- @item card variant=stat statValue="3"   statLabel="Themes" --><!-- @/item -->
<!-- @/compose-group -->`}
        </Code>

        {/* ===== 7. Component Selection Guide ===== */}
        <h2 className="text-xl font-medium mt-10 mb-3 text-[color:var(--foreground)]">
          {t('slots.section7Title')}
        </h2>
        <p className="text-sm text-[color:var(--text-secondary)] leading-relaxed">
          {t('slots.catalogIntro')}<strong>{t('slots.catalogIntroBold')}</strong>{t('slots.catalogIntroAfter')}
        </p>
        <details className="mt-3">
          <summary className="text-[12px] font-mono uppercase tracking-[0.08em] text-[color:var(--text-tertiary)] cursor-pointer">
            {t('slots.catalogExpandLabel')}
          </summary>
          <table className="w-full text-sm border-collapse mt-2">
            <thead>
              <tr className="text-left">
                <th className="pb-2 pr-4 text-[color:var(--text-tertiary)] font-medium">{t('slots.colCategory')}</th>
                <th className="pb-2 pr-4 text-[color:var(--text-tertiary)] font-medium">{t('slots.colComponentId')}</th>
                <th className="pb-2 text-[color:var(--text-tertiary)] font-medium">{t('slots.colVariants')}</th>
              </tr>
            </thead>
            <tbody>
              <Row code="card" desc="card" scope="standard / stat / decision / ticket" />
              <Row code="card" desc="info-panel" scope="approach / variant / detail / sample" />
              <Row code="list" desc="list-item" scope="shipped / carryover / focus / action" />
              <Row code="list" desc="list-row" scope="pr / file / entry" />
              <Row code="list" desc="timeline" scope="standard / milestones / incident" />
              <Row code="data" desc="metric" scope="band / hero / slide" />
              <Row code="data" desc="pr-summary" scope="standard / keyfiles" />
              <Row code="data" desc="table" scope="standard / risk / impact / flag" />
              <Row code="visual" desc="callout" scope="concept / note / questions / recommendation" />
              <Row code="visual" desc="panel" scope="snippet / glossary / prompt" />
              <Row code="visual" desc="comparison" scope="ba / options / mockup" />
              <Row code="visual" desc="progress" scope="bars / item / rollout" />
              <Row code="visual" desc="code-block" scope="diff / walkthrough" />
              <Row code="visual" desc="chip" scope="risk / incident / legend" />
              <Row code="visual" desc="design-spec" scope="swatch / spacing / radius / keyframe" />
              <Row code="visual" desc="illustration" scope="frame / notes" />
              <Row code="summary" desc="lead" scope="lead / tldr / phase" />
            </tbody>
          </table>
        </details>

        <CatalogSection />

        {/* ===== 8. Custom Components ===== */}
        <h2 className="text-xl font-medium mt-10 mb-3 text-[color:var(--foreground)]">
          {t('slots.section8Title')}
        </h2>
        <p className="text-sm text-[color:var(--text-secondary)] leading-relaxed mb-2">
          {t('slots.customCompDesc1')}{' '}
          <code className="font-mono text-[color:var(--accent)]">.forge.md</code> {t('slots.customCompDesc2')}
        </p>
        <p className="text-sm text-[color:var(--text-secondary)] leading-relaxed mb-2">
          {t('slots.customCompDesc3')}
        </p>
        <p className="text-[11px] text-[color:var(--text-tertiary)]">
          {t('slots.customCompTrust')} <code className="font-mono">trust: user</code> {t('slots.customCompTrustAfter')}
        </p>

        {/* ===== Core Principle ===== */}
        <h2 className="text-xl font-medium mt-10 mb-3 text-[color:var(--foreground)]">{t('slots.corePrincipleTitle')}</h2>
        <blockquote className="border-l-[2.5px] border-[color:var(--accent)] bg-[color:var(--color-clay-50)] px-4 py-3 my-4 text-[color:var(--text-secondary)] rounded-r-md text-[14px] leading-relaxed">
          {t('slots.corePrinciple1')}
          <br />
          {t('slots.corePrinciple2')}
        </blockquote>

        {/* ===== For AI ===== */}
        <h2 className="text-xl font-medium mt-10 mb-3 text-[color:var(--foreground)]">
          {t('slots.forAITitle')}
        </h2>
        <p className="text-sm text-[color:var(--text-secondary)] leading-relaxed mb-3">
          {t('slots.forAIDesc')}<strong>{t('slots.forAIDescBold')}</strong>{t('slots.forAIDescAfter')}
        </p>
        <ul className="text-[13px] leading-relaxed space-y-1.5 pl-0 list-none">
          <li>
            <Link href="/llms.txt" className="font-mono text-[color:var(--accent-strong,#B04A3F)] hover:underline">
              /llms.txt
            </Link>
            <span className="text-[color:var(--text-secondary)]"> {t('slots.llmsLabel')}</span>
          </li>
          <li>
            <Link href="/api/catalog.json" className="font-mono text-[color:var(--accent-strong,#B04A3F)] hover:underline">
              /api/catalog.json
            </Link>
            <span className="text-[color:var(--text-secondary)]"> {t('slots.catalogLabel')}</span>
          </li>
          <li>
            <Link href="/docs/agent" className="font-mono text-[color:var(--accent-strong,#B04A3F)] hover:underline">
              /docs/agent
            </Link>
            <span className="text-[color:var(--text-secondary)]"> {t('slots.agentDocsLabel')}</span>
          </li>
          <li>
            <Link href="/docs/syntax" className="font-mono text-[color:var(--accent-strong,#B04A3F)] hover:underline">
              /docs/syntax
            </Link>
            <span className="text-[color:var(--text-secondary)]"> {t('slots.syntaxDocsLabel')}</span>
          </li>
        </ul>

        <p className="text-sm text-[color:var(--text-tertiary)] mt-10">
          {t('slots.footerNote')}{' '}
          <code className="font-mono bg-[color:var(--surface-hover)] px-1.5 py-0.5 rounded text-xs">
            docs/engine/
          </code>
          {t('slots.footerSrc')}{' '}
          <code className="font-mono bg-[color:var(--surface-hover)] px-1.5 py-0.5 rounded text-xs">
            src/builtin/compiler/
          </code>
          {t('slots.footerComp')}{' '}
          <code className="font-mono bg-[color:var(--surface-hover)] px-1.5 py-0.5 rounded text-xs">
            src/builtin/components/*.forge.md
          </code>
          {t('slots.footerCompSrc')}
        </p>
      </article>
    </div>
  );
}

// ============================================================
// Small components
// ============================================================

function Row({ code, desc, scope }: { code: string; desc: string; scope: string }) {
  return (
    <tr className="border-t border-[color:var(--border)]">
      <td className="py-2 pr-4 font-mono text-[12px] text-[color:var(--accent-strong,#B04A3F)]">
        {code}
      </td>
      <td className="py-2 pr-4 text-[13px] text-[color:var(--text-primary)]">{desc}</td>
      <td className="py-2 text-[12px] text-[color:var(--text-tertiary)]">{scope}</td>
    </tr>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="bg-[color:var(--ink,#141413)] text-[color:var(--ivory)] font-mono text-[12px] leading-relaxed p-4 rounded-lg overflow-auto">
      {children}
    </pre>
  );
}
