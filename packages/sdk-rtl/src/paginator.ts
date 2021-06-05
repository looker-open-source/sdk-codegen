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
  Authenticator,
  IRawResponse,
  ITransportSettings,
  sdkOk,
  SDKResponse,
} from './transport'
import { IAPIMethods } from './apiMethods'
import { BaseTransport } from './baseTransport'

/**
 * Types of pagination link relative URLs
 * based on https://docs.github.com/en/rest/overview/resources-in-the-rest-api#link-header
 */
export type PageLinkRel = 'first' | 'last' | 'next' | 'prev'

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
  /** Links extracted from Pagination link header */
  links: PageLinks
  /** Latest items returned from paginate response */
  items: TSuccess
  /** Captured from the original pagination request */
  authenticator?: Authenticator
  /** Captured from the original pagination request */
  options?: Partial<ITransportSettings>
  /** Get the first page of items */
  first(): Promise<SDKResponse<TSuccess, TError>>
  /** Get the last page of items */
  last(): Promise<SDKResponse<TSuccess, TError>>
  /** Get the next page of items */
  next(): Promise<SDKResponse<TSuccess, TError>>
  /** Get the previous page of items */
  prev(): Promise<SDKResponse<TSuccess, TError>>
}

/** Pagination function call */
export type PaginateFunc<TSuccess, TError> = () => Promise<
  SDKResponse<TSuccess, TError>
>

// const paged = paginate(sdk, sdk.all_looks({ offset: 0, limit: 10 }))
// const paged = paginate(sdk, all_looks(sdk, { offset: 0, limit: 10 }))
// const looks = paged.items
/*
 while (paged.hasNext) {
    const page = paged.next()
    looks.push(paged.items)
  } while (page.length < 1)
 */

export async function paginate<TSuccess, TError>(
  sdk: IAPIMethods,
  func: PaginateFunc<TSuccess, TError>,
  options?: Partial<ITransportSettings>
): Promise<IPaginate<TSuccess, TError>> {
  const result: IPaginate<TSuccess, TError> = await new Paginator<
    TSuccess,
    TError
  >(sdk, func, options).init()
  return result
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

/**
 * Pagination support class
 */
export class Paginator<TSuccess, TError>
  implements IPaginate<TSuccess, TError>
{
  items: TSuccess = [] as unknown as TSuccess
  links: PageLinks = {}
  total = -1

  private transport: BaseTransport

  constructor(
    public sdk: IAPIMethods,
    public func: PaginateFunc<TSuccess, TError>,
    public options?: Partial<ITransportSettings>
  ) {
    this.transport = sdk.authSession.transport as BaseTransport
  }

  async init() {
    let raw: IRawResponse = {} as IRawResponse
    const base = this.sdk.authSession.transport as BaseTransport
    const saved = base.observer
    try {
      base.observer = (response: IRawResponse) => {
        raw = response
        return response
      }
      this.items = await sdkOk(this.func())
    } finally {
      base.observer = saved
    }
    this.parse(raw)
    return this
  }

  async getRel(url: string) {
    const raw = await this.transport.rawRequest('GET', url)
    this.items = await sdkOk(this.transport.parseResponse(raw))
  }

  parse(raw: IRawResponse): IPaginate<TSuccess, TError> {
    this.links = {}
    this.total = -1
    const linkHeader = raw.headers.Link
    if (linkHeader) {
      const parsed = linkHeaderParser(linkHeader)
      this.links = parsed
    }
    return this
  }

  async first(): Promise<SDKResponse<TSuccess, TError>> {
    const result: SDKResponse<TSuccess, TError> = {
      ok: false,
      error: new Error('TBD') as unknown as TError,
    }
    return Promise.resolve(result)
  }

  async last(): Promise<SDKResponse<TSuccess, TError>> {
    const result: SDKResponse<TSuccess, TError> = {
      ok: false,
      error: new Error('TBD') as unknown as TError,
    }
    return Promise.resolve(result)
  }

  async next(): Promise<SDKResponse<TSuccess, TError>> {
    const result: SDKResponse<TSuccess, TError> = {
      ok: false,
      error: new Error('TBD') as unknown as TError,
    }
    return Promise.resolve(result)
  }

  async prev(): Promise<SDKResponse<TSuccess, TError>> {
    const result: SDKResponse<TSuccess, TError> = {
      ok: false,
      error: new Error('TBD') as unknown as TError,
    }
    return Promise.resolve(result)
  }
}
