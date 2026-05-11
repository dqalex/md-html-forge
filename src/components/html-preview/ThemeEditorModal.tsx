'use client';

/**
 * ThemeEditorModal —— 自定义主题编辑器（v2 渐进式披露）
 *
 * v2 设计理念：
 *   - 90% 的用户只想做一件事：换个主色 + 给品牌起个名字
 *   - 默认只暴露 3 个最关键决策：名字、主色、风格调性
 *   - 「风格调性」一键填入合理的颜色组合 + 字体 + 圆角，避免"对着 13 个字段不知道改哪个"
 *   - 实时预览框：所见即所得
 *   - 「专业设置」折叠区：保留全部 13 个字段，给工程师 / 品牌设计师用
 *
 * 隐藏的工程概念：
 *   - 主题 id（kebab-case）从名字自动派生，用户看不到
 *   - description 自动从风格 + 主色生成，可在专业设置里改
 */

import { useState, useEffect, useMemo } from 'react';
import {
  XIcon, CheckIcon, ChevronDownIcon, ChevronRightIcon,
  PaintbrushIcon, SunIcon, FlameIcon, BookOpenIcon, MinusIcon,
  PaletteIcon, TypeIcon, SquareIcon,
  TerminalIcon, NewspaperIcon, FileTextIcon, CandyIcon,
  BriefcaseIcon, LeafIcon, MoonIcon, SmileIcon,
} from 'lucide-react';

import { Button } from '@/components/ui';
import { BUILTIN_THEMES, type ThemeDef } from '@/builtin/themes';
import { useI18n } from '@/lib/i18n';

const STORAGE_KEY = 'forge:custom-themes';

export interface ThemeEditorModalProps {
  /** 基础主题 id：新建模式下作为起点；编辑模式下（即该 id 是已存在的自定义主题）会直接回填现有内容 */
  baseThemeId: string;
  /**
   * 显式指定正在编辑的自定义主题 id。
   * 不传时，组件会自动判断：若 baseThemeId 命中 loadCustomThemes() 里的某一项，则进入编辑模式。
   */
  editingThemeId?: string;
  onSave: (theme: ThemeDef) => void;
  onClose: () => void;
}

// ============================================================
// localStorage 存取（API 兼容 v1）
// ============================================================

export function loadCustomThemes(): ThemeDef[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t) => t && typeof t.id === 'string' && typeof t.name === 'string');
  } catch {
    return [];
  }
}

export function saveCustomThemes(themes: ThemeDef[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(themes));
}

export function upsertCustomTheme(theme: ThemeDef): ThemeDef[] {
  const all = loadCustomThemes();
  const idx = all.findIndex((t) => t.id === theme.id);
  if (idx >= 0) all[idx] = theme;
  else all.push(theme);
  saveCustomThemes(all);
  return all;
}

export function removeCustomTheme(id: string): ThemeDef[] {
  const all = loadCustomThemes().filter((t) => t.id !== id);
  saveCustomThemes(all);
  return all;
}

// ============================================================
// 风格调性预设
// ============================================================
//
// 每个调性 = 一组完整的颜色 + 字体 + 圆角组合，用户选了之后立即生效，
// 不再需要逐个填字段。如果想精调可以打开「专业设置」。
//
// 按「风格大类」分组展示，让 12 个预设不会一锅粥：
//   - basic   经典（默认那 4 个）
//   - content 内容向（写作 / 阅读 / 长文）
//   - vivid   个性向（设计 / 营销 / 节日）

type MoodCategory = 'basic' | 'content' | 'vivid';

interface MoodPreset {
  id: string;
  label: string;
  desc: string;
  labelI18nKey: string;
  descI18nKey: string;
  category: MoodCategory;
  icon: React.ReactNode;
  /** 主色推荐池（用户切换调性时若已选过主色就保留） */
  recommendedAccents: string[];
  /** 应用到 ThemeDef 的字段（accent 留空，由用户独立选） */
  apply: Omit<Partial<ThemeDef>, 'id' | 'name' | 'description' | 'accent'>;
}

// 通用字体栈（避免每个预设重复声明）
const FONTS = {
  // 默认：衬线标题 + 无衬线正文
  serifTitle: {
    fontSerif: 'Source Serif 4, Georgia, serif',
    fontSans: 'Inter, system-ui, sans-serif',
    fontMono: 'JetBrains Mono, ui-monospace, monospace',
  },
  // 全无衬线（互联网产品风）
  allSans: {
    fontSerif: 'Inter, system-ui, sans-serif',
    fontSans: 'Inter, system-ui, sans-serif',
    fontMono: 'JetBrains Mono, ui-monospace, monospace',
  },
  // 等宽主导（终端 / 技术）
  monoLed: {
    fontSerif: 'JetBrains Mono, ui-monospace, monospace',
    fontSans: 'Inter, system-ui, sans-serif',
    fontMono: 'JetBrains Mono, ui-monospace, monospace',
  },
} as const;

