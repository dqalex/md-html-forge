/**
 * Forge IR (中间表示)
 *
 * 这是编译管线的中心数据结构。Lexer → Parser 之后，所有后续阶段
 * (Resolver / Emitter / Plugins) 只对 AST 操作，不再扫描原始字符串。
 *
 * 设计原则：
 *   1. 节点位置信息齐全 (offset + line + col) → 任何错误都能定位到源码
 *   2. 节点类型扁平 + 可枚举 → switch(node.kind) 就能穷尽
 *   3. 不混渲染逻辑：节点只描述"是什么"，不知道"如何变成 HTML"
 *   4. 可序列化：node 不含函数/类/正则，便于缓存与诊断输出
 */

// ===== 位置信息 =====

export interface SourceLoc {
  /** 字符偏移（包含起点） */
  start: number;
  /** 字符偏移（不包含终点） */
  end: number;
  /** 1-based 行号 */
  line: number;
  /** 1-based 列号 */
  col: number;
}

// ===== 节点 kind 枚举 =====

export type NodeKind =
  | 'Document'
  | 'Compose'         // <!-- @compose: a, b, c -->
  | 'Layout'          // <!-- @layout: id -->
  | 'Theme'           // <!-- @theme: id -->
  | 'Use'             // <!-- @use: id -->
  | 'Slot'            // <!-- @slot:name -->...<!-- @/slot -->
  | 'Group'           // <!-- @compose-group: id -->...<!-- @/compose-group -->
  | 'GroupItem'       // <!-- @item: id -->...<!-- @/item -->
  | 'Text';           // 普通正文（指令之间的内容，渲染时不强求保留）

// ===== 节点接口 =====

export interface BaseNode {
  kind: NodeKind;
  loc: SourceLoc;
}

export interface DocumentNode extends BaseNode {
  kind: 'Document';
  children: TopNode[];
  /** 顶层 @compose 声明的组件 id 列表（解析后的便捷视图） */
  composeIds: string[];
  /** 源 MD 长度，便于增量缓存判断 */
  sourceLength: number;
}

export interface ComposeNode extends BaseNode {
  kind: 'Compose';
  ids: string[];
}

export interface LayoutNode extends BaseNode {
  kind: 'Layout';
  /** 布局 id；可能未注册，由 resolver 阶段产生诊断 */
  id: string;
}

export interface ThemeNode extends BaseNode {
  kind: 'Theme';
  id: string;
}

export interface UseNode extends BaseNode {
  kind: 'Use';
  /** 显式指派组件 id 到当前段 */
  id: string;
  /** 变体 id（如 compact / detailed） */
  variant?: string;
}

export interface SlotNode extends BaseNode {
  kind: 'Slot';
  name: string;
  /** slot 内的原始内容（未渲染的 MD 片段） */
  raw: string;
  /** 内容部分的位置（不含开/闭标签自身） */
  contentLoc: SourceLoc;
}

export interface GroupNode extends BaseNode {
  kind: 'Group';
  /** 这个 group 服务于哪个布局组件 */
  layoutId: string;
  /** 顺序排列的子项 */
  items: GroupItemNode[];
}

export interface GroupItemNode extends BaseNode {
  kind: 'GroupItem';
  /** 子项使用的组件 id */
  childId: string;
  /** 子项内部的 slot 节点（已解析） */
  slots: SlotNode[];
  /** 子项原始 MD（保留给极端场景） */
  raw: string;
  /** 变体 id（由 @item childId variant=xxx 指定） */
  variant?: string;
}

export interface TextNode extends BaseNode {
  kind: 'Text';
  /** 该段文本的原始内容（指令之间的"空白" + 注释 + 普通 MD） */
  text: string;
}

// ===== 顶层节点联合 =====

/** 顶层节点（Document.children 的成员） */
export type TopNode =
  | ComposeNode
  | LayoutNode
  | ThemeNode
  | UseNode
  | SlotNode
  | GroupNode
  | TextNode;

/** 任意节点（含子节点类型） */
export type AnyNode = DocumentNode | TopNode | GroupItemNode;

// ===== 工具函数 =====

/**
 * 类型守卫：缩窄到指定 kind
 * 用例：const slots = doc.children.filter(isKind('Slot'))
 */
export function isKind<K extends NodeKind>(kind: K) {
  return (node: AnyNode): node is Extract<AnyNode, { kind: K }> => node.kind === kind;
}
