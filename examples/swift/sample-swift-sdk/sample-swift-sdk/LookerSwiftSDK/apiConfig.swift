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

// INI parser from https://gist.github.com/jetmind/f776c0d223e4ac6aec1ff9389e874553

import Foundation

typealias SectionConfig = [String: String]
typealias Config = [String: SectionConfig]

func trim(_ s: String) -> String {
    let whitespaces = CharacterSet(charactersIn: " \n\r\t")
    return s.trimmingCharacters(in: whitespaces)
}

func stripComment(_ line: String) -> String {
    let parts = line.split(
        separator: "#",
        maxSplits: 1,
        omittingEmptySubsequences: false)
    if parts.count > 0 {
        return String(parts[0])
    }
    return ""
}

func parseSectionHeader(_ line: String) -> String {
    let from = line.index(after: line.startIndex)
    let to = line.index(before: line.endIndex)
    let range = from..<to
    return String(line[range])
}

func parseLine(_ line: String) -> (String, String)? {
    let parts = stripComment(line).split(separator: "=", maxSplits: 1)
    if parts.count == 2 {
        let k = trim(String(parts[0]))
        let v = trim(String(parts[1]))
        return (k, v)
    }
    return nil
}

func parseConfig(_ filename : String) -> Config {
    let f = try! String(contentsOfFile: filename)
    var config = Config()
    var currentSectionName = "Looker"
    for line in f.components(separatedBy: "\n") {
        let line = trim(line)
        if line.hasPrefix("[") && line.hasSuffix("]") {
            currentSectionName = parseSectionHeader(line)
        } else if let (k, v) = parseLine(line) {
            var section = config[currentSectionName] ?? [:]
            section[k] = v
            config[currentSectionName] = section
        }
    }
    return config
}

struct ApiConfig : IApiSettings {
    func readConfig(_ section: String? = nil) -> IApiSection {
        return [:]
//        let config = parseConfig(self.fileName)
//        return config[section ?? self.section] ?? [:]
    }
    
    func isConfigured() -> Bool {
        return (base_url != "" && api_version != "")
    }
    
    var base_url: String?
    
    var api_version: String?
    
    var headers: Headers?
    
    var verify_ssl: Bool?
    
    var timeout: Int?
    
    var encoding: String?
    
    private var fileName = ""
    private var section = "Looker"
    
    init() {
        self.assign(DefaultSettings())
    }
    
    init(_ settings: IApiSettings) {
        self.assign(settings)
    }
    
    // TODO figure out how to use Codable and PropertyListDecoder?
    // similar to https://www.raywenderlich.com/3418439-encoding-and-decoding-in-swift
    init(_ fileName: String, _ section: String = "Looker") throws {
        self.fileName = fileName
        self.section = section
        let config = parseConfig(fileName)
        let values = config[section]
        let defaults = DefaultSettings()
        self.base_url = values?["base_url"] as String? ?? defaults.base_url
        self.api_version = values?["api_version"] as String? ?? defaults.api_version
        self.headers = values?["headers"] as Any? ?? defaults.headers
        self.verify_ssl = values?["verify_ssl"]?.bool ?? defaults.verify_ssl
        self.timeout = Int((values?["timeout"])!) ?? defaults.timeout
        self.encoding = values?["encoding"] ?? defaults.encoding
    }
    
    mutating func assign(_ values: IApiSettings) {
        let defaults = DefaultSettings()
        self.base_url = values.base_url ?? defaults.base_url
        self.api_version = values.api_version ?? defaults.api_version
        self.headers = values.headers ?? defaults.headers
        self.verify_ssl = values.verify_ssl ?? defaults.verify_ssl
        self.timeout = values.timeout ?? defaults.timeout
        self.encoding = values.encoding ?? defaults.encoding
    }
}
