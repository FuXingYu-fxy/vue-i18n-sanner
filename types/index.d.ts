import type { Config } from "./config";
/**
 * 1.读取代码
 * 2.判断文件名后缀
 *   * 如果是.js文件，直接转成ast
 *   * 如果是.vue文件，使用vue-template-compiler转成template 和 script 的ast
 *     将template编译为render函数, 剩余的步骤同.js文件
 */
export declare function scanner(config: string | Config): Promise<void>;
