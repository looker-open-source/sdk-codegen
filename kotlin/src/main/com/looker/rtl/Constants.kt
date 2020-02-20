@file:JvmName("Constants")
package com.looker.rtl

import org.jetbrains.annotations.NotNull

const val ENVIRONMENT_PREFIX = "LOOKERSDK"
const val LOOKER_VERSION = "7.3"
const val API_VERSION = "4.0"
const val SDK_VERSION = "${API_VERSION}.${LOOKER_VERSION}"
const val AGENT_TAG = "SDK-KT ${SDK_VERSION}"
const val LOOKER_APPID = "x-looker-appid"

const val MATCH_CHARSET = ";.*charset="
const val MATCH_CHARSET_UTF8 = """${MATCH_CHARSET}.*\butf-8\b"""
const val MATCH_MODE_STRING = """(^application\/.*(\bjson\b|\bxml\b|\bsql\b|\bgraphql\b|\bjavascript\b|\bx-www-form-urlencoded\b)|^text\/|.*\+xml\b|${MATCH_CHARSET})"""
const val MATCH_MODE_BINARY = """^image\/|^audio\/|^video\/|^font\/|^application\/|^multipart\/"""

val StringMatch = Regex(MATCH_MODE_STRING, RegexOption.IGNORE_CASE)
val BinaryMatch = Regex(MATCH_MODE_BINARY, RegexOption.IGNORE_CASE)

const val DEFAULT_TIMEOUT = 120
const val DEFAULT_API_VERSION = "4.0" // Kotlin requires API 4.0

typealias Values = Map<String, Any?>

// TODO ensure DelimArray<t> returns 1,2,3 for the string representation rather than [1,2,3] or some other syntax
typealias DelimArray<T> = Array<T>

typealias UriString = String

typealias UrlString = String

/* TODO The above won't work long term, so we'll need to implement something...
class DelimArray<T> : Array<T>() {
}
 */

fun isTrue(value: String?) : Boolean {
    val low = unQuote(value?.toLowerCase())
    return low == "true" || low == "1" || low == "t" || low == "y" || low == "yes"
}

fun isFalse(value: String?) : Boolean {
    val low = unQuote(value?.toLowerCase())
    return low == "false" || low == "0" || low == "f" || low == "n" || low == "no"
}

fun asBoolean(value: String?) : Boolean? {
    if (isTrue(value)) return true
    if (isFalse(value)) return false
    return null
}

/**
 * strip quotes from the value if the same "quote" character is the start and end of the string
 */
fun unQuote(value: String?) : String {
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

fun responseMode(contentType: String) : ResponseMode {
    if (StringMatch.containsMatchIn(contentType)) return ResponseMode.String
    if (BinaryMatch.containsMatchIn(contentType)) return ResponseMode.Binary
    return ResponseMode.Unknown
}
