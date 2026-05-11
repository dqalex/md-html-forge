/**
 * Markdown 插槽渲染 - 类型定义
 *
 * 移植自 teamclaw/src/shared/lib/slot-sync.ts
 * 设计：MD 用 <!-- @slot:name -->...<!-- @/slot --> 标记，HTML 用 data-slot="name" 标记
 */

// ------------------------------------------------------------------
// SlotType
//
// 对外（给 AI / 用户的 .forge.md 规范）只暴露 3 种：
//   - 'text'     纯文本（不做 MD 渲染）
//   - 'content'  Markdown 渲染（标题/列表/表格/段落混合）
//   - 'data'     数据 DSL（pipe 分隔多列、textContent 注入，由组件 mount JS 解析）
//
// 内部还保留两种历史类型（供 universal-slots 等老路径继续工作）：
//   - 'image'     图片 URL 提取（slide-cover 等组件依赖）
//   - 'richtext'  @deprecated  与 'content' 行为一致；不要在新组件中使用
// ------------------------------------------------------------------
export type SlotType = 'content' | 'image' | 'data' | 'text' | 'richtext';

/** 槽位定义 */
export interface SlotDef {
  label: string;
  type: SlotType;
  description?: string;
  placeholder?: string;
  /**
   * 绑定规则：声明该 slot 可从哪种原生 Markdown 块"自动吸收"
   *
   * 用于实现"源文件在裸 MD 编辑器里也合理"的核心原则：
   *   - 'h1' → 首个一级标题
   *   - 'h2' → 首个二级标题
   *   - 'h3' → 首个三级标题
   *   - 'blockquote' → 首个引用块
   *   - 'ul' / 'ol' → 首个无序/有序列表
   *   - 'list' → 任意列表（ul 或 ol）
   *   - 'code' → 首个围栏代码块
   *   - 'table' → 首个表格
   *   - 'paragraph' → 首个普通段落
   *   - 'eyebrow' → 组件前导元数据（>>> 前缀行，如 "> CATEGORY · TYPE"）
   *
   * 解析器会在 @use <组件id> 之后的 MD 块中，按声明类型匹配第一个合适的块。
   * 匹配到的块"被消费"，不会再分配给同组件的其他 slot。
   *
   * 若用户显式写 `<!-- @slot:name -->...<!-- @/slot -->`，显式优先。
   */
  bind?: SlotBindKind;
}

export type SlotBindKind =
  | 'h1' | 'h2' | 'h3'
  | 'blockquote'
  | 'ul' | 'ol' | 'list'
  | 'code'
  | 'table'
  | 'paragraph'
  /**
   * 'content' —— 兜底：吸收该组件段内"所有剩余未被占用的块"
   * 适合正文类 slot（body / article / main）
   */
  | 'content';

/** 槽位值（同名 slot 多次使用时 content 为数组） */
export interface SlotValue {
  name: string;
  type: SlotType;
  content: string | string[];
}

/** 同步结果 */
export interface SlotSyncResult {
  html: string;
  slots: Map<string, SlotValue>;
  errors: string[];
}

/** 模板资产 manifest（存为 JSON） */
export interface TemplateManifest {
  /** SKILL.md 全文 */
  skillMd: string;
  /** 含 <slot name="xxx"> 的 HTML 模板 */
  templateHtml: string;
  /** 引用文件名 → 内容 */
  references: Record<string, string>;
  /** manifest 版本 */
  version: string;
  /** 统一插槽规范（新格式，直接携带 slot 定义） */
  slots?: Record<string, SlotDef>;
}

/** 渲染选项 */
export interface SlotRenderOptions {
  markdown: string;
  templateHtml: string;
  slotDefs: Record<string, SlotDef>;
  cssTemplate?: string;
  sanitize?: boolean;
}
