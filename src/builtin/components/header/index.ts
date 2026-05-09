/**
 * header 类目聚合
 *
 * 新增组件时：
 *   1. 新建 header/xxx.ts，default export defineComponent({...})
 *   2. 在此 import 并加到数组
 */

import Header from './header';
import MetaPills from './meta-pills';

export const HEADER_COMPONENTS = [
  Header,
  MetaPills,
];
