/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2022 Looker Data Sciences, Inc.
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
 * THE SOFTWARE IS PROVIDED "AS IS", errDoc.methodName(WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.looker.rtl.ErrorCodeIndex
import com.looker.rtl.ErrorDoc
import com.looker.rtl.ErrorDoc.Companion.ErrorDocNotFound
import org.junit.Test
import java.io.File
import kotlin.test.assertContains
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

val errorCodeType = object : TypeToken<ErrorCodeIndex>() {}.type

class TestErrorDoc {
    val external = "https://docs.looker.com/r/err/4.0/429/delete/bogus/:namespace/purge"
    val internal = "https://docs.looker.com/r/err/internal/422/post/bogus/bulk"
    val cloud = "https://cloud.google.com/looker/docs/r/err/internal/422/post/bogus/bulk"
    val badLogin = "https://docs.looker.com/r/err/4.0/404/post/login"
    val config = TestConfig()
    val errDoc = ErrorDoc(config.sdk)
    private val gson = Gson()

    @Test
    fun parse() {
        var actual = errDoc.parse(external)
        assertEquals("https://docs.looker.com/r/err/", actual.redirector)
        assertEquals("4.0", actual.apiVersion)
        assertEquals("429", actual.statusCode)
        assertEquals("/delete/bogus/:namespace/purge", actual.apiPath)
        actual = errDoc.parse(internal)
        assertEquals("https://docs.looker.com/r/err/", actual.redirector)
        assertEquals("internal", actual.apiVersion)
        assertEquals("422", actual.statusCode)
        assertEquals("/post/bogus/bulk", actual.apiPath)
        actual = errDoc.parse(cloud)
        assertEquals("https://cloud.google.com/looker/docs/r/err/", actual.redirector)
        assertEquals("internal", actual.apiVersion)
        assertEquals("422", actual.statusCode)
        assertEquals("/post/bogus/bulk", actual.apiPath)
        actual = errDoc.parse("")
        assertEquals("", actual.redirector)
        assertEquals("", actual.apiVersion)
        assertEquals("", actual.statusCode)
        assertEquals("", actual.apiPath)
    }

    @Test
    fun liveIndex() {
        // fetch the index document from the live CDN
        val actual = errDoc.index
        assertNotNull(actual)
        assertContains(actual, "404/post/login")
    }

    @Test
    fun content() {
        val index = File(config.testFile("errorCodesIndex.json")).readText()
        errDoc.index = gson.fromJson<ErrorCodeIndex>(index, errorCodeType)
        assert(errDoc.content(badLogin).startsWith("## API Response 404 for `login`"))
        assert(errDoc.content(internal).startsWith("${ErrorDocNotFound}422/post/bogus/bulk"))
        assert(errDoc.content(external).startsWith("${ErrorDocNotFound}429/delete/bogus/{namespace}/purge"))
        assert(errDoc.content("").startsWith("${ErrorDocNotFound}bad error code link"))
    }

    @Test
    fun specPath() {
        assertEquals("/x/{f}/y/{z}", errDoc.specPath("/x/:f/y/:z"))
        assertEquals("/x/{f}/y/{z}", errDoc.specPath("/x/{f}/y/{z}"))
        assertEquals("/x/{foo_bar}/y/{zoo}", errDoc.specPath("/x/:foo_bar/y/:zoo"))
    }

    @Test
    fun errorKey() {
    }

    @Test
    fun methodName() {
        assertEquals("", errDoc.methodName(""))
        assertEquals("", errDoc.methodName("foo"))
        assertEquals("", errDoc.methodName("/foo.md"))
        assertEquals("", errDoc.methodName("/404.md"))
        assertEquals("login", errDoc.methodName("/login_404.md"))
        assertEquals("login_2", errDoc.methodName("/login_2_404.md"))
        assertEquals("and_another", errDoc.methodName("/and_another_404.md"))
        assertEquals("login", errDoc.methodName("errorcodes/live/login_404.md"))
        assertEquals("login", errDoc.methodName("https://foo.bar.com/live/login_404.md"))
    }
}