const MOOD_PRESETS: MoodPreset[] = [
  // ========== 经典 ==========
  {
    id: 'editorial',
    label: '温暖出版',
    desc: '米色底 + 衬线，像一本杂志',
    labelI18nKey: 'theme.mood.editorial',
    descI18nKey: 'theme.mood.editorialDesc',
    category: 'basic',
    icon: <BookOpenIcon className="w-4 h-4" />,
    recommendedAccents: ['#D97757', '#B04A3F', '#788C5D', '#A06A3D'],
    apply: {
      background: '#FAF9F5',
      text: '#3D3D3A',
      heading: '#141413',
      strong: '#141413',
      surface: '#FFFFFF',
      border: '#E3DACC',
      muted: '#87867F',
      ...FONTS.serifTitle,
      radius: '12px',
    },
  },
  {
    id: 'bright',
    label: '明亮清爽',
    desc: '纯白 + 大圆角，互联网产品风',
    labelI18nKey: 'theme.mood.bright',
    descI18nKey: 'theme.mood.brightDesc',
    category: 'basic',
    icon: <SunIcon className="w-4 h-4" />,
    recommendedAccents: ['#0066FF', '#22c55e', '#8b5cf6', '#f59e0b'],
    apply: {
      background: '#FFFFFF',
      text: '#1F2937',
      heading: '#0F172A',
      strong: '#0F172A',
      surface: '#F8FAFC',
      border: '#E2E8F0',
      muted: '#64748B',
      ...FONTS.allSans,
      radius: '16px',
    },
  },
  {
    id: 'serious',
    label: '深沉严肃',
    desc: '深色背景 + 高对比，发布会 / 报告',
    labelI18nKey: 'theme.mood.serious',
    descI18nKey: 'theme.mood.seriousDesc',
    category: 'basic',
    icon: <FlameIcon className="w-4 h-4" />,
    recommendedAccents: ['#FF6B35', '#F59E0B', '#22D3EE', '#A78BFA'],
    apply: {
      background: '#141413',
      text: '#E3DACC',
      heading: '#FAF9F5',
      strong: '#FAF9F5',
      surface: '#1F1E1B',
      surfaceSunken: '#28282A',
      border: '#3D3D3A',
      borderSubtle: 'rgba(227,218,204,0.12)',
      muted: '#87867F',
      ...FONTS.serifTitle,
      radius: '8px',
    },
  },
  {
    id: 'minimal',
    label: '极简留白',
    desc: '黑白灰 + 直角，包豪斯风',
    labelI18nKey: 'theme.mood.minimal',
    descI18nKey: 'theme.mood.minimalDesc',
    category: 'basic',
    icon: <MinusIcon className="w-4 h-4" />,
    recommendedAccents: ['#000000', '#525252', '#737373', '#A3A3A3'],
    apply: {
      background: '#FFFFFF',
      text: '#171717',
      heading: '#000000',
      strong: '#000000',
      surface: '#FAFAFA',
      border: '#E5E5E5',
      muted: '#737373',
      ...FONTS.allSans,
      radius: '4px',
    },
  },

  // ========== 内容向 ==========
  {
    id: 'kraft',
    label: '牛皮纸笔记',
    desc: '米黄底 + 棕字，读书笔记 / 复盘',
    labelI18nKey: 'theme.mood.kraft',
    descI18nKey: 'theme.mood.kraftDesc',
    category: 'content',
    icon: <FileTextIcon className="w-4 h-4" />,
    recommendedAccents: ['#9E5C2E', '#7A4A23', '#B85F3E', '#5C3A1E'],
    apply: {
      background: '#F4ECD8',
      text: '#4A3A24',
      heading: '#2D1F0E',
      strong: '#2D1F0E',
      surface: '#FAF5E4',
      border: '#D9C9A8',
      muted: '#8B7654',
      ...FONTS.serifTitle,
      radius: '6px',
    },
  },
  {
    id: 'magazine',
    label: '杂志风',
    desc: '大留白 + 黑白对比，长文专栏',
    labelI18nKey: 'theme.mood.magazine',
    descI18nKey: 'theme.mood.magazineDesc',
    category: 'content',
    icon: <NewspaperIcon className="w-4 h-4" />,
    recommendedAccents: ['#000000', '#B04A3F', '#0F172A', '#A06A3D'],
    apply: {
      background: '#FFFFFF',
      text: '#262626',
      heading: '#000000',
      strong: '#000000',
      surface: '#FAFAFA',
      border: '#D4D4D4',
      muted: '#737373',
      ...FONTS.serifTitle,
      radius: '0px',
    },
  },
  {
    id: 'corporate',
    label: '商务蓝',
    desc: '深蓝主色，财报 / B2B 提案',
    labelI18nKey: 'theme.mood.corporate',
    descI18nKey: 'theme.mood.corporateDesc',
    category: 'content',
    icon: <BriefcaseIcon className="w-4 h-4" />,
    recommendedAccents: ['#1E40AF', '#0F4C75', '#0369A1', '#334155'],
    apply: {
      background: '#FFFFFF',
      text: '#334155',
      heading: '#0F172A',
      strong: '#1E293B',
      surface: '#F8FAFC',
      border: '#CBD5E1',
      muted: '#64748B',
      ...FONTS.serifTitle,
      radius: '4px',
    },
  },
  {
    id: 'nature',
    label: '自然清新',
    desc: '绿色系 + 米色，环保 / 健康',
    labelI18nKey: 'theme.mood.nature',
    descI18nKey: 'theme.mood.natureDesc',
    category: 'content',
    icon: <LeafIcon className="w-4 h-4" />,
    recommendedAccents: ['#16A34A', '#65A30D', '#0D9488', '#557B3C'],
    apply: {
      background: '#F7F4ED',
      text: '#3F4A3C',
      heading: '#1A2E1A',
      strong: '#1A2E1A',
      surface: '#FBFAF4',
      border: '#D4D8C8',
      muted: '#7A8472',
      ...FONTS.serifTitle,
      radius: '12px',
    },
  },

  // ========== 个性向 ==========
  {
    id: 'terminal',
    label: '终端代码',
    desc: '暗底 + 等宽字，技术博客 / API',
    labelI18nKey: 'theme.mood.terminal',
    descI18nKey: 'theme.mood.terminalDesc',
    category: 'vivid',
    icon: <TerminalIcon className="w-4 h-4" />,
    recommendedAccents: ['#22D3EE', '#A78BFA', '#34D399', '#FBBF24'],
    apply: {
      background: '#0D1117',
      text: '#C9D1D9',
      heading: '#F0F6FC',
      strong: '#FFFFFF',
      surface: '#161B22',
      surfaceSunken: '#1C2128',
      border: '#30363D',
      borderSubtle: '#21262D',
      muted: '#8B949E',
      ...FONTS.monoLed,
      radius: '6px',
    },
  },
  {
    id: 'pastel',
    label: '马卡龙',
    desc: '低饱和粉蓝绿，软文 / 小红书',
    labelI18nKey: 'theme.mood.pastel',
    descI18nKey: 'theme.mood.pastelDesc',
    category: 'vivid',
    icon: <CandyIcon className="w-4 h-4" />,
    recommendedAccents: ['#F472B6', '#A78BFA', '#60A5FA', '#34D399'],
    apply: {
      background: '#FDF7FB',
      text: '#5B4B5C',
      heading: '#3D2D43',
      strong: '#3D2D43',
      surface: '#FFFFFF',
      border: '#F3E5F0',
      muted: '#A799A8',
      ...FONTS.allSans,
      radius: '20px',
    },
  },
  {
    id: 'night',
    label: '午夜',
    desc: '深色 + 金紫，作品集 / 影评',
    labelI18nKey: 'theme.mood.night',
    descI18nKey: 'theme.mood.nightDesc',
    category: 'vivid',
    icon: <MoonIcon className="w-4 h-4" />,
    recommendedAccents: ['#D4AF37', '#A78BFA', '#F472B6', '#22D3EE'],
    apply: {
      background: '#0F0E1A',
      text: '#C7C2D6',
      heading: '#F5F0FF',
      strong: '#FFFFFF',
      surface: '#1A1828',
      surfaceSunken: '#231F36',
      border: '#2E2A3D',
      borderSubtle: '#221F2E',
      muted: '#7A7588',
      ...FONTS.serifTitle,
      radius: '12px',
    },
  },
  {
    id: 'playful',
    label: '童趣',
    desc: '高饱和 + 大圆角，教育 / 节日',
    labelI18nKey: 'theme.mood.playful',
    descI18nKey: 'theme.mood.playfulDesc',
    category: 'vivid',
    icon: <SmileIcon className="w-4 h-4" />,
    recommendedAccents: ['#F97316', '#EC4899', '#22C55E', '#3B82F6'],
    apply: {
      background: '#FFF8E7',
      text: '#451A03',
      heading: '#7C2D12',
      strong: '#7C2D12',
      surface: '#FFFFFF',
      border: '#FED7AA',
      muted: '#A8855B',
      ...FONTS.allSans,
      radius: '24px',
    },
  },
];

