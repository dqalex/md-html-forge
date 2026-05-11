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
  GroupItemNode,
  GroupNode,
  TopNode,
} from './ast';
import type { ComponentDef } from '../types';
import type { SlotDef, SlotBindKind } from '@/lib/markdown-slots/types';
import { scanMdBlocks, type MdBlock } from './md-blocks';

/**
 * 遍历 AST 顶层 children，为每段插入由 MD 原生语法自动吸收出来的 SlotNode。
 * 返回新的 Document（原数组不变）。
 *
 * 跨段绑定：@theme/@layout 切段后，新段继承上一段的 @use 上下文和已绑定 slot 集合，
 * 让裸 MD 块可以跨段继续绑定到同个组件。
 */
export function bindNativeMd(
  doc: DocumentNode,
  source: string,
  componentMap: Map<string, ComponentDef>,
): DocumentNode {
  const segments: Segment[] = splitSegments(doc.children);
  const newChildren: TopNode[] = [];

  // 跨段携带状态
  let carryUseId: string | null = null;
  let carryUseKey: string | null = null;
  let carryExplicit = new Map<string, Set<string>>();
  let carryAuto = new Map<string, Set<string>>();
  let carryCounter = 0;

  for (const seg of segments) {
    const result = bindSegment(seg, source, componentMap, carryUseId, carryUseKey, carryExplicit, carryAuto, carryCounter);
    newChildren.push(...result.output);
    carryUseId = result.carryUseId;
    carryUseKey = result.carryUseKey;
    carryExplicit = result.carryExplicit;
    carryAuto = result.carryAuto;
    carryCounter = result.carryCounter;
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

interface SegmentBindResult {
  output: TopNode[];
  /** 段末的 @use 上下文（供下一段继承） */
  carryUseId: string | null;
  carryUseKey: string | null;
  carryExplicit: Map<string, Set<string>>;
  carryAuto: Map<string, Set<string>>;
  carryCounter: number;
}

function bindSegment(
  seg: Segment,
  source: string,
  componentMap: Map<string, ComponentDef>,
  /** 从上一段继承的 @use 上下文 */
  inheritedUseId: string | null,
  inheritedUseKey: string | null,
  inheritedExplicit: Map<string, Set<string>>,
  inheritedAuto: Map<string, Set<string>>,
  inheritedCounter: number,
): SegmentBindResult {
  const output: TopNode[] = [];

  // 段内状态：从继承值初始化
  let currentUseId = inheritedUseId;
  let currentUseKey = inheritedUseKey;
  let useCounter = inheritedCounter;
  /** 每个 use-instance 已被手动提供的 slot 名（继承上一段的） */
  const explicitSlots = new Map(inheritedExplicit);
  /** 每个 use-instance 已被自动绑定的 slot 名（继承上一段的） */
  const autoSlots = new Map(inheritedAuto);

  const markExplicit = (useKey: string, slotName: string) => {
    if (!explicitSlots.has(useKey)) explicitSlots.set(useKey, new Set());
    explicitSlots.get(useKey)!.add(slotName);
  };

  // 先扫一遍，预先收集所有显式 slot 名（按 use-instance 区分）
  let preUseKey = inheritedUseKey;
  let preCounter = inheritedCounter;
  for (const node of seg.nodes) {
    if (node.kind === 'Slot' && preUseKey) {
      markExplicit(preUseKey, node.name);
    }
    if (node.kind === 'Use') {
      preUseKey = `${node.id}#${++preCounter}`;
    }
  }
  // 重置线性游标（保留继承的初始状态）
  currentUseId = inheritedUseId;
  currentUseKey = inheritedUseKey;
  useCounter = inheritedCounter;

  // Step: 线性遍历，把 Text 节点的 raw 扫成 MdBlock，按 bind 规则分配给当前 @use 的组件
  for (let i = 0; i < seg.nodes.length; i++) {
    const node = seg.nodes[i]!;

    if (node.kind === 'Use') {
      currentUseId = node.id;
      currentUseKey = `${node.id}#${++useCounter}`;
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
      if (!currentUseId || !currentUseKey || blocks.length === 0) {
        output.push(node);
        continue;
      }

      const comp = componentMap.get(currentUseId);
      if (!comp) {
        output.push(node);
        continue;
      }

      const explicit = explicitSlots.get(currentUseKey) ?? new Set();
      const auto = autoSlots.get(currentUseKey) ?? new Set();

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

      // 第二轮：把所有"剩余块"喂给 bind='content' 的兜底 slot（支持多个 content slot）
      const contentSlots = findAllContentSlots(comp.slots, explicit, auto);
      if (contentSlots.length > 0 && unconsumed.length > 0) {
        if (contentSlots.length === 1) {
          // 单 content slot：合并所有剩余块（向后兼容）
          const slot = contentSlots[0]!;
          auto.add(slot.name);
          const fullRaw = source.slice(unconsumed[0]!.loc.start, unconsumed[unconsumed.length - 1]!.loc.end);
          const fullLoc = {
            start: unconsumed[0]!.loc.start,
            end: unconsumed[unconsumed.length - 1]!.loc.end,
            line: unconsumed[0]!.loc.line,
            col: unconsumed[0]!.loc.col,
          };
          output.push({
            kind: 'Slot',
            name: slot.name,
            raw: fullRaw,
            contentLoc: fullLoc,
            loc: fullLoc,
          });
        } else {
          // 多 content slot：按位置顺序分配
          // blocks <= slots: 每个 slot 拿一个 block，多余 slot 空
          // blocks > slots: 前 N-1 个 slot 各拿一个，最后一个吃剩余所有
          for (let si = 0; si < contentSlots.length; si++) {
            const slot = contentSlots[si]!;
            auto.add(slot.name);
            if (si < unconsumed.length - 1 && si < contentSlots.length - 1) {
              // 非最后一个 slot，且还有足够 block：拿一个 block
              const block = unconsumed[si]!;
              const value = extractBlockValue(block);
              output.push({
                kind: 'Slot',
                name: slot.name,
                raw: value,
                contentLoc: { ...block.loc },
                loc: { ...block.loc },
              });
            } else if (si < unconsumed.length) {
              // 最后一个 content slot 或剩余 block 不够分：吃所有剩余 block
              const fromIdx = Math.min(si, unconsumed.length - 1);
              const toIdx = unconsumed.length - 1;
              const fullRaw = source.slice(unconsumed[fromIdx]!.loc.start, unconsumed[toIdx]!.loc.end);
              const fullLoc = {
                start: unconsumed[fromIdx]!.loc.start,
                end: unconsumed[toIdx]!.loc.end,
                line: unconsumed[fromIdx]!.loc.line,
                col: unconsumed[fromIdx]!.loc.col,
              };
              output.push({
                kind: 'Slot',
                name: slot.name,
                raw: fullRaw,
                contentLoc: fullLoc,
                loc: fullLoc,
              });
            }
            // 如果 si >= unconsumed.length：多余 slot 留空（不输出 SlotNode）
          }
        }
      }

      autoSlots.set(currentUseKey, auto);
      output.push(node);
      continue;
    }

    // 其他节点（Compose / Layout / Theme）原样保留
    // Group 节点：对内部 @item 做裸 MD 自动绑定
    if (node.kind === 'Group') {
      output.push(bindGroup(node, source, componentMap));
      continue;
    }

    output.push(node);
  }

  return {
    output,
    carryUseId: currentUseId,
    carryUseKey: currentUseKey,
    carryExplicit: explicitSlots,
    carryAuto: autoSlots,
    carryCounter: useCounter,
  };
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

function findAllContentSlots(
  slots: Record<string, SlotDef>,
  explicit: ReadonlySet<string>,
  auto: ReadonlySet<string>,
): { name: string; def: SlotDef }[] {
  const result: { name: string; def: SlotDef }[] = [];
  for (const [name, def] of Object.entries(slots)) {
    if (def.bind !== 'content') continue;
    if (explicit.has(name) || auto.has(name)) continue;
    result.push({ name, def });
  }
  return result;
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

// ===== @item 块内 md-binding =====

/** 对 Group 内每个 item 执行裸 MD → slot 自动绑定 */
function bindGroup(
  group: GroupNode,
  source: string,
  componentMap: Map<string, ComponentDef>,
): GroupNode {
  const newItems = group.items.map(item => bindItemContent(item, source, componentMap));
  if (newItems === group.items) return group;
  return { ...group, items: newItems };
}

/**
 * 对单个 @item 块内的裸 MD 执行自动绑定。
 *
 * 步骤：
 * 1. 收集该 item 内所有显式 slot 的源码区间
 * 2. 从 item 源码范围中剔除显式 slot 占用的区间，得到"空闲"区间
 * 3. 对空闲区间跑 scanMdBlocks
 * 4. 用子组件的 slot.bind 规则自动绑定
 */
function bindItemContent(
  item: GroupItemNode,
  source: string,
  componentMap: Map<string, ComponentDef>,
): GroupItemNode {
  const comp = componentMap.get(item.childId);
  if (!comp) return item;

  // 收集显式 slot 的源码区间
  const explicitRanges: Array<{ start: number; end: number }> = [];
  for (const slot of item.slots) {
    explicitRanges.push({ start: slot.contentLoc.start, end: slot.contentLoc.end });
  }
  explicitRanges.sort((a, b) => a.start - b.start);

  // 计算 item 内未被显式 slot 占用的空闲区间
  const itemStart = item.loc.start;
  const itemEnd = item.loc.end;
  const freeRanges: Array<{ start: number; end: number }> = [];
  let cursor = itemStart;
  for (const range of explicitRanges) {
    if (range.start > cursor) {
      freeRanges.push({ start: cursor, end: range.start });
    }
    cursor = Math.max(cursor, range.end);
  }
  if (cursor < itemEnd) {
    freeRanges.push({ start: cursor, end: itemEnd });
  }

  if (freeRanges.length === 0) return item;

  // 在空闲区间内扫描 MD 块
  const allBlocks: MdBlock[] = [];
  for (const range of freeRanges) {
    const blocks = scanMdBlocks(source, range.start, range.end);
    allBlocks.push(...blocks);
  }

  if (allBlocks.length === 0) return item;

  // 构建显式/自动 slot 名集合
  const explicitSlotNames = new Set(item.slots.map(s => s.name));
  const autoSlotNames = new Set<string>();
  const newSlots: Array<{ kind: 'Slot'; name: string; raw: string; contentLoc: typeof item.loc; loc: typeof item.loc }> = [];

  // 第一轮：按具体 bind 类型匹配
  const unconsumed: MdBlock[] = [];
  for (const block of allBlocks) {
    const slotEntry = findBindSlot(comp.slots, block.kind, block.level, explicitSlotNames, autoSlotNames);
    if (!slotEntry) {
      unconsumed.push(block);
      continue;
    }
    autoSlotNames.add(slotEntry.name);
    newSlots.push({
      kind: 'Slot',
      name: slotEntry.name,
      raw: extractBlockValue(block),
      contentLoc: { ...block.loc },
      loc: { ...block.loc },
    });
  }

  // 第二轮：剩余块 → content slot
  const contentSlots = findAllContentSlots(comp.slots, explicitSlotNames, autoSlotNames);
  if (contentSlots.length > 0 && unconsumed.length > 0) {
    if (contentSlots.length === 1) {
      const slot = contentSlots[0]!;
      autoSlotNames.add(slot.name);
      const fullRaw = source.slice(unconsumed[0]!.loc.start, unconsumed[unconsumed.length - 1]!.loc.end);
      const fullLoc = {
        start: unconsumed[0]!.loc.start,
        end: unconsumed[unconsumed.length - 1]!.loc.end,
        line: unconsumed[0]!.loc.line,
        col: unconsumed[0]!.loc.col,
      };
      newSlots.push({
        kind: 'Slot',
        name: slot.name,
        raw: fullRaw,
        contentLoc: fullLoc,
        loc: fullLoc,
      });
    } else {
      for (let si = 0; si < contentSlots.length; si++) {
        const slot = contentSlots[si]!;
        autoSlotNames.add(slot.name);
        if (si < unconsumed.length - 1 && si < contentSlots.length - 1) {
          const block = unconsumed[si]!;
          newSlots.push({
            kind: 'Slot',
            name: slot.name,
            raw: extractBlockValue(block),
            contentLoc: { ...block.loc },
            loc: { ...block.loc },
          });
        } else if (si < unconsumed.length) {
          const fromIdx = Math.min(si, unconsumed.length - 1);
          const toIdx = unconsumed.length - 1;
          const fullRaw = source.slice(unconsumed[fromIdx]!.loc.start, unconsumed[toIdx]!.loc.end);
          const fullLoc = {
            start: unconsumed[fromIdx]!.loc.start,
            end: unconsumed[toIdx]!.loc.end,
            line: unconsumed[fromIdx]!.loc.line,
            col: unconsumed[fromIdx]!.loc.col,
          };
          newSlots.push({
            kind: 'Slot',
            name: slot.name,
            raw: fullRaw,
            contentLoc: fullLoc,
            loc: fullLoc,
          });
        }
      }
    }
  }

  if (newSlots.length === 0) return item;

  // 合并显式 slot + 自动绑定 slot，保持顺序：显式在前，自动追加
  return { ...item, slots: [...item.slots, ...newSlots] };
}
