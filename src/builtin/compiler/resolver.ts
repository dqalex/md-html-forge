/**
 * Resolver
 *
 * 输入：Document AST + 环境 (componentMap / themeMap / layoutMap)
 * 输出：SectionPlan[] —— 扁平化的"渲染计划"，供 Emitter 直接拼 HTML
 *
 * 负责：
 *   1. 段切割：遍历 AST 节点，按 @layout / @theme 切段
 *   2. 组件归属：slot / @use / @group 把顶层 @compose 中的 id 归入当前段
 *   3. Slot 聚合：同一段内把所有 slot 值按 name 聚合为 { [name]: raw[] }
 *   4. Group 归属：按位置将 group 归入对应 section
 *   5. 未解析项诊断（未知组件 / 未知布局 / 未知主题 / 孤儿 slot）
 *
 * Resolver 只做"逻辑推理"，完全不碰 HTML 字符串。
 */

import type {
  DocumentNode,
  GroupItemNode,
  GroupNode,
  SlotNode,
  TopNode,
} from './ast';
import { Codes, DiagnosticBag } from './diagnostics';
import type { ComponentDef } from '../types';
import type { ThemeDef } from '../themes/types';

// ===== 输出形状 =====

/** 渲染一个"普通组件"需要的所有信息 */
export interface ComponentPlan {
  componentId: string;
  /** { slotName: rawMd[] } —— 同名多次出现会变数组 */
  slotValues: Record<string, string[]>;
  /** { slotName: sourceLine }（首个出现的行号，用于点击定位） */
  slotLines?: Record<string, number>;
  /** 变体 id（由 @use comp variant=xxx 指定） */
  variant?: string;
  /** @use 指令所在行号（用于选中后修改 variant 等属性） */
  useLine?: number;
}

/** 渲染一个"显式 group"需要的信息（对应 @compose-group 块） */
export interface GroupPlan {
  layoutId: string;
  items: {
    childId: string;
    slotValues: Record<string, string[]>;
    slotLines?: Record<string, number>;
    variant?: string;
  }[];
  sectionIndex: number;
}

export interface SectionPlan {
  layoutId: string;
  themeId: string;
  /** 段内要渲染的组件（按 @compose 顺序） */
  components: ComponentPlan[];
  /** 段内要渲染的 group（按出现顺序，组件之间穿插；简化版：先渲染完所有组件，再渲染 groups） */
  groups: GroupPlan[];
}

export interface ResolveResult {
  sections: SectionPlan[];
  /** 顶层 @compose 中声明但查不到的 id */
  unresolvedComponentIds: string[];
  /** @slot 出现但没有任何组件声明 → 孤儿 */
  orphanSlotValues: Record<string, string[]>;
  /** 实际用到的主题 id（含默认） */
  usedThemeIds: string[];
  /** 没有任何 @use 上下文的裸 Markdown 文本（raw 内容，待兜底渲染） */
  freeText: string[];
}

export interface ResolveEnv {
  componentMap: Map<string, ComponentDef>;
  themeMap: Map<string, ThemeDef>;
  /** 默认主题 id（当段没写 @theme 时使用） */
  defaultThemeId: string;
  /** 默认布局 id（当段没写 @layout 时使用） */
  defaultLayoutId: string;
}

// ===== 主入口 =====

