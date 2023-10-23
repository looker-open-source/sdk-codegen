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

import com.looker.rtl.ConfigurationProvider
import com.looker.rtl.DEFAULT_HTTP_TRANSPORT
import com.looker.rtl.DEFAULT_TIMEOUT
import com.looker.rtl.asBoolean
import com.looker.rtl.unQuote
import org.apache.commons.configuration.HierarchicalINIConfiguration
import java.io.File
import java.io.StringReader

/** Structure read from an .INI file */
typealias ApiSections = Map<String, Map<String, String>>

/**
 * Parse and cleanup something that looks like an .INI file, stripping outermost quotes for values
 */
fun apiConfig(contents: String): ApiSections {
    val iniParser = HierarchicalINIConfiguration()
    iniParser.load(StringReader(contents))

    return mutableMapOf<String, Map<String, String>>().also { mapToReturn ->
        iniParser.sections.forEach { section ->
            mapToReturn[section] = mutableMapOf<String, String>().also { sectionMap ->
                iniParser.getKeys(section).forEach { key ->
                    // `key` is fully scoped (e.g. `Looker.<key>`) but we just want the key so
                    // remove the section prefix before adding to the map.
                    sectionMap[key.removePrefix("$section.")] = unQuote(iniParser.getString(key))
                }
            }
        }
    }
}

// TODO why no @JvmOverloads here?
// This takes a function returning a map so that the fromIniFile constructor
// may lazily load the file data and not store the full, parsed file map in
// memory long term.
open class ApiSettings(val rawReadConfig: () -> Map<String, String>) : ConfigurationProvider {

    companion object {
        @JvmStatic
        fun fromIniFile(filename: String = "./looker.ini", section: String = ""): ConfigurationProvider {
            val file = File(filename)
            return if (!file.exists()) {
                fromMap(emptyMap())
            } else {
                val contents = file.readText()
                fromIniText(contents, section)
            }
        }

        @JvmStatic
        fun fromIniText(contents: String, section: String = ""): ConfigurationProvider {
            val config = apiConfig(contents)
            val firstSection = if (section.isNotBlank()) section else config.keys.first()

            val settings = config[firstSection]
            if (settings.isNullOrEmpty()) {
                throw Error("No section named '$firstSection' was found")
            }

            return ApiSettings { settings }
        }

        @JvmStatic
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
    override var httpTransport = DEFAULT_HTTP_TRANSPORT

    private val keyBaseUrl: String = "base_url"
    private val keyApiVersion: String = "api_version"
    private val keyEnvironmentPrefix: String = "environmentPrefix"
    private val keyVerifySSL: String = "verify_ssl"
    private val keyTimeout: String = "timeout"
    private val keyHttpTransport: String = "kotlin_http_transport"

    init {
        val settings = this.readConfig()

        // Only replace the current values if new values are provided
        settings[keyBaseUrl].let { value ->
            baseUrl = unQuote(value ?: baseUrl)
        }

        settings[keyApiVersion].let { value ->
            apiVersion = unQuote(value ?: apiVersion)
        }

        settings[keyEnvironmentPrefix].let { value ->
            environmentPrefix = unQuote(value ?: environmentPrefix)
        }

        settings[keyVerifySSL].let { value ->
            verifySSL = asBoolean(value) ?: verifySSL
        }

        settings[keyTimeout].let { value ->
            timeout = if (value !== null) value.toInt() else timeout
        }

        settings[keyHttpTransport].let { value ->
            httpTransport = if (value !== null) value else httpTransport
        }
    }

    override fun isConfigured(): Boolean {
        return baseUrl.isNotEmpty() && apiVersion.isNotEmpty()
    }

    override fun readConfig(): Map<String, String> {
        // Load environment variables and possibly overwrite with explicitly declared map values
        val rawMap = readEnvironment().plus(rawReadConfig())
        return mapOf(
            keyBaseUrl to baseUrl,
            keyApiVersion to apiVersion,
            keyEnvironmentPrefix to environmentPrefix,
            keyVerifySSL to verifySSL.toString(),
            keyTimeout to timeout.toString(),
            "headers" to headers.toString(),
        ).plus(rawMap)
    }

    private fun addSystemProperty(map: MutableMap<String, String>, key: String) {
        System.getProperty("${environmentPrefix}_${key.uppercase()}").let { value ->
            if (value !== null && value.isNotEmpty()) map[key] = value
        }
    }

    private fun readEnvironment(): Map<String, String> {
        val map = HashMap<String, String>()
        addSystemProperty(map, keyBaseUrl)
        addSystemProperty(map, keyApiVersion)
        addSystemProperty(map, keyVerifySSL)
        addSystemProperty(map, keyTimeout)
        addSystemProperty(map, keyHttpTransport)
        return map.toMap()
    }
}
