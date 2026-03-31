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
import com.google.auth.oauth2.GoogleCredentials
import com.google.gson.JsonParser
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration
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
    private var isIapConfigured: Boolean? = null

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

    private val httpClient: HttpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(5))
        .build()

    private val googleCreds by lazy {
        GoogleCredentials.getApplicationDefault()
            .createScoped(listOf("https://www.googleapis.com/auth/cloud-platform"))
    }

    @Synchronized
    fun fetchIapToken(): String? {
        if (isIapConfigured == false) return null

        if (cachedIapToken != null && iapTokenExpiration != null) {
            if (LocalDateTime.now().isBefore(iapTokenExpiration!!.minusMinutes(5))) {
                return cachedIapToken
            }
        }

        val config = apiSettings.readConfig()
        val audience = config["iap_client_id"]
        val serviceAccount = config["iap_service_account_email"]

        if (audience.isNullOrBlank() || serviceAccount.isNullOrBlank()) {
            isIapConfigured = false
            return null
        }

        isIapConfigured = true

        return try {
            googleCreds.refreshIfExpired()
            val accessToken = googleCreds.accessToken.tokenValue

            val encodedServiceAccount = java.net.URLEncoder.encode(serviceAccount, java.nio.charset.StandardCharsets.UTF_8)
            val apiUrl = "https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/$encodedServiceAccount:generateIdToken"

            val jsonBody = com.google.gson.JsonObject().apply {
                addProperty("audience", audience)
                addProperty("includeEmail", true)
            }.toString()

            val iapRequest = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .header("Authorization", "Bearer $accessToken")
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(5))
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build()

            val iapResponse = httpClient.send(iapRequest, HttpResponse.BodyHandlers.ofString())

            if (iapResponse.statusCode() != 200) {
                throw RuntimeException("IAM API Error: ${iapResponse.statusCode()} - ${iapResponse.body()}")
            }

            val iapJsonObject = JsonParser.parseString(iapResponse.body()).asJsonObject
            val token = iapJsonObject.get("token")?.asString
                ?: throw RuntimeException("Could not find token in IAM JSON response")

            cachedIapToken = token
            iapTokenExpiration = LocalDateTime.now().plusMinutes(IAP_TOKEN_CACHE_MINUTES)
            token
        } catch (e: Exception) {
            cachedIapToken = null
            iapTokenExpiration = null
            throw RuntimeException(
                "OIDC Token failed for IAP. Ensure your Google credentials are authenticated. Underlying error: ${e.message}",
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
