'use client';

/**
 * PropertyPanel - 元素属性面板（v2）
 *
 * 移植自 GrowthPilot/src/components/PropertyPanel.jsx
 * 适配 md-html-forge editorial 设计语言
 */

import React from 'react';

// ===== 类型 =====

interface SelectedElementInfo {
  tagName: string;
  textContent?: string;
  canEditText?: boolean;
  slotName?: string | null;
  slotType?: string;
  styles: Record<string, string>;
  isImage?: boolean;
  className?: string;
}

interface PropertyPanelProps {
  element: SelectedElementInfo;
  onStyleChange: (property: string, value: string) => void;
  onTextChange?: (slotName: string, value: string) => void;
  onImageReplace: () => void;
  onClose: () => void;
  onLocateSlot?: (slotName: string) => void;
}

// ===== 预设 =====

const PRESET_COLORS = [
  '#2c2825', '#5c5450', '#9c9590', '#d4cfc7', '#FAF9F5',
  '#D97757', '#c05a35', '#8b3a1a', '#4a90d9', '#22c55e',
  '#f59e0b', '#ef4444', '#ffffff', '#000000', '#F0EDE6',
];

const FONT_SIZES = [
  '12px', '14px', '16px', '18px', '20px', '24px',
  '28px', '32px', '36px', '42px', '48px', '56px', '64px',
];

// ===== 组件 =====

export default function PropertyPanel({
  element,
  onStyleChange,
  onTextChange,
  onImageReplace,
  onClose,
  onLocateSlot,
}: PropertyPanelProps) {
  const styles = element?.styles || {};
  const isImage = element?.isImage;
  const slotName = element?.slotName;

  const [textInput, setTextInput] = React.useState(element?.textContent || '');

  React.useEffect(() => {
    setTextInput(element?.textContent || '');
  }, [element?.textContent]);

  return (
    <div
      className="w-72 flex flex-col h-full shrink-0"
      style={{ background: '#FAF9F5', borderLeft: '1px solid #e0dbd2' }}
    >
      {/* 头部 */}
      <div
        className="px-4 py-3 flex items-center justify-between shrink-0"
        style={{ borderBottom: '1px solid #e0dbd2' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">{isImage ? '🖼' : '✏️'}</span>
          <span className="text-sm font-medium" style={{ color: '#2c2825' }}>
            {isImage ? '图片属性' : '元素属性'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded flex items-center justify-center text-xs transition-colors"
          style={{ color: '#9c9590' }}
        >
          ✕
        </button>
      </div>

      {/* 元素信息 + 槽位 */}
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid #e0dbd2', background: '#F5F2EC' }}>
        <div className="flex items-center gap-2 text-xs" style={{ color: '#9c9590' }}>
          <span
            className="px-2 py-0.5 rounded font-mono"
            style={{ background: '#ede9e2', color: '#5c5450' }}
          >
            {element?.tagName || 'ELEMENT'}
          </span>
          {element?.className && (
            <span className="truncate opacity-70">.{element.className.split(' ')[0]}</span>
          )}
        </div>

        {slotName && (
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs" style={{ color: '#D97757' }}>◆</span>
              <span className="text-xs font-mono" style={{ color: '#D97757' }}>{slotName}</span>
            </div>
            <button
              onClick={() => onLocateSlot?.(slotName)}
              className="text-xs px-2 py-1 rounded-lg transition-all"
              style={{ color: '#D97757', background: 'rgba(217,119,87,0.08)', border: '1px solid rgba(217,119,87,0.2)' }}
            >
              定位 MD
            </button>
          </div>
        )}
      </div>

      {/* 属性编辑区 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {isImage ? (
          /* 图片操作 */
          <div>
            <button
              onClick={onImageReplace}
              className="w-full py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
              style={{ background: '#F0EDE6', color: '#D97757', border: '1.5px solid #D97757' }}
            >
              🔄 替换图片
            </button>
            <p className="text-xs mt-2 text-center" style={{ color: '#b5b0a8' }}>
              或双击预览区图片替换
            </p>
          </div>
        ) : (
          <>
            {/* 文字内容编辑（canEditText 时显示） */}
            {element?.canEditText && slotName && onTextChange && (
              <div>
                <div className="text-xs mb-2" style={{ color: '#9c9590' }}>文字内容</div>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onBlur={() => {
                    if (slotName) onTextChange(slotName, textInput);
                  }}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg text-sm resize-none outline-none"
                  style={{
                    background: '#F5F2EC',
                    border: '1.5px solid #d4cfc7',
                    color: '#2c2825',
                  }}
                />
              </div>
            )}

            {/* 文字颜色 */}
            <div>
              <div className="text-xs mb-2" style={{ color: '#9c9590' }}>文字颜色</div>
              <div className="grid grid-cols-5 gap-1.5">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => onStyleChange('color', color)}
                    className="w-8 h-8 rounded-lg transition-all hover:scale-110"
                    style={{
                      background: color,
                      border: styles.color === color
                        ? '2.5px solid #D97757'
                        : '1.5px solid #d4cfc7',
                    }}
                    title={color}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="color"
                  value={styles.color?.startsWith('#') ? styles.color : '#2c2825'}
                  onChange={(e) => onStyleChange('color', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={styles.color || ''}
                  onChange={(e) => onStyleChange('color', e.target.value)}
                  className="flex-1 px-2 py-1 text-xs rounded-lg font-mono outline-none"
                  style={{ background: '#F5F2EC', border: '1px solid #d4cfc7', color: '#2c2825' }}
                  placeholder="#2c2825"
                />
              </div>
            </div>

            {/* 字号 */}
            <div>
              <div className="text-xs mb-2" style={{ color: '#9c9590' }}>
                字号 <span className="font-mono ml-1" style={{ color: '#D97757' }}>{styles.fontSize || '16px'}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {FONT_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => onStyleChange('fontSize', size)}
                    className="px-2 py-1 text-xs rounded-lg transition-all"
                    style={{
                      background: styles.fontSize === size ? '#D97757' : '#F5F2EC',
                      color: styles.fontSize === size ? '#fff' : '#6b6560',
                      border: `1px solid ${styles.fontSize === size ? '#D97757' : '#d4cfc7'}`,
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* 字重 */}
            <div>
              <div className="text-xs mb-2" style={{ color: '#9c9590' }}>字重</div>
              <div className="flex gap-2">
                {[['normal', '常规'], ['bold', '粗体']].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => onStyleChange('fontWeight', val)}
                    className="flex-1 py-2 text-sm rounded-lg transition-all"
                    style={{
                      fontWeight: val === 'bold' ? 700 : 400,
                      background: (styles.fontWeight === val || (val === 'normal' && !styles.fontWeight))
                        ? '#D97757' : '#F5F2EC',
                      color: (styles.fontWeight === val || (val === 'normal' && !styles.fontWeight))
                        ? '#fff' : '#6b6560',
                      border: '1.5px solid #d4cfc7',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 底部提示 */}
      <div className="px-4 py-3 shrink-0" style={{ borderTop: '1px solid #e0dbd2', background: '#F5F2EC' }}>
        <div className="text-xs" style={{ color: '#b5b0a8' }}>
          {slotName
            ? <>点击「定位 MD」可跳转到对应槽位 <span className="font-mono" style={{ color: '#D97757' }}>{slotName}</span></>
            : '双击预览区文字可直接编辑'
          }
        </div>
      </div>
    </div>
  );
}
