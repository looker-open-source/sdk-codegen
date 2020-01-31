/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import { ITransport } from './transport'
import { NodeSettingsIniFile } from './nodeSettings'
import { Looker40SDK } from '../sdk/4.0/methods'
import { Looker31SDK } from '../sdk/3.1/methods'
import { NodeSession } from './nodeSession'
import { NodeTransport } from './nodeTransport'
import { IApiSettings } from './apiSettings'
import { IAuthSession } from './authSession'

/**
 * @class SDK
 *
 * Simple factory for the Node version of the Looker SDK. Provides default connectivity for SDK methods
 *
 */
export class LookerNodeSDK {
  /**
   * Creates an [[LookerSDK]] object.
   *
   * @param settings Defaults to the settings from LookerIni
   *
   * @param transport Defaults to a `NodeTransport` object
   *
   * @param session Defaults to `NodeSession` which logs in the user
   */
  static createClient(
    settings?: IApiSettings,
    transport?: ITransport,
    session?: IAuthSession)
  {
    settings = settings || new NodeSettingsIniFile('looker.ini')
    transport = transport || new NodeTransport(settings)
    session = session || new NodeSession(settings, transport)
    if ((settings.api_version ?? '4.0') === '3.1') return new Looker31SDK(session)
    return new Looker40SDK(session)
  }
}
