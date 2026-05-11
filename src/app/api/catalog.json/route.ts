import { NextResponse } from 'next/server';
import '@/builtin/bootstrap-data-only';
import {
  FORGE_COMPONENTS,
  FORGE_SAMPLES,
  FORGE_RUNTIME_SCRIPTS,
} from '@/builtin/components/forge-registry';
import { forgeRegistry } from '@/builtin/compiler/registry';
import type { ComponentDef } from '@/builtin/types';
import type { ThemeDef } from '@/builtin/themes/types';

/**
 * /api/catalog.json
 *
 * Agent 程序化消费端点（MCP / ChatGPT Actions / 自建 retrieval 都可以用）。
 *
 * 与 /llms.txt（纯文本）互补：
 *   - /llms.txt 给"通用 LLM 爬虫 / copilot"读（无结构）
 *   - /api/catalog.json 给"程序 / agent tool"读（强结构，容易 embedding）
 *
 * 内容范围（全量，对应产品选项 Q3=C）：
 *   - directives：7 个 forge 指令
 *   - components：所有内置组件（含 variants / slots / sample / whenToUse 等）
 *   - themes：所有注册的主题
 *   - layouts：所有布局容器组件
 *   - runtime：组件交互 API 形状（mount / api.state 等）
 *   - errors：AI 生成模板时的常见错误 + 修正
 */

type SlotInfo = {
  name: string;
  label: string;
  type: string;
  description?: string;
  bind?: string;
  placeholder?: string;
};

type VariantInfo = {
  id: string;
  description?: string;
  isDefault: boolean;
};

type CatalogComponent = {
  id: string;
  name: string;
  category: string;
  tags?: string[];
  description?: string;
  isLayout: boolean;
  hasMount: boolean;
  defaultVariant?: string;
  variants: VariantInfo[];
  slots: SlotInfo[];
  keySlots?: string[];
  whenToUse?: string[];
  whenNot?: string[];
  /** ## Sample 原文（forge markdown），用于 few-shot 模板 */
  sample?: string;
};

type CatalogTheme = {
  id: string;
  name: string;
  description?: string;
  bandStyle?: string;
};

type CatalogDirective = {
  name: string;
  syntax: string;
  scope: 'document' | 'segment' | 'component' | 'group';
  description: string;
  example: string;
  cardinality: string;
};

const DIRECTIVES: CatalogDirective[] = [
  {
    name: '@page',
    syntax: '<!-- @page width=narrow|default|wide|xwide bandStyle=contained|full-bleed -->',
    scope: 'document',
    cardinality: '至多 1',
    description: '文档级页面配置：页宽、band 样式。',
    example: '<!-- @page narrow -->',
  },
  {
    name: '@compose',
    syntax: '<!-- @compose: id1, id2, ... -->',
    scope: 'document',
    cardinality: '至多 1 · 必填（要用任何组件都得先声明）',
    description: '声明本文档用到的组件清单。不在清单里的 @use 会被忽略。',
    example: '<!-- @compose: header, lead, metric, callout, table, footer -->',
  },
  {
    name: '@theme',
    syntax: '<!-- @theme <theme-id> -->',
    scope: 'segment',
    cardinality: '任意次',
    description: '切换当前段主题；作用到下一次 @theme 之前。不中断 @use 的 MD 块捕获（跨段绑定已修复）。',
    example: '<!-- @theme dark -->',
  },
  {
    name: '@layout',
    syntax: '<!-- @layout <layout-id> -->',
    scope: 'segment',
    cardinality: '任意次',
    description: '切换当前段的布局容器（grid-2 / grid-3 / grid-4 / flex-row / stack）。',
    example: '<!-- @layout grid-3 -->',
  },
  {
    name: '@use',
    syntax: '<!-- @use <component-id> [variant=<v>] -->',
    scope: 'segment',
    cardinality: '任意次',
    description: '开一个组件实例，后续原生 MD 块按该组件 slot 的 bind 规则自动绑定；同 id 多次 @use 会得到多个独立实例。',
    example: '<!-- @use metric variant=band -->',
  },
  {
    name: '@slot',
    syntax: '<!-- @slot:<slot-name> -->...<!-- @/slot -->',
    scope: 'component',
    cardinality: '任意次（优先级高于自动绑定）',
    description: '显式给 slot 填充内容，可跨多行、支持完整 Markdown。',
    example: '<!-- @slot:calloutTitle -->风险提示<!-- @/slot -->',
  },
  {
    name: '@compose-group / @item',
    syntax: '<!-- @compose-group: <layout-id> -->\n<!-- @item <comp-id> [variant=...] [slotName="..."] -->...<!-- @/item -->\n<!-- @/compose-group -->',
    scope: 'group',
    cardinality: '任意次',
    description: '循环布局：一个布局容器内重复 N 个同结构子项。@item 支持三种赋值：显式 @slot 块（优先）、属性式 slotName="value"、裸 MD 按子组件 bind 自动绑定（2026-05-11 起）。variant=xxx 会透传给子组件。',
    example: '<!-- @compose-group grid-4 -->\n<!-- @item card variant=stat statValue="30+" statLabel="组件" --><!-- @/item -->\n<!-- @/compose-group -->',
  },
];

