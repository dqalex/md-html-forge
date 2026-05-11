'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import '@/builtin/bootstrap';
import { FORGE_COMPONENTS, FORGE_SAMPLES } from '@/builtin/components/forge-registry';
import { renderWithFallback } from '@/lib/markdown-slots/fallback-renderer';
import { useI18n } from '@/lib/i18n';
import type { ComponentDef } from '@/builtin/types';

/**
 * 组件选型指南（/docs/slots 第 7 节）
 *
 * 目标：
 *   - 给 AI agent 提供"按场景挑组件"的结构化依据（whenToUse / whenNot / keySlots）
 *   - 给人类用户一个"所见即所得"的总览，不用翻模板才知道组件长啥样
 *
 * 数据源：
 *   - FORGE_COMPONENTS 的 ComponentDef（已含 variants / variantDescriptions / tags 等）
 *   - FORGE_SAMPLES[id] 是每个 .forge.md 的 ## Sample 原始 markdown（含多个变体示例）
 *   - 缺失 whenToUse / whenNot / keySlots 的存量组件用 CATALOG_FALLBACK 兜底
 *
 * 预览：每个组件一张卡，卡片内 iframe 编译 sample → 与编辑器预览走同一条链路。
 */

/** 存量组件（未在 .forge.md 里声明 whenToUse 等字段时的兜底文案） */
const CATALOG_FALLBACK: Record<
  string,
  { whenToUse?: string[]; whenNot?: string[]; whenToUseEn?: string[]; whenNotEn?: string[]; keySlots?: string[] }
