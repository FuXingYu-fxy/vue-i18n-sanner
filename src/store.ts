import { getConfig } from "./config"
import { PATH_SEPARATOR_RE } from "./util"

const result = Object.create(null)
const i18nKeySet = new Set<string>()


export function addI18nKey(key: string, parent = result): void {
  const matcher = key.match(PATH_SEPARATOR_RE)
  if (!matcher) return

  const [_, firstPart, restPart] = matcher
  if (restPart) {
    parent[firstPart] = parent[firstPart] || Object.create(null)
    addI18nKey(restPart, parent[firstPart])
    return
  }
  if (typeof parent[firstPart] === 'object')

  // 到最后一个了
  parent[firstPart] = getConfig().placeholder
}

export function addKey(key: string): void {
  i18nKeySet.add(key)
}

export function getKeys() {
  return i18nKeySet
}

export function getResult() {
  return result
}