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

import { ArgValues } from './sdkModels'

const warn = (warning: string) => {
  throw new Error(warning)
}

const appJson = 'application/json'

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
 * @param verb HTTP method to locate
 * @param name name of parameter to find
 * @returns the matched parameter, or undefined
 */
const findOpenApiParam = (
  api: any,
  endpoint: string,
  verb: string,
  name: string
) => {
  const result = api.paths[endpoint][verb].parameters.find(
    (p: { name: string }) => p.name === name
  )
  if (!result) {
    warn(`Missing parameter: ${endpoint} ${verb} parameter ${name}`)
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

export const fixConversionObjects = (api: any, swagger: any) => {
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
                  fixes.push(fix)
                }
                requestBody.required = required
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

  return { fixes, spec: JSON.stringify(api) }
}

/**
 * Returns true if this spec is a swagger specification
 * @param spec to check
 */
export const isSwagger = (spec: any) => spec.swagger !== undefined

/**
 * Returns true spec is an OpenAPI specification
 * @param spec to check
 */
export const isOpenApi = (spec: any) => spec.openapi !== undefined

/**
 * This is a post-fix operation for the OpenAPI converter which currently misses this type of conversion
 *
 * - Converts missing swagger collectionFormat values to OpenAPI styles
 * - Flags OAS.requestBody as required or optional
 *
 * @param openApiSpec converted OpenAPI spec
 * @param swaggerSpec original swagger spec that may contain missed conversions
 * @returns modified openApiSpec and fix log in IConversionResults
 */
export const fixConversion = (
  openApiSpec: string,
  swaggerSpec: string
): IConversionResults => {
  return fixConversionObjects(JSON.parse(openApiSpec), JSON.parse(swaggerSpec))
}

/**
 * Simple "deep copy" operation. If it turns out to be slow, we'll add a lodash dependency
 * @param obj to clone
 */
const clone = (obj: any) => JSON.parse(JSON.stringify(obj))

/**
 * Convert a swagger structure ref to an OpenAPI structure ref
 * @param ref string reference to convert
 */
export const swapRef = (ref: string) =>
  ref.replace('#/definitions/', '#/components/schemas/')

/**
 * Get the name of the structure from the reference string
 * @param ref to partse
 */
export const structName = (ref: string) => {
  if (!ref) return undefined
  const parts = ref.split('/')
  return parts[parts.length - 1]
}

/**
 * Moves type, format, items to schema
 * Converts collectionFormat to style
 * @param param to convert
 */
export const convertParam = (param: any) => {
  const schema: any = { type: param.type }
  const result = clone(param)
  delete result.type
  if (param.format) {
    schema.format = param.format
    delete result.format
  }
  if (param.collectionFormat) {
    result.style = openApiStyle(param.collectionFormat)
    delete result.collectionFormat
  }
  if (param.items) {
    schema.items = param.items
    result.explode = false
    delete result.items
  }
  result.schema = schema
  return result
}

export const convertResponses = (responses: ArgValues) => {
  Object.entries(responses).forEach(([code, response]) => {
    if (response.schema?.$ref)
      response.schema.$ref = swapRef(response.schema.$ref)
    responses[code] = {
      description: response.description,
      content: { [appJson]: { schema: response.schema } },
    }
  })
  return responses
}

/**
 * Convert an operation
 * Assign schemas in params, create request bodies, update $refs
 * @param op operation to convert
 */
export const convertOp = (op: ArgValues) => {
  const ep = clone(op)
  let body = {}
  if (op.parameters) {
    ep.parameters = []
    Object.values(op.parameters).forEach((p: any) => {
      if (p.in === 'body') {
        const schema = clone(p.schema)
        if (schema.$ref) schema.$ref = swapRef(schema.$ref)
        ep.requestBody = {
          content: {
            [appJson]: {
              schema: schema,
            },
          },
          description: p.description,
        }
        if ('required' in p) ep.requestBody.required = p.required
        const struct = structName(schema.$ref)
        if (struct) {
          body = { [struct]: ep.requestBody }
        }
      } else {
        ep.parameters.push(convertParam(p))
      }
    })
    if (ep.parameters.length === 0) delete ep.parameters
  }
  ep.responses = convertResponses(ep.responses)
  return { op: ep, body }
}

/**
 * Assign schemas, request bodies, and update $ref pointers
 * @param paths to process
 */
export const convertPathsAndBodies = (paths: ArgValues) => {
  const result = { paths: {}, requestBodies: {} }
  Object.entries(paths).forEach(([path, entry]) => {
    // Hack to accommodate linting limitations
    const endpoint: ArgValues = entry
    Object.entries(endpoint).forEach(([verb, op]) => {
      const ep = convertOp(op)
      result.paths[path] = { [verb]: ep.op }
      Object.entries(ep.body as ArgValues).forEach(([name, body]) => {
        result.requestBodies[name] = body
      })
    })
  })
  return result
}

/**
 * Convert structure definitions
 * @param defs to convert
 */
export const convertDefs = (defs: ArgValues) => {
  const result = clone(defs)
  Object.entries(defs).forEach(([_, struct]) => {
    Object.entries(struct.properties as ArgValues).forEach(([__, prop]) => {
      if (prop.$ref) prop.$ref = swapRef(prop.$ref)
      if (prop.items?.$ref) prop.items.$ref = swapRef(prop.items.$ref)
    })
  })
  return result
}

/**
 * On-demand conversion of swagger to openAPI specification
 * @param spec to possibly convert
 * @returns OpenAPI version of the specification or throws error if not Swagger or OpenAPI
 */
export const upgradeSpecObject = (spec: any) => {
  if (isOpenApi(spec)) {
    return JSON.parse(swapXLookerTags(JSON.stringify(spec)))
  }
  if (!isSwagger(spec)) {
    throw new Error('Input is not a Swagger or OpenAPI specification')
  }
  const info = clone(spec.info)
  const tags = clone(spec.tags)
  const pathsAndBodies = convertPathsAndBodies(spec.paths)
  const schemas = convertDefs(spec.definitions)
  const api = {
    openapi: '3.0.0',
    info,
    tags,
    paths: pathsAndBodies.paths,
    servers: [{ url: `${spec.schemes[0]}://${spec.host}/${spec.basePath}` }],
    components: {
      requestBodies: pathsAndBodies.requestBodies,
      schemas: schemas,
    },
  }
  // const result = fixConversionObjects(api, spec)
  return api
}

export const upgradeSpec = (spec: string) =>
  JSON.stringify(upgradeSpecObject(JSON.parse(spec)))
