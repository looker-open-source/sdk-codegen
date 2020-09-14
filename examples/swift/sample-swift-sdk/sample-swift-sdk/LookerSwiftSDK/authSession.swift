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

protocol IAuthSession: IAuthorizer {
    var sudoId: String { get set }
    func getToken() -> AuthToken
    func isSudo() -> Bool
    func login(_ sudoId : String) -> AuthToken
    func reset() -> Void
}

@available(OSX 10.15, *)
class AuthSession: IAuthSession {
  
    var _authToken = AuthToken()
    var _sudoToken = AuthToken()
    var sudoId: String = ""
    var settings: IApiSettings
    var transport: ITransport
    var activeToken: AuthToken {
        get {
            if (!self._sudoToken.access_token.isEmpty) {
                return self._sudoToken
            }
            return self._authToken
        }
    }
    
    init(_ settings: IApiSettings, _ transport: ITransport? = nil) {
        self.settings = settings
        self.transport = transport ?? BaseTransport(settings)
    }
    
    func getToken() -> AuthToken {
        if (!self.isAuthenticated()) {
            // this is currently a synchronous call so unblocking
            return self.login()
        }
        return self.activeToken
    }
    
    func isSudo() -> Bool {
        return ((!self.sudoId.isEmpty) && self._sudoToken.isActive())
    }
    
    func login(_ sudoId: String = "") -> AuthToken {
        if (sudoId != self.sudoId || !self.isAuthenticated()) {
            _ = try? self._login(sudoId)
        }
        return self.activeToken
    }
    
    func reset() {
        self.sudoId = ""
        self._authToken.reset()
        self._sudoToken.reset()
    }
    
    func isAuthenticated() -> Bool {
        return self.activeToken.isActive()
    }
    
    func authenticate(_ props: URLRequest) -> URLRequest {
        let token = self.getToken()
        var updated = props
        if (token.isActive()) {
            updated.addValue("Bearer \(token.access_token)", forHTTPHeaderField: "Authorization")
        }
        return updated
    }
    
    func logout() -> Bool {
        var result = false
        if (self.isAuthenticated()) {
            result = self._logout()
        }
        return result
    }
    
    private func ok<TSuccess, TError>(_ response: SDKResponse<TSuccess, TError>) throws -> TSuccess {
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

    private func _login(_ newId: String = "") throws -> AuthToken {
        // If we've got sudo logged in, log 'em out
        _ = self.sudoLogout()
        
        if (newId != self.sudoId) {
            self.sudoId = newId
        }
        
        if (!self._authToken.isActive()) {
            self.reset()
            let section = self.settings.readConfig(nil)
            let client_id = ProcessInfo.processInfo.environment[strLookerClientId] ?? section["client_id"]
            let client_secret = ProcessInfo.processInfo.environment[strLookerClientSecret] ?? section["client_secret"]
            if ((client_id ?? "").isEmpty || (client_secret ?? "").isEmpty) {
                throw SDKError("API credentials client_id and/or client_secret are not set")
            }
            let response : SDKResponse<AccessToken, SDKError> = self.transport.request(
                HttpMethod.POST,
                "/login",
                ["client_id": client_id!, "client_secret": client_secret!],
                nil,
                nil,
                nil
            )
            let token = try? self.ok(response)
            _ = self._authToken.setToken(token!)
        }
        
        if (!self.sudoId.isEmpty) {
            let token = self.activeToken
            let response : SDKResponse<AccessToken, SDKError> = self.transport.request(
                HttpMethod.POST,
                "/login/\(newId)",
                nil,
                nil,
                { props -> URLRequest in
                    var update = props
                    update.addValue("Bearer \(token.access_token)", forHTTPHeaderField:  "Authorization")
                    return update
                },
                self.settings
            )
            let sudoToken = try? self.ok(response)
            _ = self._sudoToken.setToken(sudoToken!)
        }
        return self.activeToken
    }
    
    private func sudoLogout() -> Bool {
        var result = false
        if (self.isSudo()) {
            result = self.logout()
            self._sudoToken.reset()
        }
        return result
    }
    
    private func _logout() -> Bool {
        var result = true
        let token = self.activeToken
        let response : SDKResponse<Voidable, SDKError> = self.transport.request(
            HttpMethod.DELETE,
            "/logout",
            nil,
            nil,
            { props -> URLRequest in
                var update = props
                update.addValue("Bearer \(token.access_token)", forHTTPHeaderField:  "Authorization")
                return update
            },
            self.settings
        )
        do {
            _ = try self.ok(response)
            if (!self.sudoId.isEmpty) {
                self.sudoId = ""
                self._sudoToken.reset()
                if (!self._authToken.isActive()) {
                    _ = self.login()
                }
            } else {
                self.reset()
            }
        } catch {
            result = false
        }
        return result
    }
    
}
