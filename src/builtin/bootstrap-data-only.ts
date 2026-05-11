/**
 * 轻量 bootstrap：只注册 components + themes，不注册 inline rules。
 *
 * 为什么需要：`./inline-rules/lucide` → `./icons` → `react-dom/server`。
 * Next.js App Router 的 server handler（route.ts、非 client 的 Server Component）
 * 禁止静态 import `react-dom/server`。因此给**纯数据读取**场景（如
 * /api/catalog.json、/llms.txt、/docs/agent）提供这个最小 bootstrap，
 * 避开 icons 链。
 *
 * 这些端点只吐组件 schema / sample 文本，不会真的把 `:lucide:xxx:` 转 SVG，
 * 所以不需要 lucide 规则。
 *
 * 浏览器页面 / Client Component 正常 import `./bootstrap`（含图标） 即可。
 */

import { forgeRegistry } from './compiler/registry';
import { BUILTIN_COMPONENTS } from './components';
import { BUILTIN_THEMES } from './themes';

let booted = false;

export function bootstrapDataOnly(): void {
  if (booted) return;
  booted = true;
  forgeRegistry.registerComponents(BUILTIN_COMPONENTS);
  forgeRegistry.registerThemes(BUILTIN_THEMES);
}

bootstrapDataOnly();
