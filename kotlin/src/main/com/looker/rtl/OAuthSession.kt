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

import com.looker.sdk.AccessToken
import java.security.MessageDigest
import java.security.SecureRandom
import java.util.*

fun base64UrlEncode(bytes: ByteArray): String {
    return Base64.getUrlEncoder().encodeToString(bytes)
}

@ExperimentalUnsignedTypes
class OAuthSession(
    override val apiSettings: ConfigurationProvider,
    override val transport: Transport = Transport(apiSettings)
) :
    AuthSession(apiSettings, transport) {
    private var random = SecureRandom()
    private var codeVerifier: String = ""
    private val messageDigest = MessageDigest.getInstance("SHA-256") // "HmacSHA256")

    init {
        this.random = SecureRandom()
    }

    fun requestToken(body: Values): AuthToken {
        val response = this.transport.request<AccessToken>(
            HttpMethod.POST,
            "/api/token",
            emptyMap(),
            body
        )
        val token = this.ok<AccessToken>(response)
        this.authToken.setToken(token)
        return this.authToken
    }

    override fun getToken(): AuthToken {
        if (!this.isAuthenticated()) {
            if (this.activeToken().refreshToken?.isNotEmpty() == true) {
                val config = this.apiSettings.readConfig()
                // fetch the token
                this.requestToken(
                    mapOf(
                        "grant_type" to "refresh_token",
                        "refresh_token" to this.activeToken().refreshToken,
                        "client_id" to config["client_id"],
                        "redirect_uri" to config["redirect_uri"]
                    )
                )
            }
        }
        return this.activeToken()
    }

    /**
     * Generate an OAuth2 authCode request URL
     */
    fun createAuthCodeRequestUrl(scope: String, state: String): String {
        this.codeVerifier = base64UrlEncode(this.secureRandom(32))
        val codeChallenge = this.sha256hash(this.codeVerifier)
        val config = this.apiSettings.readConfig()
        val lookerUrl = config["looker_url"]
        return addQueryParams(
            "$lookerUrl/auth",
            mapOf(
                "response_type" to "code",
                "client_id" to config["client_id"],
                "redirect_uri" to config["redirect_uri"],
                "scope" to scope,
                "state" to state,
                "code_challenge_method" to "S256",
                "code_challenge" to codeChallenge
            )
        )
    }

    fun redeemAuthCodeBody(authCode: String, codeVerifier: String? = null): Map<String, String> {
        val verifier = codeVerifier ?: this.codeVerifier
        val config = this.apiSettings.readConfig()
        return mapOf(
            "grant_type" to "authorization_code",
            "code" to authCode,
            "code_verifier" to verifier,
            "client_id" to (config["client_id"] ?: error("")),
            "redirect_uri" to (config["redirect_uri"] ?: error(""))
        )
    }

    fun redeemAuthCode(authCode: String, codeVerifier: String? = null): AuthToken {
        return this.requestToken(redeemAuthCodeBody(authCode, codeVerifier))
    }

    fun secureRandom(byteCount: Int): ByteArray {
        val bytes = ByteArray(byteCount)
        this.random.nextBytes(bytes)
        return bytes
    }

    fun sha256hash(value: ByteArray): String {
        val bytes = messageDigest.digest(value)
        return base64UrlEncode(bytes)
    }

    fun sha256hash(value: String): String {
        return sha256hash(value.toByteArray())
    }
}
