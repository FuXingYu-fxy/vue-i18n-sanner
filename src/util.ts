import { name } from '../package.json'
import { outputFile, readJson } from "fs-extra";
import { resolve } from "path";
/** 
 * 用于匹配第一个点分割符
 * ‘a.b.c' => ['a', 'b.c']
 * ‘b.c' => ['b', 'c']
 * ‘c' => ['c']
 */
export const info = (...args: any[]) => console.log(`[${name}] `, ...args)
export const PATH_SEPARATOR_RE = /([^.]+)\.?(.+)?/
export function getFilenameFromPath(path: string) {
  return path.replace(/.+[\\\/](\w+\..+)/, '$1')
}

export const RE = {
  isJs: (path: string) => /\.js$/.test(path),
  isVue: (path: string) => /\.vue$/.test(path),
}

export async function writeFile(filePath: string, data: string) {
  try {
    // 确保文件所在目录存在,如果不存在则创建
    // await ensureDir(dirname(filePath));
    const absolutePath = resolve(process.cwd(), filePath);
    
    // 写入文件
    await outputFile(absolutePath, data);
  } catch(err) {
    console.error(err);
  }
}

export async function getFile(filePath: string) {
  const absolutePath = resolve(process.cwd(), filePath);
  let data
  if (RE.isJs(absolutePath)) {
    data = (await import(absolutePath)).default
  } else {
    data = await readJson(absolutePath)
  }
  return data
}
export function get(obj: any, path: string | string[], defaultValue?: any) {
  const paths = Array.isArray(path) ? path : path.split(/[\.\[\]]/).filter(Boolean);
  return paths.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : defaultValue), obj);
}

export function set(obj: any, path: string | string[], value: any) {
  const paths = Array.isArray(path) ? path : path.split(/[\.\[\]]/).filter(Boolean);
  if (paths.length === 0) return;
  const lastKey = paths.pop()!;
  const lastObj = paths.reduce((acc, key) => acc[key] || (acc[key] = {}), obj);
  lastObj[lastKey] = value;
}