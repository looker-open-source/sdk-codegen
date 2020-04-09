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
import { log } from './utils'
import { fail, isFileSync, quit, readFileSync, run } from './nodeUtils'
import * as fs from 'fs'

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
 * @param {string} contents
 * @returns {Promise<string>} name of the file written
 */
export const swapXLookerNullable = (contents: string) => {
  const swapRegex = /x-looker-nullable/gi
  const nullable = 'nullable'
  return contents.replace(swapRegex, nullable)
}

/**
 * Replaces x-looker-nullable with nullable for parameters and properties in a file
 * @param {string} openApiFile name of the Open API file to process
 * @returns {Promise<string>} name of the file written
 */
export const swapNullableInFile = (openApiFile: string) => {
  if (!isFileSync(openApiFile)) {
    return quit(`${openApiFile} was not found`)
  }
  log(`replacing "x-looker-nullable" with "nullable" in ${openApiFile} ...`)
  const contents = swapXLookerNullable(readFileSync(openApiFile))
  fs.writeFileSync(openApiFile, contents)
  return openApiFile
}

/**
 * Convert a Swagger specification to OpenAPI
 * @param {string} fileName
 * @param {string} openApiFile
 * @returns {Promise<string>}
 */
const convertSpec = (fileName: string, openApiFile: string) => {
  if (isFileSync(openApiFile)) {
    log(`${openApiFile} already exists.`)
    return openApiFile
  }
  try {
    // https://github.com/Mermade/oas-kit/tree/master/packages/swagger2openapi config options:
    // patch to fix up small errors in source definition (not required, just to ensure smooth process)
    // indent 2 spaces
    // output to openApiFile
    // run('swagger2openapi', [fileName, '--resolveInternal', '-p', '-i', '"  "', '-o', openApiFile])
    run('swagger2openapi', [fileName, '-p', '-i', '"  "', '-o', openApiFile])
    if (!isFileSync(openApiFile)) {
      return fail('convertSpec', `creating ${openApiFile} failed`)
    }
    return swapNullableInFile(openApiFile)
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
