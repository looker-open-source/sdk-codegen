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
 * FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import { DefaultSettings, IApiSettings } from './apiSettings'
import { Looker31SDK } from '../sdk/3.1/methods'
import { ExtensionSession } from './extensionSession'
import { ExtensionTransport } from './extensionTransport'
import {
  Authenticator,
  ITransportSettings,
} from './transport'
import { APIMethods } from "./apiMethods";
import { IAuthSession } from "./authSession";

export interface IHostConnection {
  request(
    httpMethod: string,
    path: string,
    body?: any,
    params?: any,
    authenticator?: Authenticator,
    options?: Partial<ITransportSettings>,
  ): Promise<any>
}

export class LookerExtensionSDK {
  /**
   * Creates a [[LookerSDK]] object.
   *
   * Examples:
   * LookerExtensionSDK.createClient(host) => constructs a Looker31SDK
   *
   * LookerExtensionSDK.createClient(host, Looker40SDK) => constructs a Looker40SDK
   */
  static createClient<T extends APIMethods>(hostConnection: IHostConnection,
                      type?: new (authSession: IAuthSession) => T,
                      settings?: IApiSettings): T {
    settings = settings || DefaultSettings()
    const transport = new ExtensionTransport(settings, hostConnection)
    const session = new ExtensionSession(settings, transport)
    if (type) {
      return new type(session)
    }
    else
    {
      // work around TS2322
      return ((new Looker31SDK(session)) as any) as T
    }
  }
}