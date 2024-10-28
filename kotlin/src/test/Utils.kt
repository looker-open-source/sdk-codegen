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

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.looker.rtl.*
import com.looker.sdk.ApiSettings
import com.looker.sdk.LookerSDK
import com.looker.sdk.apiConfig
import java.io.File

typealias jsonDict = Map<String, Any>

val jsonDictType = object : TypeToken<jsonDict>() {}.type

class TestSettingsIniFile(
    filename: String = "./looker.ini",
    section: String = "",
    private val base: ConfigurationProvider = ApiSettings.fromIniFile(filename, section),
) : ConfigurationProvider by base {

    override fun readConfig(): Map<String, String> {
        return base.readConfig().plus(
            mapOf(
                "client_id" to "test_client_id",
                "redirect_uri" to "looker://",
            ),
        )
    }
}

open class TestConfig() {
    val env = loadEnvironment()
    val rootPath: String = File("./").absoluteFile.parentFile.parentFile.absolutePath
    val testPath = "$rootPath/test"
    val dataFile = testFile("data.yml.json")
    val envIni = System.getProperty("LOOKERSDK_INI")
    val localIni = if (envIni === null) rootFile("looker.ini") else envIni
    private val gson = Gson()
    private val dataContents = File(dataFile).readText()
    val testData = gson.fromJson<jsonDict>(dataContents, jsonDictType)
    val testIni = rootFile(testData.get("iniFile") as String)
    val configContents = File(localIni).readText()
    val config = apiConfig(configContents)
    val section = config["Looker"]
    var settings = ApiSettings.fromIniFile(localIni, "Looker")
    var oAuthTestSettings = TestSettingsIniFile(localIni, "Looker")
    val baseUrl = section?.get("base_url")
    val timeout = section?.get("timeout")?.toInt(10)
    val testContents = File(testIni).readText()
    val testConfig = apiConfig(testContents)
    val testSection = testConfig["Looker"]
    val session = AuthSession(settings, Transport(testSettings(settings)))
    val sdk = LookerSDK(session)

    fun rootFile(fileName: String): String {
        return "$rootPath/$fileName"
    }

    fun testFile(fileName: String): String {
        return "$testPath/$fileName"
    }

    fun testSettings(options: TransportOptions): TransportOptions {
        // Set timeout to 120 seconds
        options.timeout = 120
        options.verifySSL = false
        return options
    }
}
