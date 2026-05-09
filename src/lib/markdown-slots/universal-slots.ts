/**
 * 统一插槽规范（Universal Slot Spec）
 *
 * 从 teamclaw 10 个渲染模板中提炼，解决插槽命名不一致问题：
 *   - headline / title → title
 *   - tagline / subtitle → subtitle
 *   - category / badge → badge
 *   - author / speaker → speaker（分享类）
 *   - content / main / body → body
 *   - summaryContent → summary
 *   - completed / inProgress / issues → metricValue（循环）
 *   - featuresGrid / featureCards → featureCards
 *
 * 核心设计：同一份 MD 文档可在不同模板间无缝切换，
 * 不支持某插槽的模板会忽略该插槽内容，但内容不丢失。
 *
 * ## MD 文档格式
 * ```md
 * <!-- @slot:title -->
 * 2024 Q4 业务总结报告
 * <!-- @/slot -->
 *
 * <!-- @slot:subtitle -->
 * 核心指标全面达成，营收同比增长 32%
 * <!-- @/slot -->
 *
 * <!-- @slot:section -->
 * ## 第一章节内容
 * <!-- @/slot -->
 *
 * <!-- @slot:section -->
 * ## 第二章节内容（重复使用同名 slot 即可）
 * <!-- @/slot -->
 * ```
 */

import type { SlotDef } from './types';

// ─── 核心插槽（Core Slots）────────────────────────────────────────────────
// 几乎所有模板都支持，切换模板时内容 100% 保留

export const CORE_SLOTS = {
  title: {
    label: '主标题',
    type: 'content' as const,
    description: '文档/报告/分享的主标题',
    placeholder: '在此输入主标题',
  },
  subtitle: {
    label: '副标题',
    type: 'content' as const,
    description: '副标题或一句话描述（原 tagline、heroSubtitle 统一为此）',
    placeholder: '在此输入副标题',
  },
  badge: {
    label: '标签/徽章',
    type: 'content' as const,
    description: '分类标签、版本号或状态徽章（原 category、heroBadge 统一为此）',
    placeholder: '如：深度解读 / v2.0 / 内部分享',
  },
  speaker: {
    label: '分享人/作者',
    type: 'content' as const,
    description: '演讲者/作者姓名（原 author 统一为此）',
    placeholder: '张三',
  },
  date: {
    label: '日期',
    type: 'content' as const,
    description: '发布日期或报告周期',
    placeholder: '2025-01-01',
  },
  header: {
    label: '页眉/报头',
    type: 'content' as const,
    description: '页眉区域，报纸风格的报头信息',
    placeholder: '报头信息',
  },
  footer: {
    label: '页脚',
    type: 'content' as const,
    description: '页脚文字、版权或来源信息',
    placeholder: '© 2025 公司名称',
  },
} satisfies Record<string, SlotDef>;

// ─── 内容插槽（Content Slots）────────────────────────────────────────────
// 大多数内容型模板支持

