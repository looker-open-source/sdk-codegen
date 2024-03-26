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

import { DefaultSettings } from './apiSettings';
import { ExtensionSession } from './extensionSession';
import type { IHostConnection } from './extensionTransport';
import { ExtensionTransport } from './extensionTransport';

describe('ExtensionSession', () => {
  let session: ExtensionSession;
  beforeEach(() => {
    const settings = DefaultSettings();
    const transport = new ExtensionTransport(settings, {} as IHostConnection);
    session = new ExtensionSession(settings, transport);
  });

  it('isAuthenticated', () => {
    expect(session.isAuthenticated()).toEqual(true);
  });

  it('authenticate not supported', (done) => {
    session
      .authenticate({
        headers: {},
        method: 'GET',
        url: 'http://example.com',
      })
      .then(() => {
        fail('authenticate should fail');
      })
      .catch((error: any) => {
        expect(error).toBeDefined();
        done();
      });
  });

  it('isSudo not supported', () => {
    try {
      session.isSudo();
      fail('isSudo should fail');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('logout not supported', (done) => {
    session
      .logout()
      .then(() => {
        fail('logout should fail');
      })
      .catch((error: any) => {
        expect(error).toBeDefined();
        done();
      });
  });

  it('reset is noop', () => {
    try {
      session.reset();
    } catch (error) {
      fail('expected reset to noop');
    }
  });
});
