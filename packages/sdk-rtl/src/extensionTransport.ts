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
  IRawRequest,
  IRawResponse,
  ITransport,
  ITransportSettings,
  RawObserver,
  SDKResponse,
  Values,
} from './transport';

export interface IHostConnection {
  rawRequest(
    httpMethod: string,
    path: string,
    body?: any,
    params?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ): Promise<IRawResponse>;

  request(
    httpMethod: string,
    path: string,
    body?: any,
    params?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ): Promise<any>;

  stream<T>(
    callback: (readable: any) => Promise<T>,
    method: HttpMethod,
    path: string,
    queryParams?: Values,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ): Promise<T>;
}

export class ExtensionTransport implements ITransport {
  constructor(
    private readonly options: ITransportSettings,
    private hostConnection: IHostConnection
  ) {
    this.options = options;
    this.hostConnection = hostConnection;
  }

  observer: RawObserver | undefined;

  async rawRequest(
    method: HttpMethod,
    path: string,
    queryParams?: any,
    body?: any,
    authenticator?: any,
    options?: Partial<ITransportSettings>
  ): Promise<IRawResponse> {
    const response = await this.hostConnection.rawRequest(
      method,
      path,
      body,
      queryParams,
      authenticator,
      options
    );
    return this.observer ? this.observer(response) : response;
  }

  async request<TSuccess, TError>(
    method: HttpMethod,
    path: string,
    queryParams?: any,
    body?: any,
    authenticator?: any,
    options?: Partial<ITransportSettings>
  ): Promise<SDKResponse<TSuccess, TError>> {
    return this.hostConnection.request(
      method,
      path,
      body,
      queryParams,
      authenticator,
      options
    );
  }

  async stream<TSuccess>(
    callback: (readable: any) => Promise<TSuccess>,
    method: HttpMethod,
    path: string,
    queryParams?: any,
    body?: any,
    authenticator?: any,
    options?: Partial<ITransportSettings>
  ): Promise<TSuccess> {
    options = options ? { ...this.options, ...options } : this.options;
    return this.hostConnection.stream(
      callback,
      method,
      path,
      body,
      queryParams,
      authenticator,
      options
    );
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

  retry(_request: IRawRequest): Promise<IRawResponse> {
    // TODO implement this
    return Promise.reject(new Error('TODO: retry not implemented yet'));
  }
}