export const CONTENT_SLOTS = {
  outline: {
    label: '目录大纲',
    type: 'content' as const,
    description: '文章目录，使用有序列表',
    placeholder: '1. 第一章\n2. 第二章\n3. 第三章',
  },
  lead: {
    label: '导语',
    type: 'content' as const,
    description: '文章导语/摘要段落',
    placeholder: '在此输入导语',
  },
  body: {
    label: '正文',
    type: 'content' as const,
    description: '主体内容，支持完整 Markdown（原 content、main 统一为此）',
    placeholder: '在此输入正文内容',
  },
  section: {
    label: '章节内容',
    type: 'content' as const,
    description: '章节内容，**可重复使用**填充多个章节',
    placeholder: '## 章节标题\n\n章节内容...',
  },
  sectionNum: {
    label: '章节编号',
    type: 'content' as const,
    description: '章节序号，如 01 / 02，与 section 配对重复',
    placeholder: '01',
  },
  summary: {
    label: '总结',
    type: 'content' as const,
    description: '文章总结/结语（原 summaryContent 统一为此）',
    placeholder: '在此输入总结',
  },
  summaryTitle: {
    label: '总结标题',
    type: 'content' as const,
    description: '总结区块的标题',
    placeholder: '总结',
  },
  summaryQuote: {
    label: '总结引用',
    type: 'content' as const,
    description: '总结区的金句引用',
    placeholder: '一句精炼的总结金句',
  },
  conclusion: {
    label: '结论建议',
    type: 'content' as const,
    description: '分析结论和行动建议',
    placeholder: '在此输入结论',
  },
  insight: {
    label: '洞察区块',
    type: 'content' as const,
    description: '数据洞察，**可重复使用**',
    placeholder: '洞察内容',
  },
  action: {
    label: '行动建议',
    type: 'content' as const,
    description: '行动建议，**可重复使用**',
    placeholder: '行动建议内容',
  },
  sidebar: {
    label: '侧边栏',
    type: 'content' as const,
    description: '侧边栏内容，数据亮点/引用/快讯',
    placeholder: '侧边栏内容',
  },
  bottom: {
    label: '底部栏',
    type: 'content' as const,
    description: '底部多列内容区',
    placeholder: '底部内容',
  },
  cover: {
    label: '封面图',
    type: 'image' as const,
    description: '封面图片 URL',
    placeholder: 'https://example.com/cover.jpg',
  },
  source: {
    label: '数据来源',
    type: 'content' as const,
    description: '数据来源说明',
    placeholder: '数据来源：内部统计',
  },
  period: {
    label: '周期',
    type: 'content' as const,
    description: '报告周期，如 2026-W01',
    placeholder: '2025-W01',
  },
  achievements: {
    label: '本周成果',
    type: 'content' as const,
    description: '本周/本期完成的工作成果',
    placeholder: '- 完成功能 A\n- 修复 Bug B',
  },
  risks: {
    label: '问题与风险',
    type: 'content' as const,
    description: '当前存在的问题和风险',
    placeholder: '- 风险 A\n- 问题 B',
  },
  nextPlan: {
    label: '下周计划',
    type: 'content' as const,
    description: '下周/下期的工作计划',
    placeholder: '- 计划 A\n- 计划 B',
  },
} satisfies Record<string, SlotDef>;

// ─── 数据插槽（Data Slots）───────────────────────────────────────────────
// 数值/指标类，使用 data-slot-type="data"

export const DATA_SLOTS = {
  metricValue: {
    label: '指标数值',
    type: 'data' as const,
    description: '核心数据指标值，**可重复使用**（原 completed/inProgress/issues 统一为此）',
    placeholder: '32%',
  },
  metricLabel: {
    label: '指标说明',
    type: 'content' as const,
    description: '指标说明文字，与 metricValue 配对重复',
    placeholder: '营收增长',
  },
} satisfies Record<string, SlotDef>;

// ─── 专用插槽：Landing Page ───────────────────────────────────────────────

export const LANDING_SLOTS = {
  heroBadge: {
    label: 'Hero 徽章',
    type: 'content' as const,
    description: 'Hero 区顶部徽章文字',
    placeholder: '🚀 全新发布',
  },
  heroTitle: {
    label: 'Hero 主标题',
    type: 'content' as const,
    description: 'Hero 区大标题（Landing Page 专用，其他模板用 title）',
    placeholder: '产品主标题',
  },
  heroSubtitle: {
    label: 'Hero 副标题',
    type: 'content' as const,
    description: 'Hero 区副标题描述（Landing Page 专用，其他模板用 subtitle）',
    placeholder: '产品副标题描述',
  },
  ctaButtons: {
    label: 'CTA 按钮组',
    type: 'content' as const,
    description: 'CTA 按钮列表，使用 Markdown 列表',
    placeholder: '- 立即开始\n- 查看文档',
  },
  dashboardPreview: {
    label: '仪表盘预览',
    type: 'content' as const,
    description: '预览区内容或截图',
    placeholder: '预览内容',
  },
  featuresHeader: {
    label: '功能区标题',
    type: 'content' as const,
    description: '功能特性区的标题和描述',
    placeholder: '## 核心功能\n\n功能描述',
  },
  featureCards: {
    label: '功能卡片',
    type: 'content' as const,
    description: '功能卡片列表（原 featuresGrid 统一为此）',
    placeholder: '- 功能 A\n- 功能 B\n- 功能 C',
  },
  featuresSummary: {
    label: '功能总结',
    type: 'content' as const,
    description: '功能区总结文字',
    placeholder: '功能总结',
  },
  modelsTitle: {
    label: '模型区标题',
    type: 'content' as const,
    description: '模型兼容性区域标题',
    placeholder: '支持主流模型',
  },
  modelLogos: {
    label: '模型 Logo',
    type: 'content' as const,
    description: '模型名称列表',
    placeholder: '- GPT-4\n- Claude\n- Gemini',
  },
  footerLinks: {
    label: '页脚链接',
    type: 'content' as const,
    description: '页脚导航链接列表',
    placeholder: '- 关于我们\n- 联系我们',
  },
  footerSocial: {
    label: '页脚社交',
    type: 'content' as const,
    description: '社交媒体链接列表',
    placeholder: '- GitHub\n- Twitter',
  },
  footerCopyright: {
    label: '页脚版权',
    type: 'content' as const,
    description: '版权声明文字',
    placeholder: '© 2025 公司名称',
  },
} satisfies Record<string, SlotDef>;

