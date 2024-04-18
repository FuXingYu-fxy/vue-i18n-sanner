import { parse, compileTemplate, walk } from '@vue/compiler-sfc'
import chalk from "chalk"
import {parse as jsToAst} from 'acorn'
import type { CallExpression, Identifier, MemberExpression } from 'acorn'
import {simple} from 'acorn-walk'
import { RE } from './util'
import { getConfig } from './config'
import { addI18nKey, addKey, getResult } from './store'

type Options = {
  id: string,
  filename: string,
}

function compiler(content: string, {id, filename}: Options) {
  let jsContent: string[] = [content]

  if (RE.isVue(filename)) {
    jsContent = transferVueFileToAst(content, id, filename)
  } 
  return jsContent.map((code) => (jsToAst(code, {sourceType: 'module', ecmaVersion: 'latest'})))
}

function transferVueFileToAst(content: string, id: string, filename: string) {
  const VueSFCparsed = parse(content, { sourceMap: false, ignoreEmpty: true})
  const { template, script, scriptSetup} = VueSFCparsed.descriptor
  const templateCode = template?.content || ''
  const scriptCode = (script || scriptSetup)?.content || ''

  // 将template编译为render函数
  const renderCode = compileTemplate({source: templateCode , id, filename}).code
  return [renderCode, scriptCode]
}



// 遍历ast，找到i18n函数调用
function walkAST(ast: ReturnType<typeof jsToAst>, fn: (key: string) => void) {
  const config = getConfig()
  const isI18nCallExpression = (node$1: CallExpression) => {
    const callee = node$1.callee
    if (callee.type === 'MemberExpression') {
      return callee.property.type === 'Identifier' && config.scanFuncNamePatterns.includes(callee.property.name)
    }
    return false
  }
  simple(ast, {
    CallExpression(node$2) {
      if (isI18nCallExpression(node$2)) {
        if (node$2.arguments[0].type === 'Literal') {
          fn(node$2.arguments[0].value as string)
        }
      }
    }
  }, undefined)
}

export function collectI18nKeys(content: string, options: Options) {
  const asts = compiler(content, options)

  for (const ast of asts) {
    walkAST(ast, addKey)
  }
}