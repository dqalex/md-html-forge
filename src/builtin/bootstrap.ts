/**
 * Bootstrap
 *
 * 把所有"内置"的东西一次性注册到 forgeRegistry。
 * 这是整个系统的"开机自检"入口，import 副作用完成注册。
 *
 * 用户代码要扩展系统时只需：
 *   import { forgeRegistry } from '@/builtin/compiler/registry';
 *   forgeRegistry.registerComponent(myDef);
 */

import { forgeRegistry } from './compiler/registry';
import { BUILTIN_COMPONENTS } from './components';
import { BUILTIN_THEMES } from './themes';
import { LUCIDE_RULES } from './inline-rules/lucide';

let booted = false;

export function bootstrapForge(): void {
  if (booted) return;
  booted = true;

  forgeRegistry.registerComponents(BUILTIN_COMPONENTS);
  forgeRegistry.registerThemes(BUILTIN_THEMES);
  for (const rule of LUCIDE_RULES) forgeRegistry.registerInlineRule(rule);

  // 指令目前都是"core directive"（由 lexer/parser 直接支持），
  // 这里先登记元数据用于未来的文档 / 组件浏览器 help 面板
  forgeRegistry.registerDirective({ name: 'page',           description: '文档级页面配置：宽度 + band 样式' });
  forgeRegistry.registerDirective({ name: 'compose',        description: '声明页面用到的组件 id' });
  forgeRegistry.registerDirective({ name: 'layout',         description: '段级布局切换（作用域指令）' });
  forgeRegistry.registerDirective({ name: 'theme',          description: '段级主题切换（作用域指令）' });
  forgeRegistry.registerDirective({ name: 'use',            description: '显式把组件归入当前段' });
  forgeRegistry.registerDirective({ name: 'slot',           description: '给组件 slot 填内容' });
  forgeRegistry.registerDirective({ name: 'compose-group',  description: '布局循环块' });
  forgeRegistry.registerDirective({ name: 'item',           description: '循环块内的子项' });
}

// import 即注册（适合 app 顶层）
bootstrapForge();
