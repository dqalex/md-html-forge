/**
 * MD 原生块 → slot 自动绑定
 *
 * 核心原则：源文件在裸 MD 编辑器里打开也应该是合理的。
 * 所以我们让用户直接写 `# 标题` 这样的原生 MD，而不是把内容藏进注释属性。
 *
 * 绑定时机：parser 产出 AST 之后、resolver 消化之前。
 * 对于每个 @use <componentId> 指令，扫描其后到下一个 @use / @layout / @theme
 * 之间的 MD 块，按该组件的 slot.bind 规则把 MD 块转成 SlotNode 插入 AST。
 *
 * 规则：
 *   1. 显式 `<!-- @slot:name -->` 永远优先（手动绑定胜过自动绑定）
 *   2. 每个 MD 块最多匹配一个 slot（贪婪：按组件 slot 声明顺序）
 *   3. 未匹配的 MD 块保留为 Text 节点（渲染在孤儿区）
 */

import type {
  DocumentNode,
  TopNode,
} from './ast';
import type { ComponentDef } from '../types';
import type { SlotDef, SlotBindKind } from '@/lib/markdown-slots/types';
import { scanMdBlocks, type MdBlock } from './md-blocks';

/**
 * 遍历 AST 顶层 children，为每段插入由 MD 原生语法自动吸收出来的 SlotNode。
 * 返回新的 Document（原数组不变）。
 */
export function bindNativeMd(
  doc: DocumentNode,
  source: string,
  componentMap: Map<string, ComponentDef>,
): DocumentNode {
  const segments: Segment[] = splitSegments(doc.children);
  const newChildren: TopNode[] = [];
  for (const seg of segments) {
    newChildren.push(...bindSegment(seg, source, componentMap));
  }
  return { ...doc, children: newChildren };
}

// ===== 段切割 =====

interface Segment {
  /** 段内所有顶层节点（顺序保留） */
  nodes: TopNode[];
}

function splitSegments(children: readonly TopNode[]): Segment[] {
  const segs: Segment[] = [];
  let cur: TopNode[] = [];

  const flush = () => {
    if (cur.length) segs.push({ nodes: cur });
    cur = [];
  };

  for (const node of children) {
    if (node.kind === 'Layout' || node.kind === 'Theme') {
      flush();
      cur.push(node);
    } else {
      cur.push(node);
    }
  }
  flush();
  return segs;
}

// ===== 单段绑定 =====

