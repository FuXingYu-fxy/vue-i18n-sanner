import fg from "fast-glob"
import { loadConfig } from "./config"
import type { Config } from "./config"
import { createReadStream } from 'fs-extra'
import { PATH_SEPARATOR_RE, get, getFile, getFilenameFromPath, set, writeFile } from "./util"
import { collectI18nKeys } from "./compiler"
import { getKeys } from "./store"
/** 
 * 1.读取代码
 * 2.判断文件名后缀
 *   * 如果是.js文件，直接转成ast
 *   * 如果是.vue文件，使用vue-template-compiler转成template 和 script 的ast
 *     将template编译为render函数, 剩余的步骤同.js文件
 */


export async function scanner(config: string | Config) {
  const finalConfig = await loadConfig(config)
  const filePaths = fg.sync(finalConfig.include, {
    ignore: finalConfig.exclude,
    absolute: true,
  })
  let i = 0;
  for (const path of filePaths) {
    const stream = createReadStream(path, {encoding: 'utf-8'})
    let data = ''
    stream.on('data', (chunk) => {
      data += chunk
    })
    stream.on('end', async () => {
      collectI18nKeys(data, {id: path, filename: getFilenameFromPath(path)})
      if (++i === filePaths.length) {
        const output = finalConfig.output
        /** 搜集到的所有的key */
        const i18nKeys = getKeys();
        const langResources = finalConfig.langResources
        const langs = finalConfig.langs
        
        for (const lang of Object.keys(langResources)) {
          if (!langs.includes(lang)) {
            console.error(`未找到${lang}语言配置`)
            continue
          }
          const langResource = await getFile(langResources[lang])
          const normalizedResource = normalizeLangResource(langResource)
          const savedResource = {}
          for (const key of i18nKeys) {
            const translated = get(normalizedResource, key, finalConfig.placeholder)
            set(savedResource, key, translated)
          }
          writeFile(output[lang], JSON.stringify(savedResource, null, 2))
        }
      }
    })
  }
}

/**
 * 将资源文件中的key-value结构转重构为嵌套结构
 * {
 *  'a.b.c': 'v1'
 *  'a.b.d': 'v2'
 *   a: { b: { e: 'v3' }}
 * }
 * => {a: {b: {c: 'v1', d: 'v2', e: 'v3'}}
 */
function normalizeLangResource(resource: Record<string, any>) {
  const result: typeof resource = {}
  function help(obj: typeof resource, parent = result) {
    for (const key of Object.keys(obj)) {
      const matcher = key.match(PATH_SEPARATOR_RE)
      if (matcher) {
        const [_, firstPart, restPart] = matcher
        if (!restPart) {
          const needCombine = parent[firstPart] && Object.prototype.toString.call(obj[firstPart]) === '[object Object]'
          parent[firstPart] = needCombine ? help(obj[firstPart], parent[firstPart]) : obj[firstPart]
        } else {
          parent[firstPart] = parent[firstPart] || Object.create(null)
          help({[restPart]: obj[key]}, parent[firstPart])
        }
      }
    }
    return parent
  }
  return help(resource, result)
}