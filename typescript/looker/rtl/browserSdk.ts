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

/**
 * @class LookerBrowserSDK
 *
 * Simple factory for the browser version of the Looker SDK. Provides default connectivity for SDK methods
 */
import { BrowserTransport } from './browserTransport'
import { ITransport } from './transport'
import { BrowserSession } from './browserSession'
import { DefaultSettings, IApiSettings } from './apiSettings'
import { Looker31SDK } from '../sdk/3.1/methods'
import { IAuthSession } from './authSession'
import { Looker40SDK } from '../sdk/4.0/methods'

export const BrowserSettings = (): IApiSettings => {
  const settings = DefaultSettings()
  settings.base_url = `${document.location.hostname}:19999`
  return settings
}

export class LookerBrowserSDK {
  /**
   * Creates a [[Looker31SDK]] object.
   *
   * @param settings Defaults to the settings for the Browser
   *
   * @param transport Defaults to a `BrowserTransport` object
   *
   * @param session Defaults to `BrowserSession` which defers user authentication
   */
  static init31(
    settings?: IApiSettings,
    transport?: ITransport,
    session?: IAuthSession,
  ) {
    settings = settings || BrowserSettings()
    transport = transport || new BrowserTransport(settings)
    session = session || new BrowserSession(settings, transport)
    return new Looker31SDK(session)
  }

  /**
   * Creates a [[Looker40SDK]] object.
   *
   * @param settings Defaults to the settings for the Browser
   *
   * @param transport Defaults to a `BrowserTransport` object
   *
   * @param session Defaults to `BrowserSession` which defers user authentication
   */
  static init40(
    settings?: IApiSettings,
    transport?: ITransport,
    session?: IAuthSession,
  ) {
    settings = settings || BrowserSettings()
    transport = transport || new BrowserTransport(settings)
    session = session || new BrowserSession(settings, transport)
    return new Looker40SDK(session)
  }
}
