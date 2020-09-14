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

/** A transport is a generic way to make HTTP requests. */

import Foundation

let agentTag = "Swift-SDK \(Constants.sdkVersion)"

/**
 * ResponseMode for an HTTP request - either binary or "string"
 */
enum ResponseMode {
    case binary, string, unknown
}

/**
 * MIME patterns for string content types
 * @type {RegExp}
 */
let contentPatternString = try? NSRegularExpression(Constants.matchModeString)

/**
 * MIME patterns for "binary" content types
 * @type {RegExp}
 */
let contentPatternBinary = try? NSRegularExpression(Constants.matchModeBinary)

/**
 * MIME pattern for UTF8 charset attribute
 * @type {RegExp}
 */
let charsetUtf8Pattern = try? NSRegularExpression(Constants.matchCharsetUtf8)

let applicationJsonPattern = try? NSRegularExpression(Constants.applicationJson)

/**
 * Default request timeout
 * @type {number} default request timeout is 120 seconds, or two minutes
 */
let defaultTimeout = 120

/**
 * Recognized HTTP methods
 */
enum HttpMethod: String {
    case GET = "GET"
    case POST = "POST"
    case PUT = "PUT"
    case DELETE = "DELETE"
    case PATCH = "PATCH"
    case TRACE = "TRACE"
    case HEAD = "HEAD"
}

// TODO implement these stubs
typealias Headers = Any
typealias Agent = Any

protocol ITransport {
    @available(OSX 10.15, *)
    func request<TSuccess: Codable, TError: Codable>(
        _ method: HttpMethod,
        _ path: String,
        _ queryParams: Values?,
        _ body: Any?,
        _ authenticator: Authenticator?,
        _ options: ITransportSettings?
    ) -> SDKResponse<TSuccess, TError>
}

/** A successful SDK call. */
protocol ISDKSuccessResponse {
    associatedtype T
    /** Whether the SDK call was successful. */
    var ok: Bool { get set } // true
    /** The object returned by the SDK call. */
    var value: T { get set }
}

/** An erroring SDK call. */
protocol ISDKErrorResponse {
    associatedtype T
    /** Whether the SDK call was successful. */
    var ok: Bool { get set } // false
    /** The error object returned by the SDK call. */
    var error: T { get set}
}

protocol ISDKError: LocalizedError {
    var message: String? { get set }
    var documentation_url: String? { get set }
}

/// Common ancestor for all error responses
struct SDKError: ISDKError, Codable {
    var message : String?
    var documentation_url: String?
    private var reason: String?
    private var suggestion: String?
    private var help: String?
    
    init() { }
    init(_ message: String, documentation_url: String? = "", reason: String? = "", suggestion: String? = "", help: String? = "") {
        self.message = message
        self.reason = reason
        self.suggestion = suggestion
        self.help = help
    }
    
    /// A localized message describing the error
    var errorDescription: String? { get { return self.message } }

    /// A localized message describing the reason for the failure.
    var failureReason: String? { get { return self.reason } }

    /// A localized message describing how one might recover from the failure.
    var recoverySuggestion: String? { get { return self.suggestion } }

    /// A localized message providing "help" text if the user requests help.
    var helpAnchor: String? { get { return self.help } }
}

/// For deserializating JSON into SDK structures
/// This could remain the same as simply `Codable`, but this abstraction is introduced for future extensibility
protocol SDKModel: Codable {
}

enum SDKResponse<TSuccess, TError> where TError: ISDKError {
    case success(TSuccess)
    case error(TError)
}

func SDKOk(_ response: SDKResponse<Any, SDKError>) throws -> Any {
    switch response {
    case .success(let response):
        return response
    case .error(let error):
        throw SDKError(error.errorDescription
            ?? error.failureReason
            ?? error.recoverySuggestion
            ?? error.helpAnchor
            ?? "Unknown SDK Error")
    }
}

