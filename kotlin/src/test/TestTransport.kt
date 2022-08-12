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

import com.google.gson.Gson
import com.looker.rtl.*
import com.looker.sdk.AGENT_TAG
import com.looker.sdk.ENVIRONMENT_PREFIX
import com.looker.sdk.LOOKER_APPID
import org.junit.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class TestTransport {
    val fullPath = "https://github.com/looker-open-source/sdk-codegen/"
    val base = "https://my.looker.com:19999"
    val apiVersion = "3.1"
    val userPath = "/user"
    val headers = mapOf(LOOKER_APPID to AGENT_TAG, "User-Agent" to AGENT_TAG)

    val options = TransportSettings(base, apiVersion, headers = headers, environmentPrefix = ENVIRONMENT_PREFIX)
    val xp = Transport(options)
    val qp: Values = mapOf("a" to 1, "b" to false, "c" to "d e", "skip" to null)
    val mockAuth: Authenticator = { RequestSettings(HttpMethod.GET, "bogus") }
    val params = "?a=1&b=false&c=d+e"

    @Test
    fun testFullPath() {
        var actual = xp.makeUrl(fullPath)
        assertEquals(fullPath, actual)
        actual = xp.makeUrl(fullPath, authenticator = mockAuth)
        assertEquals(fullPath, actual)
        actual = xp.makeUrl(fullPath, qp, mockAuth)
        assertEquals(fullPath + params, actual)
    }

    @Test
    fun testRelativePath() {
        var actual = xp.makeUrl(userPath)
        assertEquals("$base$userPath", actual)
        actual = xp.makeUrl(userPath, authenticator = mockAuth)
        assertEquals("$base/api/$apiVersion$userPath", actual)
        actual = xp.makeUrl(userPath, qp, mockAuth)
        assertEquals("$base/api/$apiVersion$userPath$params", actual)
    }

    @Test
    fun testFullRequest() {
        val actual = ok<String>(xp.request<String>(HttpMethod.GET, fullPath))
        assertTrue(actual.contains("One SDK to rule them all, and in the codegen bind them"))
    }

    @Test
    fun testEncodeParam() {
        val dateStr = "2020-01-01T14:48:00.00Z"
        val oldDate = Date(dateStr)
        val today = ZonedDateTime(dateStr)
        assertEquals("2020-01-01T14%3A48%3A00.000Z", encodeParam(oldDate))
        assertEquals("2020-01-01T14%3A48%3A00.000Z", encodeParam(today))
        assertEquals("foo%2Fbar", encodeParam("foo%2Fbar"))
        assertEquals("foo%2Fbar", encodeParam("foo/bar"))
        assertEquals("true", encodeParam(true))
        assertEquals("2.3", encodeParam(2.3))
    }

    data class TestModel(
        val string1: String,
        val num1: Int,
        val string2: String,
        val num2: Int,
        val string3: String,
        val num3: Int,
    )

    @Test
    fun testJsonTyping() {
        val payload = """
{
  "string1": 1,
  "num1": 1,
  "string2": "2",
  "num2": "2",
  "string3": "3",
  "num3": 3,
  "string4": "4",
  "num4": 4
}
        """.trimIndent()
        // / we use GSon so verify GSon handles ... flexible ... json
        val gson = Gson()
        val testModel = gson.fromJson(payload, TestModel::class.java)
        assertEquals("1", testModel.string1)
        assertEquals(1, testModel.num1)
        assertEquals("2", testModel.string2)
        assertEquals(2, testModel.num2)
        assertEquals("3", testModel.string3)
        assertEquals(3, testModel.num3)
    }

    @Test
    fun testEmptyError() {
        val error = parseSDKError("")
        assertTrue(error.message.isEmpty())
        assertTrue(error.errors.isEmpty())
        assertTrue(error.documentationUrl.isEmpty())
    }

    @Test
    fun testSummaryError() {
        val payload = """Some kind of error happened! Text: "{"message":"Oops!","documentation_url":"MyBad"}""""
        val error = parseSDKError(payload)
        assertEquals("Oops!", error.message)
        assertTrue(error.errors.isEmpty())
        assertEquals("MyBad", error.documentationUrl)
    }
}
