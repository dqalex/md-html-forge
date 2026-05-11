'use client';

/**
 * AppHeader · 顶部导航
 *
 * 左侧：logo + 模板选择器
 * 右侧：语法文档 / 语言切换 / Inspiration
 */

import {
  BookOpenIcon, ChevronDownIcon,
  LayoutTemplateIcon,
  FileIcon, FileTextIcon, BarChart3Icon, FlameIcon, ClipboardListIcon,
  GitPullRequestIcon, LineChartIcon, ScaleIcon, UserIcon,
  LanguagesIcon,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { ForgeLogo } from '@/components/brand/ForgeLogo';
import { TemplatePicker } from '@/components/markdown-editor/TemplatePicker';
import type { PresetTemplate } from '@/templates/presets/registry';
import type { UserTemplate } from '@/components/markdown-editor/userTemplates';
import { useI18n } from '@/lib/i18n';

const HEADER_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText: FileTextIcon,
  File: FileIcon,
  BarChart3: BarChart3Icon,
  Flame: FlameIcon,
  ClipboardList: ClipboardListIcon,
  GitPullRequest: GitPullRequestIcon,
  BookOpen: BookOpenIcon,
  LineChart: LineChartIcon,
  Scale: ScaleIcon,
  User: UserIcon,
  LayoutTemplate: LayoutTemplateIcon,
};

export interface AppHeaderProps {
  selectedPreset: PresetTemplate | null;
  onSelectPreset: (p: PresetTemplate) => void;
  userTemplates?: UserTemplate[];
  onSelectUserTemplate?: (tpl: UserTemplate) => void;
  onUserTemplatesChanged?: () => void;
  selectedUserTemplate?: UserTemplate | null;
}

export function AppHeader({
  selectedPreset, onSelectPreset,
  userTemplates, onSelectUserTemplate, onUserTemplatesChanged, selectedUserTemplate,
}: AppHeaderProps) {
  const { t, lang, setLang } = useI18n();

  const active = selectedUserTemplate
    ? {
        name: selectedUserTemplate.name,
        iconName: selectedUserTemplate.icon ?? 'User',
        color: selectedUserTemplate.color ?? 'var(--surface-sunken)',
        id: selectedUserTemplate.id,
      }
    : selectedPreset
      ? {
          name: selectedPreset.name.split('·')[0]?.trim() ?? selectedPreset.name,
          iconName: selectedPreset.templateDef.icon ?? 'LayoutTemplate',
          color: selectedPreset.templateDef.color ?? 'var(--surface-sunken)',
          id: selectedPreset.id,
        }
      : null;

  const ActiveIcon = active
    ? (HEADER_ICON_MAP[active.iconName] ?? LayoutTemplateIcon)
    : LayoutTemplateIcon;

  const handleLangToggle = () => {
    setLang(lang === 'zh' ? 'en' : 'zh');
  };

  return (
    <header
      className="flex items-center justify-between px-5 shrink-0 bg-[color:var(--surface)] border-b border-[color:var(--border)]"
      style={{ height: 'var(--header-height)' }}
    >
      {/* 左：品牌 + 模板选择 */}
      <div className="flex items-center gap-3">
        <a
          href="/"
          className="flex items-center gap-2.5 group"
          aria-label="md-html-forge · home"
        >
          <ForgeLogo size={28} className="shrink-0 transition-transform group-hover:scale-[1.04]" />
          <div className="leading-tight">
            <h1 className="font-serif text-[17px] font-medium text-[color:var(--text-primary)] tracking-tight">
              forge
            </h1>
            <p className="text-[10px] text-[color:var(--text-tertiary)] font-mono tracking-wide uppercase">
              Markdown → HTML
            </p>
          </div>
        </a>

        <span className="w-px h-6 bg-[color:var(--border)] mx-1" />

        {/* 模板切换 */}
        <TemplatePicker
          onSelect={onSelectPreset}
          selectedId={active?.id ?? null}
          userTemplates={userTemplates}
          onSelectUserTemplate={onSelectUserTemplate}
          onUserTemplatesChanged={onUserTemplatesChanged}
        >
          {({ open }) => (
            <Button variant="subtle" size="sm" onClick={open} iconRight={<ChevronDownIcon />}>
              {active ? (
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-flex items-center justify-center w-4 h-4 rounded shrink-0"
                    style={{
                      background: active.color,
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <ActiveIcon className="w-2.5 h-2.5 text-[color:var(--text-primary)]" />
                  </span>
                  <span>{active.name}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[color:var(--text-tertiary)]">
                  <LayoutTemplateIcon className="w-3.5 h-3.5" />
                  {t('header.selectTemplate')}
                </span>
              )}
            </Button>
          )}
        </TemplatePicker>
      </div>

      {/* 右：语法 / 语言切换 / Inspiration */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          icon={<BookOpenIcon />}
          onClick={() => window.open('/docs/syntax', '_self')}
        >
          {t('header.syntax')}
        </Button>

        {/* 语言切换按钮 */}
        <Button
          variant="ghost"
          size="sm"
          icon={<LanguagesIcon />}
          onClick={handleLangToggle}
          title={t('header.lang.tooltip')}
        >
          {t('header.lang.switch')}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open('https://github.com/dqalex/md-html-forge', '_blank')}
        >
          GitHub
        </Button>
      </div>
    </header>
  );
}
