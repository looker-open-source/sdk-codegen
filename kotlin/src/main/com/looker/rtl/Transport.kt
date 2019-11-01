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

import io.ktor.client.HttpClient
import io.ktor.client.call.call
import io.ktor.client.call.receive
import io.ktor.client.engine.apache.Apache
import io.ktor.client.features.json.JacksonSerializer
import io.ktor.client.features.json.JsonFeature
import io.ktor.client.request.HttpRequestBuilder
import io.ktor.client.response.HttpResponse
import io.ktor.http.takeFrom
import kotlinx.coroutines.runBlocking
import java.net.URLEncoder

sealed class SDKResponse {
    /** A successful SDK call. */
    data class SDKSuccessResponse<T>(
            /** The object returned by the SDK call. */
            val value: T
    ): SDKResponse() {
        /** Whether the SDK call was successful. */
        val ok: Boolean = true
    }

    /** An erroring SDK call. */
    data class SDKErrorResponse<T>(
            /** The error object returned by the SDK call. */
            val value: T
    ): SDKResponse() {
        /** Whether the SDK call was successful. */
        val ok: Boolean = false
    }

    /** An error representing an issue in the SDK, like a network or parsing error. */
    data class SDKError(val message: String): SDKResponse() {
        val type: String = "sdk_error"
    }
}

enum class HttpMethod(val value: io.ktor.http.HttpMethod) {
    GET(io.ktor.http.HttpMethod.Get),
    POST(io.ktor.http.HttpMethod.Post),
    PUT(io.ktor.http.HttpMethod.Put),
    DELETE(io.ktor.http.HttpMethod.Delete),
    PATCH(io.ktor.http.HttpMethod.Patch),
    HEAD(io.ktor.http.HttpMethod.Head)
    // TODO: Using the ktor-client-apache may support TRACE?
}

data class RequestSettings(
        val method: HttpMethod,
        val url: String,
        val headers: Map<String, String> = mapOf(),
        val body: String = ""
)

typealias Authenticator = (init: RequestSettings) -> RequestSettings

fun defaultAuthenticator(requestSettings: RequestSettings): RequestSettings = requestSettings

open class TransportSettings(var baseUrl: String = "",
                             var apiVersion: String = "",
                             var headers: Map<String, String> = mapOf())

fun encodeValues(params: Values = mapOf()): String {
    return params
            .filter { (k, v) -> v !== null }
            .map { (k, v) -> "$k=${URLEncoder.encode(v as String?, "utf-8")}"}
            .joinToString("&")

}

fun addQueryParams(path: String, params: Values = mapOf()): String {
    if (params.isEmpty()) return path

    val qp = encodeValues(params)
    return "$path?$qp"
}

class Transport(val options: TransportSettings) {

    var httpClient: HttpClient? = null
        private set

    // Internal only secondary constructor to support supplying an HTTP client for testing
    internal constructor(options: TransportSettings, httpClient: HttpClient) : this(options) {
        this.httpClient = httpClient
    }

    init {
        if (httpClient == null)
            httpClient = HttpClient(Apache) {
                install(JsonFeature) {
                    serializer = JacksonSerializer()
                }
            }
    }

    val apiPath = "${options.baseUrl}/api/${options.apiVersion}"

    private fun ok(res: HttpResponse): Boolean {
        // TODO: Should this use an enum class like in the ts version?
        // Enums in Kotlin don't work like c or ts and would require
        // an explicit numeric value for each enum type
        return (res.status.value >= 200) && (res.status.value <= 226)
    }

    inline fun <reified T> request(method: HttpMethod,
                                   path: String,
                                   queryParams: Values = mapOf(),
                                   body: Any? = null,
                                   noinline authenticator: Authenticator = ::defaultAuthenticator): SDKResponse {

        val builder = HttpRequestBuilder()
        // Set the request method
        builder.method = method.value

        // Handle the headers
        val agentTag = "LookerSDK Kotlin ${options.apiVersion}"
        val headers = options.headers.toMutableMap()
        headers["User-Agent"] = agentTag

        var content = ""

        if (body !== null) { //.isNotBlank()) {
            content = body.toString()
            headers["Content-Length"] = content.toByteArray().size.toString()
        }

        // Set the request URL
        val requestPath = if (authenticator === ::defaultAuthenticator)  {
            options.baseUrl
        } else {
            apiPath
        } + addQueryParams(path, queryParams)

        // Request body
        val json = io.ktor.client.features.json.defaultSerializer()
        // TODO make our request body form encoded

        val finishedRequest = authenticator(RequestSettings(method, requestPath, headers, content))

        builder.method = finishedRequest.method.value
        finishedRequest.headers.forEach {(k, v) ->
            builder.headers.append(k,v)
        }
        builder.url.takeFrom(finishedRequest.url)
        builder.body = json.write(content)

        return runBlocking {
            SDKResponse.SDKSuccessResponse(httpClient!!.call(builder).response.receive<T>())
        }
    }
}
