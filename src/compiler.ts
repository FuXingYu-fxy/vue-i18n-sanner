import { parse, compileTemplate } from '@vue/compiler-sfc'
import chalk from "chalk"
import jsx from 'acorn-jsx'
import acorn  from 'acorn'
import type { CallExpression, Program } from 'acorn'
import { simple, base, RecursiveVisitors, WalkerCallback } from 'acorn-walk'
import { RE, info } from './util'
import { getConfig } from './config'
import { addKey } from './store'
import { JSXAggregateNodeType } from './jsx-type'

const jsToAst: typeof acorn.parse = (input, options) => acorn.Parser.extend(jsx()).parse(input, options)

const ignore = () => {/** ignore */}

type EnchancedRecursiveVisitors<TState = any> = RecursiveVisitors<TState> & {
  [type in JSXAggregateNodeType['type']]?: (node: Extract<JSXAggregateNodeType, { type: type}>, state: TState, callback: WalkerCallback<TState>) => void
}

/** 扩展了针对jsx的递归算法 */
const jsxVisitor: EnchancedRecursiveVisitors = {
  ...base,
  JSXElement(node, state, c) {
    c(node.openingElement, state)
    for (const child of node.children) {
      c(child, state)
    }
    if (node.closingElement) {
      c(node.closingElement, state)
    }
  },
  JSXOpeningElement(node, state, c) {
    for (const attr of node.attributes) {
      c(attr, state)
    }
  },
  JSXAttribute(node, state, c) {
    c(node.value, state)
  },
  JSXExpressionContainer(node, state, c) {
    c(node.expression, state)
  },
  JSXClosingElement: ignore,
  JSXIdentifier: ignore,
  JSXText: ignore,
}



type Options = {
  id: string,
  filename: string,
}

function compiler(content: string, {id, filename}: Options) {
  let jsContent: string[] = [content]

  if (RE.isVue(filename)) {
    jsContent = transferVueFileToAst(content, id, filename)
  } 
  let ret: Program[]
  try {
    ret = jsContent.map((code) => (jsToAst(code, {sourceType: 'module', ecmaVersion: 'latest'})))
  } catch(err: any) {
    let str = id
    if (err.loc) {
      str = `${id}:${err.loc.line}:${err.loc.column + 1}`
    }
    info(chalk.redBright(`compiler error, unsupport sytax: ${str}`))
    ret = []
  }
  return ret
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
function walkAST(ast: Program, fn: (key: string) => void) {
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
  }, jsxVisitor)
}

export function collectI18nKeys(content: string, options: Options) {
  const asts = compiler(content, options)

  for (const ast of asts) {
    walkAST(ast, addKey)
  }
}