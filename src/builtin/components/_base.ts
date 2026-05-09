/**
 * 组件工厂 · 所有组件的统一入口
 *
 * 用 defineComponent() 声明组件，好处：
 * 1. 类型推断完整（category / tags / slots 都被精确类型化）
 * 2. 强制结构一致，减少重复样板
 * 3. 未来扩展（如：自动注入 data-attribute、统一缓存 CSS）只改这一处
 *
 * 示例：
 *   export default defineComponent({
 *     id: 'header',
 *     name: '文档标题头',
 *     category: 'header',
 *     slots: { title: { ... } },
 *     sample: { title: 'md-html-forge' },
 *     css: `...`,
 *     html: (s) => `...`,
 *   });
 */

import type { ComponentDef } from '../types';
export { isEmpty, any } from './shared-tokens';

/**
 * 定义一个组件（工厂函数）
 *
 * 类型约束由 ComponentDef 提供；这里只是一层身份函数，
 * 便于未来加入 validation / auto-registration 等逻辑。
 */
export function defineComponent(def: ComponentDef): ComponentDef {
  // 未来可在这里加：开发态 slot 校验、html() 自动 try/catch、自动 data-component id 注入
  return def;
}
