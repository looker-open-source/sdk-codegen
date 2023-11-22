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

let strLookerBaseUrl = "\(Constants.environmentPrefix)_BASE_URL"
let strLookerApiVersion = "\(Constants.environmentPrefix)_API_VERSION"
let strLookerVerifySsl = "\(Constants.environmentPrefix)_VERIFY_SSL"
let strLookerTimeout = "\(Constants.environmentPrefix)_TIMEOUT"
let strLookerClientId = "\(Constants.environmentPrefix)_CLIENT_ID"
let strLookerClientSecret = "\(Constants.environmentPrefix)_CLIENT_SECRET"
let strBadConfiguration = """
\(agentTag) configuration error:
Missing required configuration values like base_url and api_version
"""

protocol IApiSettings: ITransportSettings {
    func isConfigured() -> Bool
    func readConfig(_ section: String?) -> IApiSection
}

typealias IApiSection = SectionConfig

/**
 * default the runtime configuration settings
 * @constructor
 *
 */
struct DefaultSettings : IApiSettings {
    func isConfigured() -> Bool {
        return false
    }
    func readConfig(_ section: String? = nil) -> IApiSection {
        return [:]
    }
    var base_url: String? = ProcessInfo.processInfo.environment[strLookerBaseUrl] ?? ""
    var api_version: String? = ProcessInfo.processInfo.environment[strLookerApiVersion] ?? "4.0"
    var verify_ssl: Bool? = true
    var timeout: Int? = defaultTimeout
    var headers: Headers?
    var encoding: String?
}

/**
 * Read any key/value collection for environment variable names and return as IApiSettings
 * @constructor
 *
 * The values keys are:
 *  - <environmentPrefix>_BASE_URL
 *  - <environmentPrefix>_API_VERSION
 *  - <environmentPrefix>_CLIENT_ID
 *  - <environmentPrefix>_CLIENT_SECRET
 *  - <environmentPrefix>_VERIFY_SSL
 *  - <environmentPrefix>_TIMEOUT
 */
func ValueSettings(_ values: StringDictionary<String>) -> IApiSettings {
    var settings = DefaultSettings()
    settings.api_version = values[strLookerApiVersion] ?? settings.api_version
    settings.base_url = values[strLookerBaseUrl] ?? settings.base_url
    if (values[strLookerVerifySsl] != nil) {
        let v = values[strLookerVerifySsl]!.lowercased()
        settings.verify_ssl = v == "true" || v == "1"
    }
    if (values[strLookerTimeout] != nil) {
        settings.timeout = Int(values[strLookerTimeout]!)!
    }
    return settings
}

/**
 * @struct  ApiSettings
 *
 * .ini Configuration initializer
 */
struct ApiSettings: IApiSettings {
    func readConfig(_ section: String? = nil) -> IApiSection {
        return [:]
    }
    
    var base_url: String?
    var api_version: String?
    var verify_ssl: Bool?
    var timeout: Int?
    var headers: Headers?
    var encoding: String?
    
    init() {
        
    }
    
    init(_ settings: IApiSettings) throws {
        let defaults = DefaultSettings()
        // coerce types to declared types since some paths could have non-conforming settings values
        self.base_url = settings.base_url ?? defaults.base_url
        self.api_version = settings.api_version ?? defaults.api_version
        self.verify_ssl = settings.verify_ssl ?? defaults.verify_ssl
        self.timeout = settings.timeout ?? defaults.timeout
        self.headers = settings.headers ?? defaults.headers
        self.encoding = settings.encoding ?? defaults.encoding
        if (!self.isConfigured()) {
            throw SDKError(strBadConfiguration)
        }
    }
    
    func isConfigured() -> Bool {
        return (self.base_url != "" && self.api_version != "")
    }
}

