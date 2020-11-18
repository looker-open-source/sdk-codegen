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

import java.io.UnsupportedEncodingException
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

@Suppress("UNCHECKED_CAST")
open class APIMethods(val authSession: AuthSession) {

    val authRequest = authSession::authenticate

    inline fun <reified TSuccess, reified TFailure> get(
        path: String,
        queryParams: Values = mapOf(),
        body: Any? = null
    ): SdkResult<TSuccess, TFailure> {
        return authSession.transport.request<TSuccess, TFailure>(
            HttpMethod.GET, path, queryParams, body, authRequest
        )
    }

    inline fun <reified TSuccess, reified TFailure> head(
        path: String,
        queryParams: Values = mapOf(),
        body: Any? = null
    ): SdkResult<TSuccess, TFailure> {
        return authSession.transport.request<TSuccess, TFailure>(
            HttpMethod.HEAD, path, queryParams, body, authRequest
        )
    }

    inline fun <reified TSuccess, reified TFailure> delete(
        path: String,
        queryParams: Values = mapOf(),
        body: Any? = null
    ): SdkResult<TSuccess, TFailure> {
        return authSession.transport.request<TSuccess, TFailure>(
            HttpMethod.DELETE, path, queryParams, body, authRequest
        )
    }

    inline fun <reified TSuccess, reified TFailure> post(
        path: String,
        queryParams: Values = mapOf(),
        body: Any? = null
    ): SdkResult<TSuccess, TFailure> {
        return authSession.transport.request<TSuccess, TFailure>(
            HttpMethod.POST, path, queryParams, body, authRequest
        )
    }

    inline fun <reified TSuccess, reified TFailure> put(
        path: String,
        queryParams: Values = mapOf(),
        body: Any? = null
    ): SdkResult<TSuccess, TFailure> {
        return authSession.transport.request<TSuccess, TFailure>(
            HttpMethod.PUT, path, queryParams, body, authRequest
        )
    }

    inline fun <reified TSuccess, reified TFailure> patch(
        path: String,
        queryParams: Values = mapOf(),
        body: Any? = null
    ): SdkResult<TSuccess, TFailure> {
        return authSession.transport.request<TSuccess, TFailure>(
            HttpMethod.PATCH, path, queryParams, body, authRequest
        )
    }

    fun encodeURI(value: String): String {
        try {
            return URLEncoder.encode(value, StandardCharsets.UTF_8.toString())
        } catch (ex: UnsupportedEncodingException) {
            throw RuntimeException(ex.cause)
        }
    }
}
