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

import com.google.api.client.http.ByteArrayContent
import com.google.api.client.http.GenericUrl
import com.google.api.client.http.HttpContent
import com.google.api.client.http.HttpHeaders
import com.google.api.client.http.HttpRequest
import com.google.api.client.http.HttpRequestFactory
import com.google.api.client.http.HttpRequestInitializer
import com.google.api.client.http.HttpResponseException
import com.google.api.client.http.HttpTransport
import com.google.api.client.http.apache.v2.ApacheHttpTransport
import com.google.api.client.http.javanet.NetHttpTransport
import com.google.api.client.json.Json
import com.google.gson.annotations.SerializedName
import com.looker.rtl.GsonObjectParser.Companion.GSON
import com.looker.rtl.SDKResponse.Companion.ERROR_BODY
import org.apache.http.conn.ssl.NoopHostnameVerifier
import org.apache.http.conn.ssl.SSLConnectionSocketFactory
import org.apache.http.ssl.SSLContextBuilder
import java.io.BufferedReader
import java.net.URLDecoder
import java.net.URLEncoder
import java.security.SecureRandom
import java.security.cert.CertificateException
import java.security.cert.X509Certificate
import java.time.ZoneOffset
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.util.*
import javax.net.ssl.HostnameVerifier
import javax.net.ssl.SSLContext
import javax.net.ssl.SSLSocketFactory
import javax.net.ssl.X509TrustManager
import kotlin.collections.component1
import kotlin.collections.component2

sealed class SDKResponse {
    /** A successful SDK call. */
    data class SDKSuccessResponse<T>(
        /** The object returned by the SDK call. */
        val value: T,
    ) : SDKResponse() {
        /** Whether the SDK call was successful. */
        val ok: Boolean = true
    }

    /** An erroring SDK call. */
    data class SDKErrorResponse<T>(
        /** The error object returned by the SDK call. */
        val value: T,
        val method: HttpMethod,
        val path: String,
        val statusCode: Int,
        val statusMessage: String,
        val responseHeaders: HttpHeaders,
        val responseBody: String,
    ) : SDKResponse() {
        /** Whether the SDK call was successful. */
        val ok: Boolean = false
    }

    /** An error representing an issue in the SDK, like a network or parsing error. */
    data class SDKError(
        val message: String,
        val cause: Exception,
    ) : SDKResponse() {
        val type: String = "sdk_error"
    }

    inline fun <reified V> getOrThrow(): V =
        when (this) {
            is SDKResponse.SDKSuccessResponse<*> ->
                checkNotNull(value as? V) {
                    if (value == null) {
                        "Expected value of type ${V::class}, but was null"
                    } else {
                        "Expected value of type ${V::class}, but was ${value::class}"
                    }
                }
            is SDKResponse.SDKErrorResponse<*> ->
                throw LookerApiException(
                    method,
                    path,
                    statusCode,
                    statusMessage,
                    responseHeaders,
                    responseBody,
                )
            is SDKResponse.SDKError -> throw cause
        }

    companion object {
        const val ERROR_BODY = "error_body"

        /**
         * Response handler that throws an error on error response, returns success result on
         * success
         */
        @Deprecated(
            "This method throws java.lang.Error, which is not recommended for use in application code. Please use SDKResponse.getOrThrow() instead.",
        )
        fun <T> ok(response: SDKResponse): T {
            @Suppress("UNCHECKED_CAST")
            when (response) {
                is SDKResponse.SDKErrorResponse<*> -> throw Error(response.value.toString())
                is SDKResponse.SDKSuccessResponse<*> -> return response.value as T
                is SDKResponse.SDKError -> throw Error(response.message, response.cause)
            }
        }
    }
}

/** Thrown when a Looker API call returns an error. */
data class LookerApiException(
    val method: HttpMethod,
    val path: String,
    val statusCode: Int,
    val statusMessage: String,
    val responseHeaders: HttpHeaders,
    val responseBody: String,
) : Exception() {
    override val message = "$method $path $statusCode: $statusMessage"
}

/** Response handler that throws an error on error response, returns success result on success */
@Deprecated(
    "This method throws java.lang.Error, which is not recommended for use in application code. Please use SDKResponse.getOrThrow() instead.",
)
fun <T> ok(response: SDKResponse) = SDKResponse.ok<T>(response)

enum class HttpMethod {
    GET,
    POST,
    PUT,
    DELETE,
    PATCH,
    HEAD,
}

enum class HttpTransports(
    val label: String,
) {
    APACHE("Apache HTTP Client"),
    JAVA_NET("Native Java HTTP Client"),
    // URL_FETCH("Google App Engine HTTP Client"), TODO: App Engine support? Requires App Engine
    // SDK.
    // KTOR("Kotlin based HTTP Client") TODO: Add ktor transport wrapper. Do we need this?
}

