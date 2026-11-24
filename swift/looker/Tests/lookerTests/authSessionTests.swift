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

@available(OSX 10.15, *)
class authSessionTests: XCTestCase {

    let config = TestConfig()
    override func setUp() {
        // Put setup code here. This method is called before the invocation of each test method in the class.
    }

    override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

    // integration test against Looker instance to verify authSession handles basic authentication
    func testLogin() {
        let settings = config.settings
        let xp = BaseTransport(settings)
        let auth = AuthSession(settings, xp)
        XCTAssertFalse(auth.isAuthenticated(), "should not be authenticated")
        let token = auth.login()
        XCTAssertTrue(auth.isAuthenticated(), "should be authenticated")
        XCTAssertNotNil(token)
        XCTAssertNotNil(token.access_token, "access token should be assigned")
        XCTAssertNotNil(token.token_type, "token type should be assigned")
        _ = auth.logout()
        XCTAssertFalse(auth.isAuthenticated(), "should not be authenticated")
    }

    func testSha256() {
        let settings = config.testsettings
        let xp = BaseTransport(settings)
        let session = OAuthSession(settings, xp)
        let message = "The quick brown fox jumped over the lazy dog."
        let hash = session.sha256Hash(message)
        XCTAssertEqual("aLEoK5HeLAVMNmKcuN1EfxLwltPjxYeXjcIkhERjNIM=", hash)
    }

    func testRedemptionBody() {
        let settings = config.testsettings
        let xp = BaseTransport(config.settings)
        let session = OAuthSession(settings,xp)
        let hashCode = session.sha256Hash("com.looker.ios")
        let request = session.redeemAuthCodeBody("authCode", hashCode)
        XCTAssertEqual("authCode", request["code"])
        XCTAssertEqual(hashCode, request["code_verifier"])
        XCTAssertEqual("test_client_id", request["client_id"])
        XCTAssertEqual("looker://", request["redirect_uri"])

    }

    func testLoginSudoLogsInApiUserFirst() {
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

        class MockTransport: ITransport {
            var calls: [String] = []
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
                calls.append("\(method.rawValue) \(path)")
                authHeaders.append(req.value(forHTTPHeaderField: "Authorization") ?? "")
                let accessToken = path.hasSuffix("/login/5") ? "sudo" : "api"
                let tok = AccessToken(access_token: accessToken, token_type: "Bearer", expires_in: 3600)
                return .success(tok as! TSuccess)
            }
        }

        let xp = MockTransport()
        let session = AuthSession(MockSettings(), xp)
        let token = session.login("5")
        XCTAssertEqual(["POST /api/\(defaultApiVersion)/login", "POST /login/5"], xp.calls)
        XCTAssertEqual(["", "Bearer api"], xp.authHeaders)
        XCTAssertTrue(session.isSudo())
        XCTAssertEqual("5", session.sudoId)
        XCTAssertEqual("sudo", token.access_token)
    }

}
