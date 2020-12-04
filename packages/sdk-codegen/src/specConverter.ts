/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

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

const warn = (warning: string) => {
  throw new Error(warning)
}

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#style-values
 */
type OpenApiParameterStyle =
  | 'matrix'
  | 'label'
  | 'form'
  | 'simple'
  | 'spaceDelimited'
  | 'pipeDelimited'
  | 'deepObject'
  | undefined

/**
 * Replaces x-looker-nullable with nullable for parameters and properties in a string
 * @param {string} spec
 * @returns {Promise<string>} name of the file written
 */
export const swapXLookerTags = (spec: string) => {
  const swaps = [
    { pattern: /x-looker-nullable/gi, replacement: 'nullable' },
    { pattern: /x-looker-values/gi, replacement: 'enum' },
  ]
  swaps.forEach((swap) => {
    spec = spec.replace(swap.pattern, swap.replacement)
  })
  return spec
}

/**
 * Convert OpenAPI 2 collectionFormat to OpenApi 3 style
 *
 * See https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.3.md#style-values for
 * conversion guidelines
 *
 * @param collectionFormat string
 * @returns {OpenApiStyle}
 */
export const openApiStyle = (
  collectionFormat: string
): OpenApiParameterStyle => {
  if (!collectionFormat) return undefined
  const styles: { [key: string]: OpenApiParameterStyle } = {
    csv: 'simple',
    pipes: 'pipeDelimited',
    ssv: 'spaceDelimited',
  }
  if (collectionFormat in styles) {
    return styles[collectionFormat]
  }
  return undefined
}

/**
 * Utility function to find the named parameter for an OpenAPI endpoint
 * @param api JSON structure of OpenAPI spec
 * @param endpoint url pattern for endpoint
 * @param httpMethod HTTP method to locate
 * @param name name of parameter to find
 * @returns the matched parameter, or undefined
 */
const findOpenApiParam = (
  api: any,
  endpoint: string,
  httpMethod: string,
  name: string
) => {
  const result = api.paths[endpoint][httpMethod].parameters.find(
    (p: { name: string }) => p.name === name
  )
  if (!result) {
    warn(`Missing parameter: ${endpoint} ${httpMethod} parameter ${name}`)
  }
  return result
}

/**
 * Results of the spec conversion
 */
export interface IConversionResults {
  /**
   * JSON.stringify of the spec
   */
  spec: string
  /**
   * List of fixes to the spec
   */
  fixes: string[]
}

/**
 * This is a post-fix operation for the OpenAPI converter which currently misses this type of conversion
 *
 * - Converts missing swagger collectionFormat values to OpenAPI styles
 * - Flags OAS.requestBody as required or optional
 *
 * @param openApiSpec converted OpenAPI spec
 * @param swaggerSpec containing missed conversions
 * @returns modified openApiSpec and fix log in IConversionResults
 */
export const fixConversion = (
  openApiSpec: string,
  swaggerSpec: string
): IConversionResults => {
  const swagger = JSON.parse(swaggerSpec)
  const api = JSON.parse(openApiSpec)
  const paths = swagger.paths
  const fixes: string[] = []
  Object.entries(paths).forEach(([endpoint, op]) => {
    Object.entries(op as any).forEach(([httpMethod, method]) => {
      const operation = method as any
      const params = operation.parameters
      if (params) {
        Object.entries(params).forEach(([, p]) => {
          const param = p as any
          if (param.name === 'body' && param.in === 'body') {
            // Set `required` in requestBody
            if ('required' in param) {
              //  explicitly setting required value
              const required = param.required
              const fix = `${endpoint}::${operation.operationId} setting requestBody.required to ${required}`
              const requestBody = api.paths[endpoint][httpMethod].requestBody
              if (!requestBody) {
                warn(
                  `Failed to find "requestBody" in OAS for swagger "body param" fix: ${fix}`
                )
              } else {
                if (requestBody.required !== required) {
                  requestBody.required = required
                  fixes.push(fix)
                }
              }
            }
          }

          if (param.collectionFormat) {
            // Set style from collectionFormat if it's not set
            const format = param.collectionFormat
            const style = openApiStyle(format)
            if (style === undefined) {
              warn(
                `OAS style conversion failed: collectionFormat '${param.collectionFormat}' is unknown`
              )
            } else {
              const fix = `${endpoint}::${operation.operationId} ${param.name} '${format}' -> '${style}'`
              const newParam = findOpenApiParam(
                api,
                endpoint,
                httpMethod,
                param.name
              )
              if (newParam && newParam.style !== style) {
                newParam.style = style
                fixes.push(fix)
              }
            }
          }
        })
      }
    })
  })

  return { fixes, spec: fixes.length > 0 ? JSON.stringify(api) : openApiSpec }
}