const COMMON_ERRORS = [
  {
    id: 'fictional-slot',
    title: '虚构 slot 名',
    wrong: '<!-- @use faq-item -->\n<!-- @slot:q1 -->Q<!-- @/slot -->\n<!-- @slot:a1 -->A<!-- @/slot -->',
    right: '<!-- @use faq-item -->\n<!-- @slot:faqQ -->Q<!-- @/slot -->\n<!-- @slot:faqA -->A<!-- @/slot -->\n\n<!-- @use faq-item -->\n<!-- @slot:faqQ -->Q2<!-- @/slot -->\n<!-- @slot:faqA -->A2<!-- @/slot -->',
    hint: 'slot 名必须是目标组件声明的真实字段；多条记录用多次 @use 而不是编号。',
  },
  {
    id: 'compose-mismatch',
    title: '@compose 声明了没用的组件',
    wrong: '<!-- @compose: header, lead, code-block, footer -->  # 实际没用到 code-block',
    right: '<!-- @compose: header, lead, footer -->',
    hint: '@compose 列表必须精确匹配实际 @use 的组件集合；多余会被兜底实例化成空组件。',
  },
  {
    id: 'bind-mismatch',
    title: 'bind 不匹配导致内容丢失',
    wrong: '<!-- @use highlights -->\n\n# 一级标题  # bind:h2 的 slot 不会收到',
    right: '<!-- @use highlights -->\n\n## Highlights  # 匹配 bind:h2',
    hint: '让 MD 块级别匹配 slot.bind；或改用显式 @slot:name 块。',
  },
  {
    id: 'table-variant-slot',
    title: 'table variant 选错 slot',
    wrong: '<!-- @use table variant=risk -->\n| col | col |  # standard 才用 Markdown 表',
    right: '<!-- @use table variant=risk -->\n<!-- @slot:tableData -->\nRace condition|high|Dedupe on server id\n<!-- @/slot -->',
    hint: 'table variant=standard 用 tableContent + 原生 Markdown 表；risk/impact/flag 用 tableData + | 分隔每行。',
  },
  {
    id: 'metric-band-row-length',
    title: 'metric band 三个 slot 行数不一致',
    wrong: '<!-- @slot:metricValue -->\n14\n6\n<!-- @/slot -->\n<!-- @slot:metricLabel -->\nPRs\nDeploys\nIncidents\n<!-- @/slot -->',
    right: '三个 slot（metricValue / metricLabel / metricDelta）行数必须一致，按行对齐渲染成 N 列。',
    hint: '在 metric variant=band / hero 下，values/labels/deltas 按行数对齐成列；第 i 列取第 i 行。',
  },
];