data class RequestSettings(
    val method: HttpMethod,
    val url: String,
    val headers: Map<String, String> = emptyMap(),
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
    var httpTransport: String
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
    override var httpTransport: String = DEFAULT_HTTP_TRANSPORT,
) : TransportOptions

private val utcFormat by lazy { DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'") }

fun encodeParam(value: Any?): String {
    val utf8 = "utf-8"
    var encoded =
        if (value is ZonedDateTime) {
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

fun addQueryParams(
    path: String,
    params: Values = emptyMap(),
): String {
    if (params.isEmpty()) return path

    val qp = encodeValues(params)
    return "$path?$qp"
}

/** Returns a [HttpRequestInitializer] prepared with the provided requestSettings */
fun customInitializer(
    options: TransportOptions,
    requestSettings: RequestSettings,
): HttpRequestInitializer =
    HttpRequestInitializer { request ->
        // Timeout is passed in as seconds
        val timeout = (options.timeout * 1000)
        request.connectTimeout = timeout
        request.readTimeout = timeout

        request.parser = GsonObjectParser()
        request.followRedirects = true

        // set headers
        request.headers =
            HttpHeaders().also { requestSettings.headers.forEach { (k, v) -> it.set(k, v) } }
    }

open class Transport(
    val options: TransportOptions,
) {
    private val apiPath = "${options.baseUrl}/api/${options.apiVersion}"

    /**
     * Create the correct http request path
     *
     * @param path Relative or absolute path
     * @param queryParams query string arguments (if any)
     * @param authenticator optional authenticator callback for API requests
     * @return a fully qualified path that is the base url, the api path, or a pass through request
     * url
     */
    fun makeUrl(
        path: String,
        queryParams: Values = emptyMap(),
        authenticator: Authenticator? =
            null, // TODO figure out why ::defaultAuthenticator is matching when it
        // shouldn't
    ): String =
        if (path.startsWith("http://", true) || path.startsWith("https://", true)) {
            "" // full path was passed in
        } else {
            if (authenticator === null) {
                options.baseUrl
            } else {
                apiPath
            }
        } + addQueryParams(path, queryParams)

    open fun getAllTrustingVerifiers(): Pair<SSLSocketFactory, HostnameVerifier> {
        // NOTE! This is completely insecure and should ONLY be used with local server instance
        // testing for development purposes
        val tm: X509TrustManager =
            object : X509TrustManager {
                override fun getAcceptedIssuers(): Array<X509Certificate?> = arrayOfNulls(0)

                @Throws(CertificateException::class)
                override fun checkClientTrusted(
                    certs: Array<X509Certificate?>?,
                    authType: String?,
                ) {}

                @Throws(CertificateException::class)
                override fun checkServerTrusted(
                    certs: Array<X509Certificate?>?,
                    authType: String?,
                ) {}
            }
        val trustAllCerts = arrayOf(tm)
        val sslContext = SSLContext.getInstance("SSL")
        sslContext.init(null, trustAllCerts, SecureRandom())

        val sslSocketFactory: SSLSocketFactory = sslContext.socketFactory
        val hostnameVerifier = HostnameVerifier { _, _ -> true }

        return Pair(sslSocketFactory, hostnameVerifier)
    }

    /**
     * Given [TransportOptions], selects the requested [HttpTransport].
     *
     * Will disable SSL certificate verification iff [TransportOptions.verifySSL] is false.
     */
    open fun initTransport(options: TransportOptions): HttpTransport {
        return when (HttpTransports.valueOf(options.httpTransport.uppercase())) {
            HttpTransports.APACHE -> {
                // TODO: fix bug upstream that does not pass client context to requests.
                //  The `expire` datetime format used in the Looker response is not compatible with
                //  the "default" CookieSpec. We should be able to select an alternative spec but
                //  doing so here does not cascade to individual requests.
                //  Disable cookie management for now.
                val clientBuilder =
                    ApacheHttpTransport.newDefaultHttpClientBuilder().disableCookieManagement()
                if (!options.verifySSL) {
                    val sslBuilder = SSLContextBuilder().loadTrustMaterial(null) { _, _ -> true }
                    val sslSocketFactory = SSLConnectionSocketFactory(sslBuilder.build())
                    clientBuilder
                        .setSSLHostnameVerifier(NoopHostnameVerifier.INSTANCE)
                        .setSSLSocketFactory(sslSocketFactory)
                }

                ApacheHttpTransport(clientBuilder.build())
            }
            HttpTransports.JAVA_NET -> {
                if (!options.verifySSL) {
                    val (sslSocketFactory, hostnameVerifier) = getAllTrustingVerifiers()
                    val clientBuilder = NetHttpTransport.Builder()
                    clientBuilder.sslSocketFactory = sslSocketFactory
                    clientBuilder.hostnameVerifier = hostnameVerifier

                    return clientBuilder.build()
                }

                NetHttpTransport()
            }
        }
    }

    inline fun <reified T : Any> request(
        method: HttpMethod,
        path: String,
        queryParams: Values = emptyMap(),
        body: Any? = null,
        noinline authenticator: Authenticator? = null,
    ): SDKResponse {
        val transport: HttpTransport = initTransport(options)

        val finalizedRequestSettings: RequestSettings =
            finalizeRequest(method, path, queryParams, authenticator)

        val requestInitializer: HttpRequestInitializer =
            customInitializer(options, finalizedRequestSettings)
        val requestFactory: HttpRequestFactory = transport.createRequestFactory(requestInitializer)

        val httpContent: HttpContent? =
            when (body) {
                // the body has already been prepared as HttpContent
                is HttpContent -> body
                // body is a raw string to be converted to a byte array
                is String ->
                    ByteArrayContent(
                        "application/x-www-form-urlencoded",
                        body.toByteArray(),
                    )
                // body is a data class to be serialized as JSON or null
                else -> {
                    // TODO: Consider using JsonHttpContent()
                    if (body != null) {
                        ByteArrayContent(Json.MEDIA_TYPE, GSON.toJson(body).toByteArray())
                    } else {
                        null
                    }
                }
            }

        val request: HttpRequest =
            requestFactory
                .buildRequest(
                    finalizedRequestSettings.method.toString(),
                    GenericUrl(finalizedRequestSettings.url),
                    httpContent,
                ).setSuppressUserAgentSuffix(true)

        // TODO get overrides parameter to work without causing compilation errors in UserSession
        //            overrides: TransportOptions? = null): SDKResponse {
        //        overrides?.let { o ->
        //            if (options.verifySSL != o.verifySSL || options.timeout != o.timeout) {
        //                // need an HTTP client with custom options
        //                client = customClient(o)
        //            }
        //        }

        val sdkResponse =
            try {
                val response = request.execute()
                if (response.content == null) {
                    return SDKResponse.SDKSuccessResponse(null)
                }
                val rawResult: T =
                    when (T::class) {
                        // some responses may be a string (e.g. query results in `csv`
                        // format)
                        String::class ->
                            response.content
                                .bufferedReader()
                                .use(BufferedReader::readText) as
                                T
                        // TODO(https://github.com/looker-open-source/sdk-codegen/issues/1341):
                        //  add streaming support. Currently, `stream` methods read the
                        // entire response.
                        ByteArray::class -> response.content.readBytes() as T
                        // most responses are JSON
                        else -> response.parseAs(T::class.java)
                    }
                SDKResponse.SDKSuccessResponse(rawResult)
            } catch (e: HttpResponseException) {
                SDKResponse.SDKErrorResponse(
                    "$method $path $ERROR_BODY: ${e.content}",
                    method,
                    path,
                    e.statusCode,
                    e.statusMessage,
                    e.headers,
                    e.content,
                )
            } catch (e: Exception) {
                SDKResponse.SDKError(e.message ?: "Something went wrong", e)
            }

        return sdkResponse
    }

    /** Returns a [HttpRequestInitializer] that adds Looker auth headers and finalizes URL */
    fun finalizeRequest(
        method: HttpMethod,
        path: String,
        queryParams: Values,
        authenticator: Authenticator?,
    ): RequestSettings {
        val requestPath = makeUrl(path, queryParams, authenticator)

        // headers as provided by options but not yet finalized
        val provisionalHeaders = options.headers.toMutableMap()

        var auth = authenticator ?: ::defaultAuthenticator
        if (path.startsWith("http://", true) || path.startsWith("https://", true)) {
            // if a full path is passed in, this is a straight fetch, not an API call
            // so don't authenticate
            auth = ::defaultAuthenticator
        }

        return auth(RequestSettings(method, requestPath, provisionalHeaders))
    }
}

data class SDKErrorDetailInfo(
    var message: String,
    var field: String,
    var code: String,
    @SerializedName("documentation_url") var documentationUrl: String,
)

data class SDKErrorInfo(
    var message: String,
    var errors: List<SDKErrorDetailInfo>,
    @SerializedName("documentation_url") var documentationUrl: String,
)

fun parseSDKError(msg: String): SDKErrorInfo {
    val rx = Regex("""(?<=$ERROR_BODY:).*$""")
    val info = rx.find(msg)
    var result = SDKErrorInfo("", listOf(), "")
    info?.let {
        val payload = info.value
        result = GSON.fromJson(payload, SDKErrorInfo::class.java)
        // Ignore the linter suggestion to replace `.isNullOrEmpty()` with `.isEmpty()` because it's
        // *wrong*
        if (result.errors.isNullOrEmpty()) {
            result.errors = listOf()
        }
    }
    return result
}
