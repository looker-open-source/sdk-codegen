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

import type { Looker31SDK, Looker40SDK } from '@looker/sdk'
import {
  registerCore31SDK,
  getCore31SDK,
  unregisterCore31SDK,
} from './core_sdk_31'
import {
  registerCore40SDK,
  getCore40SDK,
  unregisterCore40SDK,
} from './core_sdk_40'
import { registerCoreSDK2, getCoreSDK2, unregisterCoreSDK2 } from './core_sdk2'
import { getCoreSDK } from './core_sdk'

describe('coreSDK', () => {
  beforeEach(() => {
    unregisterCore31SDK()
    unregisterCore40SDK()
  })

  it('errors when not initialized', () => {
    try {
      getCore31SDK()
      fail()
    } catch (err) {
      // success - getCoreSDK should fail if not registered
    }
  })

  it('returns sdk', () => {
    const fakeSdk = jest.fn() as unknown
    try {
      registerCore31SDK(fakeSdk as Looker31SDK)
      expect(getCore31SDK()).toStrictEqual(fakeSdk)
      expect(getCoreSDK()).toStrictEqual(fakeSdk)
    } catch (err) {
      fail(err)
    }
  })

  it('does not allow multiple registrations', () => {
    const fakeSdk = jest.fn() as unknown
    try {
      registerCore31SDK(fakeSdk as Looker31SDK)
      expect(getCore31SDK()).toStrictEqual(fakeSdk)
      registerCore31SDK(fakeSdk as Looker31SDK)
      fail()
    } catch (err) {
      // success - register should fail if called multiple times
    }
  })

  it('unregisters', () => {
    const fakeSdk = jest.fn() as unknown
    try {
      registerCore31SDK(fakeSdk as Looker31SDK)
      expect(getCore31SDK()).toStrictEqual(fakeSdk)
      unregisterCore31SDK()
      getCore31SDK()
      fail()
    } catch (err) {
      // success - getCoreSDK should fail unregister
    }
  })

  it('errors when not initialized', () => {
    try {
      getCore40SDK()
      fail()
    } catch (err) {
      // success - getCoreSDK should fail if not registered
    }
  })

  it('returns sdk', () => {
    const fakeSdk = jest.fn() as unknown
    const fake31Sdk = jest.fn() as unknown
    try {
      registerCore31SDK(fake31Sdk as Looker31SDK)
      registerCore40SDK(fakeSdk as Looker40SDK)
      expect(getCore40SDK()).toStrictEqual(fakeSdk)
      expect(getCoreSDK()).toStrictEqual(fake31Sdk)
    } catch (err) {
      fail(err)
    }
  })

  it('does not allow multiple registrations', () => {
    const fakeSdk = jest.fn() as unknown
    try {
      registerCore40SDK(fakeSdk as Looker40SDK)
      expect(getCore40SDK()).toStrictEqual(fakeSdk)
      registerCore40SDK(fakeSdk as Looker40SDK)
      fail()
    } catch (err) {
      // success - register should fail if called multiple times
    }
  })

  it('unregisters', () => {
    const fakeSdk = jest.fn() as unknown
    try {
      registerCore40SDK(fakeSdk as Looker40SDK)
      expect(getCore40SDK()).toStrictEqual(fakeSdk)
      unregisterCore40SDK()
      getCore40SDK()
      fail()
    } catch (err) {
      // success - getCoreSDK should fail unregister
    }
  })

  it('SDK2 does not allow multiple registrations', () => {
    const fakeSdk = jest.fn() as unknown
    try {
      registerCoreSDK2(fakeSdk)
      expect(getCoreSDK2()).toStrictEqual(fakeSdk)
      registerCoreSDK2(fakeSdk)
      fail()
    } catch (err) {
      // success - register should fail if called multiple times
    }
  })

  it('SDK2 unregisters', () => {
    const fakeSdk = jest.fn() as unknown
    try {
      registerCoreSDK2(fakeSdk)
      expect(getCoreSDK2()).toStrictEqual(fakeSdk)
      unregisterCoreSDK2()
      getCoreSDK2()
      fail()
    } catch (err) {
      // success - getCoreSDK2 should fail unregister
    }
  })
})
