/*

 MIT License

 Copyright (c) 2022 Looker Data Sciences, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */

import type { IAPIMethods } from './apiMethods'
import { sdkOk } from './transport'

export interface IErrorDocItem {
  /** relative path of mark down document */
  url: string
}

/** Location of the public CDN for Looker API Error codes */
export const ErrorCodesUrl = 'https://marketplace-api.looker.com/errorcodes/'

/** Structure of the error code document index */
export type ErrorCodeIndex = Record<string, IErrorDocItem>

/** Default "not found" content for error documents that don't (yet) exist */
export const ErrorDocNotFound = '### No documentation found for '

/** API error document_url link pattern */
const ErrorDocPatternExpression = String.raw`(?<redirector>(https:\/\/docs\.looker\.com\/r|https:\/\/cloud\.google\.com\/looker\/docs\/r)?\/err\/)(?<apiVersion>.*)\/(?<statusCode>\d{3})(?<apiPath>.*)`
export const ErrorDocRx = RegExp(ErrorDocPatternExpression, 'i')

export interface IErrorDocLink {
  /** base redirector url */
  redirector: string
  /** api version of the error link */
  apiVersion: string
  /** HTTP status code */
  statusCode: string
  /** REST API Path */
  apiPath: string
}

export interface IErrorDoc {
  /** Index of all know error codes. Call load() to populate it */
  index?: ErrorCodeIndex

  /** Url of API error document index */
  indexUrl: string

  /**
   * Extract error url into its parts
   * @param docUrl value of documentation_url from error payload
   */
  parse(docUrl: string): IErrorDocLink

  /**
   * full url to resolve error document
   * @param urlPath resolved index item (used by content())
   */
  contentUrl(urlPath: string): string

  /**
   * fetch content from the URL, returning a "not found" response if it fails
   * @param url to fetch
   */
  getContent(url: string): Promise<string>

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
  content(docUrl: string): Promise<string>

  /**
   * Ensure API request path matches the OpenAPI path pattern
   *
   * @example
   * `/entity/:id/part/:part` should be `/entity/{id}/part/{part}`
   *
   * @param path to convert to a spec path
   */
  specPath(path: string): string

  /**
   * get the lookup key for the documentation_url
   * @param docUrl value of documentation_url from error payload
   */
  errorKey(docUrl: string): string

  /** Fetch and parse the error codes documentation index from the CDN */
  load(): Promise<ErrorCodeIndex>

  /**
   * get the name of the method from the error doc url
   * @param errorMdUrl url for the error document
   */
  methodName(errorMdUrl: string): string
}

export type SDKGetCallback = (sdk: IAPIMethods, url: string) => Promise<string>
/**
 * Default fetcher using the SDK
 * @param url to get
 * @private
 */
const sdkUrlGet = async (sdk: IAPIMethods, url: string) => {
  return await sdkOk(
    sdk.authSession.transport.request<string, Error>('GET', url)
  )
}

export class ErrorDoc implements IErrorDoc {
  private _index?: ErrorCodeIndex = undefined
  constructor(
    public sdk: IAPIMethods,
    public getter: SDKGetCallback = sdkUrlGet,
    public readonly cdnUrl: string = ErrorCodesUrl
  ) {}

  public async load(): Promise<ErrorCodeIndex> {
    if (!this._index) {
      try {
        let result = await this.getter(this.sdk, this.indexUrl)
        if (typeof result === 'string') {
          result = JSON.parse(result)
        }
        this._index = result as unknown as ErrorCodeIndex
      } catch (e: any) {
        return Promise.resolve({})
      }
    }
    return this._index
  }

  public get indexUrl() {
    return this.contentUrl('index.json')
  }

  public get index() {
    if (!this._index) {
      this.load().catch((reason) => console.error(reason))
    }
    return this._index
  }

  specPath(path: string): string {
    const result = path.replace(/:\w+/g, (found) => `{${found.substr(1)}}`)
    return result
  }

  errorKey(docUrl: string): string {
    const bits = this.parse(docUrl)
    if (!bits.redirector) return ''
    return this.specPath(`${bits.statusCode}${bits.apiPath}`)
  }

  private notFound(key: string): string {
    return `${ErrorDocNotFound}${key}`
  }

  async getContent(url: string): Promise<string> {
    try {
      return await this.getter(this.sdk, url)
    } catch (e: any) {
      return Promise.resolve(this.notFound(e.message))
    }
  }

  async content(docUrl: string): Promise<string> {
    const key = this.errorKey(docUrl)
    if (!key) {
      return Promise.resolve(this.notFound('bad error code link'))
    }
    await this.load()
    let item = this.index ? this.index[key] : undefined
    if (!item) {
      // fallback to generic error document
      const code = key.split('/')[0]
      item = this.index ? this.index[code] : undefined
      if (!item) {
        return Promise.resolve(this.notFound(key))
      }
    }
    const url = this.contentUrl(item.url)
    return await this.getContent(url)
  }

  contentUrl(urlPath: string): string {
    return `${this.cdnUrl}${urlPath}`
  }

  methodName(errorMdUrl: string): string {
    const ErrorMdRx = /(?<name>\w+)_\d{3}\.md/i
    const match = errorMdUrl.match(ErrorMdRx)
    return match?.groups?.name || ''
  }

  parse(docUrl: string): IErrorDocLink {
    const match = docUrl.match(ErrorDocRx)
    return {
      redirector: match?.groups?.redirector || '',
      apiVersion: match?.groups?.apiVersion || '',
      statusCode: match?.groups?.statusCode || '',
      apiPath: match?.groups?.apiPath || '',
    }
  }
}
