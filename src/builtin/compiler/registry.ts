/**
 * Plugin Registry
 *
 * 把所有"可扩展的东西"集中起来，对外只暴露 register*() 接口。
 * Forge 的 4 类扩展点：
 *   1. Component   ─ ComponentDef
 *   2. Theme       ─ ThemeDef
 *   3. Directive   ─ 自定义注释指令（未来：@meta / @toc / @if 等）
 *   4. InlineRule  ─ 源码级文本替换规则（当前：`:lucide:xxx:` 图标）
 *
 * 内置的所有东西都在启动时 register*() 进来，用户/模板可以再注册自己的。
 * Registry 是 immutable 导出 + 可变注册 API —— 未来做热插拔也方便。
 */

import type { ComponentDef } from '../types';
import type { ThemeDef } from '../themes/types';

// ===== 类型定义 =====

export interface InlineRule {
  /** 规则 id（便于调试） */
  id: string;
  /** 模式（必须是 g 标志的 RegExp） */
  pattern: RegExp;
  /** 替换函数：返回 HTML 片段 */
  render: (match: RegExpMatchArray) => string;
}

/**
 * 自定义指令插件（占位 API）
 *
 * 未来要加 @meta / @toc / @if 这类新指令时，用这个接口注册；
 * 当前只定义接口形状，编译器里还没接入解析 hook（预留）。
 */
export interface DirectivePlugin {
  /** 指令名（不含 @） */
  name: string;
  /** 简介 */
  description?: string;
}

// ===== Registry 实例 =====

class ForgeRegistry {
  private components = new Map<string, ComponentDef>();
  private themes = new Map<string, ThemeDef>();
  private inlineRules = new Map<string, InlineRule>();
  private directives = new Map<string, DirectivePlugin>();

  // ----- Component -----

  registerComponent(def: ComponentDef): void {
    this.components.set(def.id, def);
  }

  registerComponents(defs: readonly ComponentDef[]): void {
    for (const d of defs) this.registerComponent(d);
  }

  getComponent(id: string): ComponentDef | undefined {
    return this.components.get(id);
  }

  getAllComponents(): ComponentDef[] {
    return Array.from(this.components.values());
  }

  // ----- Theme -----

  registerTheme(def: ThemeDef): void {
    this.themes.set(def.id, def);
  }

  registerThemes(defs: readonly ThemeDef[]): void {
    for (const d of defs) this.registerTheme(d);
  }

  getTheme(id: string): ThemeDef | undefined {
    return this.themes.get(id);
  }

  getAllThemes(): ThemeDef[] {
    return Array.from(this.themes.values());
  }

  // ----- Inline rule -----

  registerInlineRule(rule: InlineRule): void {
    if (!rule.pattern.global) {
      throw new Error(`InlineRule "${rule.id}" pattern must be global (missing 'g' flag)`);
    }
    this.inlineRules.set(rule.id, rule);
  }

  getAllInlineRules(): InlineRule[] {
    return Array.from(this.inlineRules.values());
  }

  // ----- Directive (占位) -----

  registerDirective(plugin: DirectivePlugin): void {
    this.directives.set(plugin.name, plugin);
  }

  getAllDirectives(): DirectivePlugin[] {
    return Array.from(this.directives.values());
  }

  // ----- 克隆（为某次编译创建子 registry，支持 template.customComponents）-----

  fork(): ForgeRegistry {
    const copy = new ForgeRegistry();
    for (const c of this.components.values()) copy.components.set(c.id, c);
    for (const t of this.themes.values()) copy.themes.set(t.id, t);
    for (const r of this.inlineRules.values()) copy.inlineRules.set(r.id, r);
    for (const d of this.directives.values()) copy.directives.set(d.name, d);
    return copy;
  }
}

/**
 * 全局单例 registry。内置的一切都在启动时注册进来。
 * 用户代码可以 `forgeRegistry.registerComponent(...)` 扩展。
 */
export const forgeRegistry = new ForgeRegistry();

export type Registry = ForgeRegistry;
