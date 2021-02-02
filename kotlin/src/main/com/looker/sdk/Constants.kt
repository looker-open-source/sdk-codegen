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

package com.looker.sdk

import com.looker.rtl.ApiSettings
import com.looker.rtl.ConfigurationProvider
import com.looker.rtl.apiConfig
import java.io.File

const val ENVIRONMENT_PREFIX = "LOOKERSDK"
const val SDK_TAG = "KT-SDK"
const val LOOKER_VERSION = "7.20"
const val API_VERSION = "4.0"
const val AGENT_TAG = "$SDK_TAG $LOOKER_VERSION"
const val LOOKER_APPID = "x-looker-appid"

/*
TODO build "composition, not inheritance", where SdkSettings takes an ApiSettings instance to delegate to instead of inheriting from it.
 Then the factory could invoke the ApiSettings factory and all it has to do it wrap that up in the SdkSettings
 */
open class SdkSettings(rawReadConfig: () -> Map<String, String>) : ApiSettings(rawReadConfig) {
    companion object {
        fun fromIniFile(filename: String = "./looker.ini", section: String = ""): ConfigurationProvider {
            return SdkSettings {
                val file = File(filename)
                if (!file.exists()) {
                    mapOf()
                } else {
                    val contents = file.readText()
                    val config = apiConfig(contents)
                    val selectedSection = if (section.isNotBlank()) section else config.keys.first()
                    config[selectedSection] ?: mapOf()
                }
            }
        }

        fun fromIniText(contents: String, section: String = ""): ConfigurationProvider {
            val config = apiConfig(contents)
            val firstSection = if (section.isNotBlank()) section else config.keys.first()

            val settings = config[firstSection]
            if (settings.isNullOrEmpty()) {
                throw Error("No section named '$firstSection' was found")
            }

            return SdkSettings({ settings })
        }

        fun fromMap(config: Map<String, String>): ConfigurationProvider {
            return SdkSettings({ config })
        }
    }

    override var environmentPrefix: String = ENVIRONMENT_PREFIX
    override var apiVersion: String = API_VERSION
    override var headers: Map<String, String> = mapOf(LOOKER_APPID to AGENT_TAG, "User-Agent" to AGENT_TAG)

}
