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

import com.looker.rtl.ErrorDoc
import com.looker.rtl.ErrorDocLink
import org.junit.Test
import kotlin.test.assertEquals

class TestErrorDoc {
    val external = "https://docs.looker.com/r/err/4.0/429/delete/bogus/:namespace/purge"
    val internal = "https://docs.looker.com/r/err/internal/422/post/bogus/bulk"
    val badLogin = "https://docs.looker.com/r/err/4.0/404/post/login"
    val another404 = "https://docs.looker.com/r/err/4.0/404/post/another"
    val config = TestConfig()
    val errDoc = ErrorDoc(config.sdk)

    @Test
    fun getIndex() {
    }

    @Test
    fun parse() {
        var actual = errDoc.parse(external)
        assertEquals("https://docs.looker.com/r/err/", actual.redirector )
        assertEquals("4.0", actual.apiVersion)
        assertEquals("429", actual.statusCode)
        assertEquals("/delete/bogus/:namespace/purge", actual.apiPath)
        actual = errDoc.parse(internal)
        assertEquals("https://docs.looker.com/r/err/", actual.redirector )
        assertEquals("internal", actual.apiVersion)
        assertEquals("422", actual.statusCode)
        assertEquals("/post/bogus/bulk", actual.apiPath)
        actual = errDoc.parse("")
        assertEquals(ErrorDocLink("", "", "", ""), actual)
        assertEquals("", actual.redirector)
        assertEquals("", actual.apiVersion)
        assertEquals("", actual.statusCode)
        assertEquals("", actual.apiPath)

    }

    @Test
    fun contentUrl() {
    }

    @Test
    fun content() {
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
