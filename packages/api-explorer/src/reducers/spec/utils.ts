import { ApiModel } from '@looker/sdk-codegen'

import { SpecItems } from '../../App'
import { SpecState } from './reducer'

/**
 * Given a collection of specs, it returns the spec marked as default, the one
 * marked as current or the first one, in that order.
 * @param {SpecItems} A collection of specs
 * @returns {string}  A spec
 */
export const getDefaultSpecKey = (specs: SpecItems): string => {
  const items = Object.entries(specs)

  if (items.length === 0) {
    throw Error('No specs found.')
  }

  let specKey = ''
  items.forEach(([key, item]) => {
    if (item.isDefault) {
      specKey = key
    }
  })

  if (!specKey) {
    items.forEach(([key, item]) => {
      if (item.status === 'current') {
        specKey = key
      }
    })
  }

  if (!specKey) {
    specKey = Object.keys(specs)[0]
  }

  if (!specKey) {
    throw Error('No specs found.')
  }

  return specKey
}

/**
 * Load the spec
 * @param spec Spec content
 * @returns ApiModel Parsed api with dynamic types loaded
 */
export const parseSpec = (spec: string) => ApiModel.fromJson(spec)

/**
 * Fetches and loads the API specification
 *
 * Generates dynamic types after loading
 *
 * TODO change default based on /versions
 * TODO use URL instead of version and derive version from reading the specification
 *
 * @param key API version
 * @param specs A collection of specs
 * @returns SpecItem Parsed api with dynamic types loaded
 */
export const fetchSpec = (key: string, specs: SpecItems): SpecState => {
  const selectedSpec = specs[key]
  if (!selectedSpec) {
    throw Error(`Spec not found: "${key}"`)
  }

  let spec: SpecState
  if (selectedSpec.api) {
    spec = { ...selectedSpec, key } as SpecState
  } else if (selectedSpec.specContent) {
    // TODO: maybe discard specContent if specURL is present?
    spec = {
      ...selectedSpec,
      key,
      api: parseSpec(selectedSpec.specContent),
    }
  } else if (selectedSpec.specURL) {
    // TODO: add fetch
    // const content = await fetch(spec.specURL)
    // spec.api = parseSpec(await content.text())
    // return spec
  } else {
    throw Error('Could not fetch spec.')
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  return spec
}

/**
 * Creates a default state object with the spec matching the specKey defined
 * in the url or the default criteria in getDefaultSpecKey
 * @param {SpecItems} A collection of specs
 * @returns {SpecState} An object to be used as default state
 */
export const initDefaultSpecState = (specs: SpecItems): SpecState => {
  const pathNodes = location.pathname.split('/')
  let specKey
  if (pathNodes.length > 2) {
    specKey = pathNodes[1]
  } else {
    specKey = getDefaultSpecKey(specs)
  }
  return fetchSpec(specKey, specs)
}
