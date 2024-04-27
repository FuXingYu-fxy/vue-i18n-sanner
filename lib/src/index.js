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
exports.scanner = void 0;
const fast_glob_1 = __importDefault(require("fast-glob"));
const config_1 = require("./config");
const fs_extra_1 = require("fs-extra");
const util_1 = require("./util");
const compiler_1 = require("./compiler");
const store_1 = require("./store");
/**
 * 1.读取代码
 * 2.判断文件名后缀
 *   * 如果是.js文件，直接转成ast
 *   * 如果是.vue文件，使用vue-template-compiler转成template 和 script 的ast
 *     将template编译为render函数, 剩余的步骤同.js文件
 */
function scanner(config) {
    return __awaiter(this, void 0, void 0, function* () {
        const finalConfig = yield (0, config_1.loadConfig)(config);
        const filePaths = fast_glob_1.default.sync(finalConfig.include, {
            ignore: finalConfig.exclude,
            absolute: true,
        });
        let i = 0;
        for (const path of filePaths) {
            const stream = (0, fs_extra_1.createReadStream)(path, { encoding: 'utf-8' });
            let data = '';
            stream.on('data', (chunk) => {
                data += chunk;
            });
            stream.on('end', () => __awaiter(this, void 0, void 0, function* () {
                (0, compiler_1.collectI18nKeys)(data, { id: path, filename: (0, util_1.getFilenameFromPath)(path) });
                if (++i === filePaths.length) {
                    const output = finalConfig.output;
                    /** 搜集到的所有的key */
                    const i18nKeys = (0, store_1.getKeys)();
                    const langResources = finalConfig.langResources;
                    const langs = finalConfig.langs;
                    for (const lang of Object.keys(langResources)) {
                        if (!langs.includes(lang)) {
                            console.error(`未找到${lang}语言配置`);
                            continue;
                        }
                        const langResource = yield (0, util_1.getFile)(langResources[lang]);
                        const normalizedResource = normalizeLangResource(langResource);
                        const savedResource = {};
                        for (const key of i18nKeys) {
                            const translated = (0, util_1.get)(normalizedResource, key, finalConfig.placeholder);
                            (0, util_1.set)(savedResource, key, translated);
                        }
                        (0, util_1.writeFile)(output[lang], JSON.stringify(savedResource, null, 2));
                    }
                }
            }));
        }
    });
}
exports.scanner = scanner;
/**
 * 将资源文件中的key-value结构转重构为嵌套结构
 * {
 *  'a.b.c': 'v1'
 *  'a.b.d': 'v2'
 *   a: { b: { e: 'v3' }}
 * }
 * => {a: {b: {c: 'v1', d: 'v2', e: 'v3'}}
 */
function normalizeLangResource(resource) {
    const result = {};
    function help(obj, parent = result) {
        for (const key of Object.keys(obj)) {
            const matcher = key.match(util_1.PATH_SEPARATOR_RE);
            if (matcher) {
                const [_, firstPart, restPart] = matcher;
                if (!restPart) {
                    const needCombine = parent[firstPart] && Object.prototype.toString.call(obj[firstPart]) === '[object Object]';
                    parent[firstPart] = needCombine ? help(obj[firstPart], parent[firstPart]) : obj[firstPart];
                }
                else {
                    parent[firstPart] = parent[firstPart] || Object.create(null);
                    help({ [restPart]: obj[key] }, parent[firstPart]);
                }
            }
        }
        return parent;
    }
    return help(resource, result);
}
