---
id: cta-banner
category: visual
tags: cta, banner, hero, marketing, landing, qrcode
trust: builtin
defaultVariant: hero
description: 通栏 CTA Banner：渐变背景 + 大标题 + 副文案 + 按钮/二维码，适用于营销落地页首屏和底部召唤行动区
whenToUse: 营销页首屏大标题区（hero）; 页面底部号召行动区（footer-cta）; 任何需要全宽背景色 + 中心化文案的区块
whenNot: 普通文档标题（用 header）; 需要展示数据或组件的段（用 metric/callout）
keySlots: bannerTitle; bannerSubtitle; bannerDesc
---

# 通栏 CTA Banner

## Variants

- `hero` — 首屏大 Banner，渐变背景 + 大标题 + 副标题 + 描述 + 数据徽章组 + 操作按钮
- `footer-cta` — 底部行动区，背景色 + 居中文案 + 二维码 + 说明文字，常用于页尾转化

## Slots

```yaml
bannerTitle:
  label: 主标题
  type: text
  placeholder: 聊天时，养生养道正在小店朋朋爆发
  bind: h1
bannerSubtitle:
  label: 副标题
  type: text
  placeholder: 养生心选 · 品质抢先出道
  bind: h2
bannerDesc:
  label: 描述文案（支持多行 Markdown）
  type: content
  placeholder: |
    覆盖人群：30 岁以上关注健康的消费群体
    养生心选正在被越来越多的人发现
  bind: content
bannerBadges:
  label: 数据徽章（每行：数值｜标签）
  type: data
  placeholder: |
    10+｜合作品牌
    200+｜精选商品
    98%｜好评率
  description: 每行格式：数值｜标签，如 10+｜合作品牌
bannerAction:
  label: 按钮文字（可选）
  type: text
  placeholder: 立即查看
bannerActionUrl:
  label: 按钮链接（可选）
  type: text
  placeholder: '#'
bannerQrcode:
  label: 二维码图片 URL（footer-cta 专用）
  type: text
  placeholder: https://example.com/qr.png
bannerQrcodeLabel:
  label: 二维码说明文字
  type: text
  placeholder: 扫码进店
bannerNote:
  label: 底部补充说明（footer-cta）
  type: content
  placeholder: 现在入驻，享创业红利 · 流量 · 收益
```

## HTML

```html
<div class="comp-cta-banner" data-section="cta-banner" data-variant="{{variant}}">
  <!-- variant: hero -->
  <div class="cb-hero">
    <div class="cb-text">
      <h1 class="cb-title" data-slot="bannerTitle"></h1>
      <h2 class="cb-subtitle" data-slot="bannerSubtitle"></h2>
      <div class="cb-desc" data-slot="bannerDesc" data-slot-type="content"></div>
    </div>
    <div class="cb-badges" data-slot="bannerBadges" data-slot-type="data"></div>
    <div class="cb-actions">
      <a class="cb-btn" data-slot="bannerAction" data-href-slot="bannerActionUrl" href="#"></a>
    </div>
  </div>

  <!-- variant: footer-cta -->
  <div class="cb-footer">
    <div class="cb-footer-text">
      <h2 class="cb-title" data-slot="bannerTitle"></h2>
      <p class="cb-subtitle" data-slot="bannerSubtitle"></p>
      <div class="cb-desc" data-slot="bannerDesc" data-slot-type="content"></div>
    </div>
    <div class="cb-footer-qr">
      <div class="cb-qrcode-wrap">
        <img class="cb-qrcode" data-slot="bannerQrcode" alt="二维码" src="" />
        <span class="cb-qrlabel" data-slot="bannerQrcodeLabel"></span>
      </div>
    </div>
    <div class="cb-footer-note" data-slot="bannerNote" data-slot-type="content"></div>
  </div>
</div>
```

## CSS

