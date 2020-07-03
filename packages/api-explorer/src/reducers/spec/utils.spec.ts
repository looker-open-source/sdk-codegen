import { ApiModel } from '@looker/sdk-codegen'
import { omit } from 'lodash'

import { specs } from '../../test-data'
import { SpecItems } from '../../ApiExplorer'
import {
  getDefaultSpecKey,
  parseSpec,
  fetchSpec,
  initDefaultSpecState,
} from './utils'

describe('Spec reducer utils', () => {
  const spec = specs['3.1']

  describe('parseSpec', () => {
    test('given a spec it returns an ApiModel with both readonly and writeable types', () => {
      const api = parseSpec(spec.specContent!)
      expect(api).toBeDefined()
      const types = Object.keys(api.types)
      expect(types).toEqual(
        expect.arrayContaining(['Dashboard', 'WriteDashboard'])
      )
    })
  })

  describe('getDefaultSpecKey', () => {
    const specList: SpecItems = {
      defaultKey: { status: 'experimental', isDefault: true },
      deprecatedKey: { status: 'deprecated' },
      currentKey: { status: 'current' },
      stableKey: { status: 'stable' },
    }

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
      const fetchedSpec = initDefaultSpecState(specs)
      expect(fetchedSpec).toBeDefined()
      expect(fetchedSpec.key).toEqual('4.0')
    })

    test('it gets default spec if url does not specify a key', () => {
      window.history.pushState({}, '', '/')
      const fetchedSpec = initDefaultSpecState(specs)
      expect(fetchedSpec).toBeDefined()
      expect(fetchedSpec.key).toEqual('3.1')
    })
  })
})
