#!/usr/bin/env node

/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import { log, success, warn } from '@looker/sdk-codegen-utils'
import { fail, isFileSync, quit, readFileSync, run, utf8Encoding } from './nodeUtils'
import * as fs from 'fs'
import { ParameterStyle } from 'openapi3-ts'

/**
 * Replaces x-looker-nullable with nullable for parameters and properties in a string
 * @param {string} spec
 * @returns {Promise<string>} name of the file written
 */
export const swapXLookerNullable = (spec: string) => {
  const swapRegex = /x-looker-nullable/gi
  const nullable = 'nullable'
  return spec.replace(swapRegex, nullable)
}

type OpenApiStyle = ParameterStyle | undefined

/**
 * Convert OpenAPI 2 collectionFormat to OpenApi 3 style
 *
 * See https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.3.md#style-values for
 * conversion guidelines
 *
 * @param {string} collectionFormat
 * @returns {OpenApiStyle}
 */
export const openApiStyle = (collectionFormat: string): OpenApiStyle => {
  if (!collectionFormat) return undefined
  const styles: {[key:string]: OpenApiStyle} = {
    'csv': 'simple',
    'ssv': 'spaceDelimited',
    'pipes': 'pipeDelimited',
  }
  if (collectionFormat in styles) {
    return styles[collectionFormat]
  }
  return undefined
}

/**
 * Utility function to find the named parameter for an OpenAPI endpoint
 * @param api JSON structure of OpenAPI spec
 * @param {string} endpoint url pattern for endpoint
 * @param {string} httpMethod HTTP method to locate
 * @param {string} name name of parameter to find
 * @returns {any} the matched parameter, or undefined
 */
const findOpenApiParam = (api: any, endpoint: string, httpMethod: string, name: string) => {
  const result = api.paths[endpoint][httpMethod].parameters.find((p: { name: string }) => p.name === name)
  if (!result) {
    warn(`Missing parameter: ${endpoint} ${httpMethod} parameter ${name}`)
  }
  return result
}

/**
 * This is a post-fix operation for the OpenAPI converter which currently misses this type of conversion
 *
 * - Converts missing swagger collectionFormat values to OpenAPI styles
 * - Flags OAS.requestBody as required or optional
 *
 * @param {string} openApiSpec
 * @param {string} swaggerSpec
 * @returns {string} modified openApiSpec
 */
export const fixConversion = (openApiSpec: string, swaggerSpec: string) => {
  const swagger = JSON.parse(swaggerSpec)
  const api = JSON.parse(openApiSpec)
  const paths = swagger['paths']
  const fixes: string[] = []
  Object.entries(paths).forEach(([endpoint, op]) => {
    Object.entries(op as any).forEach(([httpMethod, method]) => {
      const operation = method as any
      const params = operation.parameters
      if (params) {
        Object.entries(params).forEach(([, p], index) => {
          const param = p as any
          if (param.name === 'body' && param.in === 'body') {
            // Set `required` in requestBody
            if ('required' in param) {
              //  explicitly setting required value
              const required = param.required
              const fix = `${endpoint}::${operation.operationId} setting requestBody.required to ${required}`
              const requestBody = api.paths[endpoint][httpMethod].requestBody
              if (!requestBody) {
                warn(`Failed to find "requestBody" in OAS for swagger "body param" fix: ${fix}`)
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
              warn(`OAS style conversion failed: collectionFormat '${param.collectionFormat}' is unknown`)
            } else {
              const fix = `${endpoint}::${operation.operationId} ${param.name} '${format}' -> '${style}'`
              const newParam = findOpenApiParam(api, endpoint, httpMethod, param.name)
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

  if (fixes.length > 0) {
    // create the variable to avoid Typescript string template limitation
    const fixed = fixes.join('\n')
    log(`Fixed ${fixes.length} OpenAPI conversion issues:\n${fixed}`)

    // Return the modified API as an unformatted string
    return JSON.stringify(api)
  }
  return openApiSpec
}

/**
 * Replaces x-looker-nullable with nullable for parameters and properties in a file
 * @param {string} openApiFile name of the Open API file to process
 * @returns {Promise<string>} the string contents of the updated spec
 */
export const swapNullableInFile = (openApiFile: string) => {
  if (!isFileSync(openApiFile)) {
    return quit(`${openApiFile} was not found`)
  }
  log(`replacing "x-looker-nullable" with "nullable" in ${openApiFile} ...`)
  const spec = readFileSync(openApiFile)
  return swapXLookerNullable(spec)
}

/**
 * Convert a Swagger specification to OpenAPI
 * @param {string} swaggerFilename
 * @param {string} openApiFilename
 * @returns {Promise<string>}
 */
export const convertSpec = (swaggerFilename: string, openApiFilename: string) => {
  if (isFileSync(openApiFilename)) {
    log(`${openApiFilename} already exists.`)
    return openApiFilename
  }
  try {
    // https://github.com/Mermade/oas-kit/tree/master/packages/swagger2openapi config options:
    // patch to fix up small errors in source definition (not required, just to ensure smooth process)
    // indent no spaces
    // output to openApiFilename
    run('swagger2openapi', [swaggerFilename, '-p', '-i', '""', '-o', openApiFilename])
    if (!isFileSync(openApiFilename)) {
      return fail('convertSpec', `creating ${openApiFilename} failed`)
    }
    let spec = swapNullableInFile(openApiFilename)
    spec = fixConversion(spec, readFileSync(swaggerFilename))
    fs.writeFileSync(openApiFilename, spec, utf8Encoding)
    success(`Fixed up ${openApiFilename}`)
    return openApiFilename
  } catch (e) {
    return quit(e)
  }
}
