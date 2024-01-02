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
import { Looker40SDK, environmentPrefix } from '@looker/sdk';
import { NodeSession, NodeSettingsIniFile, NodeTransport } from '.';

/**
 * @class LookerNodeSDK
 *
 * Simple factory for the Node version of the Looker SDK. Provides default connectivity for SDK methods
 *
 */
export class LookerNodeSDK {
  /**
   * Creates a [[Looker40SDK]] object.
   *
   * @param settings Defaults to the settings from LookerIni
   *
   * @param transport Defaults to a `NodeTransport` object
   *
   * @param session Defaults to `NodeSession` which logs in the user
   */
  static init40(
    settings?: IApiSettings,
    transport?: ITransport,
    session?: IAuthSession
  ) {
    settings = settings || new NodeSettingsIniFile(environmentPrefix);
    transport = transport || new NodeTransport(settings);
    session = session ?? new NodeSession(settings, transport);
    return new Looker40SDK(session);
  }
}
