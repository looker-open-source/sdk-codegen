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

import com.google.gson.Gson
import com.google.gson.annotations.SerializedName
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.okhttp.*
import io.ktor.client.features.json.*
import io.ktor.client.request.*
import io.ktor.client.request.forms.*
import io.ktor.client.statement.*
import io.ktor.http.*
import kotlinx.coroutines.runBlocking
import java.net.URLDecoder
import java.net.URLEncoder
import java.security.SecureRandom
import java.security.cert.CertificateException
import java.security.cert.X509Certificate
import java.time.ZoneOffset
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.util.*
import java.util.concurrent.TimeUnit
import javax.net.ssl.HostnameVerifier
import javax.net.ssl.SSLContext
import javax.net.ssl.SSLSocketFactory
import javax.net.ssl.X509TrustManager
import kotlin.collections.Map
import kotlin.collections.component1
import kotlin.collections.component2
import kotlin.collections.emptyMap
import kotlin.collections.filter
import kotlin.collections.forEach
import kotlin.collections.joinToString
import kotlin.collections.map
import kotlin.collections.set
import kotlin.collections.toMutableMap

sealed class SDKResponse {
    /** A successful SDK call. */
    data class SDKSuccessResponse<T>(
        /** The object returned by the SDK call. */
        val value: T
    ) : SDKResponse() {
        /** Whether the SDK call was successful. */
        val ok: Boolean = true
    }

    /** An erroring SDK call. */
    data class SDKErrorResponse<T>(
        /** The error object returned by the SDK call. */
        val value: T
    ) : SDKResponse() {
        /** Whether the SDK call was successful. */
        val ok: Boolean = false
    }

    /** An error representing an issue in the SDK, like a network or parsing error. */
    data class SDKError(val message: String) : SDKResponse() {
        val type: String = "sdk_error"
    }
}

/**
 * Response handler that throws an error on error response, returns success result on success
 */
