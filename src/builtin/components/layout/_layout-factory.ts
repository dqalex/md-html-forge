/**
 * 布局组件工厂
 *
 * 所有布局组件的共同形态：
 * - 有特殊属性 isLayout: true
 * - 渲染函数读取 slots.__children__（由 renderer 注入的"子项 HTML 拼接结果"）
 * - 自身的 slots 通常很少（可选 heading 之类）
 */

import { defineComponent } from '../_base';
import type { ComponentDef } from '../../types';

interface LayoutOptions {
  id: string;
  name: string;
  description: string;
  source: string;
  tags: string[];
  /** 容器外层 CSS（容器 selector 自动用 .comp-${id}） */
  containerCss: string;
  /** 默认示例子项 id 列表（组件库「插入带示例」时用，每个会变成一个 @item） */
  sampleChildren: string[];
  /** 可选：标题 slot 的占位文字 */
  headingPlaceholder?: string;
  /** 可选：标题 slot 的 sample 值 */
  headingSample?: string;
}

export function makeLayout(opts: LayoutOptions): ComponentDef {
  const {
    id, name, description, source, tags,
    containerCss, sampleChildren,
    headingPlaceholder, headingSample,
  } = opts;

  return defineComponent({
    id,
    name,
    description,
    source,
    category: 'layout',
    tags,
    isLayout: true,
    sampleChildren,
    slots: {
      heading: {
        label: '布局标题（可选）',
        type: 'text',
        placeholder: headingPlaceholder ?? '',
      },
    },
    sample: headingSample ? { heading: headingSample } : {},
    css: containerCss,
    html: (s) => {
      const children = s.__children__ || '';
      // 没有任何子项 → 整个布局不渲染
      if (!children.trim()) return '';
      const headingHtml = s.heading && s.heading.trim()
        ? `<h2 class="layout-heading" data-slot="heading">${s.heading}</h2><hr class="rule">`
        : '';
      return `
<section class="comp-${id}" data-section="${id}">
  ${headingHtml}
  <div class="layout-children">${children}</div>
</section>`.trim();
    },
  });
}
