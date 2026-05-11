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
  /**
   * 次级表面色（比 surface 更"下沉"一档的浅色底块）。
   * 用于：代码块底 / 行内 code / 输入框 / 二级信息卡的 chunk 背景 / 分组列表的条纹。
   * 映射到 CSS 变量 `--gray-100`（历史命名，语义实为"次级表面"）。
   *
   * 浅色主题：通常是 #F5-F8 之间的一档淡灰
   * 深色主题：**必须** 给一个比 surface 再深或相近的深色值，否则 dark 下的代码块会出现"大块米色方块"
   */
  surfaceSunken?: string;
  /** 卡片/面板边框 */
  border?: string;
  /**
   * 细分割线颜色（比 border 更弱、用于行间分隔 / 虚线框 / 禁用态边框）。
   * 映射到 CSS 变量 `--gray-300`。
   *
   * 深色主题如果不覆盖，默认值 #D1CFC5（浅色）会在深底上形成扎眼亮边。
   */
  borderSubtle?: string;
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

  // ===== 段留白（contained 模式下有背景色时生效） =====
  /**
   * 段**外**留白：当前段与上下相邻段/内容之间的垂直呼吸（CSS margin）。
   * 默认 '16px 0'。背景色与外层不同的主题段（如 dark 插入 ivory 页面）
   * 建议调大（24-32px），让背景块不至于"紧贴其他内容"显得拥挤。
   *
   * 取 CSS margin shorthand 语法，如 '24px 0' / '32px 0 40px'。
   */
  sectionGap?: string;
  /**
   * 段**内**留白：段容器内边距（CSS padding）。
   * 默认 '24px 28px'。想让内容在有色段内更"松"，调大这个值（例如 '40px 36px'）。
   */
  sectionInset?: string;

  // ===== 自定义 CSS（高级用法） =====
  /** 主题专属 CSS 字符串，作用于 .theme-<id> 选择器内 */
  extraCss?: string;
}