fun <T> ok(response: SDKResponse): T {
    @Suppress("UNCHECKED_CAST")
    when (response) {
        is SDKResponse.SDKErrorResponse<*> -> throw Error(response.value.toString())
        is SDKResponse.SDKSuccessResponse<*> -> return response.value as T
        else -> throw Error("Fail!!")
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
    val headers: Map<String, String> = emptyMap()
)

typealias Authenticator = (init: RequestSettings) -> RequestSettings

fun defaultAuthenticator(requestSettings: RequestSettings): RequestSettings = requestSettings

interface TransportOptions {
    var baseUrl: String
    var apiVersion: String
    var verifySSL: Boolean
    var timeout: Int
    var headers: Map<String, String>
    var environmentPrefix: String
}

interface ConfigurationProvider : TransportOptions {
    fun isConfigured(): Boolean
    fun readConfig(): Map<String, String>
}

data class TransportSettings(
    override var baseUrl: String = "",
    override var apiVersion: String = DEFAULT_API_VERSION,
    override var verifySSL: Boolean = true,
    override var timeout: Int = DEFAULT_TIMEOUT,
    override var headers: Map<String, String> = emptyMap(),
    override var environmentPrefix: String = "LOOKERSDK",
) : TransportOptions

private val utcFormat by lazy { DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'") }

fun encodeParam(value: Any?): String {
    val utf8 = "utf-8"
    var encoded = if (value is ZonedDateTime) {
        value.toOffsetDateTime().format(utcFormat)
    } else if (value is Date) {
        value.toInstant().atZone(ZoneOffset.UTC).format(utcFormat)
    } else {
        "$value"
    }
    try {
        val decoded = URLDecoder.decode(encoded, utf8)
        if (encoded == decoded) {
            encoded = URLEncoder.encode(encoded, utf8)
        }
    } catch (e: IllegalArgumentException) {
        encoded = URLEncoder.encode(encoded, utf8)
    } catch (e: Exception) {
        throw e
    }
    return encoded
}

fun encodeValues(params: Values = emptyMap()): String {
    @Suppress("UNCHECKED_CAST")
    return params
        .filter { (_, v) -> v !== null }
        .map { (k, v) -> "$k=${encodeParam(v)}" }
        .joinToString("&")
}

fun addQueryParams(path: String, params: Values = emptyMap()): String {
    if (params.isEmpty()) return path

    val qp = encodeValues(params)
    return "$path?$qp"
}

fun customClient(options: TransportOptions): HttpClient {
    // Timeout is passed in as seconds
    val timeout = (options.timeout * 1000).toLong()
    // We are using https://square.github.io/okhttp/4.x/okhttp/okhttp3/ as our cross-platform HttpClient
    // it provides better performance and is compatible with Android
    // This construction loosely adapted from https://ktor.io/clients/http-client/engines.html#artifact-7
    return HttpClient(OkHttp) {
        install(JsonFeature) {
            serializer = GsonSerializer {
                registerTypeAdapter(AuthToken::class.java, AuthTokenAdapter())
            }
        }
        engine {
            config {
                connectTimeout(timeout, TimeUnit.MILLISECONDS)
                callTimeout(timeout, TimeUnit.MILLISECONDS)
                readTimeout(timeout, TimeUnit.MILLISECONDS)
                followRedirects(true)
                // https://square.github.io/okhttp/3.x/okhttp/okhttp3/Interceptor.html
//                addInterceptor(interceptor)
//                addNetworkInterceptor(interceptor)

//                /**
//                 * Set okhttp client instance to use instead of creating one.
//                 */
//                preconfigured = okHttpClientInstance
                if (!options.verifySSL) {
                    // NOTE! This is completely insecure and should ONLY be used with local server instance
                    // testing for development purposes
                    val tm: X509TrustManager = object : X509TrustManager {
                        override fun getAcceptedIssuers(): Array<X509Certificate?> {
                            return arrayOfNulls(0)
                        }

                        @Throws(CertificateException::class)
                        override fun checkClientTrusted(
                            certs: Array<X509Certificate?>?,
                            authType: String?
                        ) {
                        }

                        @Throws(CertificateException::class)
                        override fun checkServerTrusted(
                            certs: Array<X509Certificate?>?,
                            authType: String?
                        ) {
                        }
                    }
                    val trustAllCerts = arrayOf(tm)
                    val sslContext = SSLContext.getInstance("SSL")
                    sslContext.init(null, trustAllCerts, SecureRandom())
                    val sslSocketFactory: SSLSocketFactory = sslContext.socketFactory
                    sslSocketFactory(
                        sslSocketFactory, tm
                    )

                    val hostnameVerifier = HostnameVerifier { _, _ ->
                        true
                    }
                    hostnameVerifier(hostnameVerifier)
                }
            }
        }
    }
}

class Transport(val options: TransportOptions) {

    private val apiPath = "${options.baseUrl}/api/${options.apiVersion}"

    /**
     * Create the correct http request path
     * @param path Relative or absolute path
     * @param queryParams query string arguments (if any)
     * @param authenticator optional authenticator callback for API requests
     * @return a fully qualified path that is the base url, the api path, or a pass through request url
     */
    fun makeUrl(
        path: String,
        queryParams: Values = emptyMap(),
        authenticator: Authenticator? = null // TODO figure out why ::defaultAuthenticator is matching when it shouldn't
    ): String {
        return if (path.startsWith("http://", true) ||
            path.startsWith("https://", true)
        ) {
            "" // full path was passed in
        } else {
            if (authenticator === null) {
                options.baseUrl
            } else {
                apiPath
            }
        } + addQueryParams(path, queryParams)
    }

    inline fun <reified T> request(
        method: HttpMethod,
        path: String,
        queryParams: Values = emptyMap(),
        body: Any? = null,
        noinline authenticator: Authenticator? = null
    ): SDKResponse {
        // TODO get overrides parameter to work without causing compilation errors in UserSession
//            overrides: TransportOptions? = null): SDKResponse {

        val builder = httpRequestBuilder(method, path, queryParams, authenticator, body)

        val client = customClient(options)
        // TODO get overrides parameter working
//        overrides?.let { o ->
//            if (options.verifySSL != o.verifySSL || options.timeout != o.timeout) {
//                // need an HTTP client with custom options
//                client = customClient(o)
//            }
//        }

        val result = try {
            runBlocking {
                SDKResponse.SDKSuccessResponse(
                    client.request<HttpStatement>(builder).execute {
                        response: HttpResponse ->
                        response.receive<T>()
                    }
                )
            }
        } catch (e: Exception) {
            SDKResponse.SDKErrorResponse("$method $path $e")
        } finally {
            client.close()
        }

        return result
    }

    fun httpRequestBuilder(method: HttpMethod, path: String, queryParams: Values, authenticator: Authenticator?, body: Any?): HttpRequestBuilder {
        val builder = HttpRequestBuilder()
        // Set the request method
        builder.method = method.value

        // Handle the headers
        val headers = options.headers.toMutableMap()

        val requestPath = makeUrl(path, queryParams, authenticator)

        val auth = authenticator ?: ::defaultAuthenticator

        val finishedRequest = auth(RequestSettings(method, requestPath, headers))

        builder.method = finishedRequest.method.value
        finishedRequest.headers.forEach { (k, v) ->
            builder.headers.append(k, v)
        }
        builder.url.takeFrom(finishedRequest.url)

        if (body != null) {
            when (body) {
                is FormDataContent -> {
                    // Encoded form, probably automatically does headers["Content-Type"] = "application/x-www-form-urlencoded"
                    builder.body = body
                }
                is String -> {
                    // Presume this is a manually user-encoded value
                    headers["Content-Type"] = "application/x-www-form-urlencoded"
                    builder.body = body
                }
                else -> {
                    // Request body
                    val json = defaultSerializer()
                    val jsonBody = json.write(body)

                    builder.body = jsonBody
                    headers["Content-Length"] = jsonBody.contentLength.toString()
                }
            }
        }
        return builder
    }
}

data class SDKErrorDetailInfo(
    var message: String,
    var field: String,
    var code: String,
    @SerializedName("documentation_url")
    var documentationUrl: String,
)

data class SDKErrorInfo(
    var message: String,
    var errors: List<SDKErrorDetailInfo>,
    @SerializedName("documentation_url")
    var documentationUrl: String,
)

fun parseSDKError(msg: String) : SDKErrorInfo {
    val rx = Regex("\\s+Text:\\s+\"(.*)\"")
    val info = rx.find(msg)
    var result = SDKErrorInfo("", listOf(), "")
    info?.let{
        val (payload) = it.destructured
        val gson = Gson()
        result = gson.fromJson(payload, SDKErrorInfo::class.java)
        // Ignore the linter suggestion to replace `.isNullOrEmpty()` with `.isEmpty()` because it's *wrong*
        if (result.errors.isNullOrEmpty()) {
            result.errors = listOf()
        }
    }
    return result
}
