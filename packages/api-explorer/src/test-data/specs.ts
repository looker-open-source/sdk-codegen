import { ApiModel } from '@looker/sdk-codegen'

import { SpecItems } from '../App'
import { initDefaultSpecState } from '../reducers'

export const specs: SpecItems = {
  '3.0': {
    status: 'stable',
    specURL: 'https://self-signed.looker.com:19999/api/3.0/swagger.json',
    specContent: require('../../specs/Looker.3.0.oas.json'),
  },
  '3.1': {
    status: 'current',
    isDefault: true,
    specURL: 'https://self-signed.looker.com:19999/api/3.1/swagger.json',
    specContent: require('../../specs/Looker.3.1.oas.json'),
  },
  '4.0': {
    status: 'experimental',
    specURL: 'https://self-signed.looker.com:19999/api/4.0/swagger.json',
    specContent: require('../../specs/Looker.4.0.oas.json'),
  },
}

export const specState = initDefaultSpecState(specs)

export const api = ApiModel.fromJson(specs['3.1'].specContent)
