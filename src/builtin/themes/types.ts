/**
 * 主题定义
 *
 * 主题 = 一组 CSS 变量覆盖 + 字体配置 + 段背景。
 * 在渲染时，每"段"按当前 @theme 注入一段 <style data-theme-scope>，
 * 通过 CSS 选择器 .theme-<id> 限定作用域。
 *
 * 字段都是可选 —— 不指定的会从全局 SHARED_TOKENS_CSS 继承。
 */

export interface ThemeDef {
  /** 稳定 id（kebab-case），@theme 引用 */
  id: string;
  /** 显示名 */
  name: string;
  /** 一句话说明 */
  description?: string;

  // ===== 基础颜色（直接覆盖 SHARED_TOKENS） =====
  /** 段背景色（应用到段容器，不是全页 body） */
  background?: string;
  /** 正文色 */
  text?: string;
  /** 主标题/副标题色 */
  heading?: string;
  /** 加粗 / 重点色 */
  strong?: string;
  /** 强调色（链接、装饰、按钮） */
  accent?: string;
  /** 副强调色（hover / 次级装饰） */
  accentSoft?: string;
  /** 低强调色（caption / 注释） */
  muted?: string;
  /** 成功色 */
  success?: string;
  /** 警告色 */
  warning?: string;

  // ===== 字体 =====
  /** 衬线字体（用于 h1 / h2 / metric value 大数字） */
  fontSerif?: string;
  /** 无衬线字体（用于正文） */
  fontSans?: string;
  /** 等宽字体（用于代码 / 数据） */
  fontMono?: string;

  // ===== 视觉 =====
  /** 卡片/面板背景 */
  surface?: string;
  /** 卡片/面板边框 */
  border?: string;
  /** 圆角 */
  radius?: string;

  // ===== 段样式 =====
  /**
   * 主题段的视觉样式：
   * - 'contained' (默认): 段背景被页宽约束，整体与其他段宽度一致
   * - 'full-bleed':        段背景通栏到浏览器两边，内容仍按页宽居中（banner 感）
   *
   * 通过 @page 指令可以覆盖本主题的 bandStyle
   */
  bandStyle?: 'contained' | 'full-bleed';

  // ===== 自定义 CSS（高级用法） =====
  /** 主题专属 CSS 字符串，作用于 .theme-<id> 选择器内 */
  extraCss?: string;
}
