import { SpecItems } from '../../ApiExplorer'

export const selectSpec = (specs: SpecItems, specKey: string) => ({
  type: 'SELECT_SPEC',
  key: specKey,
  payload: specs,
})
