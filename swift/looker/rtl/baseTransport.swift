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

struct RequestResponse {
    var data: Data?
    var response: URLResponse?
    var error: SDKError?
    init(_ data: Data?, _ response: URLResponse?, _ error: SDKError?) {
        self.data = data
        self.response = response
        self.error = error
    }
}

//class BaseTransport : ITransport {
// TODO why doesn't this implementation satisfy ITransport?!?!?
class BaseTransport : ITransport  {
    let session = URLSession.shared // TODO Should this be something else like `configuration: .default`? or ephemeral?
    var apiPath = ""
    var options: ITransportSettings
    
    init(_ options: ITransportSettings) {
        self.options = options
        self.apiPath = "\(options.base_url!)/api/\(options.api_version!)"
    }
    
    func request<TSuccess: Codable, TError: Codable> (
        _ method: HttpMethod,
        _ path: String,
        _ queryParams: Values?,
        _ body: Any?,
        _ authenticator: Authenticator?,
        _ options: ITransportSettings?
    ) -> SDKResponse<TSuccess, TError> {
        var settings = options
        if (settings == nil) {
            settings = self.options
        } else {
            settings?.headers = options?.headers ?? self.options.headers
            settings?.timeout = options?.timeout ?? self.options.timeout
            settings?.encoding = options?.encoding ?? self.options.encoding
        }
        var ok: Bool = false
        var success: TSuccess? = nil
        var fail: TError? = nil
        
        let http = self.plainRequest(method, path, queryParams, body, authenticator, settings)
        if let error = http.error {
            ok = false
//            let msg = error.errorDescription!
            fail = error as? TError
        } else {
            let response = http.response as! HTTPURLResponse
            let contentType = response.mimeType!
            let data = http.data!
            do {
                print(http.data as Any)
                let parsed = parseResponse(contentType, data)
                let str = parsed as! String
                if (self.ok(response)) {
                    ok = true
                    success = try deserialize(str)
                } else {
                    ok = false
                    fail = try deserialize(str)
                }
            } catch {
                ok = false
                fail = SDKError(error.localizedDescription) as? TError
            }
        }
        return ok
            ? SDKResponse.success(success!)
            : SDKResponse.error(fail!)
    }
    
    func plainRequest(
        _ method: HttpMethod,
        _ path: String,
        _ queryParams: Values?,
        _ body: Any?,
        _ authenticator: Authenticator?,
        _ options: ITransportSettings?
    ) -> RequestResponse {
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
            let err = SDKError("The SDK call failed. Invalid properties for request \(method.rawValue) \(path)")
            return RequestResponse(nil, nil, err)
        }
        
        // This is required for requests without a UI for some bogus reason
        // https://stackoverflow.com/a/39064025/74137
        let semi = DispatchSemaphore(value: 0)
        
        var result: RequestResponse? = nil
        let task = self.session.dataTask(with: req!) { data, response, error in
            if let err = error {
                print(err as Any)
            }
            result = RequestResponse(data, response, error as? SDKError)
            semi.signal() // Notify request has completed
        }
        task.resume() // begin request
        semi.wait() // wait for request completion
        return result!
    }
    
    private func initRequest(
        _ method: HttpMethod,
        _ path: String,
        _ queryParams: Values?,
        _ body: Any?,
        _ authenticator: Authenticator?,
        _ options: ITransportSettings?
    ) -> URLRequest? {
        var fullPath = path
        if !(fullPath.starts(with: "https:") || fullPath.starts(with: "http:")) {
            fullPath = ((authenticator != nil) ? self.apiPath : (options?.base_url!)!) + path
        }
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
        let code = res.statusCode // For visibility in the sucky XCode debugger
        return (200...299).contains(code)
    }
    
}

// TODO add error handling
func parseResponse(_ contentType: String, _ data: Data?) -> Any {
    let mode = responseMode(contentType)
    switch mode {
    case .string:
        if (isMimeJson(contentType)) {
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
        
        //        if (!isMimeUtf8(contentType)) {
    //        }
    case .binary:
        return data!
    case .unknown:
        return data!
    }
    return data!
}