```css
.comp-cta-banner {
  position: relative;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

/* ===== hero 变体 ===== */
.comp-cta-banner[data-variant="hero"] .cb-hero {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  padding: 40px 36px 36px;
}

.comp-cta-banner[data-variant="hero"] .cb-footer,
.comp-cta-banner[data-variant="footer-cta"] .cb-hero { display: none; }

.comp-cta-banner .cb-title {
  font-family: var(--serif);
  font-size: 26px;
  font-weight: 700;
  line-height: 1.25;
  color: inherit;
  margin: 0;
}

.comp-cta-banner .cb-subtitle {
  font-size: 14px;
  font-weight: 500;
  color: inherit;
  opacity: 0.85;
  margin: 0;
}

.comp-cta-banner .cb-desc {
  font-size: 13px;
  line-height: 1.7;
  color: inherit;
  opacity: 0.8;
  margin: 0;
}
.comp-cta-banner .cb-desc p { margin: 2px 0; }

/* 数据徽章 */
.comp-cta-banner .cb-badges {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* data-slot 渲染后 cb-badges 里的行会被 mount JS 处理成徽章 */
.comp-cta-banner .cb-badge {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: rgba(255,255,255,0.18);
  border: 1px solid rgba(255,255,255,0.35);
  border-radius: 8px;
  padding: 8px 16px;
  min-width: 70px;
}
.comp-cta-banner .cb-badge-value {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}
.comp-cta-banner .cb-badge-label {
  font-size: 11px;
  color: rgba(255,255,255,0.8);
}

/* 按钮 */
.comp-cta-banner .cb-actions { margin-top: 4px; }
.comp-cta-banner .cb-btn {
  display: inline-block;
  padding: 10px 28px;
  border-radius: 999px;
  background: #fff;
  color: var(--clay, #D97757);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.15s;
}
.comp-cta-banner .cb-btn:empty { display: none; }
.comp-cta-banner .cb-btn:hover { opacity: 0.9; }

/* ===== footer-cta 变体 ===== */
.comp-cta-banner[data-variant="footer-cta"] .cb-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 36px 36px 32px;
  flex-wrap: wrap;
}

.comp-cta-banner[data-variant="footer-cta"] .cb-footer-text {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comp-cta-banner[data-variant="footer-cta"] .cb-footer-qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.comp-cta-banner .cb-qrcode-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.comp-cta-banner .cb-qrcode {
  width: 90px;
  height: 90px;
  border-radius: 8px;
  background: #fff;
  object-fit: contain;
  display: block;
}
.comp-cta-banner .cb-qrcode[src=""] { display: none; }

.comp-cta-banner .cb-qrlabel {
  font-size: 11px;
  color: inherit;
  opacity: 0.75;
}

.comp-cta-banner .cb-footer-note {
  width: 100%;
  font-size: 12px;
  text-align: center;
  opacity: 0.7;
  padding-top: 4px;
}
.comp-cta-banner .cb-footer-note:empty { display: none; }
```

## JS

```js
(function() {
  document.querySelectorAll('.comp-cta-banner').forEach(function(el) {
    // 处理按钮链接
    var btn = el.querySelector('.cb-btn');
    var hrefSlotEl = el.querySelector('[data-href-slot="bannerActionUrl"]');
    if (btn && hrefSlotEl) {
      var href = hrefSlotEl.textContent.trim();
      if (href && href !== '#') btn.href = href;
    }

    // 把 cb-badges 里的 data 行渲染成徽章卡片
    var badgesWrap = el.querySelector('.cb-badges');
    if (!badgesWrap) return;
    var raw = badgesWrap.textContent.trim();
    if (!raw) return;
    var lines = raw.split('\n').map(function(l) { return l.trim(); }).filter(Boolean);
    badgesWrap.innerHTML = '';
    lines.forEach(function(line) {
      var parts = line.split(/[｜|]/);
      var value = (parts[0] || '').trim();
      var label = (parts[1] || '').trim();
      if (!value) return;
      var badge = document.createElement('div');
      badge.className = 'cb-badge';
      badge.innerHTML =
        '<span class="cb-badge-value">' + value + '</span>' +
        (label ? '<span class="cb-badge-label">' + label + '</span>' : '');
      badgesWrap.appendChild(badge);
    });
  });
})();
```
