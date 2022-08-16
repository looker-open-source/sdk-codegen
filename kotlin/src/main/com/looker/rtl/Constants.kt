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

@file:JvmName("Constants")

package com.looker.rtl

import java.text.SimpleDateFormat
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.util.*

const val MATCH_CHARSET = ";.*charset="
const val MATCH_CHARSET_UTF8 = """$MATCH_CHARSET.*\butf-8\b"""
const val MATCH_MODE_STRING =
    """(^application/.*(\bjson\b|\bxml\b|\bsql\b|\bgraphql\b|\bjavascript\b|\bx-www-form-urlencoded\b)|^text/|.*\+xml\b|$MATCH_CHARSET)"""
const val MATCH_MODE_BINARY = """^image/|^audio/|^video/|^font/|^application/|^multipart/"""

val StringMatch = Regex(MATCH_MODE_STRING, RegexOption.IGNORE_CASE)
val BinaryMatch = Regex(MATCH_MODE_BINARY, RegexOption.IGNORE_CASE)

const val DEFAULT_TIMEOUT = 120
const val DEFAULT_API_VERSION = "4.0" // Kotlin requires at least API 4.0

typealias Values = Map<String, Any?>

class DelimArray<T>(val values: Array<T>, private val delimiter: String = ",") {
    override fun toString(): String {
        return values.joinToString(delimiter)
    }
}

typealias UriString = String

typealias UrlString = String

/* TODO The above won't work long term, so we'll need to implement something...
class DelimArray<T> : Array<T>() {
}
 */

fun isTrue(value: String?): Boolean {
    val low = unQuote(value?.toLowerCase())
    return low == "true" || low == "1" || low == "t" || low == "y" || low == "yes"
}

fun isFalse(value: String?): Boolean {
    val low = unQuote(value?.toLowerCase())
    return low == "false" || low == "0" || low == "f" || low == "n" || low == "no"
}

fun asBoolean(value: String?): Boolean? {
    if (isTrue(value)) return true
    if (isFalse(value)) return false
    return null
}

/**
 * strip quotes from the value if the same "quote" character is the start and end of the string
 */
fun unQuote(value: String?): String {
    if (value === null) return ""
    if (value.isBlank()) return ""
    val quote = value.substring(0, 1)
    if ("\"`'".contains(quote)) {
        if (value.endsWith(quote)) {
            // Strip matching characters
            return value.substring(1, value.length - 1)
        }
    }
    return value
}

enum class ResponseMode {
    String,
    Binary,
    Unknown
}

fun responseMode(contentType: String): ResponseMode {
    if (StringMatch.containsMatchIn(contentType)) return ResponseMode.String
    if (BinaryMatch.containsMatchIn(contentType)) return ResponseMode.Binary
    return ResponseMode.Unknown
}

internal fun ZonedDateTime(utcDateTime: String): ZonedDateTime {
    return ZonedDateTime.parse(utcDateTime, DateTimeFormatter.ISO_OFFSET_DATE_TIME)
}

internal fun Date(utcDateTime: String): Date {
    val utcFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    utcFormat.timeZone = TimeZone.getTimeZone("UTC")
    return utcFormat.parse(utcDateTime)
}

/** Loads environment variables into system properties */
fun loadEnvironment(): Map<String, String> {
    // TODO get dotenv working for .env file loading https://github.com/cdimascio/dotenv-kotlin

    val envMap = System.getenv()
    for ((key, value) in envMap) System.setProperty(key, value)
    return envMap
}
