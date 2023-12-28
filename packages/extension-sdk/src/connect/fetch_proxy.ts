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
import deepmerge from 'deepmerge';
import type {
  FetchProxy,
  FetchCustomParameters,
  FetchResponseBodyType,
  FetchProxyDataResponse,
} from './types';
import type { ExtensionHostApiImpl } from './extension_host_api';

export class FetchProxyImpl implements FetchProxy {
  constructor(
    private extensionHost: ExtensionHostApiImpl,
    private baseUrl?: string,
    private init?: FetchCustomParameters,
    private responseBodyType?: FetchResponseBodyType
  ) {}

  async fetchProxy(
    resource: string,
    init?: FetchCustomParameters,
    responseBodyType?: FetchResponseBodyType
  ): Promise<FetchProxyDataResponse> {
    return this.extensionHost.fetchProxy(
      this.getResource(resource),
      this.getInit(init),
      this.getResponseBodyType(responseBodyType)
    );
  }

  private getResource(resource: string) {
    return this.baseUrl ? this.baseUrl + resource : resource;
  }

  private getInit(init?: FetchCustomParameters) {
    if (init || this.init) {
      return deepmerge(this.init || {}, init || {});
    }
    return undefined;
  }

  private getResponseBodyType(responseBodyType?: FetchResponseBodyType) {
    return responseBodyType || this.responseBodyType;
  }
}