// ─── 专用插槽：公众号文章 ─────────────────────────────────────────────────

export const WECHAT_SLOTS = {
  titleTag: {
    label: '标题标签',
    type: 'content' as const,
    description: '标题区分类标签，如"深度解读"',
    placeholder: '深度解读',
  },
  titleMain: {
    label: '主标题（大）',
    type: 'content' as const,
    description: '公众号风格大标题（公众号专用，其他模板用 title）',
    placeholder: '主标题',
  },
  titleSub: {
    label: '副标题',
    type: 'content' as const,
    description: '公众号风格副标题（公众号专用，其他模板用 subtitle）',
    placeholder: '副标题',
  },
  partNum: {
    label: 'Part 编号',
    type: 'content' as const,
    description: 'Part 序号，如 PART 01，**可重复**',
    placeholder: 'PART 01',
  },
  partTitle: {
    label: 'Part 标题',
    type: 'content' as const,
    description: 'Part 标题，**可重复**',
    placeholder: 'Part 标题',
  },
  partImg: {
    label: 'Part 配图',
    type: 'image' as const,
    description: 'Part 配图 URL，**可重复**',
    placeholder: 'https://example.com/image.jpg',
  },
  partContent: {
    label: 'Part 内容',
    type: 'content' as const,
    description: 'Part 正文，**可重复**',
    placeholder: 'Part 内容',
  },
  caseNum: {
    label: 'Case 编号',
    type: 'content' as const,
    description: 'Case 序号，如 CASE 01，**可重复**',
    placeholder: 'CASE 01',
  },
  caseTitle: {
    label: 'Case 标题',
    type: 'content' as const,
    description: 'Case 标题，**可重复**',
    placeholder: 'Case 标题',
  },
  caseContent: {
    label: 'Case 内容',
    type: 'content' as const,
    description: 'Case 描述，**可重复**',
    placeholder: 'Case 内容',
  },
  copyright: {
    label: '版权信息',
    type: 'content' as const,
    description: '文章版权/来源声明',
    placeholder: '© 2025 公司名称',
  },
} satisfies Record<string, SlotDef>;

// ─── 全量合并 ─────────────────────────────────────────────────────────────

/** 所有统一插槽（完整集合） */
export const UNIVERSAL_SLOTS = {
  ...CORE_SLOTS,
  ...CONTENT_SLOTS,
  ...DATA_SLOTS,
  ...LANDING_SLOTS,
  ...WECHAT_SLOTS,
} satisfies Record<string, SlotDef>;

/** 统一插槽名称类型 */
export type UniversalSlotName = keyof typeof UNIVERSAL_SLOTS;

// ─── 模板插槽预设 ─────────────────────────────────────────────────────────
// 每种模板类型应使用的插槽集合，方便生成 MD 模板

/** 报告卡片（rt-report-card）推荐插槽 */
export const PRESET_REPORT_CARD: UniversalSlotName[] = [
  'title', 'subtitle', 'badge', 'date', 'speaker',
  'body', 'summary', 'conclusion', 'footer',
  'metricValue', 'metricLabel',
];

/** 技术分享（rt-tech-sharing / rt-h5-sharing）推荐插槽 */
export const PRESET_TECH_SHARING: UniversalSlotName[] = [
  'title', 'subtitle', 'badge', 'speaker', 'date',
  'outline', 'sectionNum', 'section', 'summary', 'footer',
];

/** 数据海报（rt-insight-poster）推荐插槽 */
export const PRESET_INSIGHT_POSTER: UniversalSlotName[] = [
  'title', 'subtitle', 'badge', 'date',
  'metricValue', 'metricLabel', 'insight', 'action',
  'source', 'footer',
];

