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

import Foundation

// handy extensions adapted from https://www.hackingwithswift.com/articles/108/how-to-use-regular-expressions-in-swift
extension NSRegularExpression {
    convenience init(_ pattern: String, _ options: NSRegularExpression.Options = [] ) throws {
        try self.init(pattern: pattern, options: options == [] ? [.caseInsensitive, .allowCommentsAndWhitespace, .anchorsMatchLines] : options)
    }
}

extension NSRegularExpression {
    func matches(_ string: String) -> Bool {
        let range = NSRange(location: 0, length: string.utf16.count)
        return firstMatch(in: string, options: [], range: range) != nil
    }
}

extension String {
    static func ~= (lhs: String, rhs: String) -> Bool {
        guard let regex = try? NSRegularExpression(pattern: rhs) else { return false }
        let range = NSRange(location: 0, length: lhs.utf16.count)
        return regex.firstMatch(in: lhs, options: [], range: range) != nil
    }
}

struct Constants {
    static let lookerVersion = "6.21"
    static let apiVersion = "3.1"
    static let sdkVersion = #"\#(apiVersion).\#(lookerVersion)"#
    static let environmentPrefix = "LOOKERSDK"
    
    static let matchCharset = #";.*charset="#

    static let applicationJson = #"^application\/.*\bjson\b"#
    /**
     * Does this content type say it's utf-8?
     * @type Regular expression for matching charset=utf-8 in Content-Type
     */
    static let matchCharsetUtf8 = #"\#(matchCharset).*\butf-8\b"#

    /**
     * Matching rules for string/text types. String matches must be checked *before* binary matches
     * @type Regular expression for matching Content-Type headers
     */
    static let matchModeString = #"(^application\/.*(\bjson\b|\bxml\b|\bsql\b|\bgraphql\b|\bjavascript\b|\bx-www-form-urlencoded\b))|^text\/|\#(matchCharset)"#

    /**
     * Matching rules for all binary or unknown types. Binary matches must be checked *after* string matches
     * @type {string} Regular expression for matching Content-Type headers
     */
    static let matchModeBinary = #"^image\/|^audio\/|^video\/|^font\/|^application\/|^multipart\/"#
    
}

// TODO implement StringDictionary<T>
typealias StringDictionary = [String:String]

typealias ValueDictionary = [String:Any?]

// From https://stackoverflow.com/a/40629365/74137 may want to use one of the other patterns instead
//extension String: LocalizedError {
//    public var errorDescription: String? { return self }
//}

enum SdkError: Error {
    case error(String)
}

// Extension for converting a string to bool
extension String {
    var bool: Bool? {
        switch self.lowercased() {
        case "true", "t", "yes", "y", "1":
            return true
        case "false", "f", "no", "n", "0":
            return false
        default:
            return nil
        }
    }
}