export function resolve(
  doc: DocumentNode,
  env: ResolveEnv,
  diags: DiagnosticBag,
): ResolveResult {
  const composeIds = doc.composeIds;
  const composeSet = new Set(composeIds);

  // 诊断：未知组件
  const unresolvedComponentIds: string[] = [];
  for (const id of composeIds) {
    if (!env.componentMap.has(id)) {
      unresolvedComponentIds.push(id);
      diags.warn(Codes.UNKNOWN_COMPONENT,
        `组件 "${id}" 不存在（已在 @compose 中声明但未注册）`, undefined,
        `在 @compose 列表里删掉它，或实现并注册该组件`);
    }
  }

  // slot → component 反查（第一个声明 slot 名的组件拥有它）
  const slotOwner = new Map<string, string>();
  for (const id of composeIds) {
    const comp = env.componentMap.get(id);
    if (!comp) continue;
    for (const slotName of Object.keys(comp.slots)) {
      if (!slotOwner.has(slotName)) slotOwner.set(slotName, id);
    }
  }

  // 段游标
  const sections: SectionPlan[] = [];
  let curLayout = env.defaultLayoutId;
  let curTheme = env.defaultThemeId;
  let curIndex = -1; // 当前段在 sections 数组中的索引
  const consumed = new Set<string>();
  const componentPlans = new Map<string, ComponentPlan>(); // compId → plan（该段内）
  // 当前 @use 上下文：决定无主 @slot 默认归属于哪个组件实例。
  // 段切换 / 显式 group 时需要清空，避免跨段错挂。
  let currentUseId: string | null = null;
  let currentUseVariant: string | undefined;
  /** 当前 @use 触发新建的独立 plan，slot 直接写到这里（避免被同 id 旧 plan 吞合并） */
  let currentUsePlan: ComponentPlan | null = null;

  /** 确保当前段存在，若是第一次归入组件/group 才真正开段 */
  const ensureSection = (): number => {
    if (curIndex < 0 || sections[curIndex]!.layoutId !== curLayout || sections[curIndex]!.themeId !== curTheme) {
      sections.push({ layoutId: curLayout, themeId: curTheme, components: [], groups: [] });
      curIndex = sections.length - 1;
      componentPlans.clear();
    }
    return curIndex;
  };

  /** 切段：下一次 ensureSection 会新建 */
  const breakSection = () => {
    curIndex = -1;
    componentPlans.clear();
    currentUseId = null;
    currentUseVariant = undefined;
    currentUsePlan = null;
  };

  /** 把 id 归入当前段（第一次出现才加入 components）— 用于裸 @slot 找到首个声明该 slot 的组件 */
  const pushComponent = (id: string, variant?: string, useLine?: number): ComponentPlan | undefined => {
    if (!composeSet.has(id)) return;
    if (!env.componentMap.has(id)) return;
    ensureSection();
    const key = variant ? `${id}#${variant}` : id;
    let plan = componentPlans.get(key);
    if (!plan) {
      plan = { componentId: id, slotValues: {}, variant, useLine };
      componentPlans.set(key, plan);
      sections[curIndex]!.components.push(plan);
      consumed.add(id);
    } else if (useLine !== undefined && plan.useLine === undefined) {
      plan.useLine = useLine;
    }
    return plan;
  };

  /** 显式 @use 触发：每次都建立独立组件实例（同 id+variant 多次 @use → 多个 section 块） */
  const forkUseInstance = (id: string, variant?: string, useLine?: number): ComponentPlan | undefined => {
    if (!composeSet.has(id)) return;
    if (!env.componentMap.has(id)) return;
    ensureSection();
    const plan: ComponentPlan = { componentId: id, slotValues: {}, variant, useLine };
    sections[curIndex]!.components.push(plan);
    consumed.add(id);
    // 同时让 componentPlans 指向最新实例，使后续裸 @slot（无 currentUsePlan 时）也走它
    const key = variant ? `${id}#${variant}` : id;
    componentPlans.set(key, plan);
    return plan;
  };

  // 孤儿 slot：不属于任何组件的 slot 值累积到这里
  const orphanSlotValues: Record<string, string[]> = {};
  // 裸 Text：没有任何 @use 上下文的 markdown 内容
  const freeText: string[] = [];

  // ===== 按 AST 节点顺序走 =====

  for (const child of doc.children) {
    switch (child.kind) {
      case 'Compose':
        // 顶层 @compose → 不影响段结构
        break;
      case 'Text':
        // 没有 @use 上下文的裸 Markdown → 收集为兜底内容
        if (!currentUseId && child.text?.trim()) {
          freeText.push(child.text.trim());
        }
        break;

      case 'Layout': {
        if (!env.componentMap.get(child.id) && child.id !== 'stack') {
          diags.warn(Codes.UNKNOWN_LAYOUT, `布局 "${child.id}" 未注册`, child.loc,
            `用 stack / layout-grid-2/3/4 / layout-flex-row 之一`);
        }
        curLayout = child.id;
        breakSection();
        break;
      }

      case 'Theme': {
        if (!env.themeMap.has(child.id)) {
          diags.warn(Codes.UNKNOWN_THEME, `主题 "${child.id}" 未注册`, child.loc,
            `已注册：${Array.from(env.themeMap.keys()).join(', ')}`);
        }
        curTheme = child.id;
        breakSection();
        break;
      }

      case 'Use': {
        const plan = forkUseInstance(child.id, child.variant, child.loc.line);
        // 设置当前 use 上下文：之后未匹配的 @slot 优先归到这个新实例
        currentUseId = child.id;
        currentUseVariant = child.variant;
        currentUsePlan = plan ?? null;
        break;
      }

      case 'Slot': {
        // 解析 slot 归属：当前 @use 上下文优先 + 通用名→前缀名别名匹配
        let targetPlan: ComponentPlan | undefined;
        let resolvedSlotName = child.name;

        if (currentUsePlan && currentUseId) {
          const useComp = env.componentMap.get(currentUseId);
          if (useComp) {
            // 1) 直接命中：组件 slot 表里有该名
            if (Object.prototype.hasOwnProperty.call(useComp.slots, child.name)) {
              targetPlan = currentUsePlan;
            } else {
              // 2) 前缀别名：用户写 `heading`，组件声明 `<id>Heading` → 视为同一 slot
              //    适用于 highlights/actions/table/checklist/timeline/qa 等命名规范统一的组件
              const aliased = `${currentUseId}${child.name.charAt(0).toUpperCase()}${child.name.slice(1)}`;
              if (Object.prototype.hasOwnProperty.call(useComp.slots, aliased)) {
                targetPlan = currentUsePlan;
                resolvedSlotName = aliased;
              }
            }
          }
        }

        // 3) 回落：全局 slotOwner（首个声明该 slot 名的组件）
        if (!targetPlan) {
          const owner = slotOwner.get(child.name);
          if (owner) targetPlan = pushComponent(owner);
        }

        if (targetPlan) {
          (targetPlan.slotValues[resolvedSlotName] ??= []).push(child.raw);
          (targetPlan.slotLines ??= {})[resolvedSlotName] ??= child.loc.line;
        } else {
          // 没有组件声明该 slot 名 → 孤儿
          (orphanSlotValues[child.name] ??= []).push(child.raw);
          diags.info(Codes.ORPHAN_SLOT,
            `@slot:${child.name} 没有对应组件`, child.loc,
            `检查 @compose 中是否包含声明了该 slot 的组件`);
        }
        break;
      }

      case 'Group': {
        // group 自带 layout 上下文，外部 use 不应跨入
        currentUseId = null;
        currentUseVariant = undefined;
        currentUsePlan = null;
        handleGroup(child, env, diags, ensureSection, sections, pushComponent, composeSet, consumed);
        break;
      }
    }
  }

  // 兜底：@compose 里没被任何 slot/use/group 触发的组件，塞到最后一段
  const remaining = composeIds.filter(id => !consumed.has(id) && env.componentMap.has(id));
  if (remaining.length > 0) {
    ensureSection();
    for (const id of remaining) {
      const plan: ComponentPlan = { componentId: id, slotValues: {} };
      sections[curIndex]!.components.push(plan);
      consumed.add(id);
    }
  }

  // 整个文档没任何事件 & @compose 有内容 → 单段全塞
  if (sections.length === 0 && composeIds.length > 0) {
    const plans: ComponentPlan[] = composeIds
      .filter(id => env.componentMap.has(id))
      .map(id => ({ componentId: id, slotValues: {} }));
    if (plans.length > 0) {
      sections.push({
        layoutId: env.defaultLayoutId,
        themeId: env.defaultThemeId,
        components: plans,
        groups: [],
      });
    }
  }

  // 记录用到的主题
  const usedThemeIds = new Set<string>();
  for (const s of sections) {
    if (env.themeMap.has(s.themeId)) usedThemeIds.add(s.themeId);
  }
  usedThemeIds.add(env.defaultThemeId);

  return {
    sections,
    unresolvedComponentIds,
    orphanSlotValues,
    usedThemeIds: Array.from(usedThemeIds),
    freeText,
  };
}