> = {
  header: {
    whenToUse: ['每个文档的开头，写标题 + 副标题', '需要 eyebrow / date / author 等元信息'],
    whenNot: ['不需要正式标题的短便签（直接 body 或 lead）'],
    whenToUseEn: ['Start of every document — title + subtitle', 'Need metadata like eyebrow / date / author'],
    whenNotEn: ['Short notes without formal title (use body or lead directly)'],
    keySlots: ['title', 'subtitle', 'eyebrow', 'date'],
  },
  lead: {
    whenToUse: ['TL;DR / 一句话摘要', '文章开头的"为什么看这篇"'],
    whenNot: ['正文段落（用 body）', '数据/指标（用 metric）'],
    whenToUseEn: ['TL;DR / one-line summary', '"Why read this" at article start'],
    whenNotEn: ['Body paragraphs (use body)', 'Data/metrics (use metric)'],
    keySlots: ['lead', 'tldr'],
  },
  body: {
    whenToUse: ['自由正文：段落、列表、引用、代码块混写', '没有更精确组件能装下时的兜底'],
    whenNot: ['结构化数据（用 metric / table）', '需要视觉强调的要点（用 callout / highlights）'],
    whenToUseEn: ['Free-form body: paragraphs, lists, quotes, code blocks mixed', 'Fallback when no more specific component fits'],
    whenNotEn: ['Structured data (use metric / table)', 'Points needing visual emphasis (use callout / highlights)'],
  },
  'meta-pills': {
    whenToUse: ['文档头部一排 key|value 标签（如 Status | sev-2 / Duration | 47m）'],
    whenNot: ['单个突出标签（用 chip）'],
    whenToUseEn: ['A row of key|value pills at doc header (e.g. Status | sev-2 / Duration | 47m)'],
    whenNotEn: ['Single prominent label (use chip)'],
    keySlots: ['pills'],
  },
  metric: {
    whenToUse: ['KPI / 指标仪表盘', '多个数值横排带标签 + 趋势', '报告开头的数据摘要'],
    whenNot: ['单个数值（用 callout）', '带单位/图表的时序数据（暂不支持）'],
    whenToUseEn: ['KPI / metric dashboard', 'Multiple values in a row with labels + trend', 'Data summary at report start'],
    whenNotEn: ['Single value (use callout)', 'Time-series data with units/charts (not yet supported)'],
    keySlots: ['metricValue', 'metricLabel', 'metricDelta'],
  },
  table: {
    whenToUse: ['行列数据', '风险/影响清单（risk/impact）', '特性开关列表（flag）'],
    whenNot: ['≤ 3 行小数据（用 metric 或 list-item）'],
    whenToUseEn: ['Tabular data', 'Risk/impact lists (risk/impact)', 'Feature flag lists (flag)'],
    whenNotEn: ['≤ 3 rows of small data (use metric or list-item)'],
    keySlots: ['tableContent / tableData', 'tableHeading'],
  },
  'pr-summary': {
    whenToUse: ['PR/MR 顶部摘要区：编号、作者、改动统计', '代码评审开头'],
    whenNot: ['通用 diff 展示（用 code-block variant=diff）'],
    whenToUseEn: ['PR/MR header summary: number, author, change stats', 'Code review start'],
    whenNotEn: ['General diff display (use code-block variant=diff)'],
  },
  timeline: {
    whenToUse: ['事件/里程碑时间顺序', '事故复盘的时间线', 'roadmap'],
    whenNot: ['并列任务（用 list-item）', '步骤拆解（用 code-block walkthrough）'],
    whenToUseEn: ['Events/milestones in chronological order', 'Incident review timeline', 'roadmap'],
    whenNotEn: ['Parallel tasks (use list-item)', 'Step breakdown (use code-block walkthrough)'],
  },
  'list-item': {
    whenToUse: ['shipped / carryover / focus 等列表项', '多条同结构的交付记录'],
    whenNot: ['带图标的小卡片（用 card）', '简单 bullet（直接 markdown `- ` 即可）'],
    whenToUseEn: ['shipped / carryover / focus list items', 'Multiple delivery records with same structure'],
    whenNotEn: ['Small cards with icon (use card)', 'Simple bullets (just use markdown `- `)'],
  },
  'list-row': {
    whenToUse: ['PR/文件/条目级别的行级摘要', '比 timeline 更紧凑，比 table 更视觉'],
    whenNot: ['复杂多列数据（用 table）'],
    whenToUseEn: ['PR/file/item-level row summary', 'More compact than timeline, more visual than table'],
    whenNotEn: ['Complex multi-column data (use table)'],
  },
  callout: {
    whenToUse: ['需要视觉强调的一小段文字：note / warning / question / recommendation'],
    whenNot: ['长段正文（用 body）', '列表（用 highlights）'],
    whenToUseEn: ['A short text needing visual emphasis: note / warning / question / recommendation'],
    whenNotEn: ['Long body text (use body)', 'Lists (use highlights)'],
    keySlots: ['calloutTitle', 'calloutBody'],
  },
  panel: {
    whenToUse: [
      'snippet — 带深色代码区的信息面板',
      'glossary — sticky 术语定义侧栏',
      'prompt — 一段提示词/说明',
    ],
    whenNot: ['纯代码块（用 code-block）', '长正文（用 body）'],
    whenToUseEn: [
      'snippet — info panel with dark code area',
      'glossary — sticky term definition sidebar',
      'prompt — a prompt/description block',
    ],
    whenNotEn: ['Pure code block (use code-block)', 'Long body text (use body)'],
    keySlots: ['panelTitle', 'panelBody'],
  },
  'info-panel': {
    whenToUse: ['技术方案/思路展示的大块信息', '比 panel 更宽，含图示/变体对比'],
    whenNot: ['简短提示（用 callout）'],
    whenToUseEn: ['Large info block for technical approach/idea', 'Wider than panel, includes diagrams/variant comparison'],
    whenNotEn: ['Short tips (use callout)'],
  },
  comparison: {
    whenToUse: ['Before / After 对比', '方案选型（options）', '设计稿 mockup 展示'],
    whenNot: ['单个观点（用 callout）', '多列数据对比（用 table）'],
    whenToUseEn: ['Before / After comparison', 'Option selection (options)', 'Design mockup display'],
    whenNotEn: ['Single viewpoint (use callout)', 'Multi-column data comparison (use table)'],
    keySlots: ['baBefore / baAfter', 'optionTitle', 'optionItems'],
  },
  progress: {
    whenToUse: ['完成度进度条（bars）', '单项推进（item）', '灰度 rollout 百分比'],
    whenNot: ['多维 KPI（用 metric）'],
    whenToUseEn: ['Completion progress bars (bars)', 'Single-item progress (item)', 'Gradual rollout percentage'],
    whenNotEn: ['Multi-dimensional KPIs (use metric)'],
  },
  'code-block': {
    whenToUse: ['diff — 代码差异（+/- 行 + hunk）', 'walkthrough — 编号步骤 + 文件位置 + 说明 + 可折叠代码'],
    whenNot: ['纯代码片段无结构（直接 markdown ``` 即可）'],
    whenToUseEn: ['diff — code differences (+/- lines + hunk)', 'walkthrough — numbered steps + file location + description + collapsible code'],
    whenNotEn: ['Unstructured code snippets (just use markdown ```)'],
    keySlots: ['diffContent', 'stepNum / stepLoc / stepBody / stepCode'],
  },
  chip: {
    whenToUse: [
      'risk — 风险等级胶囊（safe/medium/attention）',
      'incident — sev/resolved/neutral 事件状态 pill',
      'legend — 流程图图例条',
    ],
    whenNot: ['成行的多条 key|value（用 meta-pills）'],
    whenToUseEn: [
      'risk — risk level capsule (safe/medium/attention)',
      'incident — sev/resolved/neutral event status pill',
      'legend — flowchart legend strip',
    ],
    whenNotEn: ['Rows of key|value pairs (use meta-pills)'],
  },
  'design-spec': {
    whenToUse: ['设计系统展示：色板 / 间距 / 圆角 / 关键帧动画'],
    whenNot: ['不是设计文档（一般业务文档用不上）'],
    whenToUseEn: ['Design system showcase: color swatches / spacing / border radius / keyframe animations'],
    whenNotEn: ['Not a design document (general business docs won\'t need this)'],
  },
  illustration: {
    whenToUse: ['架构图 / 流程图的容器（frame）', '简单插画 + 说明（notes）'],
    whenNot: ['纯代码（用 code-block）', '纯表格（用 table）'],
    whenToUseEn: ['Architecture/flowchart container (frame)', 'Simple illustration + notes (notes)'],
    whenNotEn: ['Pure code (use code-block)', 'Pure table (use table)'],
  },
  highlights: {
    whenToUse: ['2-5 条需要加粗的本周要点', '报告/周报"亮点"'],
    whenNot: ['长列表（用 list-item）'],
    whenToUseEn: ['2-5 bold key points for the week', 'Report/weekly "highlights"'],
    whenNotEn: ['Long lists (use list-item)'],
  },
  actions: {
    whenToUse: ['未完成事项、follow-up、carryover 清单'],
    whenNot: ['复杂任务（用 checklist 或 table）'],
    whenToUseEn: ['Outstanding items, follow-ups, carryover list'],
    whenNotEn: ['Complex tasks (use checklist or table)'],
  },
  checklist: {
    whenToUse: ['可勾选的验收清单（点击会回写 MD）', 'Try it 交互演示'],
    whenNot: ['纯展示性任务（用 list-item）'],
    whenToUseEn: ['Checkable acceptance list (clicking writes back to MD)', 'Try it interactive demo'],
    whenNotEn: ['Display-only tasks (use list-item)'],
  },
  'collapse-section': {
    whenToUse: ['折叠的长段内容，点击标题展开', '细节说明（默认收起）'],
    whenNot: ['短小段落（直接 body）'],
    whenToUseEn: ['Collapsible long content, click title to expand', 'Detail notes (collapsed by default)'],
    whenNotEn: ['Short paragraphs (just use body)'],
  },
  'faq-item': {
    whenToUse: ['FAQ 条目（多条用多个 @use）', '问答型展示（比 qa 更紧凑）'],
    whenNot: ['单个问答（用 qa）', '步骤拆解（用 code-block walkthrough）'],
    whenToUseEn: ['FAQ entries (multiple entries use multiple @use)', 'Q&A display (more compact than qa)'],
    whenNotEn: ['Single Q&A (use qa)', 'Step breakdown (use code-block walkthrough)'],
    keySlots: ['faqQ', 'faqA'],
  },
  qa: {
    whenToUse: ['单个问答块（问题 + 展开的答案）'],
    whenNot: ['多条 FAQ（用多个 faq-item）'],
    whenToUseEn: ['Single Q&A block (question + expanded answer)'],
    whenNotEn: ['Multiple FAQs (use multiple faq-item)'],
  },
  'review-comment': {
    whenToUse: ['代码评审评论条：作者 + 文件位置 + 评论'],
    whenNot: ['通用评论（用 body）'],
    whenToUseEn: ['Code review comment strip: author + file location + comment'],
    whenNotEn: ['General comments (use body)'],
  },
  'setup-steps': {
    whenToUse: ['多步骤的安装/配置流程'],
    whenNot: ['复杂代码说明（用 code-block walkthrough）'],
    whenToUseEn: ['Multi-step installation/configuration flow'],
    whenNotEn: ['Complex code walkthrough (use code-block walkthrough)'],
  },
  'slide-agenda': {
    whenToUse: ['幻灯片式议程/大纲展示'],
    whenNot: ['普通文档目录（用 body）'],
    whenToUseEn: ['Slide-style agenda/outline display'],
    whenNotEn: ['Regular document TOC (use body)'],
  },
  'test-step': {
    whenToUse: ['测试步骤：前置 → 操作 → 预期 → 实际'],
    whenNot: ['非测试文档的流程（用 code-block walkthrough）'],
    whenToUseEn: ['Test steps: precondition → action → expected → actual'],
    whenNotEn: ['Non-test document flows (use code-block walkthrough)'],
  },
  footer: {
    whenToUse: ['文档末尾：来源 / 时间戳 / 签名'],
    whenToUseEn: ['End of document: source / timestamp / signature'],
  },
  card: {
    whenToUse: [
      'standard — 图标 + 标题 + 描述 + 链接',
      'stat — 大数字 + 指标名 + 趋势',
      'decision — 决策卡：问题 + 上下文 + 选项',
      'ticket — 工单卡：ID + 标签 + 估时',
    ],
    whenNot: ['多条列表（用 list-item/list-row）', '强视觉提示（用 callout）'],
    whenToUseEn: [
      'standard — icon + title + description + link',
      'stat — big number + metric name + trend',
      'decision — decision card: question + context + options',
      'ticket — ticket card: ID + label + estimate',
    ],
    whenNotEn: ['Multiple list items (use list-item/list-row)', 'Strong visual callout (use callout)'],
  },
};

