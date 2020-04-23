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
// ANSI colors
var Reset = '\x1b[0m';
// const Bright = "\x1b[1m"
// const Dim = "\x1b[2m"
// const Underscore = "\x1b[4m"
// const Blink = "\x1b[5m"
// const Reverse = "\x1b[7m"
// const Hidden = "\x1b[8m"
//
// const FgBlack = "\x1b[30m"
var FgRed = '\x1b[31m';
var FgGreen = '\x1b[32m';
var FgYellow = '\x1b[33m';
// const FgBlue = "\x1b[34m"
// const FgMagenta = "\x1b[35m"
// const FgCyan = "\x1b[36m"
// const FgWhite = "\x1b[37m"
//
// const BgBlack = "\x1b[40m"
// const BgRed = "\x1b[41m"
// const BgGreen = "\x1b[42m"
// const BgYellow = "\x1b[43m"
// const BgBlue = "\x1b[44m"
// const BgMagenta = "\x1b[45m"
// const BgCyan = "\x1b[46m"
// const BgWhite = "\x1b[47m"
// Abstraction of log so it can be skipped when quiet mode is enabled
exports.log = function (message) {
    console.log(message);
    return message;
};
var reset = function (message) { return "" + message + Reset; };
exports.warn = function (message) { return exports.log(reset("" + FgYellow + message)); };
exports.danger = function (message) {
    return exports.log(reset("" + FgRed + message));
};
exports.success = function (message) {
    return exports.log(reset("" + FgGreen + message));
};
exports.debug = function (message, value) {
    if (value !== undefined)
        console.log(message, '=>', JSON.stringify(value, null, 2));
    else
        return exports.log(message);
};
exports.dump = function (value) { return exports.log(JSON.stringify(value, null, 2)); };
exports.commentBlock = function (text, indent, commentStr) {
    if (indent === void 0) { indent = ''; }
    if (commentStr === void 0) { commentStr = '// '; }
    if (!text)
        return '';
    text = text.trim();
    if (!text)
        return '';
    var indenter = indent + commentStr;
    return indenter + text.split('\n').join('\n' + indenter);
};
