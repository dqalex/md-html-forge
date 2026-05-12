'use client';

/**
 * BrandPackPanel —— 品牌包管理（v2）
 *
 * 一句话定位：把你做好的「自定义主题 + AI 组件 + 默认偏好」打包成一个可分发的"渲染配方"，
 * 团队成员一键 import 就能复用，不用每个人重新调主题。
 *
 * v2 改进（vs v1）：
 *  - 顶部状态条：实时告诉用户"你现在有 N 主题 / M 组件可打包"
 *  - 空状态重写：图文讲清楚"是什么 / 为什么 / 怎么开始"
 *  - 创建流程：内嵌对话框（取代 window.prompt），含内容预览 + 命名 + 描述
 *  - 删除确认：内嵌对话框（取代 window.confirm）
 *  - 列表项可展开看具体内容
 *  - 视觉对齐项目设计语言（CSS 变量 + Button 原语 + 一致的留白）
 */

import { useEffect, useMemo, useState } from 'react';
import {
  XIcon,
  DownloadIcon,
  UploadIcon,
  PackagePlusIcon,
  TrashIcon,
  CheckIcon,
  PaletteIcon,
  WandSparklesIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PackageIcon,
  InfoIcon,
  AlertCircleIcon,
} from 'lucide-react';

import { Button } from '@/components/ui';
import { useI18n } from '@/lib/i18n';
import {
  type BrandPack,
  loadBrandPacks,
  upsertBrandPack,
  removeBrandPack,
  loadActiveBrandPackId,
  saveActiveBrandPackId,
  applyBrandPack,
  downloadBrandPackJson,
  readBrandPackFile,
  createEmptyBrandPack,
} from './brandpack';
import { loadCustomThemes } from './ThemeEditorModal';
import { loadUserComponents } from './userComponents';

export interface BrandPackPanelProps {
  onClose: () => void;
  onApplied?: () => void;
  /** 关闭面板并打开主题编辑器（创建自定义主题）*/
  onRequestCreateTheme?: () => void;
  /** 关闭面板并打开 AI 造组件 */
  onRequestCreateComponent?: () => void;
}

