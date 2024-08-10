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

import type {
  IAPIMethods,
  IRawResponse,
  ITransportSettings,
  SDKResponse,
} from './transport';
import { sdkOk } from './transport';
import type { BaseTransport } from './baseTransport';

export const LinkHeader = 'Link';
export const TotalCountHeader = 'X-Total-Count';

/**
 * Types of paging link relative URLs
 * based on https://docs.github.com/en/rest/overview/resources-in-the-rest-api#link-header
 */
export type PageLinkRel = 'first' | 'last' | 'next' | 'prev';

/** Constraints for TSuccess type */
interface ILength {
  length: number;
}

/** Result paging function call */
export type PagingFunc<TSuccess, TError> = () => Promise<
  SDKResponse<TSuccess, TError>
>;

/** Page link structure */
export interface IPageLink {
  /** Name of link */
  name?: string;
  /** Type of link */
  rel: PageLinkRel;
  /** Media type for link */
  mediaType?: string;
  /** URL for retrieving the link results */
  url: string;
}

/**
 * Collection of page links
 *
 * TODO can this be Record<PageLinkRel, IPageLink> instead and still init to {}?
 */
export type PageLinks = Record<string, IPageLink>;

export interface IPager<TSuccess, TError> {
  /** Total number of available items being paginated */
  total: number;
  /** Offset extracted from pager request */
  offset: number;
  /** Limit extracted from pager request */
  limit: number;
  /** Paging links extracted from Link header */
  links: PageLinks;
  /** Latest items returned from response */
  items: TSuccess;
  /** Captured from the original paging request */
  options?: Partial<ITransportSettings>;
  /** Total number of pages. -1 if not known. */
  pages: number;
  /** Current page. -1 if not known. */
  page: number;

  /**
   * Is the specified link rel defined in the Link header?
   * @param link to check
   */
  hasRel(link: PageLinkRel): boolean;

  /**
   * GET the requested relative link
   *
   * if the requested link is not defined, all calculated values are reset to their defaults, including
   * `total`, `items`, `offset`, and `limit`
   *
   * @param name of Link Relationship
   * @param limit optional limit override to replace limit saved in `rel`
   * @param offset optional offset override to replace offset saved in `rel`
   */
  getRel(
    name: PageLinkRel,
    limit?: number,
    offset?: number
  ): Promise<SDKResponse<TSuccess, TError>>;

  /** Get the first page of items. This is the same as offset=0 */
  firstPage(): Promise<SDKResponse<TSuccess, TError>>;
  /**
   * Get the last page of items
   *
   * @remarks This link is only provided if `total` is known.
   */
  lastPage(): Promise<SDKResponse<TSuccess, TError>>;
  /**
   * Get the next page of items
   *
   * @remarks This link is provided if `total` is known, or if the number of items returned == `limit`. In the latter case, this function may return an empty result set.
   */
  nextPage(): Promise<SDKResponse<TSuccess, TError>>;
  /**
   * Get the previous page of items
   *
   * @remarks This link is provided if the last page was not the first page.
   */
  prevPage(): Promise<SDKResponse<TSuccess, TError>>;

  /** `true` if the `next` link is defined */
  more(): boolean;
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
  const re = /<\s*(.*)\s*>;\s*rel="\s*(.*)\s*"\s*/gm;
  const links = linkHeader.split(',');
  const obj: PageLinks = {};
  let arrRes;

  links.forEach((link) => {
    link = link.trim();
    while ((arrRes = re.exec(link))) {
      const key = arrRes[2].split(' ')[0].trim().toLocaleLowerCase();
      obj[key] = {
        url: arrRes[1].trim(),
        rel: key as PageLinkRel,
        name: arrRes[2].trim(),
      };
    }
  });
  return obj;
};

/** Event to observe the paging call */
export type PageObserver<TSuccess> = (
  /** Current retrieved page of results */
  page: TSuccess
) => TSuccess;

/**
 * Create an API response pager for an endpoint that returns a Link header
 * @param sdk implementation of IAPIMethods. Can be a full SDK or functional auth session. The active transport object is captured from this parameter, which is why it must be passed separately from the paging function.
 * @param pageFunc sdk call that includes a paging header
 * @param options transport options override to capture and use in paging requests
 *
 * @remarks `TSuccess` must be a collection type that supports `length`
 */
export async function pager<TSuccess extends ILength, TError>(
  sdk: IAPIMethods,
  pageFunc: PagingFunc<TSuccess, TError>,
  options?: Partial<ITransportSettings>
): Promise<IPager<TSuccess, TError>> {
  return await new Paging<TSuccess, TError>(sdk, pageFunc, options).init();
}

/**
 * Create an API response pager and iterate through all pages, calling a page event per page
 * @param sdk implementation of IAPIMethods. Can be a full SDK or functional auth session. The active transport object is captured from this parameter, which is why it must be passed separately from the paging function.
 * @param pageFunc sdk call that includes a paging header
 * @param onPage observer of the latest page of results. Defaults to noop.
 * @param options transport options override to capture and use in paging requests
 *
 * @remarks `TSuccess` must be a collection type that supports `length`
 */
