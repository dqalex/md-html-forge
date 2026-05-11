'use client';

/**
 * SaveTemplateDialog —— 把当前 MD 存为用户模板
 *
 * Q1 决策：保存 = 完整 MD 快照（含 @compose / @slot 内容 / @theme / @page 指令）
 *   → 用户可以把调好的文档当作下次起点
 */

import { useMemo, useState } from 'react';
import {
  XIcon, CheckIcon, SaveIcon,
  FileTextIcon, BarChart3Icon, FlameIcon, ClipboardListIcon,
  GitPullRequestIcon, BookOpenIcon, LineChartIcon, ScaleIcon,
  UserIcon, SparklesIcon, NewspaperIcon, BriefcaseIcon,
} from 'lucide-react';

import { Button } from '@/components/ui';
import { useI18n } from '@/lib/i18n';

// 可选图标（与 TemplatePicker 的 ICON_MAP 对齐）
const ICON_CHOICES: Array<{ name: string; icon: React.ComponentType<{ className?: string }> }> = [
  { name: 'User',            icon: UserIcon },
  { name: 'FileText',        icon: FileTextIcon },
  { name: 'BarChart3',       icon: BarChart3Icon },
  { name: 'Flame',           icon: FlameIcon },
  { name: 'ClipboardList',   icon: ClipboardListIcon },
  { name: 'GitPullRequest',  icon: GitPullRequestIcon },
  { name: 'BookOpen',        icon: BookOpenIcon },
  { name: 'LineChart',       icon: LineChartIcon },
  { name: 'Scale',           icon: ScaleIcon },
  { name: 'Sparkles',        icon: SparklesIcon },
  { name: 'Newspaper',       icon: NewspaperIcon },
  { name: 'Briefcase',       icon: BriefcaseIcon },
];

const COLOR_CHOICES: string[] = [
  'var(--accent-soft)',
  '#FED7AA',   // 橙
  '#FEF3C7',   // 黄
  '#D1FAE5',   // 绿
  '#DBEAFE',   // 蓝
  '#E0E7FF',   // 靛
  '#F3E8FF',   // 紫
  '#FCE7F3',   // 粉
  'var(--color-ivory-300)',
  'var(--color-ivory-200)',
];

export interface SaveTemplateDialogProps {
  /** 当前 MD 快照（保存的内容） */
  markdown: string;
  onCancel: () => void;
  onConfirm: (args: { name: string; description: string; icon: string; color: string }) => void;
}

export function SaveTemplateDialog({ markdown, onCancel, onConfirm }: SaveTemplateDialogProps) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState<string>('User');
  const [color, setColor] = useState<string>(COLOR_CHOICES[0]!);

  const defaultName = useMemo(() => {
    const date = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    return `${t('saveDialog.defaultNamePrefix')} · ${date}`;
  }, []);

  const trimmed = name.trim() || defaultName;
  const canSubmit = trimmed.length > 0;

  // 统计当前 MD 有哪些 @compose 组件 + @slot 填充数
  const stats = useMemo(() => {
    const composeMatch = markdown.match(/<!--\s*@compose\s*:?\s*([^-]+?)\s*-->/);
    const compose = composeMatch
      ? composeMatch[1]!.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    const slotMatches = markdown.match(/<!--\s*@slot:\w+\s*-->/g) ?? [];
    // 去重
    const slots = new Set(slotMatches.map(m => m.match(/@slot:(\w+)/)?.[1] ?? ''));
    return { componentCount: compose.length, slotCount: slots.size, bytes: markdown.length };
  }, [markdown]);

  const Icon = (ICON_CHOICES.find(c => c.name === icon) ?? ICON_CHOICES[0]!).icon;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-sm animate-fade-in"
      style={{ background: 'rgba(26, 25, 21, 0.55)' }}
      onClick={onCancel}
    >
      <div
        className="rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)] w-[520px] max-w-[92vw] overflow-hidden flex flex-col"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <header
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div>
            <h3
              className="text-[15px] font-semibold"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}
            >
              {t('saveDialog.title')}
            </h3>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
              {t('saveDialog.desc')}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 inline-flex items-center justify-center rounded-md transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <XIcon className="w-4 h-4" />
          </button>
        </header>

        <div className="px-5 py-4 space-y-4">
          {/* 快照统计 */}
          <div
            className="rounded-[var(--radius-md)] px-3.5 py-2.5 flex items-center gap-4"
            style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border-subtle)' }}
          >
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
              style={{
                background: color,
                border: '1px solid var(--border-subtle)',
              }}
            >
              <Icon className="w-4 h-4 text-[color:var(--text-primary)]" />
            </div>
            <div className="flex-1 min-w-0 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
              <div className="flex items-center gap-3">
                <span><strong style={{ color: 'var(--text-secondary)' }}>{stats.componentCount}</strong> {t('saveDialog.components')}</span>
                <span>·</span>
                <span><strong style={{ color: 'var(--text-secondary)' }}>{stats.slotCount}</strong> {t('saveDialog.slots')}</span>
                <span>·</span>
                <span><strong style={{ color: 'var(--text-secondary)' }}>{(stats.bytes / 1024).toFixed(1)}</strong> KB</span>
              </div>
            </div>
          </div>

          {/* 名称 */}
          <div>
            <label className="block text-[11px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              {t('saveDialog.nameLabel')}
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={defaultName}
              maxLength={48}
              className="w-full h-9 px-3 rounded-[var(--radius-sm)] text-[13px] outline-none transition-colors"
              style={{
                background: 'var(--surface-sunken)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-[11px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              {t('saveDialog.description')} <span style={{ color: 'var(--text-quaternary)' }}>{t('saveDialog.descriptionOptional')}</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('saveDialog.descriptionPlaceholder')}
              maxLength={200}
              rows={2}
              className="w-full px-3 py-2 rounded-[var(--radius-sm)] text-[12px] outline-none transition-colors resize-none"
              style={{
                background: 'var(--surface-sunken)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
          </div>

          {/* 图标选择 */}
          <div>
            <label className="block text-[11px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              {t('saveDialog.icon')}
            </label>
            <div className="flex flex-wrap gap-1">
              {ICON_CHOICES.map(({ name: iconName, icon: IconC }) => {
                const active = iconName === icon;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className="w-8 h-8 rounded-md flex items-center justify-center transition-all"
                    style={{
                      background: active ? 'var(--accent)' : 'transparent',
                      border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                      color: active ? 'var(--accent-foreground)' : 'var(--text-secondary)',
                    }}
                  >
                    <IconC className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 颜色选择 */}
          <div>
            <label className="block text-[11px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              {t('saveDialog.badgeColor')}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COLOR_CHOICES.map(c => {
                const active = c === color;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-7 h-7 rounded-md relative transition-transform hover:scale-110"
                    style={{
                      background: c,
                      border: active ? '2px solid var(--text-primary)' : '1px solid var(--border)',
                    }}
                  >
                    {active && (
                      <CheckIcon
                        className="w-3.5 h-3.5 absolute inset-0 m-auto"
                        style={{ color: 'var(--text-primary)', strokeWidth: 3 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <footer
          className="px-5 py-3 flex items-center justify-end gap-2"
          style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-sunken)' }}
        >
          <Button variant="outline" size="md" onClick={onCancel}>{t('save.cancel')}</Button>
          <Button
            variant="solid"
            size="md"
            icon={<SaveIcon />}
            disabled={!canSubmit}
            onClick={() => onConfirm({ name: trimmed, description, icon, color })}
          >
            {t('saveDialog.confirmSave')}
          </Button>
        </footer>
      </div>
    </div>
  );
}
