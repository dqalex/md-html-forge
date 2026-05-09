import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import type { StreamdownProps } from 'streamdown';

/**
 * Streamdown 插件集合
 *
 * 移植自 TRFP/frontend/src/core/streamdown/plugins.ts，
 * 精简掉了 word-animation / reasoning 变体，只保留主渲染用的 `streamdownPlugins`。
 */
export const streamdownPlugins = {
  remarkPlugins: [
    remarkGfm,
    [remarkMath, { singleDollarTextMath: true }],
  ] as StreamdownProps['remarkPlugins'],
  rehypePlugins: [
    rehypeRaw,
    [rehypeKatex, { output: 'html' }],
  ] as StreamdownProps['rehypePlugins'],
};
