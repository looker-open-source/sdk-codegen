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

import { AuthSession } from './authSession';
import { BrowserTransport } from './browserTransport';
import type { ITransport, IRequestProps } from './transport';
import { LookerAppId, agentPrefix } from './transport';
import type { IApiSettings } from './apiSettings';

/**
 * An AuthSession class intended for use with proxied requests
 *
 * This session uses `authenticate` to modify all requests to pass through a proxy server with
 * passing the request to the proxy server specified in the `proxyUrl` parameter, and sets
 * the original request path as an `X-Forwarded-For` header.
 *
 */
export abstract class ProxySession extends AuthSession {
  constructor(
    public settings: IApiSettings,
    public proxyUrl: string,
    transport?: ITransport
  ) {
    super(settings, transport || new BrowserTransport(settings));
  }

  /**
   * Proxy session is considered to be always authenticated since the proxy handles all auth
   *
   * @returns `true` since the proxy handles all authentication
   */
  isAuthenticated() {
    return true;
  }

  /**
   * This implementation swaps the request's path with the proxy url, and puts the original
   * request path in the `X-Forwarded-For` header, presuming that the proxy server will add API authentication
   * information to the request that gets submitted to the Looker API, then forward the API response to the requestor
   *
   * @param props the properties of the request
   * @returns the same request properties with "authentication" data added
   *
   */
  async authenticate(props: IRequestProps) {
    if (!props.headers) {
      props.headers = {};
    }
    props.headers['X-Forwarded-For'] = props.url;
    props.headers[LookerAppId] = agentPrefix;
    props.url = this.proxyUrl;
    return props;
  }
}
