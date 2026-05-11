/**
 * Built-in Registry 类型定义
 *
 * 设计目标：
 * 1. 组件 = 最小可复用单位（独立 CSS + slot 定义 + 渲染函数）
 * 2. 模板 = 「组件列表」+ 「补充组件」+ 元数据，绝不含硬编码内容
 * 3. 渲染 fallback：模板没声明的 slot → 自动查找内置组件
 * 4. 扩展友好：未来 122 个组件按 category 分文件，register() 注册
 */

import type { SlotDef } from '@/lib/markdown-slots/types';

// ===== 组件 =====

/** 组件分类（按视觉作用） */
export type ComponentCategory =
  | 'header'      // 头部：title / pills / badges
  | 'summary'     // 摘要：tldr / lead / metrics
  | 'content'     // 正文：body / code / qa / lead
  | 'card'        // 可循环的卡片单元：feature-card / pricing-card / persona-card
  | 'list'        // 列表：highlights / actions / checklist / timeline / milestones
  | 'visual'      // 视觉：before-after / progress / rollout / options
  | 'data'        // 数据：summary-band / table / metrics
  | 'layout'      // 布局：grid-2/3/4 / flex-row / stack（横向/网格容器）
  | 'footer'      // 页脚：footer / signature
  | 'special';    // 特殊：slide-deck / kanban 等单页面专属

export interface ComponentDef {
  /** 稳定 ID（kebab-case），用于 @compose 引用 */
  id: string;
  /** 显示名称 */
  name: string;
  /** 一句话用途说明（在组件浏览器中展示） */
  description?: string;
  /** 来源 demo 编号（如 '11,12,14'）—— 用于追溯 */
  source: string;
  /** 分类，用于组件浏览器分组 */
  category: ComponentCategory;
  /** 标签，用于搜索 */
  tags?: string[];
  /** Slot 定义，渲染时按定义提取 MD slot 值 */
  slots: Record<string, SlotDef>;
  /**
   * 示例 slot 值（用于演示 & 组件库"插入带示例"）
   * key 是 slot 名，value 是该 slot 的示例内容（Markdown 文本）
   * 组件浏览器点击「插入」时会用这份示例填充 slot 骨架
   */
  sample?: Record<string, string>;
  /** 该组件专属 CSS（避免污染其他组件） */
  css: string;
  /**
   * 渲染函数：接收已"预处理"的 slot HTML 串，返回组件 HTML
   * - type: content → 已是渲染好的块级 HTML
   * - type: text → 已是渲染好的行内 HTML
   * - type: data/image → 原值（组件按需解析）
   *
   * 若所有相关 slot 均为空，应返回空字符串（组件被跳过）
   *
   * 布局组件（isLayout=true）会额外收到 slots.__children__ —— 已渲染好的子组件 HTML 拼接串
   */
  html: (slots: Record<string, string>, variant?: string) => string;
  /**
   * 是否是布局容器组件
   * - true: 该组件需要包裹其他组件，在 MD 里通过 @compose-group 嵌套子项
   * - false / undefined: 普通组件
   */
  isLayout?: boolean;
  /**
   * 布局组件提供的"示例子项"（仅当 isLayout=true 时使用）
   * 用于组件库「插入带示例」时，自动给 layout 配几个真实的子卡片
   * 数组每个元素 = 一个 @item 块要使用的组件 id（必须存在于 BUILT-IN）
   */
  sampleChildren?: string[];
  /**
   * 可用变体清单（来自 .forge.md 的 ## Variants 段）
   * 仅 forge 组件有；TS 旧组件无
   */
  variants?: string[];
  /** 默认变体 id（来自 .forge.md 的 defaultVariant 字段） */
  defaultVariant?: string;
  /**
   * 变体描述（id → 描述文字），用于 PropertyPanel 提示
   */
  variantDescriptions?: Record<string, string>;
  /**
   * 信任级别（来自 .forge.md 的 trust 字段）
   *  - 'builtin'：内置/可信组件，mount JS 直接在主文档运行
   *  - 'user'：用户/AI 生成组件，mount JS 在 sandbox iframe 中运行
   */
  trust?: 'builtin' | 'user';
  /**
   * === 选型指南字段（可选，组件选型页 /docs/slots 渲染用） ===
   *
   * 这些字段让 AI agent / 人类用户能"读懂组件是干什么的"，从而按场景挑选。
   * 新组件强制要求填写；存量组件页面用现有字段 + 硬写文案兜底。
   */
  /** 何时用：2-4 条短描述，说明"哪些场景该选这个组件"（优先给 agent 看） */
  whenToUse?: string[];
  /** 何时别用：2-3 条短描述，说明"容易误选但实际上不适合"的场景 */
  whenNot?: string[];
  /** 关键 slot：决策者最该关注的 slot 名（通常 1-3 个） */
  keySlots?: string[];
}

// ===== 模板 =====

/** 模板组别 */
export type TemplateGroup =
  | 'report'
  | 'plan'
  | 'code-review'
  | 'research'
  | 'playground';

export interface TemplateDef {
  /** 稳定 ID */
  id: string;
  /** 显示名称 */
  name: string;
  /** 一句话说明 */
  description: string;
  /** 缩略 emoji（已弃用，保留字段向后兼容；UI 实际使用 icon+color）*/
  emoji: string;
  /**
   * lucide 图标名（lucide-react 导出名），例：'FileText' / 'BarChart3' / 'Flame'
   * TemplatePicker 会渲染为 lucide 图标；缺省时回退到 emoji
   */
  icon?: string;
  /**
   * 图标徽标背景色（配色调性），接收 CSS 变量或色值
   * 例：'var(--accent-soft)' / '#FDE4D3'
   */
  color?: string;
  /** 分组 */
  group: TemplateGroup;
  /**
   * 默认组件 ID 列表（按渲染顺序）
   * 用户在 MD 中的 @compose 指令会**完全覆盖**这个列表
   */
  componentIds: string[];
  /**
   * 模板自带的扩展组件（可选）
   * 这些组件只在该模板内可用，不污染全局
   * 当 @compose 中引用了不在 BUILT-IN 也不在这里的组件时，会被忽略
   */
  customComponents?: ComponentDef[];
  /** 启用该模板时填入编辑器的初始 MD */
  starterMarkdown: string;
  /**
   * 需要但当前尚未实现的组件 id 列表（可选）
   * agent 做 html-effectiveness 还原时，若某些布局需要新组件，
   * 在这里标注，待后续独立补齐。
   */
  missingComponents?: string[];
}

// ===== 渲染上下文 =====

/**
 * 渲染时的组件查找上下文
 * 优先级：模板自带组件 > 内置组件
 *
 * 这是"模板没声明的 slot 用默认兜底"的核心机制：
 * 用户在 MD 里写 @compose: header, my-special, body
 * → my-special 在模板 customComponents 找到 → 用模板的
 * → header / body 在 BUILT-IN 找到 → 用内置的
 */
export interface ComponentLookup {
  /** 当前模板自带组件（可选） */
  custom?: ComponentDef[];
  /** 内置组件（始终存在） */
  builtin: ComponentDef[];
}
