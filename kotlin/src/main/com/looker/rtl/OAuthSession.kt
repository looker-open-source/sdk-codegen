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
import kotlin.experimental.and

// https://stackoverflow.com/a/52225984/74137
// TODO performance comparison of these two methods
fun ByteArray.toHexStr() = asUByteArray().joinToString("") { it.toString(16).padStart(2, '0') }

// Adapted from https://www.samclarke.com/kotlin-hash-strings/

fun String.md5(): String {
    return hashString(this, "MD5")
}

fun String.sha512(): String {
    return hashString(this, "SHA-512")
}

fun String.sha256(): String {
    return hashString(this, "SHA-256")
}

fun String.sha1(): String {
    return hashString(this, "SHA-1")
}

fun hashString(input: ByteArray, digester: MessageDigest): String {
    val HEX_CHARS = "0123456789abcdef"
    val bytes = digester
            .digest(input)
    val result = StringBuilder(bytes.size * 2)

    bytes.forEach {
        val i = it.toInt()
        result.append(HEX_CHARS[i shr 4 and 0x0f])
        result.append(HEX_CHARS[i and 0x0f])
    }

    return result.toString()
}

fun hashString(input: ByteArray, type: String): String {
    val digester = MessageDigest.getInstance(type)
    return hashString(input, digester)
}

/**
 * Supported algorithms on Android:
 *
 * Algorithm	Supported API Levels
 * MD5          1+
 * SHA-1	    1+
 * SHA-224	    1-8,22+
 * SHA-256	    1+
 * SHA-384	    1+
 * SHA-512	    1+
 */
fun hashString(input: String, type: String): String {
    return hashString(input.toByteArray(), type)
}

private val hexArray = "0123456789abcdef".toCharArray()

fun hexStr(bytes: ByteArray): String {
    val hexChars = CharArray(bytes.size * 2)
    for (j in bytes.indices) {
        val v = (bytes[j] and 0xFF.toByte()).toInt()

        hexChars[j * 2] = hexArray[v ushr 4]
        hexChars[j * 2 + 1] = hexArray[v and 0x0F]
    }
    return String(hexChars)
}

@ExperimentalUnsignedTypes
class OAuthSession(override val apiSettings: ApiSettings, override val transport: Transport = Transport(apiSettings))
    : AuthSession(apiSettings, transport) {
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
                mapOf(),
                body)
        val token = this.ok<AccessToken>(response)
        this.authToken = AuthToken(token)
        return this.authToken
    }

    override fun getToken(): AuthToken {
        if (!this.isAuthenticated()) {
            if (this.activeToken().refreshToken?.isNotEmpty()!!) {
                val config = this.apiSettings.readConfig()
                // fetch the token
                this.requestToken(mapOf(
                        "grant_type" to "request_token",
                        "refresh_token" to this.activeToken().refreshToken,
                        "client_id" to config["client_id"],
                        "redirect_uri" to config["redirect_uri"]
                ))
            }
        }
        return this.activeToken()
    }

    /**
     * Generate an OAuth2 authCode request URL
     */
    fun createAuthCodeRequestUrl(scope: String, state: String): String {
        val bytes = this.secureRandom(32)
        this.codeVerifier = this.sha256hash(bytes)
        val config = this.apiSettings.readConfig()
        val lookerUrl = config["looker_url"]
        return addQueryParams("$lookerUrl/auth", mapOf(
                "response_type" to "code",
                "client_id" to config["client_id"],
                "redirect_uri" to config["redirect_uri"],
                "scope" to scope,
                "state" to state,
                "code_challenge_method" to "S256",
                "code_challenge" to this.codeVerifier
        ))
    }

    fun redeemAuthCodeBody(authCode: String, codeVerifier: String? = null): Map<String, String> {
        val verifier = codeVerifier?: this.codeVerifier
        val config = this.apiSettings.readConfig()
        val map = mapOf(
                "grant_type" to "authorization_code",
                "code" to authCode,
                "code_verifier" to verifier,
                "client_id" to (config["client_id"] ?: error("")),
                "redirect_uri" to (config["redirect_uri"] ?: error(""))
        )
        return map
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
        return hashString(value, messageDigest)
    }

    fun sha256hash(value: String): String {
        return sha256hash(value.toByteArray())
    }
}
