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

import { IGeneratorSpec as LanguageSpec, legacyLanguages } from './languages'
import { ISDKConfigProps, SDKConfig } from './sdkConfig'
import { log } from '@looker/sdk-codegen-utils'
import { quit, run } from './nodeUtils'
import { logConvert } from './convert'

/**
 * Returns the last version in the .ini api_versions comma-delimited list
 * @param {ISDKConfigProps} props
 * @returns {string}
 */
const defaultApiVersion = (props: ISDKConfigProps) => {
  const versions = (props.api_versions || '4.0').split(',')
  return versions[versions.length - 1]
}

// Warning: deprecated. This is using the legacy code generator
// perform the generation for specific API version, configuration, and language
const generate = async (
  fileName: string,
  spec: LanguageSpec,
  props: ISDKConfigProps
) => {
  const path = spec.path ? spec.path : spec.language
  const language = spec.legacy ? spec.legacy : spec.language
  const apiVersion = defaultApiVersion(props)
  const apiPath = `./api/${apiVersion}/${path}`
  const options = spec.options || ''
  return run('openapi-generator', [
    'generate',
    '-i',
    fileName,
    '-g',
    language,
    '-o',
    apiPath,
    '--enable-post-process-file',
    options
  ])
}

// generate all languages for the specified configuration
const runConfig = async (name: string, props: ISDKConfigProps) => {
  log(`processing ${name} configuration ...`)
  const apiVersion = defaultApiVersion(props)
  props.api_version = apiVersion
  const openApiFile = await logConvert(name, props)
  const languages = legacyLanguages()

  let results: any[] = []
  for (const language of languages) {
    const tag = `${name} API ${language.language} version ${apiVersion}`
    log(`generating ${tag} ...`)
    results.push(await generate(openApiFile, language, props))
  }

  return results
}

(async () => {
  try {
    const config = SDKConfig()
    // Look for the Looker config section and only run that one
    const name = 'Looker'
    const props = config[name]
    void await runConfig(name, props)
  } catch (e) {
    quit(e)
  }
})()
