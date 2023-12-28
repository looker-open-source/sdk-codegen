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

import {
  LinkHeader,
  linkHeaderParser,
  pager,
  TotalCountHeader,
} from './paging';
import { APIMethods } from './apiMethods';
import { AuthSession } from './authSession';
import type { IApiSettings } from './apiSettings';
import { ApiSettings } from './apiSettings';
import { BrowserTransport } from './browserTransport';
import type {
  IRawResponse,
  IRequestProps,
  ITransport,
  SDKResponse,
} from './transport';
import { sdkOk } from './transport';

const firstUrl =
  'http://localhost/api/4.0/alerts/search?fields=id&limit=3&offset=0';
const lastUrl =
  'http://localhost/api/4.0/alerts/search?fields=id&limit=3&offset=9';
const prevUrl =
  'http://localhost/api/4.0/alerts/search?fields=id&limit=3&offset=3';
const nextUrl =
  'http://localhost/api/4.0/alerts/search?fields=id&limit=3&offset=6';

const firstLink = `<${firstUrl}>; rel="first"`;
// Verify extra whitespace characters still get parsed correctly
// The Looker API provides a header without extra whitespace but other Link headers
// may not be formatted that way
const lastLink = `< ${lastUrl} >; rel="\tlast (end of line!)\t"`;
const prevLink = `<\t${prevUrl}\n>;\nrel="prev"`;
const nextLink = `<${nextUrl}>; rel="next"`;
const allLinks = `${firstLink},${lastLink},${prevLink},${nextLink}`;
const settings = new ApiSettings({ base_url: 'mocked' });

class MockSession extends AuthSession {
  constructor(
    public readonly activeToken: string,
    settings: IApiSettings,
    transport: ITransport
  ) {
    super(settings, transport);
  }

  async authenticate(props: IRequestProps) {
    props.headers.Authorization = `Bearer ${this.activeToken}`;
    return props;
  }

  getToken() {
    return Promise.resolve(this.activeToken);
  }

  isAuthenticated(): boolean {
    return !!this.activeToken;
  }
}

const transport = new BrowserTransport(settings);
const session = new MockSession('mocked', settings, transport);
const sdk = new APIMethods(session, '4.0');
const mockedRows = ['one', 'two', 'three', 'four', 'five'];
const totalCount = 10;

const mockRawResponse = (url?: string, body?: any): IRawResponse => {
  const result: IRawResponse = {
    method: 'GET',
    ok: true,
    body: JSON.stringify(mockedRows),
    headers: { [LinkHeader]: allLinks, [TotalCountHeader]: ` ${totalCount}` },
    statusCode: 200,
    statusMessage: 'Mocking',
    contentType: 'application/json',
    url: 'https://mocked',
    requestStarted: 1000,
    responseCompleted: 2000,
  };
  if (url) {
    result.url = url;
  }
  if (body) {
    result.body = body;
  }
  return result;
};

async function mockSDKSuccess<T>(value: T) {
  return Promise.resolve<SDKResponse<T, any>>({ ok: true, value });
}

const mockRawResponseSuccess = (
  transport: BrowserTransport,
  value: any,
  rawResponse: IRawResponse
) => {
  if (transport.observer) {
    transport.observer(rawResponse);
  }
  return mockSDKSuccess(value);
};

// async function mockSDKError<T>(value: T) {
//   return Promise.resolve<SDKResponse<any, T>>({ ok: false, error: value })
// }

