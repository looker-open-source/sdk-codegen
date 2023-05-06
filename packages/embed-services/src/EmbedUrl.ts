/*

 MIT License

 Copyright (c) 2023 Looker Data Sciences, Inc.

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

export enum ContentType {
  Look = 'look',
  Explore = 'explore',
  Dashboard = 'dashboard',
  Invalid = 'invalid',
}

const THEMABLE_CONTENT: ContentType[] = [
  ContentType.Dashboard,
  ContentType.Explore,
]

export interface IEmbedUrl {
  readonly url: string
  readonly path: string
  readonly searchParams: Record<string, string>
  readonly isDashboard: boolean
  readonly isExplore: boolean
  readonly isLook: boolean
  readonly contentType: ContentType
  readonly isThemable: boolean
  embedUrl(includeSearchParams: boolean, overrides: Record<string, any>): string
}

/**
 * A class for use when implementer requires components to be context aware
 */
export class EmbedUrl implements IEmbedUrl {
  /** Current url */
  private _url: URL
  /** Path of the current page */
  readonly path: string
  /** Search string of the current url */
  readonly searchParams: Record<string, string>
  /** Determines whether the current URL is for a Dashboard */
  readonly isDashboard: boolean
  /** Determines whether the current URL is for an Explore */
  readonly isExplore: boolean
  /** Determines whether the current URl is for a Look */
  readonly isLook: boolean
  /** Determines if current URL represents themable content */
  readonly isThemable: boolean
  /** Type of content the URL represents */
  readonly contentType: ContentType
  private readonly _embedUrl: string

  constructor(url = window.location.href) {
    this._url = new URL(url)
    this.searchParams = Object.fromEntries(this._url.searchParams)
    this.path = this._url.pathname
    this.isDashboard = /^(\/embed)?\/dashboards\//i.test(this.path)
    this.isExplore = /^(\/embed)?\/explore\//i.test(this.path)
    this.isLook = /^(\/embed)?\/looks\//i.test(this.path)
    this.contentType = this.type()

    if (this.path.startsWith('/embed/')) {
      this._embedUrl = `${this._url.origin}${this._url.pathname}`
    } else {
      this._embedUrl = `${this._url.origin}/embed${this._url.pathname}`
    }

    this.isThemable = THEMABLE_CONTENT.includes(this.contentType)
  }

  get url() {
    return this._url.href
  }

  protected type() {
    let type: ContentType
    if (this.isLook) {
      type = ContentType.Look
    } else if (this.isExplore) {
      type = ContentType.Explore
    } else if (this.isDashboard) {
      type = ContentType.Dashboard
    } else {
      type = ContentType.Invalid
    }
    return type
  }

  /**
   * Builds the embed target url
   * @param includeSearchParams switch determining whether to include search params from target url
   * @param overrides any search key values to include in embed url e.g. 'k1=v1&k2=v2'
   */
  embedUrl(includeSearchParams = false, overrides: Record<string, any> = {}) {
    if (this.contentType === ContentType.Invalid) {
      throw new Error('Invalid content type')
    }

    const embedUrlParams = includeSearchParams ? this.searchParams : {}

    if (overrides) {
      Object.entries(overrides).forEach(([key, value]) => {
        let overrideValue = value
        if (typeof value === 'object') {
          overrideValue = JSON.stringify(value)
        }
        if (key === 'theme' && overrideValue === 'Looker') {
          delete embedUrlParams.theme
        } else {
          embedUrlParams[key] = overrideValue
        }
      })
    }

    let searchString = ''
    if (Object.keys(embedUrlParams).length > 0) {
      searchString = '?' + new URLSearchParams(embedUrlParams).toString()
    }

    const url = new URL(`${this._embedUrl}${searchString}`)
    return url.href
  }
}
