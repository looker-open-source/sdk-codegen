/**

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

public struct Constants {
    public static let lookerVersion = "24.4"
    public static let apiVersion = "4.0"
    public static let defaultApiVersion = "4.0" // Swift requires API 4.0
    public static let sdkVersion = #"\#(apiVersion).\#(lookerVersion)"#
    public static let environmentPrefix = "LOOKERSDK"

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
    static let matchModeString = #"(^application\/.*(\bjson\b|\bxml\b|\bsql\b|\bgraphql\b|\bjavascript\b|\bx-www-form-urlencoded\b))|^text\/|.*\+xml\b|\#(matchCharset)"#

    /**
     * Matching rules for all binary or unknown types. Binary matches must be checked *after* string matches
     * @type {string} Regular expression for matching Content-Type headers
     */
    static let matchModeBinary = #"^image\/|^audio\/|^video\/|^font\/|^application\/|^multipart\/"#

}

/// Homogeneous generic Dictionary with String keys
public typealias StringDictionary<Value> = Dictionary<String, Value>

/// Heterogeneous Dictionary with String keys
public typealias ValueDictionary<K: Hashable, V> = Dictionary<K, V>

public typealias Values = [String: Any?]

/// Extension for converting a `String` to `Bool`
public extension String {
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
    var int: Int? {
        return Int(self)
    }
}

/// Structure that represents "Void" return results for the SDK response
//struct Voidable : SDKModel {
//}

public typealias Voidable = String

public func unquote(_ value: String?) -> String? {
    guard let v = value else { return value }
    let first = v.first
    if (first == "'" || first == "\"" || first == "`") {
        let last = v.last
        if (last == first) {
            return String(v.dropFirst().dropLast())
        }
    }
    return v
}

public func isTrue(_ value: String?) -> Bool {
    guard let val = value else { return false }
    return val.bool == true
}

public func isFalse(_ value: String?) -> Bool {
    guard let val = value else { return false }
    return val.bool == false
}

public func defaultBool(_ value: String?, _ defaultVal: Bool = false) -> Bool {
    if isTrue(value) { return true }
    if isFalse(value) { return false }
    return defaultVal
}

public func envVar(_ name: String, _ defaultVal: String? = nil) -> String? {
    if let val = unquote(ProcessInfo.processInfo.environment[name]) {
        return val
    } else {
        return defaultVal
    }
}

public func isOptional(_ value: Any) -> Bool {
    let mirror = Mirror(reflecting: value)
    let style = mirror.displayStyle
    return style == .optional
}

public func unwrap(_ any:Any) -> Any? {

    let mi = Mirror(reflecting: any)
    if mi.displayStyle != .optional {
        return any
    }

    if mi.children.count == 0 { return nil }
    let (_, some) = mi.children.first!
    return some

}

public extension StringProtocol {
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

public extension Array where Element: LosslessStringConvertible {
    func toString(_ separator: String = ",", _ prefix: String = "", _ suffix: String = "") -> String {
        var result = ""
        let skip = separator.count
        result = reduce(result, { $0 + separator + String($1) })
        result = String(result[skip..<result.count])
        return "\(prefix)\(result)\(suffix)"
    }
}

/// TODO figure out the best way to deserialize URIs.
public typealias URI = String

/// TODO create type that supports `separator=","` and `prefix=""` and `suffix=""`
public typealias DelimArray<T> = Array<T>

// TODO: UTC date routines from this code. Are they necessary?
// https://stackoverflow.com/a/28016692/74137
//@available(OSX 10.12, *)
//extension ISO8601DateFormatter {
//    convenience init(_ formatOptions: Options, timeZone: TimeZone = TimeZone(secondsFromGMT: 0)!) {
//        self.init()
//        self.formatOptions = formatOptions
//        self.timeZone = timeZone
//    }
//}
//
//@available(OSX 10.13, *)
//extension Formatter {
//    static let iso8601 = ISO8601DateFormatter([.withInternetDateTime, .withFractionalSeconds])
//}
//
//@available(OSX 10.13, *)
//extension Date {
//    var iso8601: String {
//        return Formatter.iso8601.string(from: self)
//    }
//}
//
//@available(OSX 10.13, *)
//extension String {
//    var iso8601: Date? {
//        return Formatter.iso8601.date(from: self)
//    }
//}
//
//@available(OSX 10.13, *)
//extension JSONDecoder.DateDecodingStrategy {
//    static let iso8601withFractionalSeconds = custom {
//        let container = try $0.singleValueContainer()
//        let string = try container.decode(String.self)
//        guard let date = Formatter.iso8601.date(from: string) else {
//            throw DecodingError.dataCorruptedError(in: container,
//                  debugDescription: "Invalid date: " + string)
//        }
//        return date
//    }
//}
//
//@available(OSX 10.13, *)
//extension JSONEncoder.DateEncodingStrategy {
//    static let iso8601withFractionalSeconds = custom {
//        var container = $1.singleValueContainer()
//        try container.encode(Formatter.iso8601.string(from: $0))
//    }
//}
//
//@available(OSX 10.13, *)
//func UTCDate(_ dateString: String) -> Date? {
//    if let date = dateString.iso8601 {
//        return date
//    }
//    // No error handling, just return nil
//    return nil
//}

/// YYYYMMDD date representation to Date
public func SToD(_ dateString: String) -> Date? {
    let formatter = DateFormatter()
    formatter.dateFormat = "YYYYMMDD"
    return formatter.date(from: dateString)
}

/// Date to string YYYYMMDD representation
public func DToS(_ date: Date) -> String {
    let formatter = DateFormatter()
    formatter.dateFormat = "YYYYMMDD"
    return formatter.string(from: date)
}

//public struct Safe {
//    static let Dashboard = "content_favorite_id,content_metadata_id,description,hidden,id,model,query_timezone,readonly,refresh_interval,created_at,title,user_id,background_color,dashboard_layouts,delete,deleted_at,deleter_id,edit_uri,favorite_count,last_accessed_at,last_viewed_at,load_configuration,lookml_link_id,show_filters_bar,show_title,slug,space_id,folder_id,text_tile_text_color,tile_background_color,tile_text_color,title_color,view_count,settings,can"
//
//}
