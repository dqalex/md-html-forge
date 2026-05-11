'use client';

import { useMemo, useRef, useState } from 'react';
import {
  CheckIcon, FileTextIcon,
  FileIcon, BarChart3Icon, FlameIcon, ClipboardListIcon,
  GitPullRequestIcon, BookOpenIcon, LineChartIcon, ScaleIcon,
  LayoutTemplateIcon, UserIcon,
  UploadIcon, DownloadIcon, TrashIcon,
} from 'lucide-react';

import { PRESETS, type PresetTemplate } from '@/templates/presets/registry';
import { Popover, PanelSection, PanelFooter, SearchInput } from '@/components/ui';
import {
  type UserTemplate,
  downloadTemplateMd,
  readTemplateFile,
  upsertUserTemplate,
  removeUserTemplate,
} from './userTemplates';
import { useI18n } from '@/lib/i18n';

export interface TemplatePickerProps {
  onSelect: (preset: PresetTemplate) => void;
  selectedId?: string | null;
  userTemplates?: UserTemplate[];
  onSelectUserTemplate?: (tpl: UserTemplate) => void;
  onUserTemplatesChanged?: () => void;
  children: (props: { open: () => void }) => React.ReactNode;
}

const GROUP_ORDER: string[] = ['report', 'plan', 'research', 'code-review', 'playground'];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText: FileTextIcon,
  File: FileIcon,
  BarChart3: BarChart3Icon,
  Flame: FlameIcon,
  ClipboardList: ClipboardListIcon,
  GitPullRequest: GitPullRequestIcon,
  BookOpen: BookOpenIcon,
  LineChart: LineChartIcon,
  Scale: ScaleIcon,
  LayoutTemplate: LayoutTemplateIcon,
  User: UserIcon,
};

function resolveIcon(name: string | undefined): React.ComponentType<{ className?: string }> {
  if (!name) return LayoutTemplateIcon;
  return ICON_MAP[name] ?? LayoutTemplateIcon;
}

