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

import com.google.gson.TypeAdapter
import com.google.gson.annotations.SerializedName
import com.google.gson.stream.JsonReader
import com.google.gson.stream.JsonToken
import com.google.gson.stream.JsonWriter
import com.looker.sdk.AccessToken
import java.time.LocalDateTime

data class AuthToken(
    @SerializedName("access_token")
    var accessToken: String = "", // TODO: Consider making this/these vals and using new objects instead of mutating
    @SerializedName("token_type")
    var tokenType: String = "",
    @SerializedName("expires_in")
    var expiresIn: Long = 0L,
    @SerializedName("refresh_token")
    var refreshToken: String? = null
) {

    var expiresAt: LocalDateTime = LocalDateTime.now()
    /** Lag time of 10 seconds */
    val lagTime: Long = 10

//    constructor(token: AuthToken) : this(token.accessToken, token.tokenType, token.expiresIn, token.expiresAt, token.refreshToken)
    constructor(token: AccessToken) : this(token.access_token!!, token.token_type!!, token.expires_in!!.toLong(), token.refresh_token)

    init {
        expiresAt = LocalDateTime.now().plusSeconds(if (expiresIn > 0) expiresIn - lagTime else -lagTime)
    }

    fun isActive(): Boolean {
        if (accessToken.isEmpty()) return false
        return expiresAt > LocalDateTime.now()
    }

    fun setToken(token: AccessToken): AuthToken {
        this.accessToken = token.access_token ?: ""
        this.tokenType = token.token_type ?: ""
        this.expiresIn = token.expires_in ?: 0

        if (token.refresh_token != null) {
            this.refreshToken = token.refresh_token
        }

        val expirationDate = LocalDateTime.now()
        if (this.accessToken.isNotEmpty() && this.expiresIn > 0L) {
            expirationDate.plusSeconds(this.expiresIn)
        } else {
            expirationDate.minusSeconds(10)
        }
        this.expiresAt = expirationDate

        return this
    }

    fun reset() { // TODO: Should this just return a blank AuthToken object instead?
        accessToken = ""
        expiresIn = 0
    }
}

/**
 * Adapter for serialization/deserialization of [AuthToken].
 * This is required since Gson used no-args constructor to create objects. Gson's default
 * deserializer first creates an [AuthToken] object with default values which results with incorrect
 * value being assigned to [AuthToken.expiresAt] in its init block.
 *
 * This adapter mitigates this by calling the constructor with deserialized values.
 */
class AuthTokenAdapter: TypeAdapter<AuthToken>() {
    override fun read(jsonReader: JsonReader?): AuthToken {
        val authToken = AuthToken()
        jsonReader?.beginObject()

        while (jsonReader?.hasNext() == true) {
            if (jsonReader.peek().equals(JsonToken.NAME)) {
                when (jsonReader.nextName()) {
                    "access_token" -> authToken.accessToken = jsonReader.nextString()
                    "token_type" -> authToken.tokenType = jsonReader.nextString()
                    "expires_in" -> authToken.expiresIn = jsonReader.nextLong()
                    "refresh_token" -> {
                        if (jsonReader.peek().equals(JsonToken.NULL)) {
                            authToken.refreshToken = null
                            jsonReader.nextNull()
                        } else {
                            authToken.refreshToken = jsonReader.nextString()
                        }
                    }
                    else -> break
                }
            }
        }

        jsonReader?.endObject()

        // return new AuthToken calling its constructor with deserialized values
        return AuthToken(authToken.accessToken, authToken.tokenType, authToken.expiresIn, authToken.refreshToken)
    }

    override fun write(jsonWriter: JsonWriter?, authToken: AuthToken?) {
        jsonWriter?.beginObject()
        jsonWriter?.name("access_token")
        jsonWriter?.value(authToken?.accessToken)
        jsonWriter?.name("token_type")
        jsonWriter?.value(authToken?.tokenType)
        jsonWriter?.name("expires_in")
        jsonWriter?.value(authToken?.expiresIn)
        jsonWriter?.name("refresh_token")
        jsonWriter?.value(authToken?.refreshToken)
        jsonWriter?.endObject()
    }
}
