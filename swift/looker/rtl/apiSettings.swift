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

public let strLookerBaseUrl = "\(Constants.environmentPrefix)_BASE_URL"
public let strLookerApiVersion = "\(Constants.environmentPrefix)_API_VERSION"
public let strLookerVerifySsl = "\(Constants.environmentPrefix)_VERIFY_SSL"
public let strLookerTimeout = "\(Constants.environmentPrefix)_TIMEOUT"
public let strLookerClientId = "\(Constants.environmentPrefix)_CLIENT_ID"
public let strLookerClientSecret = "\(Constants.environmentPrefix)_CLIENT_SECRET"
public let strBadConfiguration = """
\(agentTag) configuration error:
Missing required configuration values like base_url and api_version
"""

public protocol IApiSettings: ITransportSettings {
    func isConfigured() -> Bool
    func readConfig(_ section: String?) -> IApiSection
}

public typealias IApiSection = SectionConfig

/**
 * default the runtime configuration settings
 * @constructor
 *
 */
public struct DefaultSettings : IApiSettings {
    public func isConfigured() -> Bool {
        return false
    }
    public func readConfig(_ section: String? = nil) -> IApiSection {
        return [:]
    }
    public var base_url: String? = ""
    public var api_version: String? = defaultApiVersion
    public var verify_ssl: Bool? = true
    public var timeout: Int? = defaultTimeout
    public var headers: Headers?
    public var encoding: String?
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
public func ValueSettings(_ values: StringDictionary<String>) -> IApiSettings {
    var defaults = DefaultSettings()
    defaults.api_version = unquote(values[strLookerApiVersion]) ?? defaults.api_version
    defaults.base_url = unquote(values[strLookerBaseUrl]) ?? defaults.base_url
    defaults.verify_ssl = defaultBool(unquote(values[strLookerVerifySsl]), true)
    if (values[strLookerTimeout] != nil) {
        defaults.timeout = Int(unquote(values[strLookerTimeout])!)!
    }
    return defaults
}

/**
 * @struct  ApiSettings
 *
 * .ini Configuration initializer
 */
public struct ApiSettings: IApiSettings {
    public func readConfig(_ section: String? = nil) -> IApiSection {
        return [:]
    }
    
    public var base_url: String?
    public var api_version: String?
    public var verify_ssl: Bool?
    public var timeout: Int?
    public var headers: Headers?
    public var encoding: String?
    
    public init() { }
    
    public init(_ settings: IApiSettings) throws {
        let defaults = DefaultSettings()
        // coerce types to declared types since some paths could have non-conforming settings values
        self.base_url = unquote(settings.base_url) ?? defaults.base_url
        self.api_version = unquote(settings.api_version) ?? defaults.api_version
        self.verify_ssl = settings.verify_ssl ?? defaults.verify_ssl
        self.timeout = settings.timeout ?? defaults.timeout
        self.headers = settings.headers ?? defaults.headers
        self.encoding = unquote(settings.encoding) ?? defaults.encoding
        if (!self.isConfigured()) {
            throw SDKError(strBadConfiguration)
        }
    }
    
    public func isConfigured() -> Bool {
        return (self.base_url != "" && self.api_version != "")
    }
}

