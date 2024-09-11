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

import { describe, it } from 'node:test';
import { expect } from 'expect';
import type {
  IRawResponse,
  ISDKError,
  ITransportSettings,
} from '@looker/sdk-rtl';
import { StatusCode, sdkOk } from '@looker/sdk-rtl';
import { NodeCryptoHash, NodeTransport } from './nodeTransport';

describe('NodeTransport', () => {
  const hostname = 'https://looker.sdk';
  const settings = { base_url: hostname } as ITransportSettings;
  const xp = new NodeTransport(settings);
  const fullPath = 'https://github.com/looker-open-source/sdk-codegen';
  const badPath = fullPath + '_bogus';
  // const queryParams = { a: 'b c', d: false, nil: null, skip: undefined }

  it('raw request retrieves fully qualified url', async () => {
    const response = await xp.rawRequest('GET', fullPath);
    expect(response).toBeDefined();
    expect(response.ok).toEqual(true);
    expect(response.method).toEqual('GET');
    expect(response.statusCode).toEqual(200);
    expect(response.statusMessage).toEqual('OK');
    expect(response.contentType).toContain('text/html');
    expect(response.body).toBeDefined();
    const html = await response.body;
    expect(html).toContain(
      'One SDK to rule them all, and in the codegen bind them'
    );
  });

  describe('transport errors', () => {
    it('gracefully handles transport errors', async () => {
      const response = await xp.rawRequest('GET', badPath);
      const errorMessage = 'Not Found';
      expect(response).toBeDefined();
      expect(response.ok).toEqual(false);
      expect(response.method).toEqual('GET');
      expect(response.statusCode).toEqual(404);
      expect(response.body).toBeDefined();
      expect(response.statusMessage).toEqual(errorMessage);
    });
  });

  it('retrieves fully qualified url', async () => {
    const response = await xp.request<string, Error>('GET', fullPath);
    expect(response).toBeDefined();
    expect(response.ok).toEqual(true);
    if (response.ok) {
      const content = response.value;
      expect(content).toContain(
        'One SDK to rule them all, and in the codegen bind them'
      );
    }
  });

  describe('ok check', () => {
    const raw: IRawResponse = {
      method: 'GET',
      contentType: 'application/json',
      headers: {},
      url: 'bogus',
      ok: true,
      statusCode: StatusCode.OK,
      statusMessage: 'Mocked success',
      body: 'body',
      requestStarted: 1000,
      responseCompleted: 2000,
    };

    it('ok is ok', () => {
      expect(xp.ok(raw)).toEqual(true);
    });

    it('All 2xx responses are ok', () => {
      raw.statusCode = StatusCode.IMUsed;
      expect(xp.ok(raw)).toEqual(true);
    });

    it('Non-2xx responses are not ok', () => {
      raw.statusCode = 422;
      expect(xp.ok(raw)).toEqual(false);
    });
  });

  it('does a standard get', async () => {
    const xp = new NodeTransport({} as ITransportSettings);
    const actual = await xp.rawRequest('GET', 'https://example.com');
    expect(actual).toBeDefined();
  });

  it('just deserializes JSON into an object', async () => {
    const xp = new NodeTransport({} as ITransportSettings);
    interface ITestModel {
      string1: string;
      num1: number;
      string2: string;
      num2: number;
      string3: string;
      num3: number;
    }
    const resp: IRawResponse = {
      headers: {},
      url: '',
      ok: true,
      contentType: 'application/json',
      statusCode: 200,
      statusMessage: 'mock',
      method: 'GET',
      body: `
{
  "string1": 1,
  "num1": 1,
  "string2": "2",
  "num2": "2",
  "string3": "3",
  "num3": 3,
  "string4": "4",
  "num4": 4
}
`,
      requestStarted: 1000,
      responseCompleted: 2000,
    };
    const untyped: any = await sdkOk(xp.parseResponse(resp));
    expect(untyped.string1).toBe(1);
    expect(untyped.num1).toBe(1);
    expect(untyped.string2).toBe('2');
    expect(untyped.num2).toBe('2');
    expect(untyped.string3).toBe('3');
    expect(untyped.num3).toBe(3);
    expect(untyped.string4).toBe('4');
    expect(untyped.num4).toBe(4);
    const typed = await sdkOk(xp.parseResponse<ITestModel, ISDKError>(resp));
    expect(typed.string1).toBe(1);
    expect(typed.num1).toBe(1);
    expect(typed.string2).toBe('2');
    expect(typed.num2).toBe('2');
    expect(typed.string3).toBe('3');
    expect(typed.num3).toBe(3);
    expect((typed as any).string4).toBe('4');
    expect((typed as any).num4).toBe(4);
  });
  describe('NodeCryptoHash', () => {
    it('secureRandom', () => {
      const hasher = new NodeCryptoHash();
      const rand1 = hasher.secureRandom(5);
      expect(rand1.length).toEqual(10);
      const rand2 = hasher.secureRandom(32);
      expect(rand2.length).toEqual(64);
    });

    it('sha256hash', async () => {
      const hasher = new NodeCryptoHash();
      const message = 'The quick brown fox jumped over the lazy dog.';
      const hash = await hasher.sha256Hash(message);
      expect(hash).toEqual('aLEoK5HeLAVMNmKcuN1EfxLwltPjxYeXjcIkhERjNIM=');
    });
  });
});