/** Generic http request property collection */
protocol IRequestInit {
    /** body of request. optional */
    var body: Any? { get set }
    /** headers for request. optional */
    var headers: StringDictionary<String>? { get set }
    /** Http method for request. required. */
    var method: HttpMethod { get set }
    /** Redirect processing for request. optional */
    var redirect: Any? { get set }
    
    /** http.Agent instance, allows custom proxy, certificate etc. */
    var agent: Agent? { get set }
    /** support gzip/deflate content encoding. false to disable */
    var compress: Bool? { get set }
    /** maximum redirect count. 0 to not follow redirect */
    var follow: Int? { get set }
    /** maximum response body size in bytes. 0 to disable */
    var size: Int? { get set }
    /** req/res timeout in ms, it resets on redirect. 0 to disable (OS limit applies) */
    var timeout: Int? { get set }
}

typealias Authenticator = (_ req: URLRequest) -> URLRequest

/**
 * Base authorization interface
 */
protocol IAuthorizer {
    var settings: IApiSettings { get set }
    var transport: ITransport { get set }
    
    /** is the current session authenticated? */
    func isAuthenticated() -> Bool
    
    func authenticate(_ props: URLRequest) -> URLRequest
    
    func logout() -> Bool
}

/** General purpose authentication callback */
//protocol Authenticator {
//    func (init: Any) -> Any
//}

/** Interface for API transport values */
protocol ITransportSettings {
    /** base URL of host address */
    var base_url: String? { get set }
    /** api version */
    var api_version: String? { get set }
    /** standard headers to provide in all transport requests */
    var headers: Headers? { get set }
    /** whether to verify ssl certs or not. Defaults to true */
    var verify_ssl: Bool? { get set }
    /** request timeout in seconds. Default to 30 */
    var timeout: Int? { get set }
    /** encoding override */
    var encoding: String? { get set }
}

/// Returns `True` if `contentType` is charset utf-8
func isMimeUtf8(_ contentType: String) -> Bool {
    return charsetUtf8Pattern?.matches(contentType) ?? false
}

/// Returns `True` if `contentType` is JSON
func isMimeJson(_ contentType: String) -> Bool {
    return applicationJsonPattern?.matches(contentType) ?? false
}

/// Is the content type binary or "string"?
/// @param {String} contentType
/// @returns {ResponseMode.binary | ResponseMode.string | ResponseMode.unknown}
func responseMode(_ contentType: String) -> ResponseMode {
    if (contentPatternString!.matches(contentType)) {
        return ResponseMode.string
    }
    if (contentPatternBinary!.matches(contentType)) {
        return ResponseMode.binary
    }
    return ResponseMode.unknown
}

// Remove all "optional" possibly nil values from the dictionary
func notAnOption(_ values: Values) -> ValueDictionary<String, Any> {
    var result = ValueDictionary<String, Any>()
    for (key, optional) in values {
        if let un = optional {
            result[key] = un
        }
    }
    return result
}

/** constructs the path argument including any optional query parameters
 @param path the base path of the request
 
 @param params optional collection of query parameters to encode and append to the path
 
 */
func addQueryParams(_ path: String, _ params: Values?) -> String {
    if (params == nil || params?.count == 0) {
        return path
    }
    var qp = ""
    if let up = params {
        // Strip out any values that may be assigned that are nil.
        let vals = notAnOption(up)
        qp = vals
            // TODO verify we don't need to filter out unset values
            //        .filter { (key: String, value: Any) -> Bool in
            //            guard value != nil { return true } else { return false }
            //    }
            .map { (key: String, value: Any ) -> String in
                "\(key)=\(asQ(value))"
        }
        .joined(separator: "&")
    }
    var result = path
    if (qp != "") { result += "?" + qp }
    return result
}

//func sdkError(result: Any) -> Error {
//  if ("message" in result && typeof result.message === "string") {
//    return Error(result.message)
//  }
//  if ("error" in result && "message" in result.error && typeof result.error.message === "string") {
//    return Error(result.error.message)
//  }
//  let error = JSON.stringify(result)
//  return Error("Unknown error with SDK method \(error)")
//}