// ===== Group 处理 =====

function handleGroup(
  group: GroupNode,
  env: ResolveEnv,
  diags: DiagnosticBag,
  ensureSection: () => number,
  sections: SectionPlan[],
  pushComponent: (id: string) => ComponentPlan | undefined,
  composeSet: Set<string>,
  consumed: Set<string>,
): void {
  const layoutComp = env.componentMap.get(group.layoutId);
  if (!layoutComp || !layoutComp.isLayout) {
    diags.warn(Codes.UNKNOWN_LAYOUT,
      `@compose-group 引用的布局 "${group.layoutId}" 不是布局组件`, group.loc);
  }

  // 先把 layout 组件本身归入当前段（如果 @compose 里声明了它）
  if (composeSet.has(group.layoutId)) {
    pushComponent(group.layoutId);
  } else {
    // @compose 没声明该 layout，仍尝试渲染（兼容用户只写 @compose-group 不写 @compose 的场景）
    ensureSection();
  }

  // 标记 group item 内用到的 childId 为 consumed，避免"兜底实例化"在 group 外再渲染一份空组件
  for (const item of group.items) {
    if (composeSet.has(item.childId)) {
      consumed.add(item.childId);
    }
  }

  // 收集子项 slot 值
  const items = group.items.map(item => buildItemPlan(item));
  const sectionIndex = ensureSection();
  sections[sectionIndex]!.groups.push({
    layoutId: group.layoutId,
    items,
    sectionIndex,
  });
}

function buildItemPlan(item: GroupItemNode): {
  childId: string;
  slotValues: Record<string, string[]>;
  slotLines: Record<string, number>;
  variant?: string;
} {
  const slotValues: Record<string, string[]> = {};
  const slotLines: Record<string, number> = {};
  for (const slot of item.slots) {
    (slotValues[slot.name] ??= []).push(slot.raw);
    slotLines[slot.name] ??= slot.loc.line;
  }
  return { childId: item.childId, slotValues, slotLines, variant: item.variant };
}
