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
    companion object {
        private val AUTH_ENDPOINT_REGEX = Regex("^/?(login(/.*)?|logout)$", RegexOption.IGNORE_CASE)
    }

    val authRequest = authSession::authenticate

    fun <T> ok(response: SDKResponse): T {
        when (response) {
            is SDKResponse.SDKErrorResponse<*> -> throw Error(response.value.toString())
            is SDKResponse.SDKSuccessResponse<*> -> return response.value as T
            else -> throw Error("Fail!!")
        }
    }

    fun isAuthEndpoint(path: String): Boolean =
        AUTH_ENDPOINT_REGEX.matches(path)

    inline fun <reified T : Any> request(
        method: HttpMethod,
        path: String,
        queryParams: Values = mapOf(),
        body: Any? = null,
    ): SDKResponse {
        var response = authSession.transport.request<T>(method, path, queryParams, body, authRequest)
        if (response is SDKResponse.SDKErrorResponse<*> && response.statusCode == 401) {
            authSession.invalidateTokens()
            if (!isAuthEndpoint(path) && !authSession.isAuthenticated()) {
                response = authSession.transport.request<T>(method, path, queryParams, body, authRequest)
                if (response is SDKResponse.SDKErrorResponse<*> && response.statusCode == 401) {
                    authSession.invalidateTokens()
                }
            }
        }
        return response
    }

    inline fun <reified T : Any> get(path: String, queryParams: Values = mapOf(), body: Any? = null): SDKResponse {
        return request<T>(HttpMethod.GET, path, queryParams, body)
    }

    inline fun <reified T : Any> head(path: String, queryParams: Values = mapOf(), body: Any? = null): SDKResponse {
        return request<T>(HttpMethod.HEAD, path, queryParams, body)
    }

    inline fun <reified T : Any> delete(path: String, queryParams: Values = mapOf(), body: Any? = null): SDKResponse {
        return request<T>(HttpMethod.DELETE, path, queryParams, body)
    }

    inline fun <reified T : Any> post(path: String, queryParams: Values = mapOf(), body: Any? = null): SDKResponse {
        return request<T>(HttpMethod.POST, path, queryParams, body)
    }

    inline fun <reified T : Any> put(path: String, queryParams: Values = mapOf(), body: Any? = null): SDKResponse {
        return request<T>(HttpMethod.PUT, path, queryParams, body)
    }

    inline fun <reified T : Any> patch(path: String, queryParams: Values = mapOf(), body: Any? = null): SDKResponse {
        return request<T>(HttpMethod.PATCH, path, queryParams, body)
    }

    fun encodeURI(value: String): String {
        try {
            return URLEncoder.encode(value, StandardCharsets.UTF_8.toString())
        } catch (ex: UnsupportedEncodingException) {
            throw RuntimeException(ex.cause)
        }
    }
}
