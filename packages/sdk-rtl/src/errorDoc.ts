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

import type { BaseTransport } from './baseTransport'
import type { IAPIMethods } from './apiMethods'
import { sdkOk } from './transport'

export interface IErrorDocItem {
  url: string
}

export type ErrorCodeIndex = Record<string, IErrorDocItem>
export const ErrorCodesUrl = 'https://marketplace-api.looker.com/errorcodes/'

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
  /** Index of all know error codes */
  index: ErrorCodeIndex

  /**
   * Extract error url into its parts
   * @param docUrl value of documentation_url from error payload
   */
  parse(docUrl: string): IErrorDocLink

  /**
   * full url to resolve error document
   * @param item resolved index item (used by content())
   */
  contentUrl(item: IErrorDocItem): string

  /**
   * fetch content from the URL, returning a "not found" response if it fails
   * @param url to fetch
   */
  getContent(url: string): Promise<string>

  /**
   * Markdown of error document
   * @param docUrl value of documentation_url from error payload
   */
  content(docUrl: string): Promise<string>

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

/** Error document link pattern */
const ErrorDocPatternExpression = String.raw`(?<redirector>https:\/\/docs\.looker\.com\/r\/err\/)(?<apiVersion>.*)\/(?<statusCode>\d{3})(?<apiPath>.*)`
export const ErrorDocRx = RegExp(ErrorDocPatternExpression, 'i')

export class ErrorDoc implements IErrorDoc {
  private transport: BaseTransport
  private _index: ErrorCodeIndex = {}
  constructor(
    public sdk: IAPIMethods,
    public readonly cdnUrl: string = ErrorCodesUrl
  ) {
    this.transport = sdk.authSession.transport as BaseTransport
  }

  public async load(): Promise<ErrorCodeIndex> {
    try {
      const result = await sdkOk(
        this.transport.request<ErrorCodeIndex, Error>('GET', this.indexUrl)
      )
      return result
    } catch (e: any) {
      return {}
    }
  }

  public get indexUrl() {
    return `${this.cdnUrl}index.json`
  }

  public get index() {
    if (Object.keys(this._index).length === 0) {
      this.load()
        .then((response) => (this._index = response))
        .catch((reason) => console.error(reason))
    }
    return this._index
  }

  errorKey(docUrl: string): string {
    const bits = this.parse(docUrl)
    if (!bits.redirector) return ''
    return `${bits.statusCode}${bits.apiPath}`
  }

  private notFound(key: string): string {
    return `### No documentation found: ${key}`
  }

  async getContent(url: string): Promise<string> {
    try {
      const content = await sdkOk(
        this.transport.request<string, Error>('GET', url)
      )
      return content
    } catch (e: any) {
      return Promise.resolve(this.notFound(e.message))
    }
  }

  async content(docUrl: string): Promise<string> {
    const key = this.errorKey(docUrl)
    if (!key) {
      return Promise.resolve(this.notFound('bad error code link'))
    }
    const item = this.index[docUrl]
    if (!item) {
      return Promise.resolve(this.notFound(key))
    }
    const url = this.contentUrl(item)
    return await this.getContent(url)
  }

  contentUrl(item: IErrorDocItem): string {
    return `${this.cdnUrl}${item.url}`
  }

  methodName(errorMdUrl: string): string {
    const ErrorMdRx = /(?<name>\w+)_\d{3}\.md/i
    const match = errorMdUrl.match(ErrorMdRx)
    return match?.groups?.name || ''
  }

  parse(docUrl: string): IErrorDocLink {
    const match = docUrl.match(ErrorDocRx)
    const result: IErrorDocLink = {
      redirector: match?.groups?.redirector || '',
      apiVersion: match?.groups?.apiVersion || '',
      statusCode: match?.groups?.statusCode || '',
      apiPath: match?.groups?.apiPath || '',
    }
    return result
  }
}
