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
  IHostConnection,
  ITransportSettings,
  Values,
} from '@looker/sdk-rtl';

import type { ApiVersion, ExtensionHostApi } from '../connect';

export class SdkConnection implements IHostConnection {
  constructor(
    private hostConnection: ExtensionHostApi,
    private apiVersion: ApiVersion
  ) {}

  async request(
    httpMethod: string,
    path: string,
    body?: any,
    params?: any,
    _authenticator?: any,
    options?: any
  ): Promise<any> {
    return this.hostConnection.invokeCoreSdk(
      httpMethod,
      path,
      params,
      body,
      undefined,
      options,
      this.apiVersion
    );
  }

  async rawRequest(
    httpMethod: string,
    path: string,
    body?: any,
    params?: any,
    _authenticator?: Authenticator,
    _options?: Partial<ITransportSettings>
  ): Promise<any> {
    return this.hostConnection.invokeCoreSdkRaw(
      httpMethod,
      path,
      params,
      body,
      this.apiVersion
    );
  }

  async stream<T>(
    _callback: (response: Response) => Promise<T>,
    _method: HttpMethod,
    _path: string,
    _queryParams?: Values,
    _body?: any,
    _authenticator?: Authenticator,
    _options?: Partial<ITransportSettings>
  ): Promise<any> {
    return Promise.reject(new Error('Not implemented'));
  }
}