/** 报纸横版（rt-newspaper）推荐插槽 */
export const PRESET_NEWSPAPER: UniversalSlotName[] = [
  'header', 'title', 'subtitle', 'date',
  'lead', 'body', 'sidebar', 'bottom', 'footer',
];

/** 报纸移动版（rt-newspaper-mobile）推荐插槽 */
export const PRESET_NEWSPAPER_MOBILE: UniversalSlotName[] = [
  'header', 'title', 'subtitle', 'date',
  'lead', 'body', 'summary', 'footer',
];

/** 社交卡片（rt-social-card）推荐插槽 */
export const PRESET_SOCIAL_CARD: UniversalSlotName[] = [
  'title', 'subtitle', 'badge', 'speaker', 'date', 'body', 'footer',
];

/** Landing Page（rt-landing-page）推荐插槽 */
export const PRESET_LANDING_PAGE: UniversalSlotName[] = [
  'heroBadge', 'heroTitle', 'heroSubtitle', 'ctaButtons',
  'dashboardPreview', 'featuresHeader', 'featureCards', 'featuresSummary',
  'modelsTitle', 'modelLogos',
  'footerLinks', 'footerSocial', 'footerCopyright',
];

/** 公众号文章（rt-wechat-modular）推荐插槽 */
export const PRESET_WECHAT: UniversalSlotName[] = [
  'titleTag', 'titleMain', 'titleSub', 'date', 'speaker',
  'lead', 'featureCards',
  'partNum', 'partTitle', 'partImg', 'partContent',
  'caseNum', 'caseTitle', 'caseContent',
  'summary', 'copyright', 'footer',
];

/** 项目周报（rt-weekly）推荐插槽 */
export const PRESET_WEEKLY: UniversalSlotName[] = [
  'title', 'period', 'date', 'speaker',
  'metricValue', 'metricLabel',
  'achievements', 'risks', 'nextPlan', 'footer',
];

// ─── 工具函数 ─────────────────────────────────────────────────────────────

/**
 * 从 UNIVERSAL_SLOTS 中选取指定插槽，生成模板的 slots 配置
 * @param keys 需要的插槽名列表
 * @param overrides 可选的覆盖配置（如自定义 placeholder）
 */
export function pickSlots(
  keys: UniversalSlotName[],
  overrides?: Partial<Record<UniversalSlotName, Partial<SlotDef>>>,
): Record<string, SlotDef> {
  const result: Record<string, SlotDef> = {};
  for (const key of keys) {
    result[key] = {
      ...UNIVERSAL_SLOTS[key],
      ...(overrides?.[key] ?? {}),
    };
  }
  return result;
}

/**
 * 根据插槽定义生成 MD 模板骨架
 * 生成的 MD 可直接用于 <!-- @slot:name --> 格式填充
 */
export function generateMdSkeleton(
  slotKeys: UniversalSlotName[],
  title = '文档标题',
): string {
  const lines: string[] = [
    `# ${title}`,
    '',
    '---',
    '',
    '> 使用 `<!-- @slot:插槽名 -->内容<!-- @/slot -->` 格式填充各插槽',
    '> 同名插槽重复使用即可填充循环区域（如 section、insight、metricValue 等）',
    '',
  ];

  for (const key of slotKeys) {
    const def = UNIVERSAL_SLOTS[key];
    lines.push(`<!-- @slot:${key} -->`);
    lines.push(def.placeholder ?? `[${def.label}]`);
    lines.push('<!-- @/slot -->');
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * 检测 MD 内容中使用了哪些统一插槽
 */
export function detectUsedSlots(mdContent: string): UniversalSlotName[] {
  const re = /<!-- @slot:(\w+) -->/g;
  const used = new Set<UniversalSlotName>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(mdContent)) !== null) {
    const name = m[1] as UniversalSlotName;
    if (name in UNIVERSAL_SLOTS) {
      used.add(name);
    }
  }
  return [...used];
}

/**
 * 获取插槽的分组信息（用于 UI 展示）
 */
export function getSlotGroup(name: UniversalSlotName): '核心' | '内容' | '数据' | 'Landing' | '公众号' {
  if (name in CORE_SLOTS) return '核心';
  if (name in CONTENT_SLOTS) return '内容';
  if (name in DATA_SLOTS) return '数据';
  if (name in LANDING_SLOTS) return 'Landing';
  return '公众号';
}