function bindSegment(
  seg: Segment,
  source: string,
  componentMap: Map<string, ComponentDef>,
): TopNode[] {
  const output: TopNode[] = [];

  // 段内状态
  let currentUseId: string | null = null;
  /** 每个组件已被手动提供的 slot 名 */
  const explicitSlots = new Map<string, Set<string>>();
  /** 每个组件已被自动绑定的 slot 名（避免一个 slot 吃多个块） */
  const autoSlots = new Map<string, Set<string>>();

  const markExplicit = (compId: string, slotName: string) => {
    if (!explicitSlots.has(compId)) explicitSlots.set(compId, new Set());
    explicitSlots.get(compId)!.add(slotName);
  };

  // 先扫一遍，预先收集所有显式 slot 名（让自动绑定知道哪些已被占用）
  // 这是"预告"，实际归属在线性推进时确定
  for (const node of seg.nodes) {
    if (node.kind === 'Slot' && currentUseId) {
      markExplicit(currentUseId, node.name);
    }
    if (node.kind === 'Use') currentUseId = node.id;
  }
  // 重置线性游标
  currentUseId = null;

  // Step: 线性遍历，把 Text 节点的 raw 扫成 MdBlock，按 bind 规则分配给当前 @use 的组件
  for (let i = 0; i < seg.nodes.length; i++) {
    const node = seg.nodes[i]!;

    if (node.kind === 'Use') {
      currentUseId = node.id;
      output.push(node);
      continue;
    }

    if (node.kind === 'Slot') {
      // 显式 slot → 若当前 @use 上下文存在，自动归入该组件（使用者已在上面 pre-pass 处理）
      output.push(node);
      continue;
    }

    if (node.kind === 'Text') {
      const blocks = scanMdBlocks(source, node.loc.start, node.loc.end);
      if (!currentUseId || blocks.length === 0) {
        output.push(node);
        continue;
      }

      const comp = componentMap.get(currentUseId);
      if (!comp) {
        output.push(node);
        continue;
      }

      const explicit = explicitSlots.get(currentUseId) ?? new Set();
      const auto = autoSlots.get(currentUseId) ?? new Set();

      // 第一轮：按具体 bind 类型匹配（h1/h2/blockquote/list/...）
      const unconsumed: MdBlock[] = [];
      for (const block of blocks) {
        const slotEntry = findBindSlot(comp.slots, block.kind, block.level, explicit, auto);
        if (!slotEntry) {
          unconsumed.push(block);
          continue;
        }
        auto.add(slotEntry.name);
        const value = extractBlockValue(block);
        output.push({
          kind: 'Slot',
          name: slotEntry.name,
          raw: value,
          contentLoc: { ...block.loc },
          loc: { ...block.loc },
        });
      }

      // 第二轮：把所有"剩余块"喂给 bind='content' 的兜底 slot
      const contentSlot = findContentSlot(comp.slots, explicit, auto);
      if (contentSlot && unconsumed.length > 0) {
        auto.add(contentSlot.name);
        const fullRaw = source.slice(unconsumed[0]!.loc.start, unconsumed[unconsumed.length - 1]!.loc.end);
        const fullLoc = {
          start: unconsumed[0]!.loc.start,
          end: unconsumed[unconsumed.length - 1]!.loc.end,
          line: unconsumed[0]!.loc.line,
          col: unconsumed[0]!.loc.col,
        };
        output.push({
          kind: 'Slot',
          name: contentSlot.name,
          raw: fullRaw,
          contentLoc: fullLoc,
          loc: fullLoc,
        });
      }

      autoSlots.set(currentUseId, auto);
      output.push(node);
      continue;
    }

    // 其他节点（Compose / Layout / Theme / Group / GroupItem）原样保留
    output.push(node);
  }

  return output;
}

// ===== 绑定规则查找 =====

function findBindSlot(
  slots: Record<string, SlotDef>,
  blockKind: MdBlock['kind'],
  blockLevel: number,
  explicit: ReadonlySet<string>,
  auto: ReadonlySet<string>,
): { name: string; def: SlotDef } | null {
  for (const [name, def] of Object.entries(slots)) {
    if (!def.bind || def.bind === 'content') continue;
    if (explicit.has(name) || auto.has(name)) continue;
    if (matchBind(def.bind, blockKind, blockLevel)) {
      return { name, def };
    }
  }
  return null;
}

function findContentSlot(
  slots: Record<string, SlotDef>,
  explicit: ReadonlySet<string>,
  auto: ReadonlySet<string>,
): { name: string; def: SlotDef } | null {
  for (const [name, def] of Object.entries(slots)) {
    if (def.bind !== 'content') continue;
    if (explicit.has(name) || auto.has(name)) continue;
    return { name, def };
  }
  return null;
}

function matchBind(bind: SlotBindKind, kind: MdBlock['kind'], level: number): boolean {
  switch (bind) {
    case 'h1': return kind === 'heading' && level === 1;
    case 'h2': return kind === 'heading' && level === 2;
    case 'h3': return kind === 'heading' && level === 3;
    case 'blockquote': return kind === 'blockquote';
    case 'ul': return kind === 'ul-list';
    case 'ol': return kind === 'ol-list';
    case 'list': return kind === 'ul-list' || kind === 'ol-list';
    case 'code': return kind === 'fenced-code';
    case 'table': return kind === 'table';
    case 'paragraph': return kind === 'paragraph';
    case 'content': return false; // content 由 findContentSlot 单独处理
  }
}

// ===== 块 → slot 值 =====

function extractBlockValue(block: MdBlock): string {
  switch (block.kind) {
    case 'heading': {
      const m = block.raw.match(/^#{1,6}\s+(.+?)\s*#*\s*$/m);
      return m ? m[1]!.trim() : block.raw.trim();
    }
    case 'blockquote': {
      return block.raw
        .split('\n')
        .map(l => l.replace(/^\s*>\s?/, ''))
        .join('\n')
        .trim();
    }
    case 'fenced-code': {
      return block.raw.trim();
    }
    default:
      return block.raw.trim();
  }
}