const MOOD_CATEGORIES: Array<{ id: MoodCategory; i18nKey: string }> = [
  { id: 'basic',   i18nKey: 'theme.mood.basic' },
  { id: 'content', i18nKey: 'theme.mood.content' },
  { id: 'vivid',   i18nKey: 'theme.mood.vivid' },
];

// 从「调性 + 主色」组合派生 description（自动生成，用户看不到）
function deriveDescription(moodId: string, accent: string): string {
  const mood = MOOD_PRESETS.find(m => m.id === moodId);
  return `${mood?.label ?? '自定义'} 风格，主色 ${accent}`;
}

// 从名字生成 kebab-case id
function nameToId(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
  return slug ? `custom-${slug}-${Date.now().toString(36).slice(-4)}` : `custom-${Date.now()}`;
}

// ============================================================
// 反推：从已存在的 ThemeDef 还原 (moodId, accent, overrides)
// ============================================================
//
// 用户保存过一次之后再打开编辑器，我们需要把 ThemeDef 拆回 UI 能理解的三个维度：
//   - moodId：匹配哪一个调性预设（对比 background + heading + radius 的组合）
//   - accent：直接取 theme.accent
//   - overrides：把预设之外的所有差异挪到"专业设置"里，保证"所见即所得"
//
// 匹配不到任何预设时：以第一个预设兜底，并把所有 mood.apply 字段整体塞进 overrides，
// 这样至少用户看到的字段值和保存前一样，不会"打开编辑器发现被改了"。

