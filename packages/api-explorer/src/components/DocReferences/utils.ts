import { ApiModel, IMethod, IType, Method } from '@looker/sdk-codegen'

import { buildMethodPath, buildTypePath } from '../../utils'

/**
 * Returns the tag for a given method name
 * @param Parsed api
 * @param Method name
 * @returns Corresponding tag
 */
const getTag = (api: ApiModel, methodName: string) => {
  // Find tag containing methodName
  return Object.entries(api.tags)
    .filter(([, methods]) => methodName in methods)
    .map(([methodTag]) => methodTag)[0]
}

/**
 * Builds a path matching MethodScene or TypeScene route
 * @param api
 * @param item A method or type item
 * @param specKey A string to identify the spec in the url
 * @returns a method or type path
 */
export const buildPath = (
  api: ApiModel,
  item: IMethod | IType,
  specKey: string
) => {
  let path
  if (item instanceof Method) {
    path = buildMethodPath(specKey, getTag(api, item.name), item.name)
  } else {
    path = buildTypePath(specKey, item.name)
  }
  return path
}
