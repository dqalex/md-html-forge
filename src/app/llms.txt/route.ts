import { generateAgentDocs } from '../_agent-docs/generate';

/**
 * /llms.txt —— 遵循 llmstxt.org 的 AI 友好站点说明格式。
 *
 * 与 /api/catalog.json 的分工：
 *   - /llms.txt              纯文本，适合贴进聊天窗口或通用爬虫
 *   - /api/catalog.json      强结构 JSON，适合程序化 retrieval / embedding
 *   - /docs/agent            /llms.txt 的浏览器版（带复制按钮，人类也能看）
 *
 * 内容由 _agent-docs/generate.ts 动态拼装，始终反映组件真实能力。
 */
export async function GET() {
  const content = generateAgentDocs();
  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