function reverseEngineerTheme(theme: ThemeDef): {
  moodId: string;
  accent: string;
  overrides: Partial<ThemeDef>;
} {
  // 1. 找最接近的 mood：按 background + heading 精确匹配；都命中算匹配
  const bestMood = MOOD_PRESETS.find(m =>
    m.apply.background === theme.background
    && m.apply.heading === theme.heading,
  ) ?? MOOD_PRESETS[0]!;

  // 2. 计算 overrides = theme 里哪些字段"偏离了 bestMood 预设"
  //    mood.apply 覆盖的字段：遍历这些 key，如果 theme 的值 != mood.apply 的值，进 overrides
  //    mood.apply 没覆盖的字段（比如 bandStyle, sectionGap, sectionInset）：如果 theme 有值，也进 overrides
  const overrides: Partial<ThemeDef> = {};
  const moodKeys = Object.keys(bestMood.apply) as Array<keyof ThemeDef>;
  for (const k of moodKeys) {
    const themeVal = theme[k];
    const moodVal = (bestMood.apply as Partial<ThemeDef>)[k];
    if (themeVal !== undefined && themeVal !== moodVal) {
      (overrides as Record<string, unknown>)[k] = themeVal;
    }
  }
  // 非 mood 覆盖的扩展字段（bandStyle/sectionGap/sectionInset/accentSoft 等）
  const extraKeys: Array<keyof ThemeDef> = ['bandStyle', 'sectionGap', 'sectionInset', 'accentSoft'];
  for (const k of extraKeys) {
    if (theme[k] !== undefined && !(k in bestMood.apply)) {
      // accentSoft 由 lightenColor(accent, 0.85) 自动派生，若用户值和派生值一致就不记
      if (k === 'accentSoft') {
        const derived = lightenColor(theme.accent ?? '#000000', 0.85);
        if (theme.accentSoft === derived) continue;
      }
      (overrides as Record<string, unknown>)[k] = theme[k];
    }
  }

  return {
    moodId: bestMood.id,
    accent: theme.accent ?? bestMood.recommendedAccents[0]!,
    overrides,
  };
}

// ============================================================
// 主组件
// ============================================================

