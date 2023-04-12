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
import { Looker40SDK as LookerSDK, all_themes } from '@looker/sdk'
import type { ITheme } from '@looker/sdk'

import { themeServiceCreator } from './ThemeService'
import type { IThemeService } from './ThemeService'
import { TestConfig, session, timeout } from './test-utils'

const config = TestConfig()
const themes = config.testData.themes

describe('ThemeService', () => {
  const sdk = new LookerSDK(session)
  let service: IThemeService
  let testThemes: ITheme[]
  const themeCount = themes.length + 1 // includes the Looker theme

  beforeEach(() => {
    service = themeServiceCreator(sdk)
  })

  const createTestThemes = async () => {
    for (const t of themes) {
      const searched = await sdk.ok(sdk.search_themes({ name: t.name }))
      if (searched.length > 0) {
        // update theme with expected values if found
        await sdk.ok(sdk.update_theme(searched[0].id!, t))
      } else {
        // create theme if not found
        await sdk.ok(sdk.create_theme(t))
      }
    }
  }

  const removeTestThemes = async () => {
    for (const t of themes) {
      const searched = await sdk.ok(sdk.search_themes({ id: t.id }))
      if (searched.length > 0) {
        await sdk.ok(sdk.delete_theme(searched[0].id!))
      }
    }
  }

  beforeAll(async () => {
    await removeTestThemes()
    await createTestThemes()
    // get themes from instance to have their ids
    testThemes = await sdk.ok(all_themes(sdk, 'id, name'))
  }, timeout)

  afterAll(async () => {
    await sdk.authSession.logout()
  })

  describe('getAll', () => {
    it('gets and caches', async () => {
      await service.getAll()
      expect(service.items).toHaveLength(themeCount)
      expect(Object.keys(service.indexedItems)).toHaveLength(themeCount)
      expect(service.expiresAt).toBeGreaterThan(0)
    })
  })

  describe('get', () => {
    it('gets and caches', async () => {
      expect(service.items).toHaveLength(0)
      const actual = await service.get(testThemes[0].id!)
      expect(actual.name).toEqual(testThemes[0].name)
      expect(service.indexedItems[testThemes[0].id!].name).toEqual(
        testThemes[0].name
      )
    })

    it('retrieves from cache when possible', async () => {
      const themes = (await service.getAll()).items
      const cachedTheme = themes[0]
      const expectedName = cachedTheme.name + 'cached'
      cachedTheme.name = expectedName
      const actual = await service.get(cachedTheme.id!)
      expect(actual.name).toEqual(expectedName)
    })

    it('bypasses cache when expired', async () => {
      service = themeServiceCreator(sdk, -1000) // set time to live in the past
      const themes = (await service.getAll()).items
      const cachedTheme = themes[0]
      const expectedName = cachedTheme.name
      cachedTheme.name += 'cached'
      const actual = await service.get(cachedTheme.id!)
      expect(actual.name).toEqual(expectedName)
    })

    it('bypasses cache if cache=false', async () => {
      service = themeServiceCreator(sdk)
      const themes = (await service.getAll()).items
      const cachedTheme = themes[0]
      const expectedName = cachedTheme.name
      cachedTheme.name += 'cached'
      const actual = await service.get(cachedTheme.id!, { itemCache: false })
      expect(actual.name).toEqual(expectedName)
    })
  })

  describe('set', () => {
    it('sets and caches', async () => {
      const theme = testThemes.find((t) => t.name === themes[0].name)!
      const updatedTheme = { ...theme, name: 'updated_theme' }
      await service.set(updatedTheme.id!, updatedTheme)
      expect(service.indexedItems[updatedTheme.id!].name).toEqual(
        'updated_theme'
      )
    })
  })

  describe('delete', () => {
    afterEach(async () => {
      // recreate any deleted themes
      await createTestThemes()
    })

    it('deletes', async () => {
      const themes = (await service.getAll()).items
      expect(themes).toHaveLength(themeCount)

      const targetTheme = themes.find(
        (t) => t.name !== 'Looker' // Default Looker theme cannot be deleted
      )!
      await service.delete(targetTheme.id!)

      expect(service.items).toHaveLength(themeCount - 1)
      expect(service.indexedItems[targetTheme.id!]).toBeUndefined()
    })
  })

  describe('getDefaultTheme', () => {
    it('gets default theme', async () => {
      expect(service.defaultTheme).toBeUndefined()
      await service.getDefaultTheme()
      expect(service.defaultTheme).toBeDefined()
    })
  })

  describe('load', () => {
    it('loads', async () => {
      expect(service.items).toHaveLength(0)
      await service.load()
      expect(service.items).toHaveLength(themeCount)
      expect(service.defaultTheme?.name).toBe('Looker')
    })
  })
})
