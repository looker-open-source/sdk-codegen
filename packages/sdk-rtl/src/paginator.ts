/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

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

import {
  IRawResponse,
  ITransportSettings,
  sdkOk,
  SDKResponse,
} from './transport'
import { IAPIMethods } from './apiMethods'
import { BaseTransport } from './baseTransport'

export const LinkHeader = 'Link'
export const TotalCountHeader = 'X-Total-Count'

/**
 * Types of pagination link relative URLs
 * based on https://docs.github.com/en/rest/overview/resources-in-the-rest-api#link-header
 */
export type PageLinkRel = 'first' | 'last' | 'next' | 'prev'

/** Pagination function call */
export type PaginateFunc<TSuccess, TError> = () => Promise<
  SDKResponse<TSuccess, TError>
>

/** Page link structure */
export interface IPageLink {
  /** Name of link */
  name?: string
  /** Type of link */
  rel: PageLinkRel
  /** Media type for link */
  mediaType?: string
  /** URL for retrieving the link results */
  url: string
}

/**
 * Collection of page links
 *
 * TODO can this be Record<PageLinkRel, IPageLink> instead and still init to {}?
 */
export type PageLinks = Record<string, IPageLink>

export interface IPaginate<TSuccess, TError> {
  /** Total number of available items being paginated */
  total: number
  /** Offset extracted from paginate request */
  offset: number
  /** Limit extracted from paginate request */
  limit: number
  /** Links extracted from Pagination link header */
  links: PageLinks
  /** Latest items returned from response */
  items: TSuccess
  /** Captured from the original pagination request */
  options?: Partial<ITransportSettings>
  /** Total number of pages. -1 if not known. */
  pages: number
  /** Current page. -1 if not known. */
  page: number

  /**
   * Is the specified link rel defined in the Link header?
   * @param link to check
   */
  hasRel(link: PageLinkRel): boolean

  /** Get the requested relative link
   * if the requested link is not defined, all calculated values are reset, including
   * `total`, `items`, `offset`, and `limit`
   */
  getRel(link: PageLinkRel): Promise<SDKResponse<TSuccess, TError>>
  /** Get the first page of items. This is the same as offset=0 */
  firstPage(): Promise<SDKResponse<TSuccess, TError>>
  /**
   * Get the last page of items
   *
   * @remarks This link is only provided if `total` is known.
   */
  lastPage(): Promise<SDKResponse<TSuccess, TError>>
  /**
   * Get the next page of items
   *
   * @remarks This link is provided if `total` is known, or if the number of items returned == `limit`. In the latter case, this function may return an empty result set.
   */
  nextPage(): Promise<SDKResponse<TSuccess, TError>>
  /**
   * Get the previous page of items
   *
   * @remarks This link is provided if the last page was not the first page.
   */
  prevPage(): Promise<SDKResponse<TSuccess, TError>>

  /** `true` if the `next` link is defined and the current items count === `limit` */
  more(): boolean
}

/**
 * Parse a link header to extract rels
 * @param linkHeader to parse
 *
 * Several different approaches are discussed at https://stackoverflow.com/questions/8735792/how-to-parse-link-header-from-github-api
 *
 * Unfortunately, none of them are a good implementation
 *
 */
export const linkHeaderParser = (linkHeader: string): PageLinks => {
  const re = /<\s*(.*)\s*>;\s*rel="\s*(.*)\s*"\s*/gm
  const links = linkHeader.split(',')
  const obj: PageLinks = {}
  let arrRes

  links.forEach((link) => {
    link = link.trim()
    while ((arrRes = re.exec(link))) {
      const key = arrRes[2].split(' ')[0].trim().toLocaleLowerCase()
      obj[key] = {
        url: arrRes[1].trim(),
        rel: key as PageLinkRel,
        name: arrRes[2].trim(),
      }
    }
  })
  return obj
}

/** Constraint for generic TSuccess pagination types */
interface ILength {
  length: number
}

/**
 * Create an API paginator for an endpoint that returns a Link header
 * @param sdk implementation of IAPIMethods. Can be full SDK or functional auth session
 * @param func sdk call that includes a pagination header
 * @param options transport options override to capture and use in paging requests
 *
 * @remarks `TSuccess` must be a collection type that supports `length`
 */
