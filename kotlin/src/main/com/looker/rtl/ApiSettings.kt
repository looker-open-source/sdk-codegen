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
    iniParser.forEach { (section, values) ->
        ret[section] = values.map { it.key to unQuote(it.value) }.toMap()
    }

    return ret
}

// TODO why no @JvmOverloads here?
// This takes a function returning a map so that the fromIniFile constructor
// may lazily load the file data and not store the full, parsed file map in
// memory long term.
open class ApiSettings(val rawReadConfig: () -> Map<String, String>) : ConfigurationProvider {

    companion object {
        fun fromIniFile(filename: String = "./looker.ini", section: String = ""): ConfigurationProvider {
            return ApiSettings({
                val file = File(filename)
                if (!file.exists()) {
                    mapOf()
                } else {
                    val contents = file.readText()
                    val config = apiConfig(contents)
                    val selectedSection = if (!section.isBlank()) section else config.keys.first()
                    config[selectedSection] ?: mapOf()
                }
            })
        }

        fun fromIniText(contents: String, section: String = ""): ConfigurationProvider {
            val config = apiConfig(contents)
            val first_section = if (!section.isBlank()) section else config.keys.first()

            val settings = config[first_section]
            if (settings.isNullOrEmpty()) {
                throw Error("No section named '$first_section' was found")
            }

            return ApiSettings({ settings })
        }

        fun fromMap(config: Map<String, String>): ConfigurationProvider {
            return ApiSettings({ config })
        }
    }

    override var baseUrl: String = ""
    override var apiVersion: String = DEFAULT_API_VERSION
    override var verifySSL: Boolean = true
    override var timeout: Int = DEFAULT_TIMEOUT
    override var headers: Map<String, String> = mapOf()

    init {
        val settings = rawReadConfig()

        // Only replace the current values if new values are provided
        settings["base_url"].let { value ->
            baseUrl = unQuote(value ?: baseUrl)
        }

        settings["api_version"].let { value ->
            apiVersion = unQuote(value ?: apiVersion)
        }

        settings["verify_ssl"].let { value ->
            verifySSL = asBoolean(value) ?: verifySSL
        }
        settings["timeout"].let { value ->
            timeout = if (value !== null) value.toInt() else timeout
        }
    }

    override fun isConfigured(): Boolean {
        return baseUrl.isNotEmpty() && apiVersion.isNotEmpty()
    }

    override fun readConfig(): Map<String, String> {
        // Merge any provided settings with the calculated values for the TransportOptions
        return rawReadConfig().plus(
            mapOf(
                "base_url" to baseUrl,
                "api_version" to apiVersion,
                "verify_ssl" to verifySSL.toString(),
                "timeout" to timeout.toString(),
                "headers" to headers.toString()
            )
        )
    }
}
