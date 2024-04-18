"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResult = exports.getKeys = exports.addKey = exports.addI18nKey = void 0;
const config_1 = require("./config");
const util_1 = require("./util");
const result = Object.create(null);
const i18nKeySet = new Set();
function addI18nKey(key, parent = result) {
    const matcher = key.match(util_1.PATH_SEPARATOR_RE);
    if (!matcher)
        return;
    const [_, firstPart, restPart] = matcher;
    if (restPart) {
        parent[firstPart] = parent[firstPart] || Object.create(null);
        addI18nKey(restPart, parent[firstPart]);
        return;
    }
    if (typeof parent[firstPart] === 'object')
        // 到最后一个了
        parent[firstPart] = (0, config_1.getConfig)().placeholder;
}
exports.addI18nKey = addI18nKey;
function addKey(key) {
    i18nKeySet.add(key);
}
exports.addKey = addKey;
function getKeys() {
    return i18nKeySet;
}
exports.getKeys = getKeys;
function getResult() {
    return result;
}
exports.getResult = getResult;
