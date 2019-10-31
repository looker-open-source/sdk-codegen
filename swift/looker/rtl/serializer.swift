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

extension DateFormatter {
    static let iso8601Full: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZZZZZ"
        formatter.calendar = Calendar(identifier: .iso8601)
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        formatter.locale = Foundation.Locale(identifier: "en_US_POSIX")
        return formatter
    }()
}

/// Convert a JSON string into the type `T`
/// @throws errors if deserialization fails
/// some interesting date decoding options here: https://stackoverflow.com/questions/44682626/swifts-jsondecoder-with-multiple-date-formats-in-a-json-string
/// https://benscheirman.com/2017/06/swift-json/ excplores lots of options, none that help with strings misrepresented as int
func deserialize<T>(_ data: Data) throws -> T where T : Codable {
    let decoder = JSONDecoder()
    decoder.dateDecodingStrategy = .formatted(DateFormatter.iso8601Full)
//    decoder.dateDecodingStrategyFormatters = [
//        DateFormatter.iso8601Full,
//        DateFormatter.iso8601,
//        DateFormatter.standardT,
//        DateFormatter.standard,
//        DateFormatter.yearMonthDay
//    ]
    do {
        let result: T = try decoder.decode(T.self, from: data)
        return result
    } catch {
        throw error
    }
    
}
/// Convert a JSON string into the type `T`
/// @throws errors if deserialization fails
@available(OSX 10.12, *)
func deserialize<T>(_ json: String) throws -> T where T : Codable {
    return try deserialize(Data(json.utf8))
}

// Support for converting a struct or class to a Dictionary of values
// Nifty code taken from https://stackoverflow.com/a/46597941/74137
struct JSON {
    static let encoder = JSONEncoder()
}

extension Encodable {
    subscript(key: String) -> Any? {
        return dictionary[key] as Any?
    }
    var dictionary: Values {
        return (try? JSONSerialization.jsonObject(with: JSON.encoder.encode(self))) as? Values ?? [:]
    }
}

/// handling date strings in JSON
/// https://stackoverflow.com/questions/44682626/swifts-jsondecoder-with-multiple-date-formats-in-a-json-string
extension JSONDecoder {
    
    /// Assign multiple DateFormatter to dateDecodingStrategy
    ///
    /// Usage :
    ///
    ///      decoder.dateDecodingStrategyFormatters = [ DateFormatter.standard, DateFormatter.yearMonthDay ]
    ///
    /// The decoder will now be able to decode two DateFormat, the 'standard' one and the 'yearMonthDay'
    ///
    /// Throws a 'DecodingError.dataCorruptedError' if an unsupported date format is found while parsing the document
    var dateDecodingStrategyFormatters: [DateFormatter]? {
        @available(*, unavailable, message: "This variable is meant to be set only")
        get { return nil }
        set {
            guard let formatters = newValue else { return }
            self.dateDecodingStrategy = .custom { decoder in
                
                let container = try decoder.singleValueContainer()
                let dateString = try container.decode(String.self)
                
                for formatter in formatters {
                    if let date = formatter.date(from: dateString) {
                        return date
                    }
                }
                
                throw DecodingError.dataCorruptedError(in: container, debugDescription: "Cannot decode date string \(dateString)")
            }
        }
    }
}

extension DateFormatter {
    static let iso8601: DateFormatter = {
        var formatter = DateFormatter()
        formatter.locale = Foundation.Locale(identifier: "en_US_POSIX")
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ssXXXXX"
        return formatter
    }()
    
    static let standardT: DateFormatter = {
        var formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        return formatter
    }()
    
    static let standard: DateFormatter = {
        var formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
        return formatter
    }()
    
    static let yearMonthDay: DateFormatter = {
        var formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter
    }()
}


// Handling JSON that doesn't QUITE conform to spec https://stackoverflow.com/a/47936036/74137
enum Variant: Codable {
    case string(String)
    case int(Int64)
    case bool(Bool)
    case double(Double)
    case date(Date)
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case .string(let string):
            try container.encode(string)
        case .int(let int):
            try container.encode(int)
        case .bool(let bool):
            try container.encode(bool)
        case .double(let double):
            try container.encode(double)
        case .date(let date):
            try container.encode(date)
        }
    }
    
    func get() -> Any {
        switch self {
        case .string(let string):
            return string
        case .int(let int):
            return int
        case .bool(let bool):
            return bool
        case .double(let double):
            return double
        case .date(let date):
            return date
        }
    }
    
    func getInt() -> Int64? {
        switch self {
        case .string(let string):
            return Int64(string)
        case .int(let int):
            return int
        case .bool(let bool):
            return bool ? 1 : 0
        case .double(let double):
            return Int64(double)
        case .date(let date):
            return Int64((date.timeIntervalSince1970 * 1000.0).rounded())
        }
    }
    
    func getString() -> String {
        switch self {
        case .string(let string):
            return string
        case .int(let int):
            return String(int)
        case .bool(let bool):
            return bool ? "true" : "false"
        case .double(let double):
            return String(double)
        case .date(let date):
            return DateFormatter.iso8601Full.string(from: date)
        }
    }
    
    func getBool() -> Bool? {
        switch self {
        case .string(let string):
            let lo = string.lowercased()
            return lo == "yes" || lo == "y" || lo == "true" || lo == "t" || lo == "1"
        case .int(let int):
            return int != 0
        case .bool(let bool):
            return bool
        case .double(let double):
            return double != 0.0
        case .date(let date):
            return date > Date.distantPast
        }
    }
    
    func getDouble() -> Double? {
        switch self {
        case .string(let string):
            return Double(string)
        case .int(let int):
            return Double(int)
        case .bool(let bool):
            return bool ? 1.0 : 0.0
        case .double(let double):
            return double
        case .date(let date):
            return Double(date.timeIntervalSince1970)
        }
    }
    
    func getDate() -> Date? {
        switch self {
        case .string(let string):
            return DateFormatter.iso8601Full.date(from: string)
        case .int(let int):
            return Date(timeIntervalSince1970: TimeInterval(int))
        case .bool(let bool):
            // suspect interpretation of "bool"
            return bool ? Date() : Date.distantPast
        case .double(let double):
            let int = Int64(double.rounded())
            return Date(timeIntervalSince1970: TimeInterval(int))
        case .date(let date):
            return date
        }

    }
    
    init(from decoder: Decoder) throws {
        var str: String
        let container = try decoder.singleValueContainer()
        do {
//            str = try decoder.unkeyedContainer() as! Stringß
            self = try .string(container.decode(String.self))
        } catch DecodingError.typeMismatch {
            do {
                self = try .int(container.decode(Int64.self))
            } catch DecodingError.typeMismatch {
                do {
                    self = try .bool(container.decode(Bool.self))
                } catch DecodingError.typeMismatch {
                    do {
                        self = try .bool(container.decode(Bool.self))
                    } catch {
                        do {
                            self = try .date(container.decode(Date.self))
                        } catch DecodingError.typeMismatch {
                            do {
                                // coerce value to String
                                // let str : String = try container.decode(String.self)
                                str = "Error at: \(container.codingPath)"
//                                str = try decoder.unkeyedContainer() as! String
                                self = .string(str)
                            } catch DecodingError.typeMismatch {
                                throw DecodingError.typeMismatch(
                                    Variant.self,
                                    DecodingError.Context(
                                        codingPath: decoder.codingPath,
                                        debugDescription: "Encoded payload not of an expected type"))
                            }
                        }
                    }
                }
            }
        }
    }
}
