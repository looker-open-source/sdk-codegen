/*

 Copyright 2022-2026 Google LLC

 Use of this source code is governed by an MIT-style
 license that can be found in the LICENSE file or at
 https://opensource.org/licenses/MIT

 */

import type { IAPIMethods } from './transport';
import { sdkOk } from './transport';

export interface IErrorDocItem {
  /** relative path of mark down document */
  url: string;
}

/** Location of the public CDN for Looker API Error codes */
export const ErrorCodesUrl = 'https://static-a.cdn.looker.app/errorcodes/';

/** Structure of the error code document index */
export type ErrorCodeIndex = Record<string, IErrorDocItem>;

/** Default "not found" content for error documents that don't (yet) exist */
export const ErrorDocNotFound = '### No documentation found for ';

/** API error document_url link pattern */
const ErrorDocPatternExpression = String.raw`^(?<redirector>(https:\/\/docs\.looker\.com\/r|https:\/\/cloud\.google\.com\/looker\/docs\/r)?\/err\/)(?<apiVersion>[\w.-]+)\/(?<statusCode>\d{3})(?<apiPath>(?:\/[\w/:{}.-]+)?)$`;
export const ErrorDocRx = RegExp(ErrorDocPatternExpression, 'i');

const escapeHtml = (value = ''): string =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export interface IErrorDocLink {
  /** base redirector url */
  redirector: string;
  /** api version of the error link */
  apiVersion: string;
  /** HTTP status code */
  statusCode: string;
  /** REST API Path */
  apiPath: string;
}

export interface IErrorDoc {
  /** Index of all know error codes. Call load() to populate it */
  index?: ErrorCodeIndex;

  /** Url of API error document index */
  indexUrl: string;

  /**
   * Extract error url into its parts
   * @param docUrl value of documentation_url from error payload
   */
  parse(docUrl: string): IErrorDocLink;

  /**
   * full url to resolve error document
   * @param urlPath resolved index item (used by content())
   */
  contentUrl(urlPath: string): string;

  /**
   * fetch content from the URL, returning a "not found" response if it fails
   * @param url to fetch
   */
  getContent(url: string): Promise<string>;

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
  content(docUrl: string): Promise<string>;

  /**
   * Ensure API request path matches the OpenAPI path pattern
   *
   * @example
   * `/entity/:id/part/:part` should be `/entity/{id}/part/{part}`
   *
   * @param path to convert to a spec path
   */
  specPath(path: string): string;

  /**
   * get the lookup key for the documentation_url
   * @param docUrl value of documentation_url from error payload
   */
  errorKey(docUrl: string): string;

  /** Fetch and parse the error codes documentation index from the CDN */
  load(): Promise<ErrorCodeIndex>;

  /**
   * get the name of the method from the error doc url
   * @param errorMdUrl url for the error document
   */
  methodName(errorMdUrl: string): string;
}

export type SDKGetCallback = (sdk: IAPIMethods, url: string) => Promise<string>;
/**
 * Default fetcher using the SDK
 * @param url to get
 * @private
 */
const sdkUrlGet = async (sdk: IAPIMethods, url: string) => {
  return await sdkOk(
    sdk.authSession.transport.request<string, Error>('GET', url)
  );
};

export class ErrorDoc implements IErrorDoc {
  private _index?: ErrorCodeIndex = undefined;
  constructor(
    public sdk: IAPIMethods,
    public getter: SDKGetCallback = sdkUrlGet,
    public readonly cdnUrl: string = ErrorCodesUrl
  ) {}

  public async load(): Promise<ErrorCodeIndex> {
    if (!this._index) {
      try {
        let result = await this.getter(this.sdk, this.indexUrl);
        if (typeof result === 'string') {
          result = JSON.parse(result);
        }
        this._index = result as unknown as ErrorCodeIndex;
      } catch (e: any) {
        return Promise.resolve({});
      }
    }
    return this._index;
  }

  public get indexUrl() {
    return this.contentUrl('index.json');
  }

  public get index() {
    if (!this._index) {
      this.load().catch(reason => console.error(reason));
    }
    return this._index;
  }

  specPath(path: string): string {
    const result = path.replace(/:\w+/g, found => `{${found.substring(1)}}`);
    return result;
  }

  errorKey(docUrl: string): string {
    const bits = this.parse(docUrl);
    if (!bits.redirector) return '';
    return this.specPath(`${bits.statusCode}${bits.apiPath}`);
  }

  private notFound(key: string): string {
    return `${ErrorDocNotFound}${escapeHtml(key)}`;
  }

  async getContent(url: string): Promise<string> {
    try {
      return await this.getter(this.sdk, url);
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : String(e ?? 'Unknown error');
      return Promise.resolve(this.notFound(message));
    }
  }

  async content(docUrl: string): Promise<string> {
    const key = this.errorKey(docUrl);
    if (!key) {
      return Promise.resolve(this.notFound('bad error code link'));
    }
    await this.load();
    let item = this.index ? this.index[key] : undefined;
    if (!item) {
      // fallback to generic error document
      const code = key.split('/')[0];
      item = this.index ? this.index[code] : undefined;
      if (!item) {
        return Promise.resolve(this.notFound(key));
      }
    }
    const url = this.contentUrl(item.url);
    return await this.getContent(url);
  }

  contentUrl(urlPath: string): string {
    return `${this.cdnUrl}${urlPath}`;
  }

  methodName(errorMdUrl: string): string {
    const ErrorMdRx = /(?<name>\w+)_\d{3}\.md/i;
    const match = errorMdUrl.match(ErrorMdRx);
    return match?.groups?.name || '';
  }

  parse(docUrl: string): IErrorDocLink {
    const match = docUrl.match(ErrorDocRx);
    return {
      redirector: match?.groups?.redirector || '',
      apiVersion: match?.groups?.apiVersion || '',
      statusCode: match?.groups?.statusCode || '',
      apiPath: match?.groups?.apiPath || '',
    };
  }
}
