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

import * as fs from 'fs'
import { ISDKConfigProps, SDKConfig } from './sdkConfig'
import { danger, log } from '@looker/sdk-codegen-utils'
import { fetchLookerVersion, openApiFileName } from './fetchSpec'
import { MethodGenerator, specFromFile, StreamGenerator, TypeGenerator } from './sdkGenerator'
import { getFormatter, Languages } from './languages'
import { logConvert } from './convert'
import { IVersionInfo, ICodeGen } from '@looker/sdk-codegen'
import { FilesFormatter } from './reformatter'
import { isDirSync, quit } from './nodeUtils'

const apiVersions = (props: any) => {
  const versions = props.api_versions ?? '3.1,4.0'
  return versions.split(',')
}

/**
 * Ensures the existence
 * @param gen the SDK source code path
 */
const sdkPathPrep = (gen: ICodeGen) => {
  const path = `${gen.codePath}${gen.packagePath}/sdk/${gen.apiVersion}`
  if (!isDirSync(path)) fs.mkdirSync(path, {recursive: true})
  return path
}

const formatter = new FilesFormatter()

/**
 * Writes the output file and registers it with the file reformatter for processing
 * @param {string} fileName name of source file
 * @param {string} content contents to (over) write into source file
 * @returns {string} the name of the file written
 */
const writeFile = (fileName: string, content: string): string => {
  fs.writeFileSync(fileName, content)
  formatter.addFile(fileName)
  return fileName
}

;(async () => {
  let args = process.argv.slice(2)
  let languages = Languages.filter(l => l.factory !== undefined).map(
    l => l.language
  )
  if (args.length > 0) {
    if (args.toString().toLowerCase() !== 'all') {
      languages = []
      for (let arg of args) {
        const values = arg.toString().split(',')
        values.forEach(v => (v.trim() ? languages.push(v.trim()) : null))
      }
    }
  }

  try {
    const config = SDKConfig()
    for (let language of languages) {
      let [name, props] = Object.entries(config)[0]
      const lookerVersion = await fetchLookerVersion(props)
      // Iterate through all specified API versions
      const apis = apiVersions(props)
      const lastApi = apis[apis.length-1]
      for (const api of apis) {
        let p = JSON.parse(JSON.stringify(props)) as ISDKConfigProps
        p.api_version = api
        const versions: IVersionInfo = {
          lookerVersion,
          apiVersion: api
        }
        void await logConvert(name, p)
        const oasFile = openApiFileName(name, p)
        // const swaggerFile = specFileName(name, p)
        const apiModel = specFromFile(oasFile)
        const gen = getFormatter(language, apiModel, versions)
        if (!gen) {
          danger(`${language} does not have a code generator defined`)
          continue
        }
        if (api !== lastApi && !gen.supportsMultiApi()) {
          danger(`skipping API ${api} for ${language} because it doesn't support multiple APIs`)
          continue
        }
        log(`generating ${language} from ${props.base_url} ${api}...`)

        sdkPathPrep(gen)
        // Generate standard method declarations
        const sdk = new MethodGenerator(apiModel, gen)
        let output = sdk.render(gen.indentStr)
        writeFile(gen.sdkFileName(`methods`), output)

        if (gen.willItStream) {
          // Generate streaming method declarations
          const s = new StreamGenerator(apiModel, gen)
          let output = s.render(gen.indentStr)
          writeFile(gen.sdkFileName(`streams`), output)
        }

        const types = new TypeGenerator(apiModel, gen)
        output = types.render('')
        writeFile(gen.sdkFileName(`models`), output)
        formatter.versionStamp(gen)
      }
    }
    // finally, reformat all the files that have been generated
    formatter.reformat()
  } catch (e) {
    quit(e)
  }
})()
