/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2020 Looker Data Sciences, Inc.
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
import CryptoKit

extension Data {
    var bytes: [UInt8] { Array(makeIterator()) }
    var data: Data { Data(bytes) }
    var hexStr: String {
        bytes.map { String(format: "%02X", $0) }.joined()
    }
}

@available(OSX 10.15, *)
class OAuthSession: IAuthSession {
    var code_verifier: Data

    init(_ settings: IApiSettings, _ transport: ITransport? = nil) {
        super.init(settings, transport)
    }

    func requestToken(body: Any) -> AuthToken {
        let response : SDKResponse<AccessToken, SDKError> = self.transport.request(
            HttpMethod.POST,
            "/api/token",
            nil,
            body,
            nil,
            nil
        )
        let token = try? self.ok(response)
        _ = self._authToken.setToken(token!)
    }

    func getToken() -> AuthToken {
        if (!self.isAuthenticated()) {
            if (!self.activeToken.refresh_token.isEmpty) {
                self.requestToken({
                    grant_type: "refresh_token",
                    refresh_token: self.activeToken.refresh_token,
                    client_id: self.settings.client_id,
                    redirect_uri: self.settings.redirect_uri,
                })
            }
        }
        return self.activeToken
    }

    /*
     Generate an OAuth2 authCode request URL
     */
    createAuthCodeRequestUrl(scope: string, state: string) -> String {
        self.code_verifier = self.secureRandom(32)
        let code_challenge = self.sha256Hash(self.code_verifier)
        let url = URLComponents()
        url.init?(self.settings.looker_url)
        url.path = "/auth"
        url.queryItems = [
            URLQueryItem(name: "response_type", value: "code"),
            URLQueryItem(name: "client_id", value: self.settings.client_id),
            URLQueryItem(name: "redirect_uri", value: self.settings.redirect_uri),
            URLQueryItem(name: "scope", value: scope),
            URLQueryItem(name: "state", value: state),
            URLQueryItem(name: "code_challenge_method", value: "S256"),
            URLQueryItem(name: "code_challenge", value: code_challenge)
        ]
        return url.url?.absoluteString
    }

    redeemAuthCode(authCode: String, code_verifier: String? = nil) -> AuthToken {
        return this.requestToken({
            grant_type: "authorization_code",
            code: authCode,
            code_verifier: code_verifier || self.code_verifier.hexStr || "",
            client_id: self.settings.client_id,
            redirect_uri: self.settings.redirect_uri,
        })
    }

    private secureRandom(byte_count: Int) -> Data {
        var keyData = Data(count: byte_count)
        let result = keyData.withUnsafeMutableBytes {
            SecRandomCopyBytes(kSecRandomDefault, byte_count, $0.baseAddress!)
        }
        if result == errSecSuccess {
            return keyData
        } else {
            throw SDKError("Error generating random bytes")
        }
    }

    private sha256Hash(data: Data) -> String {
        return SHA256.hash(data: data).data.hexStr
    }

}