export async function pageAll<TSuccess extends ILength, TError>(
  sdk: IAPIMethods,
  pageFunc: PagingFunc<TSuccess, TError>,
  onPage: PageObserver<TSuccess> = (page: TSuccess) => page,
  options?: Partial<ITransportSettings>
): Promise<IPager<TSuccess, TError>> {
  const paged = await pager(sdk, pageFunc, options);
  // Process the first page
  onPage(paged.items);
  try {
    while (paged.more()) {
      // Pass the page items to the event
      onPage(await sdk.ok(paged.nextPage()));
    }
  } catch (err) {
    return Promise.reject(err);
  }
  return paged;
}

/**
 * Link header pages class
 */
export class Paging<TSuccess extends ILength, TError>
  implements IPager<TSuccess, TError>
{
  items: TSuccess = [] as unknown as TSuccess;
  links: PageLinks = {};
  total = -1;
  offset = -1;
  limit = -1;

  private transport: BaseTransport;

  /**
   * Create an API paginator
   * @param sdk functional AuthSession or full SDK implementation
   * @param func sdk function to call
   * @param options transport overrides to use for subsequent requests
   */
  constructor(
    public sdk: IAPIMethods,
    public func: PagingFunc<TSuccess, TError>,
    public options?: Partial<ITransportSettings>
  ) {
    this.transport = sdk.authSession.transport as BaseTransport;
  }

  private async rawCatch(func: () => any) {
    let raw: IRawResponse = {} as IRawResponse;
    const saved = this.transport.observer;
    try {
      // Capture the raw request for header parsing
      this.transport.observer = (response: IRawResponse) => {
        if (saved) {
          // Chain the observer
          response = saved(response);
        }
        raw = response;
        return response;
      };
      this.items = await sdkOk(func());
    } finally {
      // Restore the previous observer (if any)
      this.transport.observer = saved;
    }
    if (Object.keys(raw).length === 0 || Object.keys(raw.headers).length === 0)
      return Promise.reject(new Error('No paging headers were found'));
    this.parse(raw);
    return this;
  }

  get page(): number {
    if (this.limit < 1 || this.offset < 0) return -1;
    const x = this.offset / this.limit + 1;
    return Math.ceil(x);
  }

  get pages(): number {
    if (this.total < 1 || this.limit < 1) return -1;
    const x = this.total / this.limit;
    return Math.ceil(x);
  }

  async init() {
    return await this.rawCatch(this.func);
  }

  hasRel(link: PageLinkRel): boolean {
    return !!this.links[link];
  }

  more() {
    return this.hasRel('next');
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
    if (value === null) return defaultValue;
    return convert(value);
  }

  reset() {
    this.links = {};
    this.total = this.offset = this.limit = -1;
    this.items = [] as unknown as TSuccess;
  }

  async getRel(
    name: PageLinkRel,
    limit?: number,
    offset?: number
  ): Promise<SDKResponse<TSuccess, TError>> {
    const rel = this.links[name];
    let result: SDKResponse<TSuccess, TError>;
    this.reset();
    if (!rel) {
      result = { ok: true, value: this.items };
      return result;
    }
    const authenticator = (init: any) => {
      return this.sdk.authSession.authenticate(init);
    };

    let link = rel.url;
    if (limit !== undefined) {
      if (offset === undefined) {
        offset = 0;
      }
      if (limit < 1 || offset < 0) {
        result = {
          ok: false,
          error: new Error(
            'limit must be > 0 and offset must be >= 0'
          ) as unknown as TError,
        };
        return result;
      }
      const url = new URL(link);
      const params = url.searchParams;
      params.set('limit', limit.toString());
      params.set('offset', offset.toString());
      link = url.toString();
    }
    const raw = await this.transport.rawRequest(
      'GET',
      link,
      undefined,
      undefined,
      authenticator,
      this.options
    );
    try {
      this.parse(raw);
      this.items = await sdkOk(this.transport.parseResponse(raw));
      result = { ok: true, value: this.items };
    } catch (e: any) {
      result = { ok: false, error: e };
    }
    return result;
  }

  static findHeader(raw: IRawResponse, name: string) {
    return (
      raw.headers[name] ||
      raw.headers[name.toLowerCase()] ||
      raw.headers[name.toUpperCase()]
    );
  }

  parse(raw: IRawResponse): IPager<TSuccess, TError> {
    const params = new URL(raw.url, 'http://default').searchParams;
    this.limit = Paging.paramDefault(params.get('limit'), -1);
    this.offset = Paging.paramDefault(
      params.get('offset'),
      this.limit > 0 ? 0 : -1
    );
    const linkHeader = Paging.findHeader(raw, LinkHeader);
    if (linkHeader) {
      this.links = linkHeaderParser(linkHeader);
    } else {
      this.links = {};
    }
    const totalHeader = Paging.findHeader(raw, TotalCountHeader);
    if (totalHeader) {
      this.total = parseInt(totalHeader.trim(), 10);
    } else {
      this.total = -1;
    }
    return this as unknown as IPager<TSuccess, TError>;
  }

  async firstPage(): Promise<SDKResponse<TSuccess, TError>> {
    return await this.getRel('first');
  }

  async lastPage(): Promise<SDKResponse<TSuccess, TError>> {
    return await this.getRel('last');
  }

  async nextPage(): Promise<SDKResponse<TSuccess, TError>> {
    return await this.getRel('next');
  }

  async prevPage(): Promise<SDKResponse<TSuccess, TError>> {
    return await this.getRel('prev');
  }
}
