"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectI18nKeys = void 0;
const compiler_sfc_1 = require("@vue/compiler-sfc");
const chalk_1 = __importDefault(require("chalk"));
const acorn_jsx_1 = __importDefault(require("acorn-jsx"));
const acorn_1 = __importDefault(require("acorn"));
const acorn_walk_1 = require("acorn-walk");
const util_1 = require("./util");
const config_1 = require("./config");
const store_1 = require("./store");
const jsToAst = (input, options) => acorn_1.default.Parser.extend((0, acorn_jsx_1.default)()).parse(input, options);
const ignore = () => { };
/** 扩展了针对jsx的递归算法 */
const jsxVisitor = Object.assign(Object.assign({}, acorn_walk_1.base), { JSXElement(node, state, c) {
        c(node.openingElement, state);
        for (const child of node.children) {
            c(child, state);
        }
        if (node.closingElement) {
            c(node.closingElement, state);
        }
    },
    JSXOpeningElement(node, state, c) {
        for (const attr of node.attributes) {
            c(attr, state);
        }
    },
    JSXAttribute(node, state, c) {
        c(node.value, state);
    },
    JSXExpressionContainer(node, state, c) {
        c(node.expression, state);
    }, JSXClosingElement: ignore, JSXIdentifier: ignore, JSXText: ignore });
function compiler(content, { id, filename }) {
    let jsContent = [content];
    if (util_1.RE.isVue(filename)) {
        jsContent = transferVueFileToAst(content, id, filename);
    }
    let ret;
    try {
        ret = jsContent.map((code) => (jsToAst(code, { sourceType: 'module', ecmaVersion: 'latest' })));
    }
    catch (err) {
        let str = id;
        if (err.loc) {
            str = `${id}:${err.loc.line}:${err.loc.column + 1}`;
        }
        (0, util_1.info)(chalk_1.default.redBright(`compiler error, unsupport sytax: ${str}`));
        ret = [];
    }
    return ret;
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
    }, jsxVisitor);
}
function collectI18nKeys(content, options) {
    const asts = compiler(content, options);
    for (const ast of asts) {
        walkAST(ast, store_1.addKey);
    }
}
exports.collectI18nKeys = collectI18nKeys;
