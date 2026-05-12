---
id: table
category: data
tags: table, grid, risk, impact, flag
trust: builtin
defaultVariant: standard
---

# 数据表格

## Variants

- `standard` — 带卡片边框的 Markdown 表格，支持标题
- `risk` — 风险评估表，三列（描述 / 严重度徽章 / 缓解措施）
- `impact` — 影响评估表，键值对两列表格
- `flag` — 特性开关行，带 toggle 视觉、rollout 徽章和依赖提示

## Slots

```yaml
tableHeading:
  label: 区块标题
  type: text
  placeholder: 表格标题
  bind: h2
tableContent:
  label: 表格内容（Markdown 表格）
  type: content
  bind: content
  placeholder: '| PR | Title | Author |\n|---|---|---|\n| #1234 | Fix login | Alice |'
  description: standard 变体使用完整 Markdown 表格
tableData:
  label: 结构化数据行
  type: data
  placeholder: '描述|严重度|缓解措施'
  description: risk / impact / flag 变体使用。risk 每行 描述|严重度|缓解；impact 每行 key|value；flag 每行 key|描述|rollout|requires|state
```

## HTML

```html
<section class="comp-table" data-section="table" data-variant="{{variant}}">
  <h2 data-slot="tableHeading"></h2>
  <hr class="rule">
  <div class="table-content" data-slot="tableContent" data-slot-type="content"></div>
  <div class="table-data" data-slot="tableData" data-slot-type="data"></div>
</section>
```

## CSS

