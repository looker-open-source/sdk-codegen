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

// Convenience extension for regular expression matching
extension NSRegularExpression {
    func matches(_ string: String) -> Bool {
        let range = NSRange(location: 0, length: string.utf16.count)
        return firstMatch(in: string, options: [], range: range) != nil
    }
}

// Convenience extension for regular expression matching
extension String {
    static func ~= (lhs: String, rhs: String) -> Bool {
        guard let regex = try? NSRegularExpression(pattern: rhs) else { return false }
        let range = NSRange(location: 0, length: lhs.utf16.count)
        return regex.firstMatch(in: lhs, options: [], range: range) != nil
    }
}

// Convenience extension for an encodeURI() function similar to other SDKs
extension String {
    func encodeURI() -> String {
        return self.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
    }
}

struct Constants {
    static let lookerVersion = "6.23"
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

/// Homogeneous generic Dictionary with String keys
typealias StringDictionary<Value> = Dictionary<String, Value>

/// Heterogeneous Dictionary with String keys
typealias ValueDictionary<K: Hashable, V> = Dictionary<K, V>

typealias Values = [String: Any]

/// Extension for converting a `String` to `Bool`
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

/// Structure that represents "Void" return results for the SDK response
struct Voidable : SDKModel {
}

// Support for converting a struct or class to a Dictionary of values
// Nifty code taken from https://stackoverflow.com/a/46597941/74137
struct JSON {
    static let encoder = JSONEncoder()
}

extension Encodable {
    subscript(key: String) -> Any? {
        return dictionary[key]
    }
    var dictionary: Values {
        return (try? JSONSerialization.jsonObject(with: JSON.encoder.encode(self))) as? Values ?? [:]
    }
}

extension StringProtocol {
    subscript(bounds: CountableClosedRange<Int>) -> SubSequence {
        let start = index(startIndex, offsetBy: bounds.lowerBound)
        let end = index(start, offsetBy: bounds.count)
        return self[start...end]
    }
    
    subscript(bounds: CountableRange<Int>) -> SubSequence {
        let start = index(startIndex, offsetBy: bounds.lowerBound)
        let end = index(start, offsetBy: bounds.count)
        return self[start..<end]
    }
}

extension Array where Element: LosslessStringConvertible {
    func toString(_ separator: String = ", ", _ prefix: String = "", _ suffix: String = "") -> String {
        var result = ""
        let skip = separator.count
        result = reduce(result, { $0 + separator + String($1) })
        result = String(result[skip..<result.count])
        return "\(prefix)\(result)\(suffix)"
    }
}

typealias DelimArray<T> = Array<T>

/*
class DelimArray<T> : Array<T> {
    var items: [T]
    var separator: String
    var prefix: String
    var suffix: String
    init(_ items: [T], _ separator: String = ",", _ prefix: String = "", _ suffix: String = "") {
        self.items = items
        self.separator = separator
        self.prefix = prefix
        self.suffix = suffix
    }
    
    mutating func toString() {
        let strings = self.items.map(String{$0})
        return self.prefix + separator.join(strings) + self.suffix
    }
}
*/
