/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2022 Looker Data Sciences, Inc.
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

/** structure of error documentation item */
class ErrorDocItem(var url: String)

/** Structure of the error code document index */
typealias ErrorCodeIndex = HashMap<String, ErrorDocItem>

 interface IErrorDocLink {
    /** base redirector url */
    var redirector: String
    /** api version of the error link */
    var apiVersion: String
    /** HTTP status code */
    var statusCode: String
    /** REST API Path */
    var apiPath: String
 }

 interface IErrorDoc {
    /** Index of all known error codes. Call load() to populate it */
    var index: ErrorCodeIndex?

    /** Url of API error document index */
    val indexUrl: String

    /**
     * Extract error url into its parts
     * @param docUrl value of documentation_url from error payload
     */
    fun parse(docUrl: String): IErrorDocLink

    /**
     * full url to resolve error document
     * @param urlPath resolved index item (used by content())
     */
    fun contentUrl(urlPath: String): String

    /**
     * fetch content from the URL, returning a "not found" response if it fails
     * @param url to fetch
     */
    fun getContent(url: String): String

    /**
     * Returns the markdown of the error document
     *
     * Some kind of content is always returned from this method. The content is
     * one of:
     * - the specific document for the method and error code
     * - a generic document for the error code
     * - a "not found" mark down if the specific and generic are not defined
     *
     * @param docUrl value of documentation_url from error payload
     */
    fun content(docUrl: String): String

    /**
     * Ensure API request path matches the OpenAPI path pattern
     *
     * @example
     * `/entity/:id/part/:part` should be `/entity/{id}/part/{part}`
     *
     * @param path to convert to a spec path
     */
    fun specPath(path: String): String

    /**
     * get the lookup key for the documentation_url
     * @param docUrl value of documentation_url from error payload
     */
    fun errorKey(docUrl: String): String

    /** Fetch and parse the error codes documentation index from the CDN */
    fun load(): ErrorCodeIndex

    /**
     * get the name of the method from the error doc url
     * @param errorMdUrl url for the error document
     */
    fun methodName(errorMdUrl: String): String
 }

/** Class to process Looker API error payloads and retrieve error documentation */
class ErrorDoc(val sdk: APIMethods, val cdnUrl: String = ErrorCodesUrl): IErrorDoc {
    companion object {
        /** Location of the public CDN for Looker API Error codes */
        const val ErrorCodesUrl = "https://marketplace-api.looker.com/errorcodes/"

        /** Default "not found" content for error documents that don't (yet) exist */
        const val ErrorDocNotFound = "### No documentation found for "

        /** API error document_url link pattern */
        private const val ErrorDocPatternExpression =
            """(?<redirector>https:\/\/docs\.looker\.com\/r\/err\/)(?<apiVersion>.*)\/(?<statusCode>\d{3})(?<apiPath>.*)"""
        val ErrorDocRx = Regex(ErrorDocPatternExpression, RegexOption.IGNORE_CASE)
    }

    private var _index: ErrorCodeIndex? = null
    override var index: ErrorCodeIndex?
        get() {
            if (_index == null) {
                _index = load()
            }
            return _index
        }
        set(value) {
            this._index = value
        }

    override val indexUrl: String
        get() {
            return "${ErrorCodesUrl}index.json"
        }

    override fun parse(docUrl: String): IErrorDocLink {
        val match = ErrorDocRx.find(docUrl) ?: return ErrorDocLink()
        return ErrorDocLink(
            match.groupValues[1],
            match.groupValues[2],
            match.groupValues[3],
            match.groupValues[4]
        )
    }

    override fun contentUrl(urlPath: String): String {
        return "${cdnUrl}$urlPath"
    }

    private fun notFound(key: String): String {
        return "${ErrorDocNotFound}$key"
    }

    override fun getContent(url: String): String {
        return try {
            sdk.ok(sdk.get<String>(url))
        } catch (e: Exception) {
            notFound(e.message.toString())
        }
    }

    override fun content(docUrl: String): String {
        val key = errorKey(docUrl)
        if (key.isEmpty()) {
            return notFound("bad error code link")
        }
        load() // Ensure the index is loaded
        var item = this.index?.get(key)
        if (item == null) {
            val code = key.split("/")[0]
            item = this.index?.get(code)
            if (item == null) {
                return notFound(key)
            }
        }
        return this.getContent(contentUrl(item.url))
    }

    override fun specPath(path: String): String {
        val rx = Regex("""(:\w+)""")
        val result = path.replace(rx) { val x = it.value.substring(1); "{$x}" }
        return result
    }

    override fun errorKey(docUrl: String): String {
        val bits = parse(docUrl)
        if (bits.redirector.isNullOrEmpty()) return ""
        return this.specPath("${bits.statusCode}${bits.apiPath}")
    }

    override fun load(): ErrorCodeIndex {
        var map = emptyMap<String, ErrorDocItem>().toMap(ErrorCodeIndex())
        if (this._index == null) {
            try {
                val result = sdk.ok<ErrorCodeIndex>(sdk.get<ErrorCodeIndex>(indexUrl))
                this._index = result
                map = result
            } catch (e: Exception) {
                this._index = null
            }
        }
        return map
    }

    override fun methodName(errorMdUrl: String): String {
        // No named capture groups yet but the named group expression is supported/ignored so no need to make it different from TS for Kotlin
        // https://youtrack.jetbrains.com/issue/KT-48246/KJS-Add-support-for-named-capture-group-and-capture-indices-in-MatchResult
        val errorMdRx = Regex("""(?<name>\w+)_\d{3}\.md""", RegexOption.IGNORE_CASE)
        val match = errorMdRx.find(errorMdUrl) ?: return ""
        val result = match.groupValues[1]
        return result
    }
}

class ErrorDocLink(
    override var redirector: String = "",
    override var apiVersion: String = "",
    override var statusCode: String = "",
    override var apiPath: String = ""
) : IErrorDocLink
