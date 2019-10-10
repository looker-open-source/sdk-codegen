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

let agentTag = "TS-SDK \(Constants.sdkVersion)"

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
let contentPatternString = try? NSRegularExpression(pattern: Constants.matchModeString, options: .caseInsensitive)

/**
 * MIME patterns for "binary" content types
 * @type {RegExp}
 */
let contentPatternBinary = try? NSRegularExpression(pattern: Constants.matchModeBinary, options: .caseInsensitive)

/**
 * MIME pattern for UTF8 charset attribute
 * @type {RegExp}
 */
let charsetUtf8Pattern = try? NSRegularExpression(pattern: Constants.matchCharsetUtf8, options: .caseInsensitive)


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

struct Promise<T> {
    
}

struct SDKResponse<TSuccess, TError> {
    
}

protocol ITransport {
    func request<TSuccess, TError>(
        method: HttpMethod,
        path: String,
        queryParams: Any?,
        body: Any?,
        authenticator: Any?, // TODO Authenticator?,
        options: Partial<ITransportSettings>?
    ) -> Promise<SDKResponse<TSuccess, TError>>
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

/** An error representing an issue in the SDK, like a network or parsing error. */
protocol ISDKError {
    
    var type: String { get } // "sdk_error"
    var message: String { get set }
}

//protocol SDKResponse: ISDKSuccessResponse, ISDKErrorResponse {
//    associatedtype TSuccess
//    associatedtype TError
//}
//<TSuccess, TError> =
//  | ISDKSuccessResponse<TSuccess>
//  | ISDKErrorResponse<TError | ISDKError>

/**
 * Base authorization interface
 */
protocol IAuthorizer {
    var settings: IApiSettings { get set }
    var transport: ITransport { get set }
    
    /** is the current session authenticated? */
    func isAuthenticated() -> Bool
    
    func authenticate(init: IRequestInit) -> Promise<IRequestInit>
    
    func logout() -> Promise<Bool>
}

/** Generic http request property collection */
protocol IRequestInit {
    /** body of request. optional */
    var body: Any? { get set }
    /** headers for request. optional */
    var headers: Any? { get set }
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

func isMatch(_ contentType: String, _ exp: NSRegularExpression) -> Bool {
    guard let range = NSRange(contentType) else { return false }
    guard let matches = exp.firstMatch(in: contentType, options: .anchored, range: range)
        else { return false }
    return matches.numberOfRanges > 0
}

/**
 * Is the content type binary or "string"?
 * @param {string} contentType
 * @returns {ResponseMode.binary | ResponseMode.string}
 */
func responseMode(contentType: String) -> ResponseMode {
    if (isMatch(contentType, contentPatternString!)) {
        return ResponseMode.string
    }
    if (isMatch(contentType, contentPatternBinary!)) {
        return ResponseMode.binary
    }
    return ResponseMode.unknown
}

/** constructs the path argument including any optional query parameters
 @param {string} path the base path of the request
 
 @param {[key: string]: string} obj optional collection of query parameters to encode and append to the path
 
 */
func addQueryParams(path: String, params: ValueDictionary?) -> String {
    if (params == nil || params?.count == 0) {
        return path
    }
    let qp = params!
        // TODO verify we don't need to filter out unset values
        //        .filter { (key: String, value: Any) -> Bool in
        //            guard value != nil { return true } else { return false }
        //    }
        .map { (key: String, value: Any ) -> String in
            "\(key)=\(value)"
    }
    .joined(separator: "&")
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