export function CatalogSection() {
  const { t, lang } = useI18n();
  const components = useMemo(
    () => [...FORGE_COMPONENTS].sort((a, b) => {
      // 按 category 再按 id 排
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.id.localeCompare(b.id);
    }),
    [],
  );

  return (
    <div className="mt-6 space-y-6">
      <p className="text-[13px] text-[color:var(--text-secondary)] leading-relaxed">
        {components.length} {t('slots.catalogCountDesc')}<strong>{t('slots.catalogIntroBold')}</strong>{t('slots.catalogCountDescAfter')}<code className="font-mono text-[12px] bg-[color:var(--surface-hover)] px-1 py-0.5 rounded">.forge.md</code>{t('slots.catalogCountDescAfter2')}{' '}
        <code className="font-mono text-[12px] bg-[color:var(--surface-hover)] px-1 py-0.5 rounded">whenToUse / whenNot / keySlots</code>{t('slots.catalogCountDescAfter3')} <code className="font-mono text-[12px]">;</code> {t('slots.catalogCountDescAfter4')}
      </p>
      {components.map((comp) => (
        <ComponentCard key={comp.id} component={comp} lang={lang} t={t} />
      ))}
    </div>
  );
}

// ===================================================================

function ComponentCard({ component, lang, t }: { component: ComponentDef; lang: string; t: (key: string) => string }) {
  const { id, name, category, tags, description, variants = [], variantDescriptions = {}, defaultVariant } = component;
  const fb = CATALOG_FALLBACK[id] || {};
  const whenToUse = component.whenToUse ?? (lang === 'zh' ? fb.whenToUse : fb.whenToUseEn) ?? fb.whenToUse;
  const whenNot = component.whenNot ?? (lang === 'zh' ? fb.whenNot : fb.whenNotEn) ?? fb.whenNot;
  const keySlots = component.keySlots ?? fb.keySlots;

  const sampleMd = FORGE_SAMPLES[id] || '';
  const allVariantIds = variants.length ? variants : defaultVariant ? [defaultVariant] : [];
  const [previewVariant, setPreviewVariant] = useState<string>(defaultVariant || allVariantIds[0] || '');

  return (
    <article
      className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface,white)] p-5"
      id={`cmp-${id}`}
    >
      {/* 头部：名称 + id + category + tags */}
      <header className="flex items-baseline flex-wrap gap-2 mb-1">
        <h3 className="text-lg font-medium text-[color:var(--foreground)] m-0">{name}</h3>
        <code className="font-mono text-[12px] text-[color:var(--accent-strong,#B04A3F)]">
          {id}
        </code>
        <span className="text-[11px] font-mono uppercase tracking-[0.1em] text-[color:var(--text-tertiary)]">
          · {category}
        </span>
      </header>

      {description && (
        <p className="text-[13px] text-[color:var(--text-secondary)] leading-relaxed mb-2 mt-1">
          {description}
        </p>
      )}

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.map((t) => (
            <span
              key={t}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-[color:var(--surface-hover)] text-[color:var(--text-tertiary)]"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* 预览 iframe（如果有 sample） */}
      {sampleMd && (
        <div className="mb-4">
          {allVariantIds.length > 1 && (
            <div className="flex items-center gap-1 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.08em] text-[color:var(--text-tertiary)] mr-2">
                {t('slots.variantLabel')}
              </span>
              {allVariantIds.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setPreviewVariant(v)}
                  className={`text-[11px] font-mono px-2.5 py-1 rounded border transition-colors ${
                    v === previewVariant
                      ? 'bg-[color:var(--foreground,#141413)] text-[color:var(--ivory,#FAF9F5)] border-[color:var(--foreground,#141413)]'
                      : 'bg-transparent text-[color:var(--text-secondary)] border-[color:var(--border)] hover:border-[color:var(--accent-strong,#B04A3F)]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          )}
          <PreviewIframe componentId={id} variant={previewVariant} sampleMd={sampleMd} />
        </div>
      )}

      {/* 变体差异表 */}
      {variants.length > 0 && (
        <div className="mb-4">
          <div className="text-[11px] font-mono uppercase tracking-[0.08em] text-[color:var(--text-tertiary)] mb-1.5">
            variants
          </div>
          <dl className="text-[13px] grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            {variants.map((v) => (
              <div key={v} className="contents">
                <dt className="font-mono text-[12px] text-[color:var(--accent-strong,#B04A3F)] whitespace-nowrap">
                  {v}
                  {v === defaultVariant && <span className="ml-1 text-[color:var(--text-tertiary)]">*</span>}
                </dt>
                <dd className="text-[color:var(--text-primary)]">
                  {variantDescriptions[v] || <span className="text-[color:var(--text-tertiary)] italic">{t('slots.noDescription')}</span>}
                </dd>
              </div>
            ))}
          </dl>
          {defaultVariant && (
            <p className="text-[11px] text-[color:var(--text-tertiary)] mt-1.5 italic">
              {t('slots.defaultVariant')}
            </p>
          )}
        </div>
      )}

      {/* 关键 slot */}
      {keySlots && keySlots.length > 0 && (
        <div className="mb-4">
          <div className="text-[11px] font-mono uppercase tracking-[0.08em] text-[color:var(--text-tertiary)] mb-1.5">
            key slots
          </div>
          <div className="flex flex-wrap gap-1.5">
            {keySlots.map((s) => (
              <code
                key={s}
                className="font-mono text-[12px] px-2 py-0.5 rounded bg-[color:var(--surface-hover)] text-[color:var(--foreground)]"
              >
                {s}
              </code>
            ))}
          </div>
        </div>
      )}

      {/* 何时用 / 何时别用 */}
      {(whenToUse || whenNot) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {whenToUse && whenToUse.length > 0 && (
            <div className="rounded-md border border-[color:var(--border)] p-3" style={{ borderLeftWidth: '2.5px', borderLeftColor: 'var(--color-olive, #788C5D)' }}>
              <div className="text-[11px] font-mono uppercase tracking-[0.08em] text-[color:var(--color-olive, #788C5D)] mb-1.5">
                {t('slots.whenToUse')}
              </div>
              <ul className="text-[13px] text-[color:var(--text-primary)] leading-relaxed space-y-1 m-0 pl-4 list-disc">
                {whenToUse.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          {whenNot && whenNot.length > 0 && (
            <div className="rounded-md border border-[color:var(--border)] p-3" style={{ borderLeftWidth: '2.5px', borderLeftColor: 'var(--color-clay-strong, #B04A3F)' }}>
              <div className="text-[11px] font-mono uppercase tracking-[0.08em] text-[color:var(--color-clay-strong, #B04A3F)] mb-1.5">
                {t('slots.whenNot')}
              </div>
              <ul className="text-[13px] text-[color:var(--text-primary)] leading-relaxed space-y-1 m-0 pl-4 list-disc">
                {whenNot.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

// ===================================================================

function PreviewIframe({
  componentId,
  variant,
  sampleMd,
}: {
  componentId: string;
  variant: string;
  sampleMd: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number>(180);

  const html = useMemo(() => {
    // sample 原文里可能包含多个变体 + `---` 分隔；只截取当前 variant 的片段
    const chunk = pickVariantChunk(sampleMd, componentId, variant);
    // 组合最小合法 forge 文档：@compose + 该组件片段
    const md = `<!-- @page narrow -->
<!-- @compose: ${componentId} -->
<!-- @theme editorial -->

${chunk}
`;
    const { html: rendered } = renderWithFallback(md, '', {}, undefined, undefined, 'preview');
    return rendered;
  }, [componentId, variant, sampleMd]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const onLoad = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        // 取实际渲染高度，自动撑开
        const h = Math.max(140, Math.min(800, doc.documentElement.scrollHeight + 20));
        setHeight(h);
      } catch { /* cross-origin */ }
    };
    iframe.addEventListener('load', onLoad);
    iframe.srcdoc = html;
    return () => iframe.removeEventListener('load', onLoad);
  }, [html]);

  return (
    <div className="rounded-md border border-[color:var(--border)] overflow-hidden bg-[color:var(--ivory,#FAF9F5)]">
      <iframe
        ref={iframeRef}
        sandbox="allow-scripts allow-same-origin"
        title={`${componentId} · ${variant} preview`}
        style={{ width: '100%', border: 'none', height, background: 'var(--ivory,#FAF9F5)' }}
      />
    </div>
  );
}

/**
 * sample 原文通常长这样（以 `---` 分隔多个变体片段）：
 *
 *   ```markdown
 *   <!-- @use card variant=standard -->
 *   ...
 *
 *   ---
 *
 *   <!-- @use card variant=stat -->
 *   ...
 *   ```
 *
 * 挑当前 variant 的片段。如果找不到匹配，回退取第一个 `@use <id>` 开头的片段。
 */
function pickVariantChunk(sampleMd: string, componentId: string, variant: string): string {
  if (!sampleMd) return '';
  // 按 `---` 切段
  const chunks = sampleMd.split(/^---\s*$/m).map((c) => c.trim()).filter(Boolean);
  const matchingUse = (chunk: string, v?: string) => {
    const re = v
      ? new RegExp(`<!--\\s*@use\\s+${escapeRe(componentId)}[^>]*variant\\s*=\\s*(?:"|')?${escapeRe(v)}(?:"|')?[^>]*-->`)
      : new RegExp(`<!--\\s*@use\\s+${escapeRe(componentId)}\\b`);
    return re.test(chunk);
  };
  // 1. 精确匹配 variant
  for (const c of chunks) {
    if (matchingUse(c, variant)) return c;
  }
  // 2. 没匹配 → 匹配 component id
  for (const c of chunks) {
    if (matchingUse(c)) return c;
  }
  // 3. 兜底：整段
  return sampleMd;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
