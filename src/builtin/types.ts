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
  html: (slots: Record<string, string>) => string;
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
  /** 缩略 emoji */
  emoji: string;
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
