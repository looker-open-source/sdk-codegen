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

package com.looker.rtl

import com.google.api.client.http.UrlEncodedContent

open class AuthSession(
    open val apiSettings: ConfigurationProvider,
    open val transport: Transport = Transport(apiSettings)
) {

    var authToken: AuthToken = AuthToken()
    private var sudoToken: AuthToken = AuthToken()
    var sudoId: String = ""

    /**
     * Abstraction of AuthToken retrieval to support sudo mode
     */
    fun activeToken(): AuthToken {
        if (sudoToken.accessToken.isNotEmpty()) {
            return sudoToken
        }
        return authToken
    }

    /**
     * Is there an active authentication token?
     */
    fun isAuthenticated(): Boolean {
        val token = activeToken()
        if (token.accessToken.isBlank()) return false
        return token.isActive()
    }

    /**
     * Add authentication data to the pending API request
     * @param[init] Initialized API request properties
     *
     * @return The updated request properties
     */
    fun authenticate(init: RequestSettings): RequestSettings {
        val headers = init.headers.toMutableMap()
        val token = getToken()
        if (token.accessToken.isNotBlank()) {
            headers["Authorization"] = "token ${token.accessToken}"
        }
        return init.copy(headers = headers)
    }

    fun isSudo(): Boolean {
        return sudoId.isNotBlank() && sudoToken.isActive()
    }

    /**
     * Retrieve the current authentication token. If there is no active token, performs default login to retrieve the
     * token.
     */
    open fun getToken(): AuthToken {
        if (!isAuthenticated()) {
            return login()
        }
        return activeToken()
    }

    /**
     * Reset the authentication session
     */
    fun reset() {
        sudoId = ""
        authToken.reset()
        sudoToken.reset()
    }

    /**
     * Activate the authentication token for the API3 or sudo user
     * @param[sudoId] If provided, impersonates the user specified
     */

    fun login(sudoId: String = ""): AuthToken = doLogin(sudoId)

    /**
     * Logout the active user. If the active user is impersonated , the session reverts to the API3 user.
     */
    fun logout(): Boolean {
        if (isAuthenticated()) {
            return doLogout()
        }
        return false
    }

    fun <T> ok(response: SDKResponse): T {
        @Suppress("UNCHECKED_CAST")
        when (response) {
            is SDKResponse.SDKErrorResponse<*> -> throw Error(response.value.toString())
            is SDKResponse.SDKSuccessResponse<*> -> return response.value as T
            else -> throw Error("Fail!!")
        }
    }

    private fun sudoLogout(): Boolean {
        var result = false
        if (isSudo()) {
            result = logout()
            sudoToken.reset()
        }
        return result
    }

    private fun doLogin(newId: String): AuthToken {
        sudoLogout()
        if (newId != sudoId) {
            sudoId = newId
        }

        if (!authToken.isActive()) {
            val apiPath = "/api/${apiSettings.apiVersion}"
            val client_id = "client_id"
            val client_secret = "client_secret"
            val config = apiSettings.readConfig()
            val clientId =
                unQuote(System.getProperty("${apiSettings.environmentPrefix}_CLIENT_ID") ?: config[client_id])
            val clientSecret =
                unQuote(System.getProperty("${apiSettings.environmentPrefix}_CLIENT_SECRET") ?: config[client_secret])
            val params = mapOf(
                client_id to clientId,
                client_secret to clientSecret
            )
            val body = UrlEncodedContent(params)
            val token = ok<AuthToken>(
                transport.request<AuthToken>(
                    HttpMethod.POST,
                    "$apiPath/login",
                    emptyMap(),
                    body
                )
            )
            authToken = token
        }

        if (sudoId.isNotBlank()) {
            val token = activeToken()
            val sudoToken = transport.request<AuthToken>(
                HttpMethod.POST,
                "/login/$newId"
            ) { requestSettings ->
                val headers = requestSettings.headers.toMutableMap()
                if (token.accessToken.isNotBlank()) {
                    headers["Authorization"] = "Bearer ${token.accessToken}"
                }
                requestSettings.copy(headers = headers)
            }
            this.sudoToken = ok(sudoToken)
        }
        return activeToken()
    }

    private fun doLogout(): Boolean {
        val token = activeToken()
        val resp = transport.request<String>(HttpMethod.DELETE, "/logout") {
            val headers = it.headers.toMutableMap()
            if (token.accessToken.isNotBlank()) {
                headers["Authorization"] = "Bearer ${token.accessToken}"
            }
            it.copy(headers = headers)
        }

        val success = when (resp) {
            is SDKResponse.SDKSuccessResponse<*> -> true
            is SDKResponse.SDKErrorResponse<*> -> false
            else -> false
        }
        if (sudoId.isNotBlank()) {
            sudoId = ""
            sudoToken.reset()
            if (!authToken.isActive()) {
                login()
            }
        } else {
            reset()
        }
        return success
    }
}
