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

package com.looker.sdk

import com.looker.rtl.*
import java.io.File

// TODO why no @JvmOverloads here?
// This takes a function returning a map so that the fromIniFile constructor
// may lazily load the file data and not store the full, parsed file map in
// memory long term.
open class ApiSettings(val rawReadConfig: () -> Map<String, String>) : ConfigurationProvider {

    companion object {
        fun fromIniFile(filename: String = "./looker.ini", section: String = ""): ConfigurationProvider {
            val file = File(filename)
            return if (!file.exists()) {
                fromMap( emptyMap() )
            } else {
                val contents = file.readText()
                fromIniText(contents, section)
            }
        }

        fun fromIniText(contents: String, section: String = ""): ConfigurationProvider {
            val config = apiConfig(contents)
            val firstSection = if (section.isNotBlank()) section else config.keys.first()

            val settings = config[firstSection]
            if (settings.isNullOrEmpty()) {
                throw Error("No section named '$firstSection' was found")
            }

            return ApiSettings { settings }
        }

        fun fromMap(config: Map<String, String>): ConfigurationProvider {
            return ApiSettings { config }
        }
    }

    override var baseUrl: String = ""
    override var environmentPrefix: String = ENVIRONMENT_PREFIX
    override var apiVersion: String = API_VERSION
    override var headers: Map<String, String> = mapOf(LOOKER_APPID to AGENT_TAG, "User-Agent" to AGENT_TAG)
    override var verifySSL: Boolean = true
    override var timeout: Int = DEFAULT_TIMEOUT

    init {
        val settings = this.readConfig()

        // Only replace the current values if new values are provided
        settings["base_url"].let { value ->
            baseUrl = unQuote(value ?: baseUrl)
        }

        settings["api_version"].let { value ->
            apiVersion = unQuote(value ?: apiVersion)
        }

        settings["environmentPrefix"].let { value ->
            environmentPrefix = unQuote(value ?: environmentPrefix)
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
        val rawMap = rawReadConfig()
        return mapOf(
                "base_url" to baseUrl,
                "api_version" to apiVersion,
                "environmentPrefix" to environmentPrefix,
                "verify_ssl" to verifySSL.toString(),
                "timeout" to timeout.toString(),
                "headers" to headers.toString()
            ).plus(rawMap)
    }
}
