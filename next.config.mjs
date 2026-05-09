/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 允许把 .html 模板作为原始文本通过 import 读取
  webpack: (config) => {
    config.module.rules.push({
      test: /\.html$/i,
      resourceQuery: /raw/,
      type: 'asset/source',
    });
    return config;
  },
  // Turbopack 对 *.html?raw 的等价规则
  turbopack: {
    rules: {
      '*.html': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
