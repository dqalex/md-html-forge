// `?raw` 文本导入：webpack/turbopack 会把内容作为字符串返回
declare module '*.forge.md?raw' {
  const content: string;
  export default content;
}

declare module '*.html?raw' {
  const content: string;
  export default content;
}
