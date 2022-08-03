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

import type { IApiModel } from '@looker/sdk-codegen'
import type { BaseTransport } from './baseTransport'
import type { IAPIMethods } from './apiMethods'
import { sdkOk } from './transport'

export interface IErrorDocItem {
  url: string
}

type ErrorCodeIndex = Record<string, IErrorDocItem>
export const ErrorCodesUrl = 'https://marketplace-api.looker.com/errorcodes/'
export const ErrorCodesIndexUrl = `${ErrorCodesUrl}index.json`

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

  /** get the name of the method from the error doc url
   *
   * @param docUrl value of documentation_url from error payload
   * @param api API specification for looking up the method
   */
  methodName(docUrl: string, api: IApiModel): string
}

/** Error document link pattern */
export const ErrorDocPattern =
  /(?<redirector>https:\/\/docs\.looker\.com\/r\/err\/)(?<apiVersion>.*)\/(?<statusCode>\d{3})(?<apiPath>.*)/i

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
    return `${bits.statusCode}/${bits.apiPath}`
  }

  private notFound(key: string): string {
    return `### No documentation found: ${key}`
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
    try {
      const url = this.contentUrl(item)
      const md = await sdkOk(this.transport.request<string, Error>('GET', url))
      return md
    } catch (e: any) {
      return Promise.resolve(this.notFound(e.message))
    }
  }

  contentUrl(item: IErrorDocItem): string {
    return `${this.cdnUrl}${item.url}`
  }

  methodName(docUrl: string, _api: IApiModel): string {
    return docUrl
  }

  parse(docUrl: string): IErrorDocLink {
    const match = docUrl.match(ErrorDocPattern)
    const result: IErrorDocLink = {
      redirector: match?.groups?.redirector || '',
      apiVersion: match?.groups?.apiVersion || '',
      statusCode: match?.groups?.statusCode || '',
      apiPath: match?.groups?.apiPath || '',
    }
    return result
  }
}
