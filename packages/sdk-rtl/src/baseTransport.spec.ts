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

import { BaseTransport } from './baseTransport';
import type {
  Authenticator,
  HttpMethod,
  IRawRequest,
  IRawResponse,
  ITransportSettings,
  SDKResponse,
  Values,
} from './transport';

/** Minimal concrete transport that exposes the protected `initRequest` under test */
class TestTransport extends BaseTransport {
  constructor(options: ITransportSettings) {
    super(options);
  }

  init(
    method: HttpMethod,
    path: string,
    body?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>
  ) {
    return this.initRequest(method, path, body, authenticator, options);
  }

  parseResponse<TSuccess, TError>(
    _raw: IRawResponse
  ): Promise<SDKResponse<TSuccess, TError>> {
    throw new Error('not implemented');
  }

  rawRequest(
    _method: HttpMethod,
    _path: string,
    _queryParams?: Values,
    _body?: any,
    _authenticator?: Authenticator,
    _options?: Partial<ITransportSettings>
  ): Promise<IRawResponse> {
    throw new Error('not implemented');
  }

  request<TSuccess, TError>(
    _method: HttpMethod,
    _path: string,
    _queryParams?: any,
    _body?: any,
    _authenticator?: Authenticator,
    _options?: Partial<ITransportSettings>
  ): Promise<SDKResponse<TSuccess, TError>> {
    throw new Error('not implemented');
  }

  stream<TSuccess>(
    _callback: (response: Response) => Promise<TSuccess>,
    _method: HttpMethod,
    _path: string,
    _queryParams?: Values,
    _body?: any,
    _authenticator?: Authenticator,
    _options?: Partial<ITransportSettings>
  ): Promise<TSuccess> {
    throw new Error('not implemented');
  }

  retry(_wait: IRawRequest): Promise<IRawResponse> {
    throw new Error('not implemented');
  }
}

const url = 'https://looker.example.com/api/4.0/user';
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('BaseTransport.initRequest abort signals', () => {
  const xp = new TestTransport({
    base_url: 'https://looker.example.com',
  } as ITransportSettings);
  let debug: jest.SpyInstance;

  beforeEach(() => {
    debug = jest.spyOn(console, 'debug').mockImplementation(() => undefined);
  });

  it('attaches the default timeout signal when the caller passes none', async () => {
    const props = await xp.init('GET', url);

    expect(props.signal).toBeInstanceOf(AbortSignal);
    expect(props.signal?.aborted).toBe(false);
    expect(debug).not.toHaveBeenCalled();
  });

  it('aborts once the configured timeout elapses', async () => {
    const props = await xp.init('GET', url, undefined, undefined, {
      timeout: 0.01, // seconds
    });

    expect(props.signal?.aborted).toBe(false);
    await sleep(50);
    expect(props.signal?.aborted).toBe(true);
  });

  it('combines a caller-supplied signal with the timeout', async () => {
    const controller = new AbortController();

    const props = await xp.init('GET', url, undefined, undefined, {
      signal: controller.signal,
    });

    expect(props.signal?.aborted).toBe(false);
    controller.abort();
    expect(props.signal?.aborted).toBe(true);
    expect(debug).not.toHaveBeenCalled();
  });

  describe('without AbortSignal.timeout', () => {
    const original = AbortSignal.timeout;

    beforeEach(() => {
      (AbortSignal as any).timeout = undefined;
    });

    afterEach(() => {
      AbortSignal.timeout = original;
    });

    it('reports the missing timeout support and sends no signal', async () => {
      const props = await xp.init('GET', url);

      expect(props.signal).toBeUndefined();
      expect(debug).toHaveBeenCalledWith(
        'AbortSignal.timeout is not defined. Timeout will use default behavior'
      );
    });

    it('still honors a caller-supplied cancel signal', async () => {
      const controller = new AbortController();

      const props = await xp.init('GET', url, undefined, undefined, {
        signal: controller.signal,
      });

      expect(props.signal).toBe(controller.signal);
    });
  });
});
