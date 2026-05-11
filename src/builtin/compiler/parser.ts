/**
 * Parser
 *
 * token 流 → Document AST
 *
 * 语法（伪 BNF，支持冒号式 + 属性式两种形态）：
 *   document        := top*
 *   top             := compose | page | layout | theme | use | slot | slot-multi | group | text
 *   compose         := COMPOSE                                  （仅第一个生效）
 *   page            := PAGE                                     （文档级配置，后续出现覆盖前者）
 *   layout/theme/use:= 单值指令
 *   slot            := SLOT_OPEN text* SLOT_CLOSE               （块级，可含 Markdown）
 *   slot-multi      := SLOT_MULTI                               （自闭合，一条指令一到多个 key=value slot）
 *   group           := GROUP_OPEN (item | text)* GROUP_CLOSE
 *   item            := ITEM_OPEN (slot | slot-multi | text)* ITEM_CLOSE
 *
 * 语义要点：
 *   - slot-multi 会展开成若干个 SlotNode（紧凑形态 = 块级形态的语法糖）
 *   - group / item 的属性式语法里，除了 positional 指定 id，其余 key=value 也作为 slot
 *     （例："@compose-group layout-grid-3 heading='Why'" → 隐含 slot heading=Why）
 */

import type {
  DocumentNode,
  GroupItemNode,
  GroupNode,
  SlotNode,
  SourceLoc,
  TopNode,
} from './ast';
import { Codes, DiagnosticBag } from './diagnostics';
import type { Token } from './lexer';
import type { ParsedAttrs } from './attr-parser';

export interface ParseResult {
  doc: DocumentNode;
  diagnostics: DiagnosticBag;
}

export function parse(source: string, tokens: Token[]): ParseResult {
  const diags = new DiagnosticBag();
  const children: TopNode[] = [];

  let i = 0;
  const peek = () => tokens[i];
  // 防御性总迭代上限
  const MAX_ITER = Math.max(1000, tokens.length * 2);
  let iter = 0;

  while (i < tokens.length) {
    if (++iter > MAX_ITER) break;
    const cursorBefore = i;
    const tk = peek()!;

    switch (tk.kind) {
      case 'compose': {
        const ids = tk.value.split(',').map(s => s.trim()).filter(Boolean);
        children.push({ kind: 'Compose', ids, loc: tk.loc });
        i++;
        break;
      }

      case 'page': {
        // page 指令不进 AST（由 page-config pre-pass 消化），把它当 text 放过
        // 这样 parseSections 按位置推进时也不会把 page 指令位置误当组件切分点
        i++;
        break;
      }

      case 'layout':
      case 'theme':
      case 'use': {
        if (!tk.value) {
          diags.error(Codes.EMPTY_DIRECTIVE_VALUE, `@${tk.kind} 缺少值`, tk.loc,
            `请写成 <!-- @${tk.kind}: <id> --> 或 <!-- @${tk.kind} <id> -->`);
          i++;
          break;
        }
        const node: TopNode = tk.kind === 'layout'
          ? { kind: 'Layout', id: tk.value, loc: tk.loc }
          : tk.kind === 'theme'
          ? { kind: 'Theme', id: tk.value, loc: tk.loc }
          : { kind: 'Use', id: tk.value, variant: tk.attrs?.attrs?.variant as string | undefined, loc: tk.loc };
        children.push(node);
        i++;
        break;
      }

      case 'slot-open': {
        const { node, nextIndex } = parseSlot(source, tokens, i, diags);
        children.push(node);
        i = nextIndex;
        break;
      }

      case 'group-open': {
        const { node, nextIndex } = parseGroup(source, tokens, i, diags);
        children.push(node);
        i = nextIndex;
        break;
      }

      case 'text': {
        children.push({ kind: 'Text', text: tk.value, loc: tk.loc });
        i++;
        break;
      }

      case 'slot-close':
      case 'group-close':
      case 'item-close':
        diags.warn(Codes.ITEM_OUTSIDE_GROUP,
          `意外的闭合标签 <!-- @/${tk.kind.replace('-close', '')} -->`, tk.loc);
        i++;
        break;

      case 'item-open':
        diags.warn(Codes.ITEM_OUTSIDE_GROUP,
          `@item 只能出现在 @compose-group 内`, tk.loc,
          `用 <!-- @compose-group ... --> 包起来`);
        i++;
        break;

      default:
        i++;
    }
    // 全局兜底：游标必须前进
    if (i === cursorBefore) i = cursorBefore + 1;
  }

  const composeNodes = children.filter(c => c.kind === 'Compose') as { ids: string[]; loc: SourceLoc }[];
  if (composeNodes.length > 1) {
    for (let k = 1; k < composeNodes.length; k++) {
      diags.warn(Codes.DUPLICATE_COMPOSE, `@compose 指令重复出现，仅第一个生效`, composeNodes[k]!.loc);
    }
  }
  const composeIds = composeNodes[0]?.ids ?? [];

  return {
    doc: {
      kind: 'Document',
      children,
      composeIds,
      sourceLength: source.length,
      loc: { start: 0, end: source.length, line: 1, col: 1 },
    },
    diagnostics: diags,
  };
}

// ===== 子解析器 =====

