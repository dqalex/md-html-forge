import { defineComponent, isEmpty, any } from '../_base';

/**
 * Review Comment · PR 评审评论气泡
 *
 * 支持三种评论级别：blocking（红橙左边框）、nit（灰色左边框）、default（灰色左边框）。
 * 源自 03-code-review-pr.html 的 .bubble 区块。
 */
export default defineComponent({
  id: 'review-comment',
  name: '评审评论',
  description: 'PR review 评论气泡，支持 blocking/nit/default 级别',
  source: '03',
  category: 'card',
  tags: ['review', 'comment', 'pr', 'bubble'],

  slots: {
    commentAnchor: { label: '行号定位（可选）', type: 'text',  placeholder: 'line 11' },
    commentLabel:  { label: '评论类型标签',    type: 'text',  placeholder: 'Blocking' },
    commentType:   { label: '类型（blocking/nit）', type: 'text',  placeholder: 'blocking' },
    commentBody:   { label: '评论内容',       type: 'content', placeholder: '`onMutate` doesn\'t call `qc.cancelQueries(key)` first...', bind: 'content' },
  },

  sample: {
    commentAnchor: 'line 11',
    commentLabel: 'Blocking',
    commentType: 'blocking',
    commentBody: '`onMutate` doesn\'t call `qc.cancelQueries(key)` first. If a background refetch lands between the optimistic write and the server response, it will clobber the optimistic state.',
  },

  css: `
.comp-review-comment {
  position: relative;
  background: var(--white);
  border: var(--border);
  border-left-width: 4px;
  border-radius: 8px;
  padding: 12px 14px 12px 16px;
  max-width: 680px;
}
.comp-review-comment.blocking { border-left-color: var(--clay); }
.comp-review-comment.nit { border-left-color: var(--gray-300); }
.comp-review-comment::before {
  content: "";
  position: absolute;
  left: -9px;
  top: 16px;
  width: 12px;
  height: 12px;
  background: var(--white);
  border-left: 1.5px solid var(--gray-300);
  border-bottom: 1.5px solid var(--gray-300);
  transform: rotate(45deg);
}
.comp-review-comment.blocking::before { border-left-color: var(--clay); border-bottom-color: var(--clay); }
.comp-review-comment .rc-anchor {
  font-family: var(--mono);
  font-size: 11.5px;
  color: var(--gray-500);
  margin-bottom: 4px;
}
.comp-review-comment .rc-label {
  display: inline-block;
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
  margin-right: 8px;
}
.comp-review-comment.blocking .rc-label { color: var(--clay); }
.comp-review-comment.nit .rc-label { color: var(--gray-500); }
.comp-review-comment .rc-body {
  font-size: 13.5px;
  color: var(--gray-700);
}
.comp-review-comment .rc-body code {
  font-family: var(--mono);
  font-size: 12.5px;
  background: var(--gray-100);
  padding: 1px 5px;
  border-radius: 4px;
}
  `.trim(),

  html: (s) => {
    if (!any(s.commentBody, s.commentLabel)) return '';

    const type = !isEmpty(s.commentType) ? s.commentType!.trim().toLowerCase() : '';
    const typeClass = type === 'blocking' ? ' blocking' : type === 'nit' ? ' nit' : '';

    return `
<div class="comp-review-comment${typeClass}" data-section="review-comment">
  ${!isEmpty(s.commentAnchor) ? `<div class="rc-anchor" data-slot="commentAnchor">${s.commentAnchor}</div>` : ''}
  ${!isEmpty(s.commentLabel) ? `<span class="rc-label" data-slot="commentLabel">${s.commentLabel}</span>` : ''}
  ${!isEmpty(s.commentBody) ? `<div class="rc-body" data-slot="commentBody" data-slot-type="content">${s.commentBody}</div>` : ''}
</div>`.trim();
  },
});
