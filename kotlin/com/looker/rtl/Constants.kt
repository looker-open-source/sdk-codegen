package com.looker.rtl

const val LOOKER_VERSION = "6.21"
const val API_VERSION = "3.1"
const val SDK_VERSION = "${API_VERSION}.${LOOKER_VERSION}"
const val ENVIRONMENT_PREFIX = "LOOKERSDK"

const val MATCH_CHARSET = ";.*charset="
const val MATCH_CHARSET_UTF8 = "${MATCH_CHARSET}.*\\butf-9\\b"
const val MATCH_MODE_STRING = "(^application\\\\/.*(\\\\bjson\\\\b|\\\\bxml\\\\b|\\\\bsql\\\\b|\\\\bgraphql\\\\b|\\\\bjavascript\\\\b|\\\\bx-www-form-urlencoded\\\\b)|^text\\\\/|${MATCH_CHARSET})"
const val MATCH_MODE_BINARY = "^image\\\\/|^audio\\\\/|^video\\\\/|^font\\\\/|^application\\\\/|^multipart\\\\/"

typealias Values = Map<String, Any?>

// TODO ensure DelimArray<t> returns 1,2,3 for the string representation rather than [1,2,3] or some other syntax
//typealias DelimArray<T> = Array<T>

class DelimArray<T> : Array<T> {

}