export function BrandPackPanel({
  onClose, onApplied, onRequestCreateTheme, onRequestCreateComponent,
}: BrandPackPanelProps) {
  const { t } = useI18n();
  const [packs, setPacks] = useState<BrandPack[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 二级对话框
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BrandPack | null>(null);

  // 当前可打包的资源（实时读 localStorage）
  const [available, setAvailable] = useState<{
    themes: ReturnType<typeof loadCustomThemes>;
    components: ReturnType<typeof loadUserComponents>;
  }>({ themes: [], components: [] });

  const refresh = () => {
    setPacks(loadBrandPacks());
    setActiveId(loadActiveBrandPackId());
    setAvailable({
      themes: loadCustomThemes(),
      components: loadUserComponents(),
    });
  };

  useEffect(() => {
    refresh();
  }, []);

  // ESC 关闭最外层弹窗（如果没有二级对话框打开）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (createDialogOpen) { setCreateDialogOpen(false); return; }
      if (deleteTarget) { setDeleteTarget(null); return; }
      onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [createDialogOpen, deleteTarget, onClose]);

  const hasAnyAvailable = available.themes.length > 0 || available.components.length > 0;
  const emptyPacksCount = packs.filter(p => p.themes.length === 0 && p.components.length === 0).length;

  const handleConfirmCreate = (name: string, description: string) => {
    const themes = loadCustomThemes();
    const components = loadUserComponents();
    // 二次校验：拒绝创建空盒子（外层按钮也 disabled，但 race 情况下兜底）
    if (themes.length === 0 && components.length === 0) {
      setCreateDialogOpen(false);
      setError(t('brandPack.error.noPackTarget'));
      return;
    }
    const pack = createEmptyBrandPack(name);
    pack.description = description.trim() || undefined;
    pack.themes = themes;
    pack.components = components;
    upsertBrandPack(pack);
    refresh();
    setCreateDialogOpen(false);
    setInfo(`${t('brandPack.info.created')}「${pack.name}」（${pack.themes.length} ${t('brandPack.themes')} · ${pack.components.length} ${t('brandPack.components')}）`);
    setError(null);
  };

  /** 一键清理已存在的空品牌包（脏数据） */
  const handlePurgeEmpty = () => {
    const all = loadBrandPacks();
    const empties = all.filter(p => p.themes.length === 0 && p.components.length === 0);
    if (empties.length === 0) return;
    for (const p of empties) removeBrandPack(p.id);
    refresh();
    setInfo(`${t('brandPack.info.purged')} ${empties.length} ${t('brandPack.info.emptyPacks')}`);
  };

  const handleApply = (pack: BrandPack) => {
    const r = applyBrandPack(pack);
    saveActiveBrandPackId(pack.id);
    setActiveId(pack.id);
    if (r.errors.length) {
      setError(r.errors.join('；'));
    } else {
      setError(null);
      setInfo(`${t('brandPack.info.applied')}「${pack.name}」（${t('brandPack.themesCount')} ${r.themesApplied} · ${t('brandPack.componentsCount')} ${r.componentsApplied}）`);
    }
    onApplied?.();
  };

  const handleConfirmDelete = (pack: BrandPack) => {
    removeBrandPack(pack.id);
    refresh();
    setDeleteTarget(null);
    setInfo(`${t('brandPack.info.deleted')}「${pack.name}」`);
  };

  const handleImportFile = async (file: File) => {
    setImporting(true);
    setError(null);
    try {
      const pack = await readBrandPackFile(file);
      upsertBrandPack(pack);
      refresh();
      setInfo(`${t('brandPack.info.imported')}「${pack.name}」`);
    } catch (e) {
      setError(`${t('brandPack.error.importFailed')}${(e as Error).message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in"
      style={{ background: 'rgba(26, 25, 21, 0.45)' }}
      onClick={onClose}
    >
      <div
        className="rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)] w-[760px] max-h-[88vh] overflow-hidden flex flex-col"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <header
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
              style={{ background: 'var(--accent-soft)' }}
            >
              <PackageIcon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            </div>
            <div className="min-w-0">
              <h2
                className="text-[17px] font-semibold leading-tight"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}
              >
                {t('brandPack.title')}
              </h2>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {t('brandPack.desc')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 inline-flex items-center justify-center rounded-md transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            title={t('brandPack.closeEsc')}
          >
            <XIcon className="w-4 h-4" />
          </button>
        </header>

        {/* 操作栏 + 状态条 */}
        <div
          className="flex items-center justify-between px-6 py-3 shrink-0 gap-3"
          style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-sunken)' }}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1 text-[12px]">
            <span style={{ color: 'var(--text-tertiary)' }}>{t('brandPack.availableNow')}</span>
            <Pill
              icon={<PaletteIcon className="w-3 h-3" />}
              label={`${available.themes.length} ${t('brandPack.themes')}`}
              active={available.themes.length > 0}
            />
            <Pill
              icon={<WandSparklesIcon className="w-3 h-3" />}
              label={`${available.components.length} ${t('brandPack.components')}`}
              active={available.components.length > 0}
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <label
              className="inline-flex items-center gap-1.5 h-8 px-3 text-[12px] font-medium rounded-md cursor-pointer transition-all"
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <UploadIcon className="w-3.5 h-3.5" />
              {importing ? t('brandPack.importing') : t('brandPack.importJson')}
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImportFile(f);
                  e.target.value = '';
                }}
                disabled={importing}
              />
            </label>
            <Button
              variant="solid"
              size="md"
              icon={<PackagePlusIcon />}
              disabled={!hasAnyAvailable}
              onClick={() => setCreateDialogOpen(true)}
              title={hasAnyAvailable ? t('brandPack.packTooltip') : t('brandPack.packDisabledTooltip')}
            >
              {t('brandPack.packCurrent')}
            </Button>
          </div>
        </div>

        {/* 反馈条（info / error） */}
        {(info || error) && (
          <div
            className="px-6 py-2 text-[12px] flex items-center gap-2 shrink-0"
            style={{
              background: error ? 'rgba(176, 74, 63, 0.08)' : 'var(--accent-soft)',
              color: error ? '#B04A3F' : 'var(--accent-strong)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            {error
              ? <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
              : <InfoIcon className="w-3.5 h-3.5 shrink-0" />
            }
            <span className="truncate">{error ?? info}</span>
            <button
              onClick={() => { setInfo(null); setError(null); }}
              className="ml-auto text-[11px] opacity-70 hover:opacity-100"
            >
              {t('brandPack.close')}
            </button>
          </div>
        )}

        {/* 列表 */}
        <div className="flex-1 overflow-y-auto">
          {packs.length === 0 ? (
            <EmptyState
              hasAnyAvailable={hasAnyAvailable}
              onCreateTheme={onRequestCreateTheme ? () => { onClose(); onRequestCreateTheme(); } : undefined}
              onCreateComponent={onRequestCreateComponent ? () => { onClose(); onRequestCreateComponent(); } : undefined}
            />
          ) : (
            <>
              {emptyPacksCount > 0 && (
                <div
                  className="mx-6 my-3 px-3 py-2 rounded-[var(--radius-sm)] text-[12px] flex items-center gap-2"
                  style={{
                    background: 'rgba(176, 74, 63, 0.08)',
                    border: '1px solid rgba(176, 74, 63, 0.25)',
                    color: '#B04A3F',
                  }}
                >
                  <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="flex-1">
                    {emptyPacksCount} {t('brandPack.emptyPacksWarning')}
                  </span>
                  <button
                    type="button"
                    onClick={handlePurgeEmpty}
                    className="text-[11px] font-medium underline underline-offset-2"
                  >
                    {t('brandPack.purgeEmpty')}
                  </button>
                </div>
              )}
              <ul>
                {packs.map((pack) => (
                  <BrandPackRow
                    key={pack.id}
                    pack={pack}
                    active={pack.id === activeId}
                    expanded={expandedId === pack.id}
                    onToggleExpand={() => setExpandedId((prev) => (prev === pack.id ? null : pack.id))}
                    onApply={() => handleApply(pack)}
                    onExport={() => downloadBrandPackJson(pack)}
                    onRequestDelete={() => setDeleteTarget(pack)}
                  />
                ))}
              </ul>
            </>
          )}
        </div>

        {/* 底部说明 */}
        <footer
          className="px-6 py-2.5 text-[11px] shrink-0"
          style={{
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--surface-sunken)',
            color: 'var(--text-tertiary)',
          }}
        >
          {t('brandPack.footer')}
        </footer>
      </div>

      {/* 二级：打包对话框 */}
      {createDialogOpen && (
        <CreateDialog
          themesCount={available.themes.length}
          componentsCount={available.components.length}
          themePreview={available.themes.slice(0, 5).map(t => t.name || t.id)}
          componentPreview={available.components.slice(0, 5).map(c => c.id)}
          onCancel={() => setCreateDialogOpen(false)}
          onConfirm={handleConfirmCreate}
        />
      )}

      {/* 二级：删除确认 */}
      {deleteTarget && (
        <ConfirmDialog
          title={`${t('brandPack.deleteConfirm.title')}「${deleteTarget.name}」？`}
          desc={t('brandPack.deleteConfirm.desc')}
          confirmLabel={t('brandPack.deleteConfirm.confirm')}
          danger
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => handleConfirmDelete(deleteTarget)}
        />
      )}
    </div>
  );
}

// ===== 子组件：空状态 =====

interface EmptyStateProps {
  hasAnyAvailable: boolean;
  onCreateTheme?: () => void;
  onCreateComponent?: () => void;
}

function EmptyState({ hasAnyAvailable, onCreateTheme, onCreateComponent }: EmptyStateProps) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center text-center px-8 py-10 max-w-[560px] mx-auto">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
        style={{ background: 'var(--accent-soft)' }}
      >
        <PackageIcon className="w-7 h-7" style={{ color: 'var(--accent)' }} />
      </div>
      <h3
        className="text-[16px] font-semibold mb-2"
        style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}
      >
        {t('brandPack.empty.title')}
      </h3>
      <p className="text-[13px] leading-relaxed mb-5 max-w-[460px]" style={{ color: 'var(--text-secondary)' }}>
        {t('brandPack.empty.desc')}
      </p>

      {/* 直观演示：品牌包里有什么 */}
      <div
        className="w-full mb-5 p-4 rounded-[var(--radius-md)] flex items-center gap-3"
        style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border-subtle)' }}
      >
        <div
          className="w-12 h-12 rounded-md flex items-center justify-center shrink-0"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <PackageIcon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
        </div>
        <span className="text-[20px] shrink-0" style={{ color: 'var(--text-quaternary)' }}>=</span>
        <BadgeDemo
          icon={<PaletteIcon className="w-3.5 h-3.5" />}
          label={t('brandPack.empty.customTheme')}
          example={t('brandPack.empty.customThemeExample')}
        />
        <span className="text-[14px] shrink-0" style={{ color: 'var(--text-quaternary)' }}>+</span>
        <BadgeDemo
          icon={<WandSparklesIcon className="w-3.5 h-3.5" />}
          label={t('brandPack.empty.aiComponent')}
          example={t('brandPack.empty.aiComponentExample')}
        />
      </div>

      {/* 用户视角：根据当前是否有资产，决定显示啥 */}
      {hasAnyAvailable ? (
        <div className="w-full">
          <p className="text-[12.5px] mb-3" style={{ color: 'var(--accent-strong)' }}>
            {t('brandPack.empty.hasAvailableHint')}
          </p>
        </div>
      ) : (
        <div className="w-full space-y-3">
          <p
            className="text-[12px] font-medium"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {t('brandPack.empty.howToStart')}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {onCreateTheme && (
              <CtaCard
                icon={<PaletteIcon className="w-4 h-4" />}
                title={t('brandPack.empty.createTheme')}
                desc={t('brandPack.empty.createThemeDesc')}
                onClick={onCreateTheme}
              />
            )}
            {onCreateComponent && (
              <CtaCard
                icon={<WandSparklesIcon className="w-4 h-4" />}
                title={t('brandPack.empty.createComponent')}
                desc={t('brandPack.empty.createComponentDesc')}
                onClick={onCreateComponent}
              />
            )}
          </div>
          <p className="text-[11px] mt-3" style={{ color: 'var(--text-quaternary)' }}>
            {t('brandPack.empty.orImport')}
          </p>
        </div>
      )}
    </div>
  );
}

function BadgeDemo({ icon, label, example }: { icon: React.ReactNode; label: string; example: string }) {
  return (
    <div className="flex flex-col items-start gap-0.5 min-w-0 flex-1">
      <span
        className="inline-flex items-center gap-1 text-[11px] font-medium"
        style={{ color: 'var(--text-primary)' }}
      >
        {icon}
        {label}
      </span>
      <span className="text-[10px] truncate w-full text-left" style={{ color: 'var(--text-tertiary)' }}>
        {example}
      </span>
    </div>
  );
}

function CtaCard({
  icon, title, desc, onClick,
}: { icon: React.ReactNode; title: string; desc: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-start gap-2.5 px-3 py-3 rounded-[var(--radius-md)] text-left transition-all"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent)';
        e.currentTarget.style.background = 'var(--accent-soft)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.background = 'var(--surface)';
      }}
    >
      <span
        className="shrink-0 mt-0.5"
        style={{ color: 'var(--accent)' }}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[12.5px] font-medium" style={{ color: 'var(--text-primary)' }}>
          {title}
        </span>
        <span className="block text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
          {desc}
        </span>
      </span>
    </button>
  );
}

// ===== 子组件：列表项 =====

interface BrandPackRowProps {
  pack: BrandPack;
  active: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onApply: () => void;
  onExport: () => void;
  onRequestDelete: () => void;
}

function BrandPackRow({ pack, active, expanded, onToggleExpand, onApply, onExport, onRequestDelete }: BrandPackRowProps) {
  const { t } = useI18n();
  return (
    <li
      style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: active ? 'var(--accent-soft)' : 'transparent',
      }}
    >
      <div className="flex items-center gap-3 px-6 py-3">
        <button
          type="button"
          onClick={onToggleExpand}
          className="w-6 h-6 inline-flex items-center justify-center rounded transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          {expanded ? <ChevronDownIcon className="w-3.5 h-3.5" /> : <ChevronRightIcon className="w-3.5 h-3.5" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
              {pack.name}
            </span>
            {active && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}
              >
                <CheckIcon className="w-2.5 h-2.5" />
                {t('brandPack.applied')}
              </span>
            )}
          </div>
          {pack.description && (
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {pack.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
            <span className="inline-flex items-center gap-1">
              <PaletteIcon className="w-3 h-3" /> {pack.themes.length}
            </span>
            <span className="inline-flex items-center gap-1">
              <WandSparklesIcon className="w-3 h-3" /> {pack.components.length}
            </span>
            <span style={{ color: 'var(--text-quaternary)' }}>·</span>
            <span style={{ color: 'var(--text-quaternary)' }}>
              {new Date(pack.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant={active ? 'subtle' : 'solid'}
            size="sm"
            icon={active ? <CheckIcon /> : undefined}
            onClick={onApply}
            disabled={active}
          >
            {active ? t('brandPack.applied') : t('brandPack.apply')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<DownloadIcon />}
            onClick={onExport}
            title={t('brandPack.exportJson')}
            className="!px-1.5"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<TrashIcon />}
            onClick={onRequestDelete}
            title={t('brandPack.delete')}
            className="!px-1.5"
            style={{ color: '#B04A3F' }}
          />
        </div>
      </div>

      {expanded && (
        <div
          className="px-6 pb-3 ml-9 grid grid-cols-2 gap-4 text-[12px]"
          style={{ color: 'var(--text-secondary)' }}
        >
          <div>
            <div
              className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] mb-1.5"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <PaletteIcon className="w-3 h-3" /> {t('brandPack.themesCount')}（{pack.themes.length}）
            </div>
            {pack.themes.length === 0 ? (
              <p className="text-[11px]" style={{ color: 'var(--text-quaternary)' }}>{t('brandPack.none')}</p>
            ) : (
              <ul className="space-y-0.5">
                {pack.themes.map(t => (
                  <li key={t.id} className="flex items-baseline gap-2">
                    <span>{t.name || t.id}</span>
                    <code className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                      {t.id}
                    </code>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <div
              className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] mb-1.5"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <WandSparklesIcon className="w-3 h-3" /> {t('brandPack.componentsCount')}（{pack.components.length}）
            </div>
            {pack.components.length === 0 ? (
              <p className="text-[11px]" style={{ color: 'var(--text-quaternary)' }}>{t('brandPack.none')}</p>
            ) : (
              <ul className="space-y-0.5">
                {pack.components.map(c => (
                  <li key={c.id} className="flex items-baseline gap-2">
                    <code className="text-[11px] font-mono">{c.id}</code>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

// ===== 子组件：状态徽章 =====

function Pill({ icon, label, active }: { icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px]"
      style={{
        background: active ? 'var(--accent-soft)' : 'var(--surface)',
        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
        color: active ? 'var(--accent-strong)' : 'var(--text-tertiary)',
      }}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </span>
  );
}

// ===== 子组件：创建对话框 =====

interface CreateDialogProps {
  themesCount: number;
  componentsCount: number;
  themePreview: string[];
  componentPreview: string[];
  onCancel: () => void;
  onConfirm: (name: string, description: string) => void;
}

function CreateDialog({
  themesCount, componentsCount, themePreview, componentPreview, onCancel, onConfirm,
}: CreateDialogProps) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const defaultName = useMemo(() => {
    const date = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    return `My Brand · ${date}`;
  }, []);

  const trimmed = name.trim() || defaultName;
  const canSubmit = trimmed.length > 0;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-sm animate-fade-in"
      style={{ background: 'rgba(26, 25, 21, 0.55)' }}
      onClick={onCancel}
    >
      <div
        className="rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)] w-[480px] max-w-[92vw] overflow-hidden flex flex-col"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h3
            className="text-[15px] font-semibold"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}
          >
            {t('brandPack.create.title')}
          </h3>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {t('brandPack.create.desc')}
          </p>
        </header>

        <div className="px-5 py-4 space-y-4">
          {/* 内容预览 */}
          <div
            className="rounded-[var(--radius-md)] p-3.5"
            style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-2" style={{ color: 'var(--text-tertiary)' }}>
              {t('brandPack.create.willPack')}
            </div>
            <div className="grid grid-cols-2 gap-3 text-[12px]">
              <PreviewSection
                icon={<PaletteIcon className="w-3 h-3" />}
                label={t('brandPack.create.themeLabel')}
                count={themesCount}
                items={themePreview}
              />
              <PreviewSection
                icon={<WandSparklesIcon className="w-3 h-3" />}
                label={t('brandPack.create.componentLabel')}
                count={componentsCount}
                items={componentPreview}
              />
            </div>
          </div>

          {/* 命名 */}
          <div>
            <label className="block text-[11px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              {t('brandPack.create.nameLabel')}
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={defaultName}
              maxLength={64}
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

          {/* 描述（可选） */}
          <div>
            <label className="block text-[11px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              {t('brandPack.create.descLabel')} <span style={{ color: 'var(--text-quaternary)' }}>{t('brandPack.create.descOptional')}</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('brandPack.create.descPlaceholder')}
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
        </div>

        <footer
          className="px-5 py-3 flex items-center justify-end gap-2"
          style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-sunken)' }}
        >
          <Button variant="outline" size="md" onClick={onCancel}>
            {t('save.cancel')}
          </Button>
          <Button
            variant="solid"
            size="md"
            icon={<PackagePlusIcon />}
            disabled={!canSubmit}
            onClick={() => onConfirm(trimmed, description)}
          >
            {t('brandPack.create.confirm')}
          </Button>
        </footer>
      </div>
    </div>
  );
}

function PreviewSection({
  icon, label, count, items,
}: { icon: React.ReactNode; label: string; count: number; items: string[] }) {
  const { t } = useI18n();
  return (
    <div>
      <div className="flex items-center gap-1 mb-1.5" style={{ color: 'var(--text-secondary)' }}>
        {icon}
        <span className="text-[12px] font-medium">{label}</span>
        <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>· {count}</span>
      </div>
      {count === 0 ? (
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-quaternary)' }}>
          {t('brandPack.create.noContent')}
        </p>
      ) : (
        <ul className="space-y-0.5 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
          {items.map((s, i) => (
            <li key={i} className="truncate">· {s}</li>
          ))}
          {count > items.length && (
            <li style={{ color: 'var(--text-quaternary)' }}>… {t('brandPack.create.moreItems')} {count - items.length}</li>
          )}
        </ul>
      )}
    </div>
  );
}

// ===== 子组件：删除确认 =====

interface ConfirmDialogProps {
  title: string;
  desc?: string;
  confirmLabel: string;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function ConfirmDialog({ title, desc, confirmLabel, danger, onCancel, onConfirm }: ConfirmDialogProps) {
  const { t } = useI18n();
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-sm animate-fade-in"
      style={{ background: 'rgba(26, 25, 21, 0.55)' }}
      onClick={onCancel}
    >
      <div
        className="rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)] w-[400px] max-w-[92vw] overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4">
          <h3
            className="text-[15px] font-semibold mb-1"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}
          >
            {title}
          </h3>
          {desc && (
            <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {desc}
            </p>
          )}
        </div>
        <footer
          className="px-5 py-3 flex items-center justify-end gap-2"
          style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-sunken)' }}
        >
          <Button variant="outline" size="md" onClick={onCancel}>
            {t('save.cancel')}
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center h-8 px-3 text-[13px] font-medium rounded-md transition-all"
            style={{
              background: danger ? '#B04A3F' : 'var(--accent)',
              color: '#fff',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            {confirmLabel}
          </button>
        </footer>
      </div>
    </div>
  );
}
