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

import XCTest
@testable import looker

class authTokenTests: XCTestCase {

    override func setUp() {
        // Put setup code here. This method is called before the invocation of each test method in the class.
    }

    override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

    func testIsInactiveByDefault() {
        // This is an example of a functional test case.
        // Use XCTAssert and related functions to verify your tests produce the correct results.
        let auth = AuthToken()
        XCTAssertEqual(auth.isActive(), false, "auth should not be active")
    }

    func testIsActiveWithToken() {
        // TODO figure out how to init protocol and pass it in
        let auth = AuthToken(AccessToken(access_token: "thisismytoken", token_type: "Bearer", expires_in: 30))
        XCTAssertEqual(auth.isActive(), true, "auth should be active")
        //        let auth = AuthToken("thisismytoken", "bearer", 30)
        //        XCTAssertEqual(auth.isActive(), true)
    }

    func testPerformanceExample() {
        // This is an example of a performance test case.
        self.measure {
            // Put the code you want to measure the time of here.
        }
    }

    func testLagTime() {
        var actual = AuthToken(AccessToken(access_token: "thisismytoken", token_type: "Bearer", expires_in: 9))
        XCTAssertEqual(actual.isActive(), false, "9 seconds should be inactive")
        actual = AuthToken(AccessToken(access_token: "thisismytoken", token_type: "Bearer", expires_in: 11))
        XCTAssertEqual(actual.isActive(), true, "11 seconds should be inactive")

    }

    func testResetPreservesRefreshToken() {
        var actual = AuthToken(AccessToken(access_token: "thisismytoken", token_type: "Bearer", expires_in: 3600, refresh_token: "refresh-me"))
        XCTAssertEqual(actual.isActive(), true)
        actual.reset()
        XCTAssertEqual(actual.isActive(), false)
        XCTAssertEqual(actual.refresh_token, "refresh-me")
    }

    @available(OSX 10.15, *)
    func testReauthenticatesOnceOn401() {
        struct MockSettings: IApiSettings {
            var base_url: String? = "https://mock.looker.com:19999"
            var api_version: String? = defaultApiVersion
            var verify_ssl: Bool? = true
            var timeout: Int? = defaultTimeout
            var headers: Headers?
            var encoding: String?
            func isConfigured() -> Bool { return true }
            func readConfig(_ section: String? = nil) -> IApiSection {
                return ["client_id": "test_id", "client_secret": "test_secret"]
            }
        }

        class Mock401Transport: ITransport {
            var loginCount = 0
            var authHeaders: [String] = []

            func request<TSuccess: Codable, TError: Codable>(
                _ method: HttpMethod,
                _ path: String,
                _ queryParams: Values?,
                _ body: Any?,
                _ authenticator: Authenticator?,
                _ options: ITransportSettings?
            ) -> SDKResponse<TSuccess, TError> {
                var req = URLRequest(url: URL(string: "https://mock.looker.com:19999\(path)")!)
                if let auth = authenticator {
                    req = auth(req)
                }
                if path.hasSuffix("/login") {
                    loginCount += 1
                    let tok = AccessToken(access_token: "token-\(loginCount)", token_type: "Bearer", expires_in: 3600)
                    return .success(tok as! TSuccess)
                }
                let header = req.value(forHTTPHeaderField: "Authorization") ?? ""
                authHeaders.append(header)
                if header == "Bearer token-1" {
                    return .error(SDKError("Requires authentication.", code: 401) as! TError)
                }
                return .success("recovered" as! TSuccess)
            }
        }

        let xp = Mock401Transport()
        let session = AuthSession(MockSettings(), xp)
        let api = APIMethods(session)
        let resp: SDKResponse<String, SDKError> = api.get("/user", nil, nil, nil)
        let value = try? api.ok(resp)
        XCTAssertEqual("recovered", value)
        XCTAssertEqual(2, xp.loginCount)
        XCTAssertEqual(["Bearer token-1", "Bearer token-2"], xp.authHeaders)
    }
}