```css
.comp-table {
  margin-bottom: 40px;
}
.comp-table h2 {
  font-family: var(--serif);
  font-weight: 500;
  font-size: 22px;
  margin: 0 0 8px;
  color: var(--slate);
}
.comp-table .rule {
  border: none;
  border-top: 1px solid var(--gray-300);
  margin: 0 0 16px;
}

/* ===== variant: standard ===== */
.comp-table[data-variant="standard"] .table-content table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: var(--white);
  border: var(--border);
  border-radius: var(--radius-panel);
  overflow: hidden;
}
.comp-table[data-variant="standard"] .table-content th {
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--gray-500);
  background: var(--gray-100);
  padding: 12px 16px;
  border-bottom: 1px solid var(--gray-300);
}
.comp-table[data-variant="standard"] .table-content td {
  padding: 13px 16px;
  border-bottom: 1px solid var(--gray-100);
  font-size: 14px;
}
.comp-table[data-variant="standard"] .table-content tr:last-child td {
  border-bottom: none;
}
.comp-table[data-variant="standard"] .table-content tr:hover {
  background: var(--ivory);
}
/* 表头排序指示 */
.comp-table .table-content th.sort-asc::after,
.comp-table .table-content th.sort-desc::after,
.comp-table[data-variant="risk"] .rt-head .rt-cell.sort-asc::after,
.comp-table[data-variant="risk"] .rt-head .rt-cell.sort-desc::after {
  content: " \25B4";
  font-size: 10px;
  margin-left: 4px;
  color: var(--clay);
}
.comp-table .table-content th.sort-desc::after,
.comp-table[data-variant="risk"] .rt-head .rt-cell.sort-desc::after {
  content: " \25BE";
}
.comp-table[data-variant="standard"] .table-data {
  display: none;
}

/* ===== variant: risk ===== */
.comp-table[data-variant="risk"] .table-content {
  display: none;
}
.comp-table[data-variant="risk"] .table-data {
  border: var(--border);
  border-radius: var(--radius-panel);
  overflow: hidden;
  background: var(--white);
}
.comp-table[data-variant="risk"] .rt-row {
  display: grid;
  grid-template-columns: 1.6fr 90px 1.6fr;
  gap: 0;
}
.comp-table[data-variant="risk"] .rt-row + .rt-row {
  border-top: 1.5px solid var(--gray-300);
}
.comp-table[data-variant="risk"] .rt-cell {
  padding: 14px 18px;
  font-size: 13.5px;
}
.comp-table[data-variant="risk"] .rt-cell + .rt-cell {
  border-left: 1.5px solid var(--gray-300);
}
.comp-table[data-variant="risk"] .rt-head {
  background: var(--gray-100);
  font-weight: 600;
  color: var(--slate);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-family: var(--mono);
}
.comp-table[data-variant="risk"] .rt-sev {
  display: inline-block;
  font-family: var(--mono);
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 600;
}
.comp-table[data-variant="risk"] .rt-sev.high {
  background: var(--gray-100);
  color: var(--clay);
}
.comp-table[data-variant="risk"] .rt-sev.med {
  background: var(--oat);
  color: var(--slate);
}
.comp-table[data-variant="risk"] .rt-sev.low {
  background: var(--gray-100);
  color: var(--olive);
}

/* ===== variant: impact ===== */
.comp-table[data-variant="impact"] .table-content {
  display: none;
}
.comp-table[data-variant="impact"] .table-data table {
  width: 100%;
  max-width: 460px;
  border-collapse: separate;
  border-spacing: 0;
  background: var(--white);
  border: var(--border);
  border-radius: var(--radius-panel);
  overflow: hidden;
}
.comp-table[data-variant="impact"] .table-data th {
  text-align: left;
  font-weight: 400;
  color: var(--gray-500);
  width: 55%;
  padding: 12px 18px;
  font-size: 14px;
  border-bottom: 1px solid var(--gray-100);
}
.comp-table[data-variant="impact"] .table-data td {
  font-family: var(--mono);
  color: var(--slate);
  padding: 12px 18px;
  font-size: 14px;
  border-bottom: 1px solid var(--gray-100);
}
.comp-table[data-variant="impact"] .table-data tr:last-child th,
.comp-table[data-variant="impact"] .table-data tr:last-child td {
  border-bottom: none;
}

/* ===== variant: flag ===== */
.comp-table[data-variant="flag"] .table-content {
  display: none;
}
.comp-table[data-variant="flag"] .fr-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--gray-100);
  border-left: 3px solid transparent;
}
.comp-table[data-variant="flag"] .fr-row:last-child {
  border-bottom: none;
}
.comp-table[data-variant="flag"] .fr-row.warn {
  border-left-color: var(--clay);
  background: var(--gray-100);
}
.comp-table[data-variant="flag"] .fr-toggle {
  position: relative;
  flex: none;
  width: 38px;
  height: 22px;
  margin-top: 1px;
  border-radius: 999px;
}
.comp-table[data-variant="flag"] .fr-toggle.off {
  background: var(--gray-300);
}
.comp-table[data-variant="flag"] .fr-toggle.on {
  background: var(--olive);
}
.comp-table[data-variant="flag"] .fr-toggle::after {
  content: "";
  position: absolute;
  top: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--white);
}
.comp-table[data-variant="flag"] .fr-toggle.off::after {
  left: 3px;
}
.comp-table[data-variant="flag"] .fr-toggle.on::after {
  right: 3px;
}
.comp-table[data-variant="flag"] .fr-info {
  flex: 1;
  min-width: 0;
}
.comp-table[data-variant="flag"] .fr-key {
  font-family: var(--mono);
  font-size: 13px;
  color: var(--gray-700);
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}
.comp-table[data-variant="flag"] .fr-dot {
  display: none;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--clay);
  flex: none;
}
.comp-table[data-variant="flag"] .fr-row.changed .fr-dot {
  display: inline-block;
}
.comp-table[data-variant="flag"] .fr-rollout {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.03em;
  color: var(--gray-500);
  background: var(--gray-100);
  border: 1px solid var(--gray-300);
  border-radius: 999px;
  padding: 1px 7px 2px;
}
.comp-table[data-variant="flag"] .fr-desc {
  color: var(--gray-500);
  font-size: 12.5px;
  margin-top: 2px;
}
.comp-table[data-variant="flag"] .fr-req {
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
  margin-top: 7px;
  font-family: var(--mono);
  font-size: 11px;
  color: var(--gray-500);
  background: var(--gray-100);
  border: 1px solid var(--gray-300);
  border-radius: 999px;
  padding: 2px 9px 3px;
}
.comp-table[data-variant="flag"] .fr-row.warn .fr-req {
  color: var(--clay);
  background: var(--oat);
  border-color: var(--oat);
}
```

## JS