function toCatalogComponent(c: ComponentDef): CatalogComponent {
  const variants: VariantInfo[] = (c.variants ?? []).map((v) => ({
    id: v,
    description: c.variantDescriptions?.[v],
    isDefault: v === c.defaultVariant,
  }));
  const slots: SlotInfo[] = Object.entries(c.slots).map(([name, def]) => ({
    name,
    label: def.label,
    type: def.type,
    description: def.description,
    bind: def.bind,
    placeholder: def.placeholder,
  }));
  return {
    id: c.id,
    name: c.name,
    category: c.category,
    tags: c.tags,
    description: c.description,
    isLayout: c.isLayout === true,
    hasMount: FORGE_RUNTIME_SCRIPTS.some((s) => s.id === c.id),
    defaultVariant: c.defaultVariant,
    variants,
    slots,
    keySlots: c.keySlots,
    whenToUse: c.whenToUse,
    whenNot: c.whenNot,
    sample: FORGE_SAMPLES[c.id],
  };
}

function toCatalogTheme(t: ThemeDef): CatalogTheme {
  return {
    id: t.id,
    name: t.name,
    description: t.description,
    bandStyle: t.bandStyle,
  };
}

export async function GET() {
  const allComponents = forgeRegistry.getAllComponents();
  const forgeMdComponents = FORGE_COMPONENTS.map(toCatalogComponent);
  const layoutComponents = allComponents
    .filter((c) => c.isLayout)
    .map(toCatalogComponent);

  // 所有"非 layout 非 forge.md"的老 TS 组件也有价值，一并导出
  const forgeMdIds = new Set(FORGE_COMPONENTS.map((c) => c.id));
  const legacyTsComponents = allComponents
    .filter((c) => !c.isLayout && !forgeMdIds.has(c.id))
    .map(toCatalogComponent);

  const body = {
    meta: {
      project: 'md-html-forge',
      version: '0.1.0',
      generatedAt: new Date().toISOString(),
      description:
        'forge = Markdown → 组件化 HTML。文档源始终是合法 Markdown，所有扩展走 <!-- @xxx --> 注释。',
      usage: {
        agentFriendly: '推荐 agent 把 components[] 的 whenToUse / keySlots / sample 做 embedding，然后按用户需求检索最匹配的组件 id，组装进 @compose + @use。',
        renderChain: 'renderWithFallback(markdown) 会依次：parseCompose → tokenize → parseTokens → resolveBindings → emitHtml；用同一条链路的 iframe 就是编辑器预览。',
      },
    },
    directives: DIRECTIVES,
    components: forgeMdComponents,
    legacyComponents: legacyTsComponents,
    layouts: layoutComponents,
    themes: forgeRegistry.getAllThemes().map(toCatalogTheme),
    runtime: {
      mountSignature: 'function mount(el: HTMLElement, api: ForgeApi): void',
      api: {
        el: '组件根 DOM（带 data-forge-id）',
        'runtime.on / off / emit': '同 iframe 内事件总线',
        'runtime.copy(text)': '剪贴板复制（Promise<boolean>）',
        'runtime.shouldJumpToSource(target)': '统一的跳转决策（交互元素返回 false）',
        'runtime.state.get/set': '全局命名空间的状态',
        'state.get(key, fallback)': '组件级状态（自动加 c:<id>:<variant>: 前缀）',
        'state.set(key, value)': '组件级状态写入，跨 srcdoc 重载保留',
        'emit(event, payload)': '向宿主 React 发 forge:component-event',
        'on(event, handler)': '监听宿主回发的 forge:host-event',
      },
      builtinBehaviors: [
        '所有 <details> 的 open 状态自动持久化（key = "details:" + index）',
        'markdown 列表 "- [x]" / "- [ ]" 自动变 data-md-checkbox 输入框，勾选会回写源 MD',
        '带 data-src-line 的 slot 点击跳转到源码对应行；交互元素（input/button/summary/[data-no-jump]）跳过',
        '组件交互状态（Tab、排序、折叠）通过 forge:state-push/pull/snapshot 消息在 iframe 与 parent 之间桥接',
      ],
      criticalConstraint: '组件 mount JS 里的所有 click/change handler 必须 e.stopPropagation()，否则会冒泡到顶层 click 触发"定位到源码"，用户感知"点完跳顶"。',
    },
    commonErrors: COMMON_ERRORS,
  };

  return NextResponse.json(body, {
    headers: {
      // 给爬虫/agent：1 小时边缘缓存（开发时 Next dev 会忽略）
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