describe('paging', () => {
  describe('linkHeaderParser', () => {
    it('parses all links', () => {
      const actual = linkHeaderParser(allLinks);
      const keys = Object.keys(actual);
      expect(keys).toEqual(['first', 'last', 'prev', 'next']);
      expect(actual.first.rel).toEqual('first');
      expect(actual.first.url).toEqual(
        'http://localhost/api/4.0/alerts/search?fields=id&limit=3&offset=0'
      );
      expect(actual.last.rel).toEqual('last');
      expect(actual.last.url).toEqual(
        'http://localhost/api/4.0/alerts/search?fields=id&limit=3&offset=9'
      );
      expect(actual.last.name).toEqual('last (end of line!)');
      expect(actual.next.rel).toEqual('next');
      expect(actual.next.url).toEqual(
        'http://localhost/api/4.0/alerts/search?fields=id&limit=3&offset=6'
      );
      expect(actual.prev.rel).toEqual('prev');
      expect(actual.prev.url).toEqual(
        'http://localhost/api/4.0/alerts/search?fields=id&limit=3&offset=3'
      );
    });

    it('gets first only', () => {
      const actual = linkHeaderParser(firstLink);
      const keys = Object.keys(actual);
      expect(keys).toEqual(['first']);
      expect(actual.first.rel).toEqual('first');
      expect(actual.first.url).toEqual(
        'http://localhost/api/4.0/alerts/search?fields=id&limit=3&offset=0'
      );
    });
  });

  describe('pager', () => {
    beforeEach(() => {
      jest
        .spyOn(BrowserTransport.prototype, 'rawRequest')
        .mockReturnValue(Promise.resolve(mockRawResponse()));
    });
    afterAll(() => {
      jest.clearAllMocks();
    });

    it('initializes', async () => {
      const actual = await pager(
        sdk,
        () =>
          mockRawResponseSuccess(
            transport,
            mockedRows,
            mockRawResponse(firstUrl)
          ),
        {
          timeout: 99,
        }
      );
      expect(actual).toBeDefined();
      expect(actual.limit).toEqual(3);
      expect(actual.offset).toEqual(0);
      expect(actual.total).toEqual(totalCount);
      expect(actual.items).toEqual(mockedRows);
      expect(actual.pages).toEqual(4);
      expect(actual.page).toEqual(1);

      expect(actual.hasRel('first')).toEqual(true);
      expect(actual.hasRel('next')).toEqual(true);
      expect(actual.hasRel('prev')).toEqual(true);
      expect(actual.hasRel('last')).toEqual(true);
      expect(actual.options?.timeout).toEqual(99);
    });

    it('do not throw error without other params', async () => {
      const actual = await pager(sdk, () =>
        mockRawResponseSuccess(
          transport,
          mockedRows,
          mockRawResponse('/api/4.0/alerts/search')
        )
      );
      expect(actual).toBeDefined();
      expect(actual.limit).toEqual(-1);
      expect(actual.offset).toEqual(-1);
    });

    it('works without other query params', async () => {
      const actual = await pager(sdk, () =>
        mockRawResponseSuccess(
          transport,
          mockedRows,
          mockRawResponse('/api/4.0/alerts/search?limit=3&offset=0')
        )
      );
      expect(actual).toBeDefined();
      expect(actual.limit).toEqual(3);
      expect(actual.offset).toEqual(0);
    });

    it('works on relative url', async () => {
      const actual = await pager(sdk, () =>
        mockRawResponseSuccess(
          transport,
          mockedRows,
          mockRawResponse('/api/4.0/alerts/search?fields=id&limit=3&offset=0')
        )
      );
      expect(actual).toBeDefined();
      expect(actual.limit).toEqual(3);
      expect(actual.offset).toEqual(0);
    });

    it('supports paging', async () => {
      const paged = await pager(sdk, () =>
        mockRawResponseSuccess(transport, mockedRows, mockRawResponse())
      );
      expect(paged).toBeDefined();
      expect(paged.items).toEqual(mockedRows);
      const threeRows = ['one', 'two', 'three'];
      jest
        .spyOn(BrowserTransport.prototype, 'rawRequest')
        .mockReturnValue(
          Promise.resolve(mockRawResponse(nextUrl, JSON.stringify(threeRows)))
        );
      let items = await sdkOk(paged.nextPage());
      expect(items).toBeDefined();
      expect(items).toEqual(threeRows);
      expect(paged.offset).toEqual(6);
      expect(paged.limit).toEqual(3);
      expect(paged.total).toEqual(totalCount);
      expect(paged.pages).toEqual(4);
      expect(paged.page).toEqual(3);

      jest
        .spyOn(BrowserTransport.prototype, 'rawRequest')
        .mockReturnValue(Promise.resolve(mockRawResponse(nextUrl, '[]')));
      items = await sdkOk(paged.nextPage());
      expect(items).toBeDefined();
      expect(items).toEqual([]);
      expect(paged.offset).toEqual(6);
      expect(paged.limit).toEqual(3);
      expect(paged.total).toEqual(totalCount);
      expect(paged.pages).toEqual(4);
      expect(paged.page).toEqual(3);

      jest
        .spyOn(BrowserTransport.prototype, 'rawRequest')
        .mockReturnValue(Promise.resolve(mockRawResponse(prevUrl)));
      items = await sdkOk(paged.prevPage());
      expect(items).toBeDefined();
      expect(items).toEqual(mockedRows);
      expect(paged.offset).toEqual(3);
      expect(paged.limit).toEqual(3);
      expect(paged.total).toEqual(totalCount);
      expect(paged.pages).toEqual(4);
      expect(paged.page).toEqual(2);

      jest
        .spyOn(BrowserTransport.prototype, 'rawRequest')
        .mockReturnValue(Promise.resolve(mockRawResponse(lastUrl)));
      items = await sdkOk(paged.lastPage());
      expect(items).toBeDefined();
      expect(items).toEqual(mockedRows);
      expect(paged.offset).toEqual(9);
      expect(paged.limit).toEqual(3);
      expect(paged.total).toEqual(totalCount);
      expect(paged.pages).toEqual(4);
      expect(paged.page).toEqual(4);

      jest
        .spyOn(BrowserTransport.prototype, 'rawRequest')
        .mockReturnValue(Promise.resolve(mockRawResponse(firstUrl)));
      items = await sdkOk(paged.firstPage());
      expect(items).toBeDefined();
      expect(items).toEqual(mockedRows);
      expect(paged.offset).toEqual(0);
      expect(paged.limit).toEqual(3);
      expect(paged.total).toEqual(totalCount);
    });
  });
});