export function TemplatePicker({
  onSelect, selectedId, userTemplates, onSelectUserTemplate, onUserTemplatesChanged, children,
}: TemplatePickerProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredPresets = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return PRESETS;
    return PRESETS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q),
    );
  }, [search]);

  const filteredUser = useMemo(() => {
    if (!userTemplates) return [];
    const q = search.trim().toLowerCase();
    if (!q) return userTemplates;
    return userTemplates.filter(
      (tpl) =>
        tpl.name.toLowerCase().includes(q) ||
        (tpl.description?.toLowerCase().includes(q) ?? false),
    );
  }, [search, userTemplates]);

  const grouped = useMemo(() => {
    const map = new Map<string, PresetTemplate[]>();
    for (const p of filteredPresets) {
      const arr = map.get(p.group) ?? [];
      arr.push(p);
      map.set(p.group, arr);
    }
    const ordered = new Map<string, PresetTemplate[]>();
    for (const g of GROUP_ORDER) {
      if (map.has(g)) ordered.set(g, map.get(g)!);
    }
    for (const [g, v] of map) if (!ordered.has(g)) ordered.set(g, v);
    return ordered;
  }, [filteredPresets]);

  const handleSelect = (preset: PresetTemplate) => {
    onSelect(preset);
    setOpen(false);
  };

  const handleUserSelect = (tpl: UserTemplate) => {
    onSelectUserTemplate?.(tpl);
    setOpen(false);
  };

  const handleDeleteUser = (e: React.MouseEvent, tpl: UserTemplate) => {
    e.stopPropagation();
    if (!window.confirm(`${t('template.user.delete')} 「${tpl.name}」？`)) return;
    removeUserTemplate(tpl.id);
    onUserTemplatesChanged?.();
  };

  const handleExportUser = (e: React.MouseEvent, tpl: UserTemplate) => {
    e.stopPropagation();
    downloadTemplateMd(tpl);
  };

  const handleImportFile = async (file: File) => {
    setImportError(null);
    try {
      const tpl = await readTemplateFile(file);
      upsertUserTemplate(tpl);
      onUserTemplatesChanged?.();
    } catch (e) {
      setImportError(`Import failed: ${(e as Error).message}`);
    }
  };

  return (
    <>
      {children({ open: () => setOpen(true) })}

      <Popover open={open} onClose={() => setOpen(false)} anchor="top-center" width={480}>
        {/* 搜索 + 导入 */}
        <div className="px-3 py-2.5 border-b border-[color:var(--border-subtle)] flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={`${t('header.selectTemplate')}…`}
              autoFocus
            />
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 h-8 px-2.5 inline-flex items-center gap-1 text-[11.5px] rounded-md border border-[color:var(--border)] text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-hover)] transition-colors"
          >
            <UploadIcon className="w-3.5 h-3.5" />
            {t('template.importMd')}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,text/markdown"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImportFile(f);
              e.target.value = '';
            }}
          />
        </div>

        {importError && (
          <div
            className="px-4 py-2 text-[11px] border-b border-[color:var(--border-subtle)]"
            style={{ background: 'rgba(176, 74, 63, 0.08)', color: '#B04A3F' }}
          >
            {importError}
            <button className="ml-2 underline underline-offset-2" onClick={() => setImportError(null)}>×</button>
          </div>
        )}

        <div className="max-h-[480px] overflow-y-auto py-2">
          {filteredPresets.length === 0 && filteredUser.length === 0 && (
            <div className="flex items-center justify-center py-12 text-sm text-[color:var(--text-tertiary)]">
              No matching templates
            </div>
          )}

          {/* 用户自定义模板 */}
          {filteredUser.length > 0 && (
            <PanelSection title={t('template.user.title')}>
              {filteredUser.map((tpl) => {
                const isSelected = selectedId === tpl.id;
                const Icon = resolveIcon(tpl.icon ?? 'User');
                return (
                  <div
                    key={tpl.id}
                    className={`group relative flex items-start gap-3 w-full px-4 py-2.5 transition-colors hover:bg-[color:var(--surface-hover)] ${
                      isSelected ? 'bg-[color:var(--accent-soft)]' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleUserSelect(tpl)}
                      className="flex-1 min-w-0 flex items-start gap-3 text-left"
                    >
                      <div
                        className="shrink-0 w-9 h-9 rounded-md flex items-center justify-center"
                        style={{ background: tpl.color ?? 'var(--surface-sunken)', border: '1px solid var(--border-subtle)' }}
                      >
                        <Icon className="w-4 h-4 text-[color:var(--text-primary)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-medium truncate block ${isSelected ? 'text-[color:var(--accent-strong)]' : 'text-[color:var(--text-primary)]'}`}>
                          {tpl.name}
                        </span>
                        {tpl.description && (
                          <div className="text-xs text-[color:var(--text-tertiary)] mt-0.5 line-clamp-2">{tpl.description}</div>
                        )}
                      </div>
                    </button>
                    <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 self-center">
                      <button type="button" onClick={(e) => handleExportUser(e, tpl)} title={t('template.user.export')}
                        className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-[color:var(--surface)] text-[color:var(--text-tertiary)] hover:text-[color:var(--text-primary)]">
                        <DownloadIcon className="w-3 h-3" />
                      </button>
                      <button type="button" onClick={(e) => handleDeleteUser(e, tpl)} title={t('template.user.delete')}
                        className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-[color:var(--surface)] text-[color:var(--text-tertiary)] hover:text-[color:#B04A3F]">
                        <TrashIcon className="w-3 h-3" />
                      </button>
                    </div>
                    {isSelected && <CheckIcon className="shrink-0 h-4 w-4 text-[color:var(--accent)] mt-1" />}
                  </div>
                );
              })}
            </PanelSection>
          )}

          {/* 内置模板 */}
          {[...grouped.entries()].map(([group, items]) => (
            <PanelSection key={group} title={t(`template.groups.${group}` as Parameters<typeof t>[0])}>
              {items.map((preset) => {
                const isSelected = selectedId === preset.id;
                const Icon = resolveIcon(preset.templateDef.icon);
                const color = preset.templateDef.color ?? 'var(--surface-sunken)';
                return (
                  <button key={preset.id} type="button" onClick={() => handleSelect(preset)}
                    className={`group flex items-start gap-3 w-full px-4 py-2.5 text-left transition-colors hover:bg-[color:var(--surface-hover)] ${
                      isSelected ? 'bg-[color:var(--accent-soft)]' : ''
                    }`}
                  >
                    <div className="shrink-0 w-9 h-9 rounded-md flex items-center justify-center"
                      style={{ background: color, border: '1px solid var(--border-subtle)' }}>
                      <Icon className="w-4 h-4 text-[color:var(--text-primary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-medium truncate block ${isSelected ? 'text-[color:var(--accent-strong)]' : 'text-[color:var(--text-primary)]'}`}>
                        {preset.name}
                      </span>
                      <div className="text-xs text-[color:var(--text-tertiary)] mt-0.5 line-clamp-2">{preset.description}</div>
                    </div>
                    {isSelected && <CheckIcon className="shrink-0 h-4 w-4 text-[color:var(--accent)] mt-1" />}
                  </button>
                );
              })}
            </PanelSection>
          ))}
        </div>

        <PanelFooter>
          <FileTextIcon className="h-3 w-3 text-[color:var(--text-tertiary)]" />
          <span>{t('template.footer')}</span>
        </PanelFooter>
      </Popover>
    </>
  );
}
