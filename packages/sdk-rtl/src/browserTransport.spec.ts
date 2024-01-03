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

import { BrowserTransport } from './browserTransport';
import type { IRawResponse, ISDKError, ITransportSettings } from './transport';
import { sdkOk } from './transport';

describe('BrowserTransport', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('cannot track performance if performance is not supported', () => {
    jest.spyOn(BrowserTransport, 'supportsPerformance').mockReturnValue(false);
    BrowserTransport.trackPerformance = true;
    expect(BrowserTransport.trackPerformance).toEqual(false);
  });

  it('can track performance if performance is supported', () => {
    jest.spyOn(BrowserTransport, 'supportsPerformance').mockReturnValue(true);
    BrowserTransport.trackPerformance = true;
    expect(BrowserTransport.trackPerformance).toEqual(true);
    BrowserTransport.trackPerformance = false;
    expect(BrowserTransport.trackPerformance).toEqual(false);
  });

  it('just deserializes JSON into an object', async () => {
    const xp = new BrowserTransport({} as ITransportSettings);
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
});