function parseSlot(
  source: string,
  tokens: Token[],
  startIdx: number,
  diags: DiagnosticBag,
): { node: SlotNode; nextIndex: number } {
  const openTok = tokens[startIdx]!;
  const name = openTok.value;

  let j = startIdx + 1;
  const contentStart = openTok.loc.end;
  let contentEnd = openTok.loc.end;

  while (j < tokens.length) {
    const t = tokens[j]!;
    if (t.kind === 'slot-close') {
      contentEnd = t.loc.start;
      const raw = source.slice(contentStart, contentEnd);
      return {
        node: {
          kind: 'Slot',
          name,
          raw,
          contentLoc: { start: contentStart, end: contentEnd, line: openTok.loc.line, col: openTok.loc.col },
          loc: { start: openTok.loc.start, end: t.loc.end, line: openTok.loc.line, col: openTok.loc.col },
        },
        nextIndex: j + 1,
      };
    }
    j++;
  }

  const raw = source.slice(contentStart);
  diags.error(Codes.UNCLOSED_SLOT, `@slot:${name} 未闭合`, openTok.loc,
    `补上 <!-- @/slot -->`);
  return {
    node: {
      kind: 'Slot',
      name,
      raw,
      contentLoc: { start: contentStart, end: source.length, line: openTok.loc.line, col: openTok.loc.col },
      loc: { start: openTok.loc.start, end: source.length, line: openTok.loc.line, col: openTok.loc.col },
    },
    nextIndex: tokens.length,
  };
}

function parseGroup(
  source: string,
  tokens: Token[],
  startIdx: number,
  diags: DiagnosticBag,
): { node: GroupNode; nextIndex: number } {
  const openTok = tokens[startIdx]!;
  const layoutId = openTok.value;
  const items: GroupItemNode[] = [];

  // 属性式 group 可能带额外 slot 属性（如 heading）
  // 这些属性不展开到顶层（group 自身的 slot），而是由 resolver 读取
  // —— 简化起见，当前先把它们视为隐含的 slot 附加到第一个 item 上面；
  //    更正式的做法是让 GroupNode 带自己的 slots（未来扩展）
  // 目前：忽略 group 层属性（除 layout positional 外），只支持 item 层

  let j = startIdx + 1;
  while (j < tokens.length) {
    const t = tokens[j]!;
    if (t.kind === 'group-close') {
      return {
        node: {
          kind: 'Group',
          layoutId,
          items,
          loc: { start: openTok.loc.start, end: t.loc.end, line: openTok.loc.line, col: openTok.loc.col },
        },
        nextIndex: j + 1,
      };
    }
    if (t.kind === 'item-open') {
      const { node, nextIndex } = parseItem(source, tokens, j, diags);
      items.push(node);
      j = nextIndex;
      continue;
    }
    j++;
  }

  diags.error(Codes.UNCLOSED_GROUP, `@compose-group: ${layoutId} 未闭合`, openTok.loc,
    `补上 <!-- @/compose-group -->`);
  return {
    node: {
      kind: 'Group',
      layoutId,
      items,
      loc: { start: openTok.loc.start, end: source.length, line: openTok.loc.line, col: openTok.loc.col },
    },
    nextIndex: tokens.length,
  };
}

function parseItem(
  source: string,
  tokens: Token[],
  startIdx: number,
  diags: DiagnosticBag,
): { node: GroupItemNode; nextIndex: number } {
  const openTok = tokens[startIdx]!;
  const childId = openTok.value;
  const slots: SlotNode[] = [];
  const rawStart = openTok.loc.end;

  // 提取 variant 属性并从 attrs 中移除，避免被 expandAttrsToSlots 当成 slot
  let variant: string | undefined;
  if (openTok.attrs?.attrs?.variant) {
    variant = openTok.attrs.attrs.variant;
    delete openTok.attrs.attrs.variant;
  }

  // 属性式 item：@item feature-card cardTitle="X" cardBody="Y"
  //   除 positional 外的所有 attrs 展开为 slot
  if (openTok.attrs) {
    for (const slotNode of expandAttrsToSlots(openTok.loc, openTok.attrs, childId)) {
      slots.push(slotNode);
    }
  }

  let j = startIdx + 1;
  while (j < tokens.length) {
    const t = tokens[j]!;
    if (t.kind === 'item-close') {
      const raw = source.slice(rawStart, t.loc.start);
      return {
        node: {
          kind: 'GroupItem',
          childId,
          slots,
          raw,
          variant,
          loc: { start: openTok.loc.start, end: t.loc.end, line: openTok.loc.line, col: openTok.loc.col },
        },
        nextIndex: j + 1,
      };
    }
    if (t.kind === 'slot-open') {
      const { node, nextIndex } = parseSlot(source, tokens, j, diags);
      slots.push(node);
      j = nextIndex;
      continue;
    }
    j++;
  }

  diags.error(Codes.UNCLOSED_ITEM, `@item: ${childId} 未闭合`, openTok.loc,
    `补上 <!-- @/item -->`);
  const raw = source.slice(rawStart);
  return {
    node: {
      kind: 'GroupItem',
      childId,
      slots,
      raw,
      variant,
      loc: { start: openTok.loc.start, end: source.length, line: openTok.loc.line, col: openTok.loc.col },
    },
    nextIndex: tokens.length,
  };
}

// ===== 工具：属性式 → SlotNode[] =====

/**
 * 为带 attrs 的 @item/@compose-group 把非 positional 的键值对展开为 slot
 * （用于 @item 简写，如 @item feature-card cardIcon=zap）
 */
function expandAttrsToSlots(loc: SourceLoc, attrs: ParsedAttrs, positional: string): SlotNode[] {
  const out: SlotNode[] = [];
  for (const key of Object.keys(attrs.attrs)) {
    if (key === positional) continue;
    const val = attrs.attrs[key] ?? '';
    if (!val) continue;
    out.push(makeAttrSlot(key, val, loc));
  }
  return out;
}

function makeAttrSlot(name: string, value: string, loc: SourceLoc): SlotNode {
  return {
    kind: 'Slot',
    name,
    raw: value,
    contentLoc: { ...loc },
    loc,
  };
}
