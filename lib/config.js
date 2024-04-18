"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = exports.getConfig = void 0;
const chalk_1 = __importDefault(require("chalk"));
const defaultConfig = {
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
};
let config;
function getConfig() {
    return config;
}
exports.getConfig = getConfig;
function loadConfig(config$1) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof config$1 === 'string') {
            const module_ = require(config$1);
            config$1 = module_;
        }
        // TODO 校验配置文件格式
        config = Object.assign(Object.assign({}, defaultConfig), config$1);
        if (config.debug) {
            console.log(chalk_1.default.green('配置文件加载成功: \n'), config);
        }
        return config;
    });
}
exports.loadConfig = loadConfig;
