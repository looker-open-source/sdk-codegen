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

// partly from https://stackoverflow.com/a/57255549/74137
@available(OSX 10.15, *)
extension Digest {
    var bytes: [UInt8] { Array(makeIterator()) }
    var data: Data { Data(bytes) }
    var hexStr: String {
        bytes.map { String(format: "%02x", $0) }.joined()
    }
    var base64Url: String {
         data.base64Url()
     }
}

// partly from https://stackoverflow.com/a/40089462/74137
extension Data {
    struct HexEncodingOptions: OptionSet {
        let rawValue: Int
        static let upperCase = HexEncodingOptions(rawValue: 1 << 0)
    }

    func hexStr(_ options: HexEncodingOptions = []) -> String {
        let hexDigits = Array((options.contains(.upperCase) ? "0123456789ABCDEF" : "0123456789abcdef").utf16)
        var chars: [unichar] = []
        chars.reserveCapacity(2 * count)
        for byte in self {
            chars.append(hexDigits[Int(byte / 16)])
            chars.append(hexDigits[Int(byte % 16)])
        }
        return String(utf16CodeUnits: chars, count: chars.count)
    }
    
    func base64Url() -> String {
        return base64EncodedString()
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "+", with: "-")
    }
}

@available(OSX 10.15, *)
open class OAuthSession: AuthSession {
    var code_verifier: String = ""

    public override init(_ settings: IApiSettings, _ transport: ITransport? = nil) {
        super.init(settings, transport)
    }

    open func requestToken(_ body: Values) throws -> AuthToken {
        let response : SDKResponse<AccessToken, SDKError> = self.transport.request(
            HttpMethod.POST,
            "/api/token",
            nil,
            // This body needs to be www-form-urlencoded for the login method
            // encoding it to String here makes that happen automatically
            encodeParams(body),
            nil,
            nil
        )
        do {
            let token = try self.ok(response)
            return self._authToken.setToken(token)
        } catch {
            throw error
        }
    }

    open override func getToken() throws -> AuthToken {
        if (!self.isAuthenticated()) {
            if (!self.activeToken.refresh_token.isEmpty) {
                let config = self.settings.readConfig(nil)
                // fetch the token
                let _ = try self.requestToken([
                    "grant_type": "refresh_token",
                    "refresh_token": self.activeToken.refresh_token,
                    "client_id": config["client_id"],
                    "redirect_uri": config["redirect_uri"]
                ])
            }
        }
        return self.activeToken
    }

    /*
     Generate an OAuth2 authCode request URL
     */
    public func createAuthCodeRequestUrl(scope: String, state: String) throws -> String {
        self.code_verifier = try! self.secureRandom(32).base64Url()
        let code_challenge = self.sha256Hash(self.code_verifier)
        let config = self.settings.readConfig(nil)
        let looker_url = config["looker_url"]!
        let url = addQueryParams("\(looker_url)/auth", [
            "response_type": "code",
            "client_id": config["client_id"],
            "redirect_uri": config["redirect_uri"],
            "scope": scope,
            "state": state,
            "code_challenge_method": "S256",
            "code_challenge": code_challenge
        ])
        return url
    }

    func redeemAuthCodeBody(_ authCode: String, _ code_verifier: String? = nil) -> Dictionary<String, String>{
        let config = self.settings.readConfig(nil)
        let verifier = (code_verifier == nil ? self.code_verifier : code_verifier) ?? ""
        return [
            "grant_type": "authorization_code",
            "code": authCode,
            "code_verifier": verifier,
            "client_id": config["client_id"]!,
            "redirect_uri": config["redirect_uri"]!
        ]
    }

    public func redeemAuthCode(_ authCode: String, _ code_verifier: String? = nil) throws -> AuthToken {
        return try self.requestToken(redeemAuthCodeBody(authCode, code_verifier))
    }

    private func secureRandom(_ byte_count: Int) throws -> Data {
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

    public func sha256Hash(_ data: Data) -> String {
        return SHA256.hash(data: data).base64Url
    }

    public func sha256Hash(_ value: String) -> String {
        let data = value.data(using: .utf8)!
        return sha256Hash(data)
    }
}
