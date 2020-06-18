/**
 * Builds a path matching the route used by MethodScene
 * @param methodName A method name
 * @param specKey A string to identify the spec in the URL
 * @param tag Corresponding method tag
 * @returns a Method path
 */
export const buildMethodPath = (
  specKey: string,
  tag: string,
  methodName: string
) => `/${specKey}/methods/${tag}/${methodName}`

/**
 * Builds a path matching the route used by TypeScene
 * @param typeName A type name
 * @param specKey A string to identify the spec in the URL
 * @returns a Type path
 */
export const buildTypePath = (specKey: string, typeName: string) =>
  `/${specKey}/types/${typeName}`
