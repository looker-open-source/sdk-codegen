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

@file:Suppress("UNCHECKED_CAST")

import com.looker.rtl.*
import org.junit.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue

val config = TestConfig()

class TestConstants {
    @Test
    fun unquoteMatchingPairs() {
        // matched pairs
        assertEquals(unQuote("'foo'"), "foo")
        assertEquals(unQuote("`foo`"), "foo")
        assertEquals(unQuote("\"foo\""), "foo")
        // unmatched pairs
        assertEquals(unQuote("'foo\"'"), "foo\"")
        assertEquals(unQuote("`foo'`"), "foo'")
        assertEquals(unQuote("'foo"), "'foo")
        assertEquals(unQuote("foo'"), "foo'")
        assertEquals(unQuote("`foo'"), "`foo'")
        assertEquals(unQuote("foo`"), "foo`")
        assertEquals(unQuote("\"foo"), "\"foo")
    }

    @Test
    fun testBoolStrings() {
        asBoolean("1")?.let { assertTrue(it) }
        asBoolean("'1'")?.let { assertTrue(it) }
        asBoolean("y")?.let { assertTrue(it) }
        asBoolean("YES")?.let { assertTrue(it) }
        asBoolean("t")?.let { assertTrue(it) }
        asBoolean("TRUE")?.let { assertTrue(it) }
        asBoolean("`TRUE`")?.let { assertTrue(it) }
        asBoolean("true")?.let { assertTrue(it) }
        asBoolean("0")?.let { assertFalse(it) }
        asBoolean("f")?.let { assertFalse(it) }
        asBoolean("FALSE")?.let { assertFalse(it) }
        asBoolean("n")?.let { assertFalse(it) }
        asBoolean("N")?.let { assertFalse(it) }
        asBoolean("NO")?.let { assertFalse(it) }
        asBoolean("null")?.let { assertNull(it) }
        asBoolean("boo")?.let { assertNull(it) }
    }

    @Test
    fun testStringTypes() {
        val contentTypes = config.testData["content_types"] as jsonDict
        val types = contentTypes["string"] as ArrayList<String>
        types.forEach { t ->
            val mode = responseMode(t)
            assertEquals(ResponseMode.String, mode, t)
        }
    }

    @Test
    fun testBinaryTypes() {
        val contentTypes = config.testData["content_types"] as jsonDict
        val types = contentTypes["binary"] as ArrayList<String>
        types.forEach { t ->
            val mode = responseMode(t)
            assertEquals(ResponseMode.Binary, mode, t)
        }
    }

    @Test
    fun testDelimArray() {
        val ids: Array<Long> = arrayOf(1, 2, 3, 4)
        var actual = DelimArray(ids)
        assertEquals(actual.toString(), "1,2,3,4")
        actual = DelimArray(ids, ", ")
        assertEquals(actual.toString(), "1, 2, 3, 4")
        actual = DelimArray(ids, "|")
        assertEquals(actual.toString(), "1|2|3|4")
        actual = DelimArray(arrayOf(5, 6, 7, 8))
        assertEquals(actual.toString(), "5,6,7,8")
    }
}
