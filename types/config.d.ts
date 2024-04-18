export type Config = {
    debug: boolean;
    /** 扫描的目标文件 */
    include: string[];
    /** 哪些文件被排除 */
    exclude: string[];
    output: Record<string, string>;
    /** 扫描哪些函数名 */
    scanFuncNamePatterns: string[];
    /** 未找到对应语言的本地化时, 使用一个占位符替代 */
    placeholder: string;
    /** 本地资源文件 */
    langResources: Record<string, string>;
    langs: string[];
};
export declare function getConfig(): Config;
export declare function loadConfig(config$1: string | Config): Promise<Config>;
