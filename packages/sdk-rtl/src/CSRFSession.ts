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

import type { IApiSettings } from './apiSettings';
import type { IRequestProps, ITransport } from './transport';
import { BrowserTransport } from './browserTransport';
import { AuthSession } from './authSession';

/**
 * CSRFSession is only for use within the Looker UI or a script that
 * executes in the Looker UI. Not for use by third party web apps. Looker UI web
 * service endpoints require that requests must contain a CSRF token to block third
 * party request forgeries. The actual login state is conveyed via encrypted browser
 * cookies exclusive to the looker domain, which the browser implicitly includes on
 * all web requests to looker UI web service.
 */
export class CSRFSession extends AuthSession {
  _activeToken = '';
  constructor(
    public settings: IApiSettings,
    transport?: ITransport
  ) {
    super(settings, transport || new BrowserTransport(settings));
  }

  get activeToken() {
    if (!this._activeToken) {
      const meta = document.head.querySelector(
        '[name=csrf-token]'
      ) as HTMLMetaElement;
      this._activeToken = meta ? meta.content : '';
    }
    return this._activeToken;
  }

  async getToken() {
    return this.activeToken;
  }

  /**
   * Returns true if the same origin browser session has a CRSF token established
   * that can be used for API authentication
   */
  isAuthenticated() {
    const token = this.activeToken;
    if (!token) return false;
    return true;
  }

  /**
   * Authenticates a request with the CSRF token if it is active
   *
   * @param props Request properties to decorate
   */
  async authenticate(props: IRequestProps) {
    const token = this.activeToken;
    if (token) props.headers['X-CSRF-TOKEN'] = token;
    return props;
  }
}
