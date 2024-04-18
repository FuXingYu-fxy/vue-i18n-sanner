"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectI18nKeys = void 0;
const compiler_sfc_1 = require("@vue/compiler-sfc");
const acorn_1 = require("acorn");
const acorn_walk_1 = require("acorn-walk");
const util_1 = require("./util");
const config_1 = require("./config");
const store_1 = require("./store");
function compiler(content, { id, filename }) {
    let jsContent = [content];
    if (util_1.RE.isVue(filename)) {
        jsContent = transferVueFileToAst(content, id, filename);
    }
    return jsContent.map((code) => ((0, acorn_1.parse)(code, { sourceType: 'module', ecmaVersion: 'latest' })));
}
function transferVueFileToAst(content, id, filename) {
    var _a;
    const VueSFCparsed = (0, compiler_sfc_1.parse)(content, { sourceMap: false, ignoreEmpty: true });
    const { template, script, scriptSetup } = VueSFCparsed.descriptor;
    const templateCode = (template === null || template === void 0 ? void 0 : template.content) || '';
    const scriptCode = ((_a = (script || scriptSetup)) === null || _a === void 0 ? void 0 : _a.content) || '';
    // 将template编译为render函数
    const renderCode = (0, compiler_sfc_1.compileTemplate)({ source: templateCode, id, filename }).code;
    return [renderCode, scriptCode];
}
// 遍历ast，找到i18n函数调用
function walkAST(ast, fn) {
    const config = (0, config_1.getConfig)();
    const isI18nCallExpression = (node$1) => {
        const callee = node$1.callee;
        if (callee.type === 'MemberExpression') {
            return callee.property.type === 'Identifier' && config.scanFuncNamePatterns.includes(callee.property.name);
        }
        return false;
    };
    (0, acorn_walk_1.simple)(ast, {
        CallExpression(node$2) {
            if (isI18nCallExpression(node$2)) {
                if (node$2.arguments[0].type === 'Literal') {
                    fn(node$2.arguments[0].value);
                }
            }
        }
    }, undefined);
}
function collectI18nKeys(content, options) {
    const asts = compiler(content, options);
    for (const ast of asts) {
        walkAST(ast, store_1.addKey);
    }
}
exports.collectI18nKeys = collectI18nKeys;
