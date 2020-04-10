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

import { ISDKConfigProps } from './sdkConfig'
import { openApiFileName, logFetch } from './fetchSpec'
import { log, success, warn } from './utils'
import { fail, isFileSync, quit, readFileSync, run } from './nodeUtils'
import * as fs from 'fs'
import { writeFileSync } from 'fs'

const { Spectral } = require('@stoplight/spectral')
const { getLocationForJsonPath, parseWithPointers } = require('@stoplight/json')

const lintyFresh = true

const lintCheck = async (fileName: string) => {
  if (!lintyFresh) return ''
  // return `${fileName} lint checking was skipped`
  try {
    // const linter = run('speccy', ['lint', fileName])
    const linter = new Spectral()
    if (!linter) return fail('Lint', 'no response')
    const spec = parseWithPointers(readFileSync(fileName))
    linter
      .run({
        parsed: spec,
        getLocationForJsonPath,
      })
      .then(console.log)
    return ''
    // if (
    //   linter.toString().indexOf('Specification is valid, with 0 lint errors') >=
    //   0
    // ) {
    //   return
    // }
  } catch (e) {
    return quit(e)
  }
}

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

type OpenApiStyle = 'matrix' | 'label' | 'form' | 'simple' | 'spaceDelimited' | 'pipeDelimited' | 'deepObject' | undefined

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
    'csv':'simple',
    'ssv': 'spaceDelimited',
    'pipes': 'pipeDelimited',
  }
  if (collectionFormat in styles) {
    return styles[collectionFormat]
  }
  return undefined
}

// TODO complete this function
/**
 * Convert swagger collectionFormat values to OpenAPI styles
 *
 * This is post-fix operation for the OpenAPI converter which currently misses this type of conversion
 *
 * @param {string} openApiSpec
 * @param {string} swaggerSpec
 * @returns {string} modified openApiSpec
 */
export const addSpecStyles = (openApiSpec: string, swaggerSpec: string) => {
  const swagger = JSON.parse(swaggerSpec)
  const api = JSON.parse(openApiSpec)
  const paths = swagger['paths']
  const fixes: string[] = []
  Object.entries(paths).forEach(([endpoint, op]) => {
    Object.entries(op as any).forEach(([httpMethod, operation]) => {
      Object.entries((operation as any).parameters).forEach(([arrayPos, p], index) => {
        const param = p as any
        if (param.collectionFormat) {
          const format = param.collectionFormat
          const style = openApiStyle(format)
          if (style === undefined) {
            warn(`OpenAPI style conversion failed: collectionFormat '${param.collectionFormat}' is unknown`)
          } else {
            const newParam = api.paths[endpoint][httpMethod].parameters[arrayPos]
            if (newParam.style !== style) {
              newParam.style = style
              fixes.push(`${endpoint} ${httpMethod} ${param.name}.collectionFormat '${format}' -> '${style}'`)
            }
          }
        }
      })
    })
  })

  if (fixes.length > 0) {
    // create the variable to avoid Typescript string template limitation
    const fixed = fixes.join('\n')
    log(`Converted ${fixes.length} collectionFormat parameters:\n${fixed}`)

    // Return the modified API as a string
    return JSON.stringify(api, null, 2)
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
  return swapXLookerNullable(readFileSync(openApiFile))
}

/**
 * Convert a Swagger specification to OpenAPI
 * @param {string} swaggerFilename
 * @param {string} openApiFilename
 * @returns {Promise<string>}
 */
const convertSpec = (swaggerFilename: string, openApiFilename: string) => {
  if (isFileSync(openApiFilename)) {
    log(`${openApiFilename} already exists.`)
    return openApiFilename
  }
  try {
    // https://github.com/Mermade/oas-kit/tree/master/packages/swagger2openapi config options:
    // patch to fix up small errors in source definition (not required, just to ensure smooth process)
    // indent 2 spaces
    // output to openApiFilename
    // run('swagger2openapi', [swaggerFilename, '--resolveInternal', '-p', '-i', '"  "', '-o', openApiFilename])
    run('swagger2openapi', [swaggerFilename, '-p', '-i', '"  "', '-o', openApiFilename])
    if (!isFileSync(openApiFilename)) {
      return fail('convertSpec', `creating ${openApiFilename} failed`)
    }
    let spec = swapNullableInFile(openApiFilename)
    spec = addSpecStyles(spec, readFileSync(swaggerFilename))
    writeFileSync(openApiFilename, spec)
    return spec
  } catch (e) {
    return quit(e)
  }
}

/**
 * Fetch (if needed) and convert a Swagger API specification to OpenAPI
 * @param {string} name base name of the target file
 * @param {ISDKConfigProps} props SDK configuration properties to use
 * @returns {Promise<string>} name of converted OpenAPI file
 */
export const logConvert = async (name: string, props: ISDKConfigProps) => {
  const oaFile = openApiFileName(name, props)
  if (isFileSync(oaFile)) return oaFile

  const specFile = await logFetch(name, props)
  const openApiFile = convertSpec(specFile, oaFile)
  if (!openApiFile) {
    return fail('logConvert', 'No file name returned for openAPI upgrade')
  }

  await lintCheck(openApiFile)
  return openApiFile
}
