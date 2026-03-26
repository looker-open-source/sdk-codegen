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
import com.google.cloud.iam.credentials.v1.GenerateIdTokenRequest
import com.google.cloud.iam.credentials.v1.IamCredentialsClient
import com.google.cloud.iam.credentials.v1.IamCredentialsSettings
import com.google.cloud.iam.credentials.v1.ServiceAccountName
import java.time.LocalDateTime

open class AuthSession(
    open val apiSettings: ConfigurationProvider,
    open val transport: Transport = Transport(apiSettings),
) {
    companion object {
        private const val IAP_TOKEN_CACHE_MINUTES = 50L
    }

    var authToken: AuthToken = AuthToken()
    private var sudoToken: AuthToken = AuthToken()
    var sudoId: String = ""

    private var cachedIapToken: String? = null
    private var iapTokenExpiration: LocalDateTime? = null

    /** Abstraction of AuthToken retrieval to support sudo mode */
    fun activeToken(): AuthToken {
        if (sudoToken.accessToken.isNotEmpty()) {
            return sudoToken
        }
        return authToken
    }

    /** Is there an active authentication token? */
    open fun isAuthenticated(): Boolean {
        val token = activeToken()
        if (token.accessToken.isBlank()) return false
        return token.isActive()
    }

    /**
     * Add authentication data to the pending API request
     *
     * @param[init] Initialized API request properties
     * @return The updated request properties
     */
    fun authenticate(init: RequestSettings): RequestSettings {
        val headers = init.headers.toMutableMap()

        // Handles Google IAP
        val iapToken = fetchIapToken()
        if (iapToken != null) {
            headers["Proxy-Authorization"] = "Bearer $iapToken"
        }

        // Handles Looker Identity
        val token = getToken()
        if (token.accessToken.isNotBlank()) {
            headers["Authorization"] = "token ${token.accessToken}"
        }

        return init.copy(headers = headers)
    }

    fun fetchIapToken(): String? {
        if (cachedIapToken != null && iapTokenExpiration != null) {
            if (LocalDateTime.now().isBefore(iapTokenExpiration)) {
                return cachedIapToken
            }
        }

        val config = apiSettings.readConfig()
        val audience = config["iap_client_id"]
        val serviceAccount = config["iap_service_account_email"]

        if (audience.isNullOrBlank() || serviceAccount.isNullOrBlank()) return null

        return try {
            val settings = IamCredentialsSettings.newBuilder()
                .setTransportChannelProvider(
                    IamCredentialsSettings.defaultHttpJsonTransportProviderBuilder().build(),
                )
                .build()

            IamCredentialsClient.create(settings).use { client ->
                val request = GenerateIdTokenRequest.newBuilder()
                    .setName(ServiceAccountName.of("-", serviceAccount).toString())
                    .setAudience(audience)
                    .setIncludeEmail(true)
                    .build()
                val token = client.generateIdToken(request).token
                cachedIapToken = token
                iapTokenExpiration = LocalDateTime.now().plusMinutes(IAP_TOKEN_CACHE_MINUTES)
                token
            }
        } catch (e: Exception) {
            cachedIapToken = null
            iapTokenExpiration = null
            throw RuntimeException(
                "OIDC Token failed for IAP. Please check your IAP Client ID and IAP Service Account Email. Underlying Google Cloud error: ${e.message}",
                e,
            )
        }
    }

    fun isSudo(): Boolean = sudoId.isNotBlank() && sudoToken.isActive()

    /**
     * Retrieve the current authentication token. If there is no active token, performs default
     * login to retrieve the token.
     */
    open fun getToken(): AuthToken {
        if (!isAuthenticated()) {
            return login()
        }
        return activeToken()
    }

    /** Reset the authentication session */
    fun reset() {
        sudoId = ""
        authToken.reset()
        sudoToken.reset()

        cachedIapToken = null
        iapTokenExpiration = null
    }

    /**
     * Activate the authentication token for the API3 or sudo user
     *
     * @param[sudoId] If provided, impersonates the user specified
     */
    fun login(sudoId: String = ""): AuthToken = doLogin(sudoId)

    /**
     * Logout the active user. If the active user is impersonated , the session reverts to the API3
     * user.
     */
    fun logout(): Boolean {
        if (isAuthenticated()) {
            return doLogout()
        }
        return false
    }

    fun <T> ok(response: SDKResponse) = SDKResponse.ok<T>(response)

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
                unQuote(
                    System.getProperty("${apiSettings.environmentPrefix}_CLIENT_ID")
                        ?: config[client_id],
                )
            val clientSecret =
                unQuote(
                    System.getProperty("${apiSettings.environmentPrefix}_CLIENT_SECRET")
                        ?: config[client_secret],
                )
            val params = mapOf(client_id to clientId, client_secret to clientSecret)
            val body = UrlEncodedContent(params)

            val iapToken = fetchIapToken()

            try {
                val token = ok<AuthToken>(
                    transport.request<AuthToken>(
                        HttpMethod.POST,
                        "$apiPath/login",
                        emptyMap(),
                        body,
                    ) { requestSettings ->
                        val headers = requestSettings.headers.toMutableMap()
                        iapToken?.let {
                            headers["Proxy-Authorization"] = "Bearer $it"
                        }
                        requestSettings.copy(headers = headers)
                    },
                )
                authToken = token
            } catch (e: Exception) {
                val isUsingIap = !config["iap_client_id"].isNullOrBlank() || !config["iap_service_account_email"].isNullOrBlank()

                val errorMessage = if (isUsingIap) {
                    "Authentication failed during login. \nPlease check your iap_client_id and iap_service_account_email fields, as well as your Looker credentials.\nDetails: ${e.message}"
                } else {
                    "Authentication failed during login. \nPlease check your Looker client_id and client_secret.\nDetails: ${e.message}"
                }
                throw RuntimeException(errorMessage, e)
            }
        }

        if (sudoId.isNotBlank()) {
            val token = activeToken()
            val sudoToken =
                transport.request<AuthToken>(HttpMethod.POST, "/login/$newId") { requestSettings ->
                    val headers = requestSettings.headers.toMutableMap()
                    if (token.accessToken.isNotBlank()) {
                        headers["Authorization"] = "token ${token.accessToken}"
                    }
                    requestSettings.copy(headers = headers)
                }
            this.sudoToken = ok(sudoToken)
        }
        return activeToken()
    }

    private fun doLogout(): Boolean {
        val token = activeToken()
        val apiPath = "/api/${apiSettings.apiVersion}"

        val resp = transport.request<Any>(HttpMethod.DELETE, "$apiPath/logout") { requestSettings ->
            val headers = requestSettings.headers.toMutableMap()

            fetchIapToken()?.let { iapToken ->
                headers["Proxy-Authorization"] = "Bearer $iapToken"
            }

            if (token.accessToken.isNotBlank()) {
                headers["Authorization"] = "token ${token.accessToken}"
            }
            requestSettings.copy(headers = headers)
        }

        val success =
            when (resp) {
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