```js
(function() {
  document.querySelectorAll('.comp-table').forEach(function(el) {
  var variant = el.getAttribute('data-variant') || 'standard';

  var esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

  // ===== 通用：给 <table> 表头加排序能力 =====
  // 用法：传入 table 元素；自动遍历 thead th，加 click → 切换 asc/desc/none
  // 排序方式：先尝试解析为数字，否则按字符串本地化比较
  function bindTableSort(tableEl, key) {
    if (!tableEl) return;
    var thead = tableEl.querySelector('thead') || tableEl;
    var ths = thead.querySelectorAll('th');
    if (!ths.length) return;
    var tbody = tableEl.querySelector('tbody') || tableEl;
    // 缓存原始顺序，便于第三次点击恢复
    var originalRows = Array.from(tbody.querySelectorAll('tr'));

    var apply = function(col, dir) {
      ths.forEach(function(th, i) {
        th.classList.toggle('sort-asc', i === col && dir === 'asc');
        th.classList.toggle('sort-desc', i === col && dir === 'desc');
      });
      if (dir === 'none' || col == null) {
        originalRows.forEach((r) => tbody.appendChild(r));
        return;
      }
      var rows = Array.from(tbody.querySelectorAll('tr'));
      var getCell = function(tr) {
        var cells = tr.querySelectorAll('td, th');
        return cells[col] ? (cells[col].textContent || '').trim() : '';
      };
      var tryNum = function(v) {
        var m = v.replace(/[,_\s]/g, '').match(/^-?\d+(\.\d+)?$/);
        return m ? parseFloat(v.replace(/[,_\s]/g, '')) : null;
      };
      rows.sort(function(a, b) {
        var av = getCell(a);
        var bv = getCell(b);
        var an = tryNum(av), bn = tryNum(bv);
        var cmp;
        if (an !== null && bn !== null) cmp = an - bn;
        else cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: 'base' });
        return dir === 'asc' ? cmp : -cmp;
      });
      rows.forEach((r) => tbody.appendChild(r));
    };

    // 恢复持久化的排序
    var saved = api.state.get('sort:' + key, null);
    if (saved && typeof saved.col === 'number' && saved.dir) apply(saved.col, saved.dir);

    ths.forEach(function(th, i) {
      th.style.cursor = 'pointer';
      th.setAttribute('data-no-jump', '1');
      th.addEventListener('click', function(e) {
        e.stopPropagation();
        // 三态：none → asc → desc → none
        var cur = api.state.get('sort:' + key, { col: -1, dir: 'none' });
        var nextDir = 'asc';
        if (cur.col === i && cur.dir === 'asc') nextDir = 'desc';
        else if (cur.col === i && cur.dir === 'desc') nextDir = 'none';
        var next = nextDir === 'none' ? { col: -1, dir: 'none' } : { col: i, dir: nextDir };
        api.state.set('sort:' + key, next);
        apply(next.col, next.dir);
      });
    });
  }

  if (variant === 'standard') {
    // 给 markdown 渲染出来的 table 加排序
    var tableEl = el.querySelector('.table-content table');
    bindTableSort(tableEl, 'standard');
    return;
  }

  var dataEl = el.querySelector('[data-slot="tableData"]');
  if (!dataEl) return;

  var raw = (dataEl.textContent || '').trim();
  if (!raw) return;

  var rows = raw.split('\n').map((s) => s.trim()).filter(Boolean);

  if (variant === 'risk') {
    // 每行 描述|严重度|缓解 → 保留 .rt-row 网格结构
    var sevClass = function(s) {
      var k = s.toLowerCase();
      if (k.startsWith('h')) return 'high';
      if (k.startsWith('m')) return 'med';
      return 'low';
    };
    var headHtml = '<div class="rt-row rt-head"><div class="rt-cell" data-rt-col="0">Risk</div><div class="rt-cell" data-rt-col="1">Severity</div><div class="rt-cell" data-rt-col="2">Mitigation</div></div>';
    var cellsList = rows.map((r) => r.split('|').map((s) => s.trim()));
    var renderBody = (list) => list.map(function(cells) {
      var desc = cells[0] || '';
      var sev = cells[1] || '';
      var miti = cells[2] || '';
      return `<div class="rt-row" data-rt-data='${esc(JSON.stringify(cells))}'><div class="rt-cell">${esc(desc)}</div><div class="rt-cell"><span class="rt-sev ${sevClass(sev)}">${esc(sev)}</span></div><div class="rt-cell">${esc(miti)}</div></div>`;
    }).join('');
    dataEl.innerHTML = headHtml + renderBody(cellsList);

    // 让 head cell 可点排序：复用 cellsList 重排
    var sevOrder = function(s) {
      var k = (s || '').toLowerCase();
      if (k.startsWith('h')) return 3;
      if (k.startsWith('m')) return 2;
      if (k.startsWith('l')) return 1;
      return 0;
    };
    var sortKey = 'sort:risk';
    var apply = function(col, dir) {
      dataEl.querySelectorAll('.rt-head .rt-cell').forEach(function(c, i) {
        c.classList.toggle('sort-asc', i === col && dir === 'asc');
        c.classList.toggle('sort-desc', i === col && dir === 'desc');
      });
      // 移除旧 body
      dataEl.querySelectorAll('.rt-row:not(.rt-head)').forEach((r) => r.remove());
      var list = cellsList.slice();
      if (col != null && dir !== 'none') {
        list.sort(function(a, b) {
          var cmp;
          if (col === 1) cmp = sevOrder(a[1]) - sevOrder(b[1]);
          else cmp = (a[col] || '').localeCompare(b[col] || '', undefined, { numeric: true, sensitivity: 'base' });
          return dir === 'asc' ? cmp : -cmp;
        });
      }
      dataEl.insertAdjacentHTML('beforeend', renderBody(list));
    };
    var saved = api.state.get(sortKey, null);
    if (saved && typeof saved.col === 'number' && saved.dir) apply(saved.col, saved.dir);
    dataEl.querySelectorAll('.rt-head .rt-cell').forEach(function(cell, i) {
      cell.style.cursor = 'pointer';
      cell.setAttribute('data-no-jump', '1');
      cell.addEventListener('click', function(e) {
        e.stopPropagation();
        var cur = api.state.get(sortKey, { col: -1, dir: 'none' });
        var nextDir = 'asc';
        if (cur.col === i && cur.dir === 'asc') nextDir = 'desc';
        else if (cur.col === i && cur.dir === 'desc') nextDir = 'none';
        var next = nextDir === 'none' ? { col: -1, dir: 'none' } : { col: i, dir: nextDir };
        api.state.set(sortKey, next);
        apply(next.col, next.dir);
      });
    });
    return;
  }

  if (variant === 'impact') {
    // 每行 key|value，渲染为 <table><tr><th>k</th><td>v</td></tr>
    var trs = rows.map(function(r) {
      var [k = '', v = ''] = r.split('|').map((s) => s.trim());
      return `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`;
    }).join('');
    dataEl.innerHTML = `<table><tbody>${trs}</tbody></table>`;
    return;
  }

  if (variant === 'flag') {
    // 每行 key|描述|rollout|requires|state
    var html = rows.map(function(r) {
      var [key = '', desc = '', rollout = '', requires = '', state = 'off'] = r.split('|').map((s) => s.trim());
      var stateClass = state.toLowerCase() === 'on' ? 'on' : 'off';
      var warnClass = (state.toLowerCase() === 'warn' || requires) ? 'warn' : '';
      var reqHtml = requires ? `<span class="fr-req">requires <code>${esc(requires)}</code></span>` : '';
      var rolloutHtml = rollout ? `<span class="fr-rollout">${esc(rollout)}%</span>` : '';
      return `<div class="fr-row ${warnClass}">
        <div class="fr-toggle ${stateClass}" role="switch" aria-checked="${stateClass === 'on'}" data-flag-key="${esc(key)}"></div>
        <div class="fr-info">
          <div class="fr-key"><span class="fr-dot"></span><code>${esc(key)}</code>${rolloutHtml}</div>
          <div class="fr-desc">${esc(desc)}</div>
          ${reqHtml}
        </div>
      </div>`;
    }).join('');
    dataEl.innerHTML = html;
    // flag 变体 toggle：点击 .fr-toggle 切换状态（持久化），并 emit 事件
    dataEl.querySelectorAll('.fr-toggle').forEach(function(tg) {
      tg.style.cursor = 'pointer';
      tg.setAttribute('data-no-jump', '1');
      var key = tg.getAttribute('data-flag-key') || '';
      var stateKey = 'flag:' + key;
      var saved = api.state.get(stateKey, null);
      if (saved === 'on') { tg.classList.remove('off'); tg.classList.add('on'); tg.setAttribute('aria-checked', 'true'); }
      else if (saved === 'off') { tg.classList.remove('on'); tg.classList.add('off'); tg.setAttribute('aria-checked', 'false'); }
      tg.addEventListener('click', function(e) {
        e.stopPropagation();
        var nowOn = tg.classList.contains('on');
        if (nowOn) { tg.classList.remove('on'); tg.classList.add('off'); tg.setAttribute('aria-checked', 'false'); api.state.set(stateKey, 'off'); }
        else { tg.classList.remove('off'); tg.classList.add('on'); tg.setAttribute('aria-checked', 'true'); api.state.set(stateKey, 'on'); }
        api.emit('flag-toggle', { key: key, on: !nowOn });
      });
    });
    return;
  }
  });
})();
```

## Sample

```markdown
<!-- @use table variant=standard -->

### Shipped This Week

| PR | Title | Author | Impact |
|---|---|---|---|
| #1234 | Login retries + circuit breaker | @alice | p0 |
| #1240 | Move session store to Redis | @bob | p1 |

<!-- @use table variant=risk -->

### Risks & mitigations

<!-- @slot:tableData -->
Race condition on socket append|high|Dedupe on server-assigned id
Unread counts go stale|med|Broadcast comment_reads upserts
Mention detection false-positives|low|Resolve mentions against workspace members
<!-- @/slot -->

<!-- @use table variant=impact -->

### Impact

<!-- @slot:tableData -->
Requests failed (502)|~41,200
Peak error rate|21.4%
Users affected|~2,300 workspaces
<!-- @/slot -->

<!-- @use table variant=flag -->

### Feature Flags

<!-- @slot:tableData -->
sync.offline_queue_v2|Persist offline edits to IndexedDB|10|sync.delta_compression|on
<!-- @/slot -->
```
