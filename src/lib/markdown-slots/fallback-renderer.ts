/**
 * 兜底渲染器 — 重导出
 *
 * 此文件已迁移至 @/builtin/fallback-renderer.ts 以消除循环依赖：
 *   - builtin/compiler/emitter → markdown-slots/slot-sync (MD→HTML 渲染)
 *   - markdown-slots/fallback-renderer → builtin/compiler (编译器)  ← 循环
 *
 * 迁移后方向统一：builtin → markdown-slots，无循环。
 * 此文件保留仅为向后兼容。
 */

export {
  renderWithFallback,
  parseComposeDirective,
  type RenderResult,
} from '@/builtin/fallback-renderer';
