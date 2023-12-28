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
  Authenticator,
  HttpMethod,
  IRawResponse,
  ITransportSettings,
  SDKResponse,
  Values,
  IRequestHeaders,
  IRequestProps,
  ISDKError,
} from '@looker/sdk-rtl';
import { BaseTransport, agentPrefix, LookerAppId } from '@looker/sdk-rtl';
import type {
  ExtensionSDK,
  FetchCustomParameters,
  FetchProxyDataResponse,
} from '@looker/extension-sdk';

export class ExtensionProxyTransport extends BaseTransport {
  constructor(
    public extensionSDK: ExtensionSDK,
    options: ITransportSettings
  ) {
    super(options);
  }

  private async initRequest(
    method: HttpMethod,
    path: string,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ) {
    const agentTag = options?.agentTag || agentPrefix;
    options = options ? { ...this.options, ...options } : this.options;
    const headers: IRequestHeaders = { [LookerAppId]: agentTag };
    if (options && options.headers) {
      Object.entries(options.headers).forEach(([key, val]) => {
        headers[key] = val;
      });
    }

    // Make sure an empty body is undefined
    if (!body) {
      body = undefined;
    } else {
      if (typeof body !== 'string') {
        body = JSON.stringify(body);
        headers['Content-Type'] = 'application/json';
      }
    }
    let props: IRequestProps = {
      body,
      credentials: 'same-origin',
      headers,
      method,
      url: path,
    };

    if (authenticator) {
      // Add authentication information to the request
      props = await authenticator(props);
    }

    return props;
  }

  parseResponse<TSuccess, TError>(
    _raw: IRawResponse
  ): Promise<SDKResponse<TSuccess, TError>> {
    const result: SDKResponse<TSuccess, TError> = {
      ok: false,
      error: new Error('Should not be called!') as unknown as TError,
    };
    return Promise.resolve(result);
  }

  async rawRequest(
    method: HttpMethod,
    path: string,
    queryParams?: Values,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ): Promise<IRawResponse> {
    options = { ...this.options, ...options };
    const requestPath = this.makeUrl(path, options, queryParams);
    const props = await this.initRequest(
      method,
      requestPath,
      body,
      authenticator,
      options
    );
    // const req = this.extensionSDK.fetchProxy(props.url)
    // Google services don't like LookerAppId header
    delete props.headers[LookerAppId];
    const fetchParams: FetchCustomParameters = {
      body: props.body,
      credentials: props.credentials,
      headers: props.headers,
      method: method as any,
    };
    const req = this.extensionSDK.fetchProxy(props.url, fetchParams);

    const requestStarted = Date.now();
    const res: FetchProxyDataResponse = await req;
    const responseCompleted = Date.now();

    const contentType = String(res.headers['content-type']);
    // const mode = responseMode(contentType)
    // const responseBody =
    //   mode === ResponseMode.binary ? await res.body : await res.body.toString()
    return {
      method,
      url: requestPath,
      body: res.body,
      contentType,
      ok: true,
      statusCode: res.status,
      statusMessage: `${res.status} fetched`,
      headers: res.headers,
      requestStarted,
      responseCompleted,
    };
  }

  async request<TSuccess, TError>(
    method: HttpMethod,
    path: string,
    queryParams?: Values,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ): Promise<SDKResponse<TSuccess, TError>> {
    try {
      const res = await this.rawRequest(
        method,
        path,
        queryParams,
        body,
        authenticator,
        options
      );
      // The response body is already parsed to an object if it's JSON
      if (this.ok(res)) {
        return { ok: true, value: res.body };
      } else {
        return { error: res.body, ok: false };
      }
    } catch (e: any) {
      const error: ISDKError = {
        message:
          typeof e.message === 'string'
            ? e.message
            : `The SDK call was not successful. The error was '${e}'.`,
        type: 'sdk_error',
      };
      return { error, ok: false };
    }
  }

  async stream<T>(
    _callback: (readable: _Readable.Readable) => Promise<T>,
    _method: HttpMethod,
    _path: string,
    _queryParams?: Values,
    _body?: any,
    _authenticator?: Authenticator,
    _options?: Partial<ITransportSettings>
  ): Promise<T> {
    return Promise.reject(new Error('stream is not implemented'));
  }
}
