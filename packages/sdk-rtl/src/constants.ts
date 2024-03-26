/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */

export const matchCharset = ';.*charset=';

/**
 * Does this content type say it's utf-8?
 * @type {string} Regular expression for matching charset=utf-8 in Content-Type
 */
export const matchCharsetUtf8 = `${matchCharset}.*\\butf-8\\b`;

/**
 * Matching rules for string/text types. String matches must be checked *before* binary matches
 * @type {string} Regular expression for matching Content-Type headers
 */
export const matchModeString = `(^application\\/.*(\\bjson\\b|\\bxml\\b|\\bsql\\b|\\bgraphql\\b|\\bjavascript\\b|\\bx-www-form-urlencoded\\b)|^text\\/|.*\\+xml\\b|${matchCharset})`;

/**
 * Matching rules for all binary or unknown types. Binary matches must be checked *after* string matches
 * @type {string} Regular expression for matching Content-Type headers
 */
export const matchModeBinary =
  '^image\\/|^audio\\/|^video\\/|^font\\/|^application\\/|^multipart\\/';

/**
 * Does this string mean "true"
 * @param {string} value
 * @returns {boolean} true if matching a `true` value, false otherwise
 */
export const isTrue = (value: string) => /^(true|t|yes|y|1)$/i.test(value);

/**
 * Does this string mean "false"
 * @param {string} value
 * @returns {boolean} true if matching a `false` value, false otherwise
 */
export const isFalse = (value: string) => /^(false|f|no|n|0)$/i.test(value);

/**
 * Return true, false, or default boolean value for string representation of boolean
 * @param {string} value
 * @param {boolean} defaultBool is the value to return if the string doesn't match. defaults to false.
 * @returns {boolean} true or false
 */
export const boolDefault = (value: string, defaultBool = false) => {
  if (isTrue(value)) return true;
  if (isFalse(value)) return false;
  return defaultBool;
};

/**
 * strip surrounding quotes from a string if it is uniformly quoted
 * @param {string | null} value to unquote
 * @returns {string | null} unquoted string if it begins and ends with the same character out of `\` " '`
 */
export const unquote = (value: string | undefined | null): string => {
  if (!value) return '';
  if (/^['"`]/.test(value)) {
    const quote = value.substring(0, 1);
    // Strip surrounding quotes?
    if (value.endsWith(quote)) return value.substring(1, value.length - 1);
  }
  return value;
};

/**
 * Documented type alias because URL assignment construction is not compatible with API parameters
 */
export type Url = string;

/** Documented type to clarify SDK hash types */
export interface IDictionary<T> {
  [key: string]: T;
}

/**
 * Documented type alias for password spec
 */
export type Password = string;
