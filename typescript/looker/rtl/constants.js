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
exports.defaultApiVersion = '3.1';
exports.lookerVersion = '7.6';
exports.apiVersion = '4.0';
exports.sdkVersion = exports.apiVersion + "." + exports.lookerVersion;
exports.environmentPrefix = 'LOOKERSDK';
exports.matchCharset = ';.*charset=';
exports.utf8 = 'utf-8';
/**
 * Does this content type say it's utf-8?
 * @type {string} Regular expression for matching charset=utf-8 in Content-Type
 */
exports.matchCharsetUtf8 = exports.matchCharset + ".*\\butf-8\\b";
/**
 * Matching rules for string/text types. String matches must be checked *before* binary matches
 * @type {string} Regular expression for matching Content-Type headers
 */
exports.matchModeString = "(^application\\/.*(\\bjson\\b|\\bxml\\b|\\bsql\\b|\\bgraphql\\b|\\bjavascript\\b|\\bx-www-form-urlencoded\\b)|^text\\/|.*\\+xml\\b|" + exports.matchCharset + ")";
/**
 * Matching rules for all binary or unknown types. Binary matches must be checked *after* string matches
 * @type {string} Regular expression for matching Content-Type headers
 */
exports.matchModeBinary = '^image\\/|^audio\\/|^video\\/|^font\\/|^application\\/|^multipart\\/';
/**
 * Does this string mean "true"
 * @param {string} value
 * @returns {boolean} true if matching a `true` value, false otherwise
 */
exports.isTrue = function (value) { return /^(true|t|yes|y|1)$/i.test(value); };
/**
 * Does this string mean "false"
 * @param {string} value
 * @returns {boolean} true if matching a `false` value, false otherwise
 */
exports.isFalse = function (value) { return /^(false|f|no|n|0)$/i.test(value); };
/**
 * Return true, false, or default boolean value for string representation of boolean
 * @param {string} value
 * @param {boolean} defaultBool is the value to return if the string doesn't match. defaults to false.
 * @returns {boolean} true or false
 */
exports.boolDefault = function (value, defaultBool) {
    if (defaultBool === void 0) { defaultBool = false; }
    if (exports.isTrue(value))
        return true;
    if (exports.isFalse(value))
        return false;
    return defaultBool;
};
/**
 * strip surrounding quotes from a string if it is uniformly quoted
 * @param {string | null} value to unquote
 * @returns {string | null} unquoted string if it begins and ends with the same character out of `\` " '`
 */
exports.unquote = function (value) {
    if (!value)
        return '';
    if (/^['\"`]/.test(value)) {
        var quote = value.substring(0, 1);
        // Strip surrounding quotes?
        if (value.endsWith(quote))
            return value.substring(1, value.length - 1);
    }
    return value;
};