export function ThemeEditorModal({ baseThemeId, editingThemeId, onSave, onClose }: ThemeEditorModalProps) {
  const { t } = useI18n();

  // 识别编辑模式：显式 editingThemeId > 自动识别（baseThemeId 命中已存在的 custom theme）
  // 一次性初始化，避免多次 re-render 重放初始值
  const editingTheme = useMemo<ThemeDef | null>(() => {
    if (typeof window === 'undefined') return null;
    const customs = loadCustomThemes();
    const id = editingThemeId ?? baseThemeId;
    return customs.find(t => t.id === id) ?? null;
  }, [baseThemeId, editingThemeId]);

  const isEditMode = editingTheme !== null;

  const baseTheme = BUILTIN_THEMES.find((t) => t.id === baseThemeId) ?? BUILTIN_THEMES[0]!;

  // 编辑模式下反推 (moodId, accent, overrides)；新建模式走默认值
  const initial = useMemo(() => {
    if (editingTheme) {
      return {
        name: editingTheme.name,
        ...reverseEngineerTheme(editingTheme),
      };
    }
    return {
      name: `${t('theme.defaultNamePrefix')} ${baseTheme.name}`,
      moodId: MOOD_PRESETS[0]!.id,
      accent: MOOD_PRESETS[0]!.recommendedAccents[0]!,
      overrides: {} as Partial<ThemeDef>,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 简单模式状态：名字 + 主色 + 调性
  const [name, setName] = useState(initial.name);
  const [moodId, setMoodId] = useState<string>(initial.moodId);
  const [accent, setAccent] = useState<string>(initial.accent);

  // 专业模式额外覆盖（仅当用户主动改时填入，否则跟随调性）
  const [advancedOverrides, setAdvancedOverrides] = useState<Partial<ThemeDef>>(initial.overrides);
  const [showAdvanced, setShowAdvanced] = useState(Object.keys(initial.overrides).length > 0);

  // 派生：合成最终 ThemeDef
  //   - 编辑模式：复用原 id（保存时 upsert 会命中旧记录并覆盖）
  //   - 新建模式：根据 name 派生一个新 id（含时间戳后缀防冲突）
  const draft = useMemo<ThemeDef>(() => {
    const mood = MOOD_PRESETS.find(m => m.id === moodId)!;
    return {
      id: editingTheme ? editingTheme.id : nameToId(name),
      name: name.trim() || `${t('theme.defaultNamePrefix')} ${baseTheme.name}`,
      description: deriveDescription(moodId, accent),
      ...mood.apply,
      accent,
      accentSoft: lightenColor(accent, 0.85),
      ...advancedOverrides,
    };
  }, [name, moodId, accent, advancedOverrides, baseTheme, editingTheme, t]);

  // ESC 关闭
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = () => {
    if (!draft.name) return;
    upsertCustomTheme(draft);
    onSave(draft);
    onClose();
  };

  // 编辑模式下的「另存为副本」：绕过 editingTheme 的 id 复用，强制走 nameToId 生成新 id
  const handleSaveAsCopy = () => {
    if (!draft.name) return;
    const mood = MOOD_PRESETS.find(m => m.id === moodId)!;
    const copy: ThemeDef = {
      ...draft,
      id: nameToId(name || `${t('theme.defaultNamePrefix')} ${baseTheme.name}`),
      name: `${draft.name} (copy)`,
      description: deriveDescription(moodId, accent),
      ...mood.apply,
      accent,
      accentSoft: lightenColor(accent, 0.85),
      ...advancedOverrides,
    };
    upsertCustomTheme(copy);
    onSave(copy);
    onClose();
  };

  const handleSelectMood = (id: string) => {
    setMoodId(id);
    // 切换调性时，若当前主色不在新调性的推荐里，自动切到第一个推荐色
    const mood = MOOD_PRESETS.find(m => m.id === id)!;
    if (!mood.recommendedAccents.includes(accent)) {
      setAccent(mood.recommendedAccents[0]!);
    }
  };

  const setOverride = <K extends keyof ThemeDef>(key: K, value: ThemeDef[K] | undefined) => {
    setAdvancedOverrides(prev => {
      const next = { ...prev };
      if (value === undefined || value === '') delete next[key];
      else (next as Record<string, unknown>)[key] = value;
      return next;
    });
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
              <PaintbrushIcon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            </div>
            <div className="min-w-0">
              <h2
                className="text-[17px] font-semibold leading-tight"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}
              >
                {isEditMode ? t('theme.editTitle') : t('theme.title')}
              </h2>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {isEditMode ? t('theme.editDesc') : t('theme.desc')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 inline-flex items-center justify-center rounded-md transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            title={t('theme.closeEsc')}
          >
            <XIcon className="w-4 h-4" />
          </button>
        </header>

        {/* 主体 */}
        <div className="flex-1 overflow-y-auto">
          {/* 编辑模式提示条 */}
          {editingTheme && (
            <div
              className="mx-6 mt-4 px-3 py-2 rounded-[var(--radius-sm)] text-[11.5px] leading-relaxed flex items-start gap-2"
              style={{
                background: 'var(--accent-soft)',
                color: 'var(--accent-strong)',
                border: '1px solid var(--accent)',
              }}
            >
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}
              >
                ID
              </span>
              <span className="min-w-0 flex-1">
                <span className="block">{t('theme.editHint')}</span>
                <code className="text-[10px] opacity-70 font-mono">{editingTheme.id}</code>
              </span>
            </div>
          )}
          {/* 简单模式：3 步 */}
          <div className="px-6 py-5 space-y-5">
            {/* Step 1：名字 */}
            <Step n={1} title={t('theme.step1Title')}>
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('theme.step1Placeholder')}
                maxLength={32}
                className="w-full h-10 px-3.5 rounded-[var(--radius-md)] text-[14px] outline-none transition-colors"
                style={{
                  background: 'var(--surface-sunken)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              />
            </Step>

            {/* Step 2：调性 */}
            <Step n={2} title={t('theme.step2Title')}>
              <div className="space-y-3">
                {MOOD_CATEGORIES.map(cat => {
                  const items = MOOD_PRESETS.filter(m => m.category === cat.id);
                  if (items.length === 0) return null;
                  return (
                    <div key={cat.id}>
                      <div
                        className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-1.5"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {t(cat.i18nKey as any)}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {items.map(mood => (
                          <MoodCard
                            key={mood.id}
                            mood={mood}
                            active={moodId === mood.id}
                            onClick={() => handleSelectMood(mood.id)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Step>

            {/* Step 3：主色 */}
            <Step n={3} title={t('theme.step3Title')}>
              <ColorPicker
                value={accent}
                onChange={setAccent}
                recommended={MOOD_PRESETS.find(m => m.id === moodId)!.recommendedAccents}
              />
            </Step>

            {/* 实时预览 */}
            <ThemePreview theme={draft} />
          </div>

          {/* 专业设置（可折叠） */}
          <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={() => setShowAdvanced(v => !v)}
              className="w-full flex items-center justify-between px-6 py-3 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span className="flex items-center gap-2 text-[13px] font-medium">
                {showAdvanced ? <ChevronDownIcon className="w-3.5 h-3.5" /> : <ChevronRightIcon className="w-3.5 h-3.5" />}
                专业设置
                <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                  （可选，精调每个颜色 / 字体 / 圆角）
                </span>
              </span>
              {Object.keys(advancedOverrides).length > 0 && (
                <span
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                  style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
                >
                  已覆盖 {Object.keys(advancedOverrides).length} 项
                </span>
              )}
            </button>

            {showAdvanced && (
              <AdvancedPanel
                draft={draft}
                overrides={advancedOverrides}
                onSet={setOverride}
                onReset={() => setAdvancedOverrides({})}
              />
            )}
          </div>
        </div>

        {/* 底部 */}
        <footer
          className="px-6 py-3.5 flex items-center justify-between shrink-0 gap-3"
          style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-sunken)' }}
        >
          <div className="text-[11px] min-w-0 truncate" style={{ color: 'var(--text-tertiary)' }}>
            保存到本地，可在「品牌包」一并打包分享
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="md" onClick={onClose}>取消</Button>
            {isEditMode && (
              <Button
                variant="outline"
                size="md"
                disabled={!name.trim()}
                onClick={handleSaveAsCopy}
                title={t('theme.saveAsCopy')}
              >
                {t('theme.saveAsCopy')}
              </Button>
            )}
            <Button
              variant="solid"
              size="md"
              icon={<CheckIcon />}
              disabled={!name.trim()}
              onClick={handleSave}
            >
              {isEditMode ? t('theme.saveUpdate') : t('theme.saveTheme')}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ============================================================
// 子组件
// ============================================================

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-5 h-5 rounded-full inline-flex items-center justify-center text-[11px] font-mono font-semibold"
          style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}
        >
          {n}
        </span>
        <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
          {title}
        </span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function MoodCard({ mood, active, onClick }: { mood: MoodPreset; active: boolean; onClick: () => void }) {
  const { t } = useI18n();
  const apply = mood.apply;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-stretch gap-2 p-2.5 rounded-[var(--radius-md)] text-left transition-all"
      style={{
        background: active ? 'var(--accent-soft)' : 'transparent',
        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
      }}
    >
      {/* 缩略色卡：显示该调性的核心配色 */}
      <div
        className="h-12 rounded flex items-center justify-center relative overflow-hidden"
        style={{
          background: apply.background,
          border: `1px solid ${apply.border ?? 'transparent'}`,
          borderRadius: apply.radius,
        }}
      >
        <span
          className="text-[14px] font-medium"
          style={{
            color: apply.heading,
            fontFamily: apply.fontSerif,
          }}
        >
          Aa
        </span>
        {/* 推荐主色池预览：右下角 4 色串 */}
        <div className="absolute right-1 bottom-1 flex gap-0.5">
          {mood.recommendedAccents.slice(0, 4).map((c, i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: c,
                boxShadow: '0 0 0 1px rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </div>
      </div>
      <div className="flex items-start gap-1.5">
        <span
          className="shrink-0 mt-0.5"
          style={{ color: active ? 'var(--accent)' : 'var(--text-tertiary)' }}
        >
          {mood.icon}
        </span>
        <div className="min-w-0">
          <div
            className="text-[12px] font-medium leading-tight"
            style={{ color: active ? 'var(--accent-strong)' : 'var(--text-primary)' }}
          >
            {mood.label}
          </div>
          <div className="text-[10.5px] mt-0.5 leading-snug" style={{ color: 'var(--text-tertiary)' }}>
            {mood.desc}
          </div>
        </div>
      </div>
    </button>
  );
}

function ColorPicker({
  value, onChange, recommended,
}: { value: string; onChange: (c: string) => void; recommended: string[] }) {
  // 推荐色 + 通用色板
  const palette = useMemo(() => {
    const general = ['#D97757', '#0066FF', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#000000'];
    const merged = [...recommended, ...general.filter(c => !recommended.includes(c))];
    return merged.slice(0, 12);
  }, [recommended]);

  return (
    <div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {palette.map(c => {
          const active = c.toLowerCase() === value.toLowerCase();
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              className="w-8 h-8 rounded-full relative transition-transform hover:scale-110"
              style={{
                background: c,
                border: active ? '2px solid var(--text-primary)' : '1px solid var(--border)',
                boxShadow: active ? 'var(--shadow-sm)' : 'none',
              }}
              title={c}
            >
              {active && (
                <CheckIcon
                  className="w-4 h-4 absolute inset-0 m-auto"
                  style={{
                    color: isLightColor(c) ? '#000' : '#fff',
                    strokeWidth: 3,
                  }}
                />
              )}
            </button>
          );
        })}

        {/* 自定义颜色 */}
        <label
          className="w-8 h-8 rounded-full cursor-pointer flex items-center justify-center relative overflow-hidden transition-transform hover:scale-110"
          style={{
            background: 'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
            border: '1px solid var(--border)',
          }}
          title="自定义颜色"
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>

        <span className="text-[11px] font-mono ml-2" style={{ color: 'var(--text-tertiary)' }}>
          {value.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

function ThemePreview({ theme }: { theme: ThemeDef }) {
  return (
    <div>
      <div
        className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-2"
        style={{ color: 'var(--text-tertiary)' }}
      >
        实时预览
      </div>
      <div
        className="rounded-[var(--radius-md)] overflow-hidden"
        style={{
          background: theme.background,
          border: `1px solid ${theme.border ?? 'transparent'}`,
        }}
      >
        <div className="px-5 py-4">
          <div
            className="text-[11px] font-mono mb-1.5"
            style={{
              color: theme.muted,
              fontFamily: theme.fontMono,
              letterSpacing: '0.06em',
            }}
          >
            EYEBROW · 2026
          </div>
          <h3
            className="text-[20px] font-semibold leading-tight mb-1.5"
            style={{ color: theme.heading, fontFamily: theme.fontSerif }}
          >
            标题字体看起来怎么样？
          </h3>
          <p
            className="text-[13px] leading-relaxed"
            style={{ color: theme.text, fontFamily: theme.fontSans }}
          >
            正文段落，这里展示<strong style={{ color: theme.strong }}>加粗强调</strong>的效果。
            这段文本帮你判断主题的可读性。
            <a style={{ color: theme.accent, textDecoration: 'underline' }}>这是链接颜色</a>。
          </p>

          {/* 卡片样例 */}
          <div
            className="mt-3 px-3 py-2.5 rounded-[var(--radius-sm)]"
            style={{
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: theme.radius,
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-1.5 h-8 rounded"
                style={{ background: theme.accent }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium" style={{ color: theme.heading }}>
                  示例卡片
                </div>
                <div className="text-[11px]" style={{ color: theme.muted }}>
                  你的主色用在这里
                </div>
              </div>
              <button
                type="button"
                className="px-2.5 py-1 rounded text-[11px] font-medium"
                style={{
                  background: theme.accent,
                  color: isLightColor(theme.accent ?? '#000') ? '#000' : '#fff',
                  borderRadius: theme.radius,
                }}
              >
                操作
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 专业设置面板（折叠区）
// ============================================================

const COLOR_FIELDS: Array<{ key: keyof ThemeDef; label: string }> = [
  { key: 'background', label: '页面背景' },
  { key: 'text',       label: '正文颜色' },
  { key: 'heading',    label: '标题颜色' },
  { key: 'strong',     label: '加粗强调' },
  { key: 'muted',      label: '次要文字' },
  { key: 'surface',    label: '卡片背景' },
  { key: 'border',     label: '边框颜色' },
  { key: 'accentSoft', label: '柔和强调' },
];

const FONT_FIELDS: Array<{ key: keyof ThemeDef; label: string; placeholder: string }> = [
  { key: 'fontSerif', label: '衬线（标题）',   placeholder: 'Source Serif 4, Georgia, serif' },
  { key: 'fontSans',  label: '无衬线（正文）', placeholder: 'Inter, system-ui, sans-serif' },
  { key: 'fontMono',  label: '等宽（代码）',   placeholder: 'JetBrains Mono, ui-monospace, monospace' },
];

interface AdvancedPanelProps {
  draft: ThemeDef;
  overrides: Partial<ThemeDef>;
  onSet: <K extends keyof ThemeDef>(key: K, value: ThemeDef[K] | undefined) => void;
  onReset: () => void;
}

function AdvancedPanel({ draft, overrides, onSet, onReset }: AdvancedPanelProps) {
  const hasOverrides = Object.keys(overrides).length > 0;
  return (
    <div className="px-6 pb-5 space-y-4" style={{ background: 'var(--surface-sunken)' }}>
      <div className="pt-3 flex items-center justify-between">
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
          这里可以精调每一项。<strong>留空</strong>表示跟随上方调性预设。
        </p>
        {hasOverrides && (
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] underline underline-offset-2"
            style={{ color: 'var(--accent-strong)' }}
          >
            重置全部覆盖
          </button>
        )}
      </div>

      {/* 颜色 */}
      <Section icon={<PaletteIcon className="w-3 h-3" />} title="颜色">
        <div className="grid grid-cols-2 gap-2.5">
          {COLOR_FIELDS.map(f => (
            <ColorOverrideField
              key={String(f.key)}
              label={f.label}
              effective={(draft[f.key] as string) ?? ''}
              override={overrides[f.key] as string | undefined}
              onChange={(v) => onSet(f.key, v as ThemeDef[typeof f.key])}
            />
          ))}
        </div>
      </Section>

      {/* 字体 */}
      <Section icon={<TypeIcon className="w-3 h-3" />} title="字体（CSS font-family）">
        <div className="space-y-2">
          {FONT_FIELDS.map(f => (
            <TextOverrideField
              key={String(f.key)}
              label={f.label}
              placeholder={f.placeholder}
              effective={(draft[f.key] as string) ?? ''}
              override={overrides[f.key] as string | undefined}
              onChange={(v) => onSet(f.key, v as ThemeDef[typeof f.key])}
            />
          ))}
        </div>
      </Section>

      {/* 视觉 */}
      <Section icon={<SquareIcon className="w-3 h-3" />} title="视觉">
        <div className="grid grid-cols-2 gap-2.5">
          <TextOverrideField
            label="圆角"
            placeholder="例如 12px"
            effective={draft.radius ?? ''}
            override={overrides.radius}
            onChange={(v) => onSet('radius', v)}
          />
          <SelectOverrideField
            label="主题段样式"
            options={[
              { value: 'contained',  label: 'contained · 受页宽约束' },
              { value: 'full-bleed', label: 'full-bleed · 通栏 banner' },
            ]}
            effective={(draft.bandStyle as string) ?? 'contained'}
            override={overrides.bandStyle as string | undefined}
            onChange={(v) => onSet('bandStyle', v as ThemeDef['bandStyle'])}
          />
          <TextOverrideField
            label="段外留白"
            placeholder="例如 24px 0"
            effective={draft.sectionGap ?? ''}
            override={overrides.sectionGap}
            onChange={(v) => onSet('sectionGap', v)}
          />
          <TextOverrideField
            label="段内留白"
            placeholder="例如 28px 32px"
            effective={draft.sectionInset ?? ''}
            override={overrides.sectionInset}
            onChange={(v) => onSet('sectionInset', v)}
          />
        </div>
      </Section>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] mb-2"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function FieldShell({
  label, overridden, children,
}: { label: string; overridden: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        {overridden && (
          <span
            className="text-[9px] font-mono uppercase tracking-wider px-1 py-0.5 rounded"
            style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}
          >
            自定义
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function ColorOverrideField({
  label, effective, override, onChange,
}: {
  label: string;
  effective: string;
  override: string | undefined;
  onChange: (v: string | undefined) => void;
}) {
  const display = override ?? effective;
  const isHex = /^#[0-9a-fA-F]{3,8}$/.test(display);
  const overridden = override !== undefined;

  return (
    <FieldShell label={label} overridden={overridden}>
      <div
        className="flex items-center gap-2 px-2 h-8 rounded-[var(--radius-sm)]"
        style={{
          background: 'var(--surface)',
          border: `1px solid ${overridden ? 'var(--accent)' : 'var(--border)'}`,
        }}
      >
        <span
          className="w-4 h-4 rounded shrink-0"
          style={{
            background: isHex ? display : 'transparent',
            border: '1px solid var(--border-subtle)',
          }}
        />
        <input
          type="text"
          value={override ?? ''}
          onChange={(e) => onChange(e.target.value || undefined)}
          placeholder={effective}
          className="flex-1 min-w-0 text-[11px] font-mono outline-none bg-transparent"
          style={{ color: 'var(--text-primary)' }}
        />
        <input
          type="color"
          value={isHex ? display.slice(0, 7) : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent shrink-0"
          aria-label="拾色器"
        />
      </div>
    </FieldShell>
  );
}

function TextOverrideField({
  label, placeholder, effective, override, onChange,
}: {
  label: string;
  placeholder?: string;
  effective: string;
  override: string | undefined;
  onChange: (v: string | undefined) => void;
}) {
  const overridden = override !== undefined;
  return (
    <FieldShell label={label} overridden={overridden}>
      <input
        type="text"
        value={override ?? ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        placeholder={placeholder ?? effective}
        className="w-full h-8 px-2.5 rounded-[var(--radius-sm)] text-[11.5px] outline-none transition-colors"
        style={{
          background: 'var(--surface)',
          border: `1px solid ${overridden ? 'var(--accent)' : 'var(--border)'}`,
          color: 'var(--text-primary)',
        }}
      />
    </FieldShell>
  );
}

function SelectOverrideField({
  label, options, effective, override, onChange,
}: {
  label: string;
  options: Array<{ value: string; label: string }>;
  effective: string;
  override: string | undefined;
  onChange: (v: string | undefined) => void;
}) {
  const overridden = override !== undefined;
  return (
    <FieldShell label={label} overridden={overridden}>
      <select
        value={override ?? effective}
        onChange={(e) => onChange(e.target.value === effective ? undefined : e.target.value)}
        className="w-full h-8 px-2.5 rounded-[var(--radius-sm)] text-[11.5px] outline-none"
        style={{
          background: 'var(--surface)',
          border: `1px solid ${overridden ? 'var(--accent)' : 'var(--border)'}`,
          color: 'var(--text-primary)',
        }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </FieldShell>
  );
}

// ============================================================
// 工具
// ============================================================

/** 判断颜色是亮色（用于在彩色背景上选黑/白文字） */
function isLightColor(hex: string): boolean {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // YIQ
  return (r * 299 + g * 587 + b * 114) / 1000 > 155;
}

/** 把颜色变浅（生成 accentSoft）：mix amount 0-1，越大越白 */
function lightenColor(hex: string, amount: number): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}