export async function paginate<TSuccess extends ILength, TError>(
  sdk: IAPIMethods,
  func: PaginateFunc<TSuccess, TError>,
  options?: Partial<ITransportSettings>
): Promise<IPaginate<TSuccess, TError>> {
  return await new Paginator<TSuccess, TError>(sdk, func, options).init()
}

/**
 * Pagination support class
 */
export class Paginator<TSuccess extends ILength, TError>
  implements IPaginate<TSuccess, TError>
{
  items: TSuccess = [] as unknown as TSuccess
  links: PageLinks = {}
  total = -1
  offset = -1
  limit = -1

  private transport: BaseTransport

  /**
   * Create an API paginator
   * @param sdk functional AuthSession or full SDK implementation
   * @param func sdk function to call
   * @param options transport overrides to use for subsequent requests
   */
  constructor(
    public sdk: IAPIMethods,
    public func: PaginateFunc<TSuccess, TError>,
    public options?: Partial<ITransportSettings>
  ) {
    this.transport = sdk.authSession.transport as BaseTransport
  }

  private async rawCatch(func: () => any) {
    let raw: IRawResponse = {} as IRawResponse
    const saved = this.transport.observer
    try {
      this.transport.observer = (response: IRawResponse) => {
        raw = response
        return response
      }
      this.items = await sdkOk(func())
    } finally {
      this.transport.observer = saved
    }
    if (Object.keys(raw).length === 0 || Object.keys(raw.headers).length === 0)
      throw new Error('No headers were retrieved for pagination')
    this.parse(raw)
    return this
  }

  get page(): number {
    if (this.limit < 1 || this.offset < 0) return -1
    const x = this.offset / this.limit + 1
    return Math.ceil(x)
  }

  get pages(): number {
    if (this.total < 1 || this.limit < 1) return -1
    const x = this.total / this.limit
    return Math.ceil(x)
  }

  async init() {
    return await this.rawCatch(this.func)
  }

  hasRel(link: PageLinkRel): boolean {
    return !!this.links[link]
  }

  more() {
    return this.hasRel('next') && this.items.length === this.limit
  }

  /**
   * Default string value
   * @param value to retrieve or default
   * @param defaultValue to apply if string is null
   * @param convert function to convert assigned string value
   * @private
   */
  private static paramDefault(
    value: string | null,
    defaultValue: any,
    convert = (v: string) => parseInt(v, 10)
  ) {
    if (value === null) return defaultValue
    return convert(value)
  }

  reset() {
    this.links = {}
    this.total = this.offset = this.limit = -1
    this.items = [] as unknown as TSuccess
  }

  async getRel(link: PageLinkRel): Promise<SDKResponse<TSuccess, TError>> {
    const rel = this.links[link]
    let result: SDKResponse<TSuccess, TError>
    this.reset()
    if (!rel) {
      result = { ok: true, value: this.items }
      return result
    }
    const raw = await this.transport.rawRequest(
      'GET',
      rel.url,
      undefined,
      undefined,
      this.sdk.authSession.authenticate,
      this.options
    )
    try {
      this.parse(raw)
      this.items = await sdkOk(this.transport.parseResponse(raw))
      result = { ok: true, value: this.items }
    } catch (e) {
      result = { ok: false, error: e }
    }
    return result
  }

  parse(raw: IRawResponse): IPaginate<TSuccess, TError> {
    const req = new URL(raw.url)
    const params = req.searchParams
    this.offset = Paginator.paramDefault(params.get('offset'), -1)
    this.limit = Paginator.paramDefault(params.get('limit'), -1)
    const linkHeader = raw.headers[LinkHeader]
    if (linkHeader) {
      this.links = linkHeaderParser(linkHeader)
    } else {
      this.links = {}
    }
    const totalHeader = raw.headers[TotalCountHeader]
    if (totalHeader) {
      this.total = parseInt(totalHeader.trim(), 10)
    } else {
      this.total = -1
    }
    return this as unknown as IPaginate<TSuccess, TError>
  }

  async firstPage(): Promise<SDKResponse<TSuccess, TError>> {
    return await this.getRel('first')
  }

  async lastPage(): Promise<SDKResponse<TSuccess, TError>> {
    return await this.getRel('last')
  }

  async nextPage(): Promise<SDKResponse<TSuccess, TError>> {
    return await this.getRel('next')
  }

  async prevPage(): Promise<SDKResponse<TSuccess, TError>> {
    return await this.getRel('prev')
  }
}
