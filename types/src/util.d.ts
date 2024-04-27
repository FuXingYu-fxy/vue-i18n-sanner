/**
 * 用于匹配第一个点分割符
 * ‘a.b.c' => ['a', 'b.c']
 * ‘b.c' => ['b', 'c']
 * ‘c' => ['c']
 */
export declare const info: (...args: any[]) => void;
export declare const PATH_SEPARATOR_RE: RegExp;
export declare function getFilenameFromPath(path: string): string;
export declare const RE: {
    isJs: (path: string) => boolean;
    isVue: (path: string) => boolean;
};
export declare function writeFile(filePath: string, data: string): Promise<void>;
export declare function getFile(filePath: string): Promise<any>;
export declare function get(obj: any, path: string | string[], defaultValue?: any): any;
export declare function set(obj: any, path: string | string[], value: any): void;
