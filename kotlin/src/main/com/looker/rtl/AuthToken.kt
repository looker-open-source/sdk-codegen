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

import com.fasterxml.jackson.annotation.JsonProperty
import java.time.LocalDateTime

data class AuthToken(
        @JsonProperty("access_token")
        var accessToken: String = "",  // TODO: Consider making this/these vals and using new objects instead of mutating
        @JsonProperty("token_type")
        val tokenType: String = "",
        @JsonProperty("expires_in")
        var expiresIn: Long = 0,
        @JsonProperty("expires_at")
        var expiresAt: LocalDateTime = LocalDateTime.now()) {

    constructor(token: AuthToken) : this(token.accessToken, token.tokenType, token.expiresIn, token.expiresAt)

    init {
        if (expiresIn > 0) {
            expiresAt = LocalDateTime.now().plusSeconds(expiresIn)
        }
    }

    fun isActive(): Boolean {
        if (accessToken.isEmpty()) return false
        return expiresAt > LocalDateTime.now()
    }

    fun reset() {  // TODO: Should this just return a blank AuthToken object instead?
        accessToken = ""
        expiresIn = 0
    }
}
