'use client';

import { useMemo, useState } from 'react';
import { FileTextIcon, CheckIcon } from 'lucide-react';

import { PRESETS, type PresetTemplate } from '@/templates/presets/registry';
import { Popover, PanelSection, PanelFooter, SearchInput } from '@/components/ui';

export interface TemplatePickerProps {
  onSelect: (preset: PresetTemplate) => void;
  selectedId?: string | null;
  children: (props: { open: () => void }) => React.ReactNode;
}

const GROUP_LABEL: Record<string, string> = {
  research:      '研究 / 讲解',
  report:        '报告',
  'code-review': '代码评审',
  plan:          '规划',
  playground:    '其他',
};

export function TemplatePicker({ onSelect, selectedId, children }: TemplatePickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return PRESETS;
    return PRESETS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q),
    );
  }, [search]);

  const grouped = useMemo(() => {
    const map = new Map<string, PresetTemplate[]>();
    for (const p of filtered) {
      const arr = map.get(p.group) ?? [];
      arr.push(p);
      map.set(p.group, arr);
    }
    return map;
  }, [filtered]);

  const handleSelect = (preset: PresetTemplate) => {
    onSelect(preset);
    setOpen(false);
  };

  return (
    <>
      {children({ open: () => setOpen(true) })}

      <Popover open={open} onClose={() => setOpen(false)} anchor="top-center" width={460}>
        <div className="px-3 py-2.5 border-b border-[color:var(--border-subtle)]">
          <SearchInput value={search} onChange={setSearch} placeholder="搜索模板…" autoFocus />
        </div>

        <div className="max-h-[440px] overflow-y-auto py-2">
          {filtered.length === 0 && (
            <div className="flex items-center justify-center py-12 text-sm text-[color:var(--text-tertiary)]">
              没有匹配的模板
            </div>
          )}

          {[...grouped.entries()].map(([group, items]) => (
            <PanelSection key={group} title={GROUP_LABEL[group] ?? group}>
              {items.map((preset) => {
                const isSelected = selectedId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelect(preset)}
                    className={`group flex items-start gap-3 w-full px-4 py-2.5 text-left transition-colors hover:bg-[color:var(--surface-hover)] ${
                      isSelected ? 'bg-[color:var(--accent-soft)]' : ''
                    }`}
                  >
                    <div className="shrink-0 w-9 h-9 rounded-md bg-[color:var(--surface-sunken)] flex items-center justify-center text-[18px] group-hover:bg-[color:var(--surface)]">
                      {preset.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-medium truncate ${isSelected ? 'text-[color:var(--accent-strong)]' : 'text-[color:var(--text-primary)]'}`}>
                          {preset.name}
                        </span>
                        {preset.id.startsWith('compose-') && (
                          <span className="shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded bg-[color:var(--color-clay-50)] text-[color:var(--color-clay-600)] uppercase tracking-wider">
                            compose
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[color:var(--text-tertiary)] mt-0.5 line-clamp-2">
                        {preset.description}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckIcon className="shrink-0 h-4 w-4 text-[color:var(--accent)] mt-1" />
                    )}
                  </button>
                );
              })}
            </PanelSection>
          ))}
        </div>

        <PanelFooter>
          <FileTextIcon className="h-3 w-3 text-[color:var(--text-tertiary)]" />
          <span>
            所有模板都支持 <code className="font-mono text-[color:var(--accent)]">@compose: a, b, c</code> 自由组合组件
          </span>
        </PanelFooter>
      </Popover>
    </>
  );
}
