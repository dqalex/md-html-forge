import { generateAgentDocs } from '../../_agent-docs/generate';
import { AgentDocsPageView } from './AgentDocsPageView';

export const metadata = {
  title: 'Agent Docs · md-html-forge',
  description:
    'Forge syntax contract docs for AI agents. Same source as /llms.txt, browser version with one-click copy.',
};

/**
 * /docs/agent — Browser-friendly agent docs.
 *
 * Supports bilingual (zh / en) rendering:
 *   - Server generates both zh and en content
 *   - Client-side AgentDocsPageView selects via i18n lang
 */
export default function AgentDocsPage() {
  const contentZh = generateAgentDocs('zh');
  const contentEn = generateAgentDocs('en');
  return <AgentDocsPageView contentZh={contentZh} contentEn={contentEn} />;
}
