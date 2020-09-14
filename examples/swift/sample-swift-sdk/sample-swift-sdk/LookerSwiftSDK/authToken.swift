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

protocol AccessTokenProtocol {
    var access_token: String { get set }
    var token_type: String { get set }
    var expires_in: Int64 { get set }
}
//
//struct AccessToken: AccessTokenProtocol, Codable {
//  var access_token: String
//  var token_type: String
//  var expires_in: Int
//}

struct AuthToken: AccessTokenProtocol {
    var access_token: String = ""
    var token_type: String = ""
    var expires_in: Int64 = 0
    
    private var expiresAt: Date?
    
    init() { }
    
    init(_ token: AccessToken) {
        self = self.setToken(token)
    }
    
    // true if the authentication token is set and has not timed without
    func isActive() -> Bool {
        if (self.access_token == "" || self.expires_in == 0) { return false }
        guard let expiresAt = self.expiresAt else { return false }
        return expiresAt > Date()
    }
    
    static func expiryDate(_ inSeconds: Int) -> Date {
        let interval = inSeconds > 0 ? inSeconds : -10
        return Date.init(timeIntervalSinceNow: TimeInterval(interval))
    }
    
    // Assign the token and set its expiration
    mutating func setToken(_ token: AccessToken) -> Self {
        self.access_token = token.access_token!
        self.token_type = token.token_type!
        self.expires_in = token.expires_in!
        self.expiresAt = Self.expiryDate(Int(self.expires_in))
        return self
    }
    
    mutating func reset() {
        self.access_token = ""
        self.expires_in = 0
    }
}
