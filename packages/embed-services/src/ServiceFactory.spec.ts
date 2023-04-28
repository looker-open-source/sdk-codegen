/*

 MIT License

 Copyright (c) 2023 Looker Data Sciences, Inc.

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
import { Looker40SDK as LookerSDK } from '@looker/sdk'
import type { IAPIMethods } from '@looker/sdk-rtl'
import { session } from './test-utils'
import { createFactory, destroyFactory, getFactory } from './ServiceFactory'
import { getThemeService, registerThemeService } from './ThemeService'

describe('ServiceFactory', () => {
  const sdk: IAPIMethods = new LookerSDK(session)

  afterEach(() => {
    destroyFactory()
  })

  it('createFactory creates', () => {
    createFactory(sdk)
    expect(getFactory()).toBeDefined()
  })

  it('getFactory throws when no factory exists', () => {
    expect(getFactory).toThrow('Factory must be created with an SDK')
  })

  it('registers and gets a service', async () => {
    createFactory(sdk)
    registerThemeService()
    const service = getThemeService()
    expect(service).toBeDefined()
    await service.getDefaultTheme()
    expect(service.defaultTheme?.name).toEqual('Looker')
  })
})
