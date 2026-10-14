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

import com.google.api.client.http.HttpTransport
import com.google.api.client.http.LowLevelHttpRequest
import com.google.api.client.http.LowLevelHttpResponse
import com.looker.rtl.AuthSession
import com.looker.rtl.OAuthSession
import com.looker.rtl.Transport
import com.looker.rtl.TransportOptions
import org.junit.Test
import java.io.ByteArrayInputStream
import java.io.File
import java.io.InputStream
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

@ExperimentalUnsignedTypes
class TestAuthSession {
    val config by lazy { TestConfig() }
    val settings by lazy { config.settings }
    val testSettings by lazy { config.testSettings(settings) }

    @Test
    fun testTestFiles() {
        assertTrue(File(config.dataFile).exists(), "${config.dataFile} should exist")
        assertTrue(File(config.localIni).exists(), "${config.localIni} should exist")
    }

    @Test
    fun testIsAuthenticated() {
        val session = AuthSession(settings, Transport(testSettings))
        assertFalse(session.isAuthenticated())
    }

    @Test
    fun testLoginWithValidCreds() {
        val session = AuthSession(settings, Transport(testSettings))
        session.login()
        assertTrue(session.isAuthenticated())
    }

    @Test
    fun testUnauthenticatedLogout() {
        val session = AuthSession(settings, Transport(testSettings))
        assertFalse(session.isAuthenticated())
        assertFalse(session.logout())
    }

    @Test
    fun testLogsInAndOutWithGoodCreds() {
        val session = AuthSession(settings, Transport(testSettings))
        assertFalse(session.isAuthenticated())
        session.login()
        assertTrue(session.isAuthenticated())
        assertTrue(session.logout())
        assertFalse(session.isAuthenticated())
    }

    @Test
    fun testSudoLoginUsesApiPrefixAndAuthHeader() {
        val mockSettings = MockSettings(bareMinimum)
        val requests = mutableListOf<Pair<String, String>>()
        val requestHeaders = mutableListOf<Map<String, String>>()

        val mockHttpTransport = object : HttpTransport() {
            override fun buildRequest(method: String, url: String): LowLevelHttpRequest {
                return object : LowLevelHttpRequest() {
                    private val headers = mutableMapOf<String, String>()

                    override fun addHeader(name: String, value: String) {
                        headers[name] = value
                    }

                    override fun execute(): LowLevelHttpResponse {
                        requests.add(method to url)
                        requestHeaders.add(headers.toMap())
                        val responseJson = if (url.endsWith("/login")) {
                            """{"access_token":"admin_token","token_type":"Bearer","expires_in":3600}"""
                        } else {
                            """{"access_token":"sudo_token","token_type":"Bearer","expires_in":3600}"""
                        }
                        return object : LowLevelHttpResponse() {
                            override fun getContent(): InputStream =
                                ByteArrayInputStream(responseJson.toByteArray(Charsets.UTF_8))
                            override fun getContentEncoding(): String? = null
                            override fun getContentLength(): Long = responseJson.length.toLong()
                            override fun getContentType(): String = "application/json"
                            override fun getStatusLine(): String = "HTTP/1.1 200 OK"
                            override fun getStatusCode(): Int = 200
                            override fun getReasonPhrase(): String = "OK"
                            override fun getHeaderCount(): Int = 0
                            override fun getHeaderName(index: Int): String? = null
                            override fun getHeaderValue(index: Int): String? = null
                        }
                    }
                }
            }
        }

        val mockTransport = object : Transport(mockSettings) {
            override fun initTransport(options: TransportOptions): HttpTransport = mockHttpTransport
        }

        val session = AuthSession(mockSettings, mockTransport)
        val token = session.login("user_123")

        assertEquals(2, requests.size)
        assertEquals("POST" to "https://my.looker.com:19999/api/4.0/login", requests[0])
        assertEquals("POST" to "https://my.looker.com:19999/api/4.0/login/user_123", requests[1])
        assertEquals("token admin_token", requestHeaders[1]["Authorization"])
        assertTrue(session.isSudo())
        assertEquals("sudo_token", token.accessToken)
    }

    @Test
    fun testSha256() {
        val session = OAuthSession(settings, Transport(testSettings))
        val message = "The quick brown fox jumped over the lazy dog."
        val hash = session.sha256hash(message)
        assertEquals("aLEoK5HeLAVMNmKcuN1EfxLwltPjxYeXjcIkhERjNIM=", hash, "Quick brown fox should match")
    }

    @Test
    fun testRedemptionBody() {
        val session = OAuthSession(config.oAuthTestSettings, Transport(testSettings))
        val hashCode = session.sha256hash("com.looker.android")
        val request = session.redeemAuthCodeBody("authCode", hashCode)
        assertEquals("authCode", request["code"])
        assertEquals(hashCode, request["code_verifier"])
        assertEquals("test_client_id", request["client_id"])
        assertEquals("looker://", request["redirect_uri"])
    }
}
