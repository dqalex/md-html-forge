import type { ThemeDef } from './types';

/**
 * 内置主题
 *
 * 设计原则：
 * - 所有主题共享 SHARED_TOKENS 的字体/圆角/间距 → 视觉协调
 * - 每个主题只覆盖颜色和（可选）字体，避免改"骨"只改"皮"
 * - 主题 id 用 kebab-case，便于 @theme 引用
 */

const EDITORIAL: ThemeDef = {
  id: 'editorial',
  name: 'Editorial（默认）',
  description: 'ivory 底 + clay 强调 + serif 标题（首屏默认风格）',
  // 不覆盖 → 全部用 SHARED_TOKENS 默认值
};

const DARK: ThemeDef = {
  id: 'dark',
  name: 'Dark Slate',
  description: '深色背景 + oat 强调，适合"重点段"',
  background: '#141413',
  text: '#E3DACC',
  heading: '#FAF9F5',
  strong: '#FAF9F5',
  accent: '#D97757',
  accentSoft: '#E3DACC',
  muted: '#87867F',
  surface: '#1F1F1E',
  // "下沉一档"的浅底：code 背景、行内 code、输入框、引用块等等
  // 在 dark 下必须用比 surface 深或相近的深色，否则这些地方会变"米色方块"
  surfaceSunken: '#28282A',
  border: '1px solid rgba(227,218,204,0.18)',
  // 细分割线：比 border 更弱，避免扎眼亮线
  borderSubtle: 'rgba(227,218,204,0.12)',
  // dark 段插在浅色页面里时，段外要有足够呼吸；段内内容更松一点
  // 让深色块看起来是"独立一段"而不是"紧贴前后内容"
  sectionGap: '32px 0',
  sectionInset: '36px 36px',
};

const SAGE: ThemeDef = {
  id: 'sage',
  name: 'Sage Olive',
  description: '橄榄绿强调，沉稳的工程报告风',
  background: '#F5F4ED',
  text: '#3D3D3A',
  heading: '#141413',
  strong: '#141413',
  accent: '#788C5D',
  accentSoft: '#A4B583',
  surface: '#FFFFFF',
  surfaceSunken: '#EDEBE0',
  borderSubtle: '#D7D5C6',
};

const COBALT: ThemeDef = {
  id: 'cobalt',
  name: 'Cobalt Blue',
  description: '科技蓝，适合数据看板/产品 landing',
  background: '#F5F8FF',
  text: '#1F2937',
  heading: '#0F172A',
  strong: '#0F172A',
  accent: '#0056FF',
  accentSoft: '#60A5FA',
  surface: '#FFFFFF',
  surfaceSunken: '#E8EFFF',
  borderSubtle: '#CBD7F0',
  fontSerif: '"Inter", system-ui, sans-serif',
};

const SUNSET: ThemeDef = {
  id: 'sunset',
  name: 'Sunset Coral',
  description: '暖橘红 + 米色，营销页/活动页',
  background: '#FFF5EE',
  text: '#3D3D3A',
  heading: '#141413',
  strong: '#B04A3F',
  accent: '#D97757',
  accentSoft: '#FFE0CC',
  surface: '#FFFFFF',
  surfaceSunken: '#FCE9DA',
  borderSubtle: '#EBD1BC',
};

const MONO: ThemeDef = {
  id: 'mono',
  name: 'Mono Print',
  description: '黑白印刷感，适合"严肃文档"',
  background: '#FFFFFF',
  text: '#222222',
  heading: '#000000',
  strong: '#000000',
  accent: '#000000',
  accentSoft: '#666666',
  muted: '#999999',
  surface: '#FFFFFF',
  surfaceSunken: '#F5F5F5',
  border: '1px solid #DDDDDD',
  borderSubtle: '#EEEEEE',
  fontSerif: 'Georgia, "Times New Roman", serif',
};

/**
 * 推荐主题清单（3 个核心主题）
 *
 * 产品方向：预设少 + 自定义能力强
 * - editorial：默认 ivory + clay + serif
 * - dark：深色 + oat 强调
 * - mono：黑白印刷
 *
 * SAGE / COBALT / SUNSET 保留为「向后兼容主题」（旧文档引用不会断），
 * 但不在 UI 主题选择器里暴露。
 */
export const RECOMMENDED_THEME_IDS = ['editorial', 'dark', 'mono'] as const;

export const BUILTIN_THEMES: ThemeDef[] = [
  EDITORIAL,
  DARK,
  SAGE,
  COBALT,
  SUNSET,
  MONO,
];

export const BUILTIN_THEME_MAP = new Map(BUILTIN_THEMES.map(t => [t.id, t]));

export function getBuiltinTheme(id: string): ThemeDef | undefined {
  return BUILTIN_THEME_MAP.get(id);
}

export const DEFAULT_THEME_ID = 'editorial';
