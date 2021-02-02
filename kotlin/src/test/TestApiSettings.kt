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

import com.looker.rtl.ApiSettings
import com.looker.rtl.AuthSession
import com.looker.rtl.ConfigurationProvider
import com.looker.rtl.DEFAULT_TIMEOUT
import com.looker.sdk.*
import org.junit.Test
import kotlin.test.assertEquals

val bareMinimum = """
[Looker]
base_url=https://my.looker.com:19999
""".trimIndent()

val quotedMinimum = """
[Looker]
base_url='https://my.looker.com:19999'
""".trimIndent()

val withEnvPrefix = """
[Looker]
base_url=https://my.looker.com:19999
environmentPrefix=$ENVIRONMENT_PREFIX
""".trimIndent()

val mockId = "IdOverride"
val mockSecret = "SecretOverride"

class MockSettings(contents: String) : ConfigurationProvider by ApiSettings.fromIniText(contents) {
    override fun readConfig(): Map<String, String> {
        return mapOf(
            "base_url" to baseUrl,
            "environmentPrefix" to ENVIRONMENT_PREFIX,
            "verify_ssl" to verifySSL.toString(),
            "timeout" to timeout.toString(),
            "headers" to headers.toString(),
            "client_id" to mockId,
            "client_secret" to mockSecret,
        )
    }
}

class TestApiSettings {
    @Test
    fun testApiSettingsDefaults() {
        val settings = ApiSettings.fromIniText(bareMinimum)
        val config = settings.readConfig()
        assertEquals(settings.baseUrl, "https://my.looker.com:19999", "Base URL is read")
        assertEquals(settings.environmentPrefix, "")
        assertEquals(settings.verifySSL, true)
        assertEquals(settings.timeout, DEFAULT_TIMEOUT)
        assertEquals(config["client_id"], null)
        assertEquals(config["client_secret"], null)
    }

    @Test
    fun testApiSettingsQuotes() {
        val settings = ApiSettings.fromIniText(quotedMinimum)
        assertEquals("https://my.looker.com:19999", settings.baseUrl, "Base URL is read")
        assertEquals(true, settings.verifySSL)
        assertEquals(DEFAULT_TIMEOUT, settings.timeout)
    }

    @Test
    fun testApiSettingsOverrides() {
        val settings = MockSettings(bareMinimum)
        val config = settings.readConfig()
        assertEquals("https://my.looker.com:19999", settings.baseUrl, "Base URL is read")
        assertEquals("", settings.environmentPrefix)
        assertEquals(true, settings.verifySSL)
        assertEquals(DEFAULT_TIMEOUT, settings.timeout)
        assertEquals(mockId, config["client_id"])
        assertEquals(mockSecret, config["client_secret"])
    }

    @Test
    fun testApiSettingsEnvPrefix() {
        val settings = MockSettings(withEnvPrefix)
        val config = settings.readConfig()
        assertEquals("https://my.looker.com:19999", settings.baseUrl, "Base URL is read")
        assertEquals(ENVIRONMENT_PREFIX, settings.environmentPrefix)
        assertEquals(true, settings.verifySSL)
        assertEquals(DEFAULT_TIMEOUT, settings.timeout)
        assertEquals(mockId, config["client_id"])
        assertEquals(mockSecret, config["client_secret"])
    }

    @Test
    fun testSessionOverride() {
        val settings = MockSettings(withEnvPrefix)
        val session = AuthSession(settings)
        val config = session.apiSettings.readConfig()
        assertEquals("https://my.looker.com:19999", settings.baseUrl, "Base URL is read")
        assertEquals(ENVIRONMENT_PREFIX, settings.environmentPrefix)
        assertEquals(true, settings.verifySSL)
        assertEquals(DEFAULT_TIMEOUT, settings.timeout)
        assertEquals(mockId, config["client_id"])
        assertEquals(mockSecret, config["client_secret"])
    }

    @Test
    fun testSdkSettings() {
        val settings = SdkSettings.fromIniText(bareMinimum)
        assertEquals("https://my.looker.com:19999", settings.baseUrl, "Base URL is read")
        assertEquals(ENVIRONMENT_PREFIX, settings.environmentPrefix)
        assertEquals(API_VERSION, settings.apiVersion)
        assertEquals(mapOf(LOOKER_APPID to AGENT_TAG, "User-Agent" to AGENT_TAG), settings.headers)
    }
}
