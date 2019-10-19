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

//class BaseTransport : ITransport {
// TODO why doesn't this implementation satisfy ITransport?!?!?
class BaseTransport {
    
    let session = URLSession.shared
    var apiPath = ""
    var options: ITransportSettings
    
    init(_ options: ITransportSettings) {
        self.options = options
        self.apiPath = "\(options.base_url!)/api/\(options.api_version!)"
    }
    
    func request<TSuccess, TError> (
        _ method: HttpMethod,
        _ path: String,
        _ queryParams: Any?,
        _ body: Any?,
        _ authenticator: Authenticator?,
        _ options: ITransportSettings?
    ) throws -> SDKResponse<TSuccess, TError> {
        var settings = options
        if (settings == nil) {
            settings = self.options
        } else {
            settings?.headers = options?.headers ?? self.options.headers
            settings?.timeout = options?.timeout ?? self.options.timeout
            settings?.encoding = options?.encoding ?? self.options.encoding
        }
        let req = self.initRequest(method, path, queryParams, body, authenticator, settings)
        if (req == nil) {
            throw SDKError("The SDK call failed. Invalid properties for request \(method.rawValue) \(path)")
            //            return SDKResponse.error(err)
        }
        var ok: Bool = false
        var success: TSuccess? = nil
        var fail: TError? = nil
        self.session.dataTask(with: req!) { data, response, error in
            print(data as Any)
            print(response as Any)
            print(error as Any)
            if let error = error as NSError? {
                NSLog("task transport error %@ / %d", error.domain, error.code)
                return
            }
            let response = response as! HTTPURLResponse
            let contentType = response.allHeaderFields["content-type"] as! String
            let parsed = parseResponse(contentType, data)
            if (self.ok(response)) {
                ok = true
                success = parsed as? TSuccess
            } else {
                ok = false
                fail = parsed as? TError
            }
        }.resume()
        return ok
            ? SDKResponse.success(success!)
            : SDKResponse.error(fail!)
    }
    
    private func initRequest(
        _ method: HttpMethod,
        _ path: String,
        _ queryParams: Any?,
        _ body: Any?,
        _ authenticator: Authenticator?,
        _ options: ITransportSettings?
    ) -> URLRequest? {
        let fullPath = ((authenticator != nil) ? self.apiPath : (options?.base_url!)!) + path
        let requestPath = URL(string: fullPath)!
        var req = URLRequest(
            url: requestPath,
            timeoutInterval: TimeInterval(options?.timeout ?? self.options.timeout!))
        req.httpMethod = method.rawValue
        if (body != nil) {
            req.httpBody = try? JSONSerialization.data(withJSONObject: body!)
        }
        if (authenticator != nil) {
            req = authenticator!(req)
        }
        return req
    }
    
    private func ok(_ res: HTTPURLResponse) -> Bool {
        return (200...299).contains(res.statusCode)
    }
    
}

// TODO add error handling
func parseResponse(_ contentType: String, _ data: Data?) -> Any {
    let mode = responseMode(contentType)
    switch mode {
    case .string:
        if (isJson(contentType)) {
            do {
                let json = try JSONSerialization.jsonObject(with: data!, options: [])
                return json
            } catch {
                return "Error parsing JSON: \(error): \(data!)"
            }
        }
        // convert result to UTF-8, without checking?
        if let data = data, let dataString = String(data: data, encoding: .utf8) {
            return dataString
        }
        
        //        if (!isUtf8(contentType)) {
    //        }
    case .binary:
        return data!
    case .unknown:
        return data!
    }
    return data!
}

