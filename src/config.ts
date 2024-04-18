import chalk from "chalk"

export type Config = {
  debug: boolean,
  /** 扫描的目标文件 */
  include: string[],
  /** 哪些文件被排除 */
  exclude: string[],
  output: Record<string, string>,
  /** 扫描哪些函数名 */
  scanFuncNamePatterns: string[],
  /** 未找到对应语言的本地化时, 使用一个占位符替代 */
  placeholder: string,
  /** 本地资源文件 */
  langResources: Record<string, string>
  langs: string[]
}
const defaultConfig: Config = {
  exclude: ['node_modules'],
  debug: false,
  output: {
    en: 'en.json',
    zh: 'zh.json'
  },
  include: ['**/*.{js,vue}'],
  scanFuncNamePatterns: ['$t', 't'],
  placeholder: '__NOT_TRANSLATE__',
  langs: ['zh', 'en'],
  langResources: {
    en: './src/lang/saved/en.json',
    zh: './src/lang/saved/zh.json'
  }
}

let config: Config

export function getConfig() {
  return config
}

export async function loadConfig(config$1: string | Config) {
  if (typeof config$1 === 'string') {
    const module_ = require(config$1)
    config$1 = module_ as Config
  }
  // TODO 校验配置文件格式
  config = {
    ...defaultConfig,
    ...config$1
  }
  if (config.debug) {
    console.log(chalk.green('配置文件加载成功: \n'), config)
  }
  return config
}