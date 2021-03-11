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
import { ApiModel } from '@looker/sdk-codegen'
import { cloneDeep, omit } from 'lodash'

import { specs } from '../../test-data'
import { SpecItems } from '../../ApiExplorer'
import {
  getDefaultSpecKey,
  parseSpec,
  fetchSpec,
  initDefaultSpecState,
  getSpecKey,
  getSpecsFromVersions,
} from './utils'

describe('Spec reducer utils', () => {
  const spec = specs['3.1']
  const specList: SpecItems = {
    defaultKey: { status: 'experimental', isDefault: true },
    deprecatedKey: { status: 'deprecated' },
    currentKey: { status: 'current' },
    stableKey: { status: 'stable' },
  }

  describe('parseSpec', () => {
    test('given a spec it returns an ApiModel with both readonly and writeable types', () => {
      expect(spec.specContent).toBeDefined()
      if (spec.specContent) {
        const api = parseSpec(spec.specContent)
        expect(api).toBeDefined()
        const types = Object.keys(api.types)
        expect(types).toEqual(
          expect.arrayContaining(['Dashboard', 'WriteDashboard'])
        )
      }
    })
  })

  describe('getSpecKey', () => {
    const saveLocation = window.location

    afterAll(() => {
      window.location = saveLocation
    })

    test('recognizes spec version in url', () => {
      window.history.pushState({}, '', '/4.0/')
      const specKey = getSpecKey(window.location)
      expect(specKey).toBeDefined()
      expect(specKey).toEqual('4.0')
    })

    test('ignores oauth as a spec key', () => {
      window.history.pushState({}, '', '/oauth/')
      const specKey = getSpecKey(window.location)
      expect(specKey).toEqual('')
    })

    test('gets default spec key when specs are provided and url has no path', () => {
      window.history.pushState({}, '', '')
      const specKey = getSpecKey(window.location, specList)
      expect(specKey).toBeDefined()
      expect(specKey).toEqual('defaultKey')
    })

    test('gets default spec key when specs are provided and url has oauth path', () => {
      window.history.pushState({}, '', '/oauth/')
      const specKey = getSpecKey(window.location, specList)
      expect(specKey).toBeDefined()
      expect(specKey).toEqual('defaultKey')
    })
  })

  describe('getDefaultSpecKey', () => {
    test('it throws if no specs are provided', () => {
      expect(() => {
        getDefaultSpecKey({} as SpecItems)
      }).toThrow('No specs found.')
    })

    test('it returns specKey for default spec if found', () => {
      expect(getDefaultSpecKey(specList)).toEqual('defaultKey')
    })

    test('it returns specKey for spec marked as current if none are marked as default', () => {
      const specItems = omit(specList, 'defaultKey')
      expect(getDefaultSpecKey(specItems)).toEqual('currentKey')
    })

    test('it returns first spec if no spec is marked as default or current', () => {
      const specItems = omit(specList, ['defaultKey', 'currentKey'])
      expect(getDefaultSpecKey(specItems)).toEqual('deprecatedKey')
    })
  })

  describe('fetchSpec', () => {
    const specList: SpecItems = {
      fromModel: {
        status: 'experimental',
        api: ApiModel.fromJson(specs['3.1'].specContent),
      },
      fromSpecContent: {
        status: 'current',
        specContent: specs['3.1'].specContent,
      },
      emptySpecItem: { status: 'deprecated' },
    }

    test('it uses api model if found ', () => {
      const fetchedSpec = fetchSpec('fromModel', specList)
      expect(fetchedSpec.api).toBeInstanceOf(ApiModel)
    })

    test('it uses spec content to create model if model is not available', () => {
      const fetchedSpec = fetchSpec('fromSpecContent', specList)
      expect(fetchedSpec.api).toBeInstanceOf(ApiModel)
    })

    test('it throws for invalid key', () => {
      expect(() => fetchSpec('Bad Key', specList)).toThrow(
        'Spec not found: "Bad Key"'
      )
    })

    test('it throws if no model, content or url are found', () => {
      expect(() => fetchSpec('emptySpecItem', specList)).toThrow(
        'Could not fetch spec.'
      )
    })
  })

  describe('initDefaultSpecState', () => {
    const saveLocation = window.location

    afterAll(() => {
      window.location = saveLocation
    })

    test('it fetches spec using key defined in url', () => {
      window.history.pushState({}, '', '/4.0/')
      const fetchedSpec = initDefaultSpecState(specs, window.location)
      expect(fetchedSpec).toBeDefined()
      expect(fetchedSpec.key).toEqual('4.0')
    })

    test('it gets default spec if url does not specify a key', () => {
      window.history.pushState({}, '', '/')
      const fetchedSpec = initDefaultSpecState(specs, window.location)
      expect(fetchedSpec).toBeDefined()
      expect(fetchedSpec.key).toEqual('4.0')
    })
  })

  describe('getSpecsFromVersions', () => {
    const versions = {
      looker_release_version: '21.3.0',
      current_version: {
        version: '3.1',
        full_version: '3.1.0',
        status: 'current',
        swagger_url: 'http://localhost:19999/api/3.1/swagger.json',
      },
      supported_versions: [
        {
          version: '2.99',
          full_version: '2.99.0',
          status: 'internal_test',
          swagger_url: 'http://localhost:19999/api/2.99/swagger.json',
        },
        {
          version: '3.0',
          full_version: '3.0.0',
          status: 'legacy',
          swagger_url: 'http://localhost:19999/api/3.0/swagger.json',
        },
        {
          version: '3.1',
          full_version: '3.1.0',
          status: 'current',
          swagger_url: 'http://localhost:19999/api/3.1/swagger.json',
        },
        {
          version: '4.0',
          full_version: '4.0.21.3',
          status: 'experimental',
          swagger_url: 'http://localhost:19999/api/4.0/swagger.json',
        },
      ],
      api_server_url: 'http://localhost:19999',
    }

    test('only gets supported specifications', async () => {
      const actual = await getSpecsFromVersions(versions)
      expect(Object.keys(actual)).toEqual(['3.1', '4.0'])
    })

    test('current is the default spec', async () => {
      const specs = await getSpecsFromVersions(versions)
      const actual = Object.entries(specs).find(
        ([_, a]) => a.status === 'current'
      )
      expect(actual).toBeDefined()
      if (actual) {
        const [, current] = actual
        expect(current).toBeDefined()
        expect(current.status).toEqual('current')
        expect(current.isDefault).toEqual(true)
      }
    })

    test('specs have unique keys', async () => {
      const moar = cloneDeep(versions)
      moar.supported_versions.push(
        {
          version: '4.0',
          full_version: 'full',
          status: 'un',
          swagger_url: 'http://localhost:19999/api/4.0/u.json',
        },
        {
          version: '4.0',
          full_version: 'full',
          status: 'un',
          swagger_url: 'http://localhost:19999/api/4.0/un.json',
        },
        {
          version: '4.0',
          full_version: 'full',
          status: 'un',
          swagger_url: 'http://localhost:19999/api/4.0/un3.json',
        },
        {
          version: '4.0',
          full_version: 'full',
          status: 'un',
          swagger_url: 'http://localhost:19999/api/4.0/un4.json',
        }
      )
      const actual = await getSpecsFromVersions(moar)
      expect(Object.keys(actual)).toEqual([
        '3.1',
        '4.0',
        '4.0u',
        '4.0un',
        '4.0un3',
        '4.0un4',
      ])
    })
  })
})
