#!/usr/bin/env node

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

import { log, success } from '@looker/sdk-codegen-utils'
import { fixConversion, swapXLookerTags } from '@looker/sdk-codegen'
import {
  fail,
  isFileSync,
  quit,
  readFileSync,
  run,
  writeFileSync,
} from './nodeUtils'
import { writeSpecFile } from './fetchSpec'

/**
 * Replaces Looker-specific tags with OpenAPI equivalents
 * @param {string} openApiFile name of the Open API file to process
 * @returns {Promise<string>} the string contents of the updated spec
 */
export const swapXLookerTagsInFile = (openApiFile: string) => {
  if (!isFileSync(openApiFile)) {
    return quit(`${openApiFile} was not found`)
  }
  const spec = readFileSync(openApiFile)
  return swapXLookerTags(spec)
}

/**
 * Convert a Swagger specification to OpenAPI
 *
 * If the source spec is already an OpenAPI spec, fixes are still processed
 *
 * @param specFileName source Swagger spec file
 * @param openApiFilename destination OpenAPI spec file
 * @param force use `true` to force a conversion even if the file exists
 * @returns {Promise<string>} name of OpenAPI file
 */
export const convertSpec = (
  specFileName: string,
  openApiFilename: string,
  force = false
) => {
  if (isFileSync(openApiFilename) && !force) {
    log(`${openApiFilename} already exists. Skipping conversion.`)
    return openApiFilename
  }
  const spec = readFileSync(specFileName)
  const swagger = JSON.parse(spec)
  if (swagger.swagger) {
    // Still a swagger spec. Convert it.
    // https://github.com/Mermade/oas-kit/tree/master/packages/swagger2openapi config options:
    // patch to fix up small errors in source definition (not required, just to ensure smooth process)
    // indent no spaces
    // output to openApiFilename
    run('yarn swagger2openapi', [
      specFileName,
      '-p',
      '-i',
      '""',
      '-o',
      openApiFilename,
    ])
  } else if (swagger.openapi) {
    // We've already got an OpenAPI file
    writeFileSync(openApiFilename, JSON.stringify(swagger))
  } else {
    throw new Error(`Bad specification file ${specFileName}`)
  }
  if (!isFileSync(openApiFilename)) {
    return fail('convertSpec', `creating ${openApiFilename} failed`)
  }
  const source = swapXLookerTagsInFile(openApiFilename)
  const result = fixConversion(source, readFileSync(specFileName))
  writeSpecFile(openApiFilename, result.spec)
  success(`${openApiFilename} has ${result.fixes.length} fixes`)
  return openApiFilename
}
