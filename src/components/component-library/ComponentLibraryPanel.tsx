'use client';

/**
 * 组件库抽屉
 */

import { useMemo, useState } from 'react';
import { XIcon, PlusIcon, CheckIcon } from 'lucide-react';

import { BUILTIN_COMPONENTS, groupBuiltinByCategory } from '@/builtin/components';
import type { ComponentDef, ComponentCategory } from '@/builtin/types';
import { parseComposeDirective } from '@/builtin/renderer';
import { generateStarterMarkdown } from '@/builtin/templates/starter';
import { Drawer, SearchInput, Button } from '@/components/ui';
import { useI18n } from '@/lib/i18n';

const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  header:  'Header',
  summary: 'Summary',
  content: 'Content',
  card:    'Card',
  list:    'List',
  visual:  'Visual',
  data:    'Data',
  layout:  'Layout',
  footer:  'Footer',
  special: 'Special',
};

export interface ComponentLibraryPanelProps {
  markdown: string;
  onInsert: (newMarkdown: string) => void;
  onClose: () => void;
}

export function ComponentLibraryPanel({ markdown, onInsert, onClose }: ComponentLibraryPanelProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const groups = useMemo(() => groupBuiltinByCategory(), []);

  const activeIds = useMemo(() => {
    return new Set(parseComposeDirective(markdown) ?? []);
  }, [markdown]);

  const filteredGroups = useMemo(() => {
    if (!query.trim()) return groups;
    const q = query.trim().toLowerCase();
    const result: Record<string, ComponentDef[]> = {};
    for (const [cat, comps] of Object.entries(groups)) {
      const matched = comps.filter(c =>
        c.id.includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.tags?.some(t => t.includes(q)),
      );
      if (matched.length) result[cat] = matched;
    }
    return result;
  }, [groups, query]);

  const handleInsert = (comp: ComponentDef) => {
    onInsert(insertComponent(markdown, comp));
  };

  const totalCount = Object.values(filteredGroups).reduce((s, a) => s + a.length, 0);

  return (
    <Drawer open={true} onClose={onClose} width={440}>
      {/* Header */}
      <div className="flex items-center justify-between h-[var(--header-height)] px-4 border-b border-[color:var(--border-subtle)] shrink-0">
        <div>
          <h2 className="font-serif text-[16px] font-medium text-[color:var(--text-primary)] leading-tight">
            {t('compLib.title')}
          </h2>
          <p className="text-[11px] font-mono text-[color:var(--text-tertiary)] mt-0.5">
            {BUILTIN_COMPONENTS.length} · built-in / 120+ planned
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-7 w-7 rounded-md hover:bg-[color:var(--surface-hover)] text-[color:var(--text-secondary)] flex items-center justify-center"
          aria-label={t('compLib.close')}
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3 shrink-0 border-b border-[color:var(--border-subtle)]">
        <SearchInput value={query} onChange={setQuery} placeholder={t('compLib.searchPlaceholder')} autoFocus />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="text-sm text-[color:var(--text-tertiary)]">{t('compLib.noMatch')}</div>
          </div>
        ) : (
          Object.entries(filteredGroups).map(([cat, comps]) => (
            <section key={cat}>
              <div className="sticky top-0 z-10 bg-[color:var(--surface)] px-4 py-2 border-b border-[color:var(--border-subtle)] flex items-baseline gap-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-[color:var(--text-tertiary)]">
                  {CATEGORY_LABELS[cat as ComponentCategory] ?? cat}
                </span>
                <span className="text-[10px] text-[color:var(--text-quaternary)]">
                  {comps.length}
                </span>
              </div>
              <ul className="divide-y divide-[color:var(--border-subtle)]">
                {comps.map(comp => {
                  const inUse = activeIds.has(comp.id);
                  return (
                    <li
                      key={comp.id}
                      className={`group px-4 py-3 hover:bg-[color:var(--surface-hover)] transition-colors ${
                        inUse ? 'bg-[color:var(--accent-soft)]/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-[color:var(--text-primary)]">
                              {comp.name}
                            </span>
                            <code className="text-[10px] font-mono text-[color:var(--text-tertiary)]">
                              {comp.id}
                            </code>
                            {inUse && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]">
                                <CheckIcon className="h-2.5 w-2.5" />
                                {t('compLib.inUse')}
                              </span>
                            )}
                          </div>
                          {comp.description && (
                            <p className="text-xs text-[color:var(--text-tertiary)] mt-1 leading-relaxed line-clamp-2">
                              {comp.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Object.keys(comp.slots).slice(0, 5).map(s => (
                              <code
                                key={s}
                                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[color:var(--surface-sunken)] text-[color:var(--text-tertiary)] border border-[color:var(--border-subtle)]"
                              >
                                {s}
                              </code>
                            ))}
                            {Object.keys(comp.slots).length > 5 && (
                              <span className="text-[10px] text-[color:var(--text-quaternary)] self-center">
                                +{Object.keys(comp.slots).length - 5}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant={inUse ? 'outline' : 'solid'}
                          size="xs"
                          icon={<PlusIcon />}
                          onClick={() => handleInsert(comp)}
                        >
                          {inUse ? 'Slot' : t('compLib.insert')}
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-[color:var(--border-subtle)] bg-[color:var(--surface-sunken)] text-[11px] text-[color:var(--text-tertiary)] shrink-0">
        {t('compLib.footer').split('@compose')[0]}<code className="font-mono text-[color:var(--accent)]">@compose</code>{t('compLib.footer').split('@compose')[1]}
      </div>
    </Drawer>
  );
}

// ============================================================
// 插入逻辑：智能追加
// ============================================================

function insertComponent(md: string, comp: ComponentDef): string {
  const composeMatch = md.match(/<!--\s*@compose\s*:?\s*([\w,\s-]+)\s*-->/);

  const fragment = generateStarterMarkdown([comp.id], '', BUILTIN_COMPONENTS, 'sample');
  const fragmentBody = fragment
    .replace(/^<!-- @compose[\s\S]*?\n\n/, '')
    .replace(/^<!--[^\n]*-->\n/, '')
    .replace(/^<!--[^\n]*-->\n/, '')
    .replace(/^<!--[^\n]*-->\n/, '')
    .trim();

  let newMd: string;
  if (composeMatch) {
    const existingIds = composeMatch[1]!.split(',').map(s => s.trim()).filter(Boolean);
    if (!existingIds.includes(comp.id)) {
      const footerIdx = existingIds.indexOf('footer');
      if (footerIdx >= 0) existingIds.splice(footerIdx, 0, comp.id);
      else existingIds.push(comp.id);
      const newDirective = `<!-- @compose: ${existingIds.join(', ')} -->`;
      newMd = md.replace(composeMatch[0], newDirective);
    } else {
      newMd = md;
    }
  } else {
    newMd = `<!-- @compose: ${comp.id} -->\n\n${md}`;
  }

  return newMd.trimEnd() + '\n\n' + fragmentBody + '\n';
}
