"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.set = exports.get = exports.getFile = exports.writeFile = exports.RE = exports.getFilenameFromPath = exports.PATH_SEPARATOR_RE = void 0;
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
/**
 * 用于匹配第一个点分割符
 * ‘a.b.c' => ['a', 'b.c']
 * ‘b.c' => ['b', 'c']
 * ‘c' => ['c']
 */
exports.PATH_SEPARATOR_RE = /([^.]+)\.?(.+)?/;
function getFilenameFromPath(path) {
    return path.replace(/.+[\\\/](\w+\..+)/, '$1');
}
exports.getFilenameFromPath = getFilenameFromPath;
exports.RE = {
    isJs: (path) => /\.js$/.test(path),
    isVue: (path) => /\.vue$/.test(path),
};
function writeFile(filePath, data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // 确保文件所在目录存在,如果不存在则创建
            // await ensureDir(dirname(filePath));
            const absolutePath = (0, path_1.resolve)(process.cwd(), filePath);
            // 写入文件
            yield (0, fs_extra_1.outputFile)(absolutePath, data);
        }
        catch (err) {
            console.error(err);
        }
    });
}
exports.writeFile = writeFile;
function getFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const absolutePath = (0, path_1.resolve)(process.cwd(), filePath);
        let data;
        if (exports.RE.isJs(absolutePath)) {
            data = (yield Promise.resolve(`${absolutePath}`).then(s => __importStar(require(s)))).default;
        }
        else {
            data = yield (0, fs_extra_1.readJson)(absolutePath);
        }
        return data;
    });
}
exports.getFile = getFile;
function get(obj, path, defaultValue) {
    const paths = Array.isArray(path) ? path : path.split(/[\.\[\]]/).filter(Boolean);
    return paths.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : defaultValue), obj);
}
exports.get = get;
function set(obj, path, value) {
    const paths = Array.isArray(path) ? path : path.split(/[\.\[\]]/).filter(Boolean);
    if (paths.length === 0)
        return;
    const lastKey = paths.pop();
    const lastObj = paths.reduce((acc, key) => acc[key] || (acc[key] = {}), obj);
    lastObj[lastKey] = value;
}
exports.set = set;
