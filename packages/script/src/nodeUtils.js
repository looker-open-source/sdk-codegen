"use strict";
/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var child_process_1 = require("child_process");
var utils_1 = require("../gen/src/utils");
exports.utf8Encoding = { encoding: 'utf-8' };
exports.utf8 = 'utf-8';
/**
 * Abstraction of reading a file so all refs go to one place
 * @param filePath name of file
 * @param encoding character encoding. defaults to utf-8
 * @returns {string}
 */
exports.readFileSync = function (filePath, encoding) {
    if (encoding === void 0) { encoding = exports.utf8; }
    return fs.readFileSync(filePath, encoding);
};
exports.isDirSync = function (filePath) {
    try {
        return fs.statSync(filePath).isDirectory();
    }
    catch (e) {
        if (e.code === 'ENOENT') {
            return false;
        }
        else {
            throw e;
        }
    }
};
exports.isFileSync = function (filePath) {
    try {
        return fs.statSync(filePath).isFile();
    }
    catch (e) {
        if (e.code === 'ENOENT') {
            return false;
        }
        else {
            throw e;
        }
    }
};
exports.quit = function (err) {
    if (err) {
        if (typeof err === 'string') {
            var message = err;
            err = new Error('Failure');
            err.message = message;
        }
        console.error("Error: " + err.name + ", " + err.message);
        console.error(err.stack);
        process.exit(1);
    }
    else {
        process.exit(0);
    }
    return ''; // spoof return type for TypeScript to not complain
};
exports.fail = function (name, message) {
    var err = new Error(message);
    err.name = name;
    return exports.quit(err);
};
exports.run = function (command, args, errMsg, warning) {
    if (warning === void 0) { warning = false; }
    // https://nodejs.org/api/child_process.html#child_process_child_process_execsync_command_options
    var options = {
        maxBuffer: 1024 * 2048,
        timeout: 300 * 1000,
        windowsHide: true,
        encoding: 'utf8',
    };
    try {
        // const result = await spawnSync(command, args, options)
        command += ' ' + args.join(' ');
        var result = child_process_1.execSync(command, options);
        return result;
    }
    catch (e) {
        if (warning) {
            utils_1.warn(errMsg);
            return '';
        }
        else {
            return exports.quit(errMsg || e);
        }
    }
};
