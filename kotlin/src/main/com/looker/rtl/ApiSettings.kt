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

import org.ini4j.Ini
import java.io.ByteArrayInputStream
import java.io.File

typealias ApiSections = Map<String, Map<String, String>>

fun apiConfig(contents: String): ApiSections {
    val iniParser = Ini(ByteArrayInputStream(contents.toByteArray()))

    val ret = mutableMapOf<String, Map<String, String>>()
    iniParser.forEach {(section, values) ->
        ret[section] = values.toMap()
    }

    return ret
}

class ApiSettingsIniFile(filename: String = "./looker.ini",
                         section: String = "") : ApiSettings(File(filename).readText(), section)


// TODO why no @JvmOverloads here?
open class ApiSettings(contents: String, var section: String = ""): TransportSettings() {

    val clientId: String
    val clientSecret: String
    val embedSecret: String

    init {
        val config = apiConfig(contents)
        section = if (!section.isBlank()) section else config.keys.first()

        if (config[section].isNullOrEmpty()) {
            throw Error("No section named '$section' was found")
        }

        apiVersion = config[section]?.get("api_version") ?: DEFAULT_API_VERSION
        baseUrl = config[section]?.get("base_url") ?: ""
        clientId = config[section]?.get("client_id") ?: ""
        clientSecret = config[section]?.get("client_secret") ?: ""
        embedSecret = config[section]?.get("embed_secret") ?: ""
        verifySSL = asBoolean(config[section]?.get("verify_ssl")) ?: true
        timeout = config[section]?.get("timeout")?.toInt() ?: DEFAULT_TIMEOUT
    }
}
