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

import { Languages, IGeneratorSpec as LanguageSpec } from './languages'
import { SDKConfigProps, SDKConfig } from './sdkConfig'
import { log, quit, run } from './utils'
import { logConvert } from './convert'

// TODO replace with sdkGen.ts and remove `yarn sdk` command
// TODO deprecated. This is using the legacy code generator
// perform the generation for specific API version, configuration, and language
const generate = async (fileName: string, spec: LanguageSpec, props: SDKConfigProps) => {
  const path = spec.path ? spec.path : spec.language
  const language = spec.legacy ? spec.legacy : spec.language
  const apiPath = `./api/${props.api_version}/${path}`
  return run('openapi-generator',
    ['generate', '-i', fileName, '-g', language, '-o', apiPath, '--enable-post-process-file', spec.options])
}

// legacy all languages for the specified configuration
const runConfig = async (name: string, props: SDKConfigProps) => {
  log(`processing ${name} configuration ...`)

  const openApiFile = await logConvert(name, props)

  let results: any[] = []
  for (const language of Languages) {
    const tag = `${name} API ${language.language} version ${props.api_version}`
    log(`generating ${tag} ...`)
    results.push(await generate(openApiFile, language, props))
  }

  return results
}

try {
  const config = SDKConfig()
  Object.entries(config).forEach(async ([name, props]) => runConfig(name, props))
} catch (e) {
  quit(e)
}
