import type { TemplateDef } from '../types';
import { BUILTIN_COMPONENTS } from '../components';
import { generateStarterMarkdown, type StarterMode } from './starter';

/**
 * 创建一个基础模板（仅引用内置组件，无自定义组件）
 */
export function makeTemplate(args: {
  id: string;
  name: string;
  description: string;
  emoji: string;
  icon: string;
  color: string;
  group: TemplateDef['group'];
  componentIds: string[];
  docTitle: string;
  starterMode?: StarterMode;
  starterMarkdown?: string;
  missingComponents?: string[];
}): TemplateDef {
  return {
    id: args.id,
    name: args.name,
    description: args.description,
    emoji: args.emoji,
    icon: args.icon,
    color: args.color,
    group: args.group,
    componentIds: args.componentIds,
    starterMarkdown:
      args.starterMarkdown
      ?? generateStarterMarkdown(
        args.componentIds,
        args.docTitle,
        BUILTIN_COMPONENTS,
        args.starterMode ?? 'sample',
      ),
    missingComponents: args.missingComponents,
  };
}
