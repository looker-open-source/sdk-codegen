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
import type { IApiSettings, IAuthSession, ITransport } from '@looker/sdk-rtl';
import {
  DefaultSettings,
  BrowserSession,
  BrowserTransport,
} from '@looker/sdk-rtl';

import { Looker40SDK } from './4.0/methods';

export const BrowserSettings = (): IApiSettings => {
  const settings = DefaultSettings();
  settings.base_url = `${document.location.hostname}:19999`;
  return settings;
};

export class LookerBrowserSDK {
  /**
   * Creates a [[Looker40SDK]] object.
   *
   * @param settings Defaults to the settings for the Browser
   *
   * @param transport Defaults to a `BrowserTransport` object
   *
   * @param session Defaults to `BrowserSession` which uses OAuth authentication flow and CORS requests
   */
  static init40(
    settings?: IApiSettings,
    transport?: ITransport,
    session?: IAuthSession
  ) {
    settings = settings || BrowserSettings();
    transport = transport || new BrowserTransport(settings);
    session = session || new BrowserSession(settings, transport);
    return new Looker40SDK(session);
  }
}
