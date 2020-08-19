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

@available(OSX 10.15, *)
open class APIMethods {
    public var authSession: IAuthorizer
    public var encoder = JSONEncoder()
    
    public init(_ authSession: IAuthorizer) {
        self.authSession = authSession
    }
    
    open func encode<T>(_ value: T) throws -> Data where T : Encodable {
        return try! encoder.encode(value)
    }
    
    open func ok<TSuccess, TError>(_ response: SDKResponse<TSuccess, TError>) throws -> TSuccess {
        switch response {
        case .success(let response):
            return response
        case .error(let error):
            // TODO implement logging
//            let message = error.errorDescription
//                ?? error.failureReason
//                ?? error.recoverySuggestion
//                ?? error.helpAnchor
//                ?? "Unknown SDK Error"
//            print("Error: \(message)")
            throw error
        }
    }
    
    open func authRequest<TSuccess: Codable, TError: Codable>(
        _ method: HttpMethod,
        _ path: String,
        _ queryParams: Values?,
        _ body: Any?,
        _ options: ITransportSettings?
    ) -> SDKResponse<TSuccess, TError> {
        return self.authSession.transport.request(
            method,
            path,
            queryParams,
            body,
            { props -> URLRequest in
                do {
                    let auth = try self.authSession.authenticate(props)
                    return auth
                } catch {
                    print("Auth Error: \(error)")
                    return props
                }
            },
            options
        )
    }
    
    /** Make a GET request */
    open func get<TSuccess: Codable, TError: Codable>(
        _ path: String,
        _ queryParams: Values?,
        _ body: Any?,
        _ options: ITransportSettings?
    ) -> SDKResponse<TSuccess, TError> {
        return self.authRequest(
            HttpMethod.GET,
            path,
            queryParams,
            body,
            options
        )
    }
    
    /** Make a HEAD request */
    open func head<TSuccess: Codable, TError: Codable>(
        _ path: String,
        _ queryParams: Values?,
        _ body: Any?,
        _ options: ITransportSettings?
    ) -> SDKResponse<TSuccess, TError> {
        return self.authRequest(
            HttpMethod.HEAD,
            path,
            queryParams,
            body,
            options
        )
    }
    
    /** Make a DELETE request */
    open func delete<TSuccess: Codable, TError: Codable>(
        _ path: String,
        _ queryParams: Values?,
        _ body: Any?,
        _ options: ITransportSettings?
    ) -> SDKResponse<TSuccess, TError> {
        return self.authRequest(
            HttpMethod.DELETE,
            path,
            queryParams,
            body,
            options
        )
    }
    
    /** Make a POST request */
    open func post<TSuccess: Codable, TError: Codable>(
        _ path: String,
        _ queryParams: Values?,
        _ body: Any?,
        _ options: ITransportSettings?
    ) -> SDKResponse<TSuccess, TError> {
        return self.authRequest(
            HttpMethod.POST,
            path,
            queryParams,
            body,
            options
        )
    }
    
    /** Make a PUT request */
    open func put<TSuccess: Codable, TError: Codable>(
        _ path: String,
        _ queryParams: Values?,
        _ body: Any?,
        _ options: ITransportSettings?
    ) -> SDKResponse<TSuccess, TError> {
        return self.authRequest(
            HttpMethod.PUT,
            path,
            queryParams,
            body,
            options
        )
    }
    
    /** Make a PATCH request */
    open func patch<TSuccess: Codable, TError: Codable>(
        _ path: String,
        _ queryParams: Values?,
        _ body: Any?,
        _ options: ITransportSettings?
    ) -> SDKResponse<TSuccess, TError> {
        return self.authRequest(
            HttpMethod.PATCH,
            path,
            queryParams,
            body,
            options
        )
    }
}
