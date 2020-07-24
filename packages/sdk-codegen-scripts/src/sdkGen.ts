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

import * as fs from 'fs'
import { danger, log } from '@looker/sdk-codegen-utils'
import { IVersionInfo, ICodeGen, codeGenerators } from '@looker/sdk-codegen'
import { ISDKConfigProps, SDKConfig } from './sdkConfig'
import {
  fetchLookerVersion,
  fetchLookerVersions,
  logConvertSpec,
} from './fetchSpec'
import {
  MethodGenerator,
  specFromFile,
  StreamGenerator,
  TypeGenerator,
} from './sdkGenerator'
import { FilesFormatter } from './reformatter'
import { isDirSync, quit } from './nodeUtils'
import { getGenerator } from './languages'

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
  if (!isDirSync(path)) fs.mkdirSync(path, { recursive: true })
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
  const args = process.argv.slice(2)
  let languages = codeGenerators
    .filter((l) => l.factory !== undefined)
    .map((l) => l.language)
  if (args.length > 0) {
    if (args.toString().toLowerCase() !== 'all') {
      languages = []
      for (const arg of args) {
        const values = arg.toString().split(',')
        values.forEach((v) => (v.trim() ? languages.push(v.trim()) : null))
      }
    }
  }

  try {
    const config = SDKConfig()
    for (const language of languages) {
      const [name, props] = Object.entries(config)[0]
      let lookerVersions = {}
      let lookerVersion = ''
      try {
        lookerVersions = await fetchLookerVersions(props)
        lookerVersion = await fetchLookerVersion(props, lookerVersions)
      } catch {
        // Looker server may not be required, so default things for the generator
        lookerVersions = {
          supported_versions: [
            {
              version: '3.1',
              swagger_url: `https://${props.base_url}/api/3.1/swagger.json`,
            },
            {
              version: '4.0',
              swagger_url: `https://${props.base_url}/api/4.0/swagger.json`,
            },
          ],
        }
        lookerVersion = ''
      }
      // Iterate through all specified API versions
      const apis = apiVersions(props)
      const lastApi = apis[apis.length - 1]
      for (const api of apis) {
        const p = JSON.parse(JSON.stringify(props)) as ISDKConfigProps
        p.api_version = api
        const versions: IVersionInfo = {
          apiVersion: api,
          lookerVersion,
        }
        const oasFile = await logConvertSpec(name, p, lookerVersions)
        log(`Using specification ${oasFile} for code generation`)
        const apiModel = specFromFile(oasFile)
        const gen = getGenerator(language, apiModel, versions)
        if (!gen) {
          danger(`${language} does not have a code generator defined`)
          continue
        }
        if (api !== lastApi && !gen.supportsMultiApi()) {
          danger(
            `skipping API ${api} for ${language} because it doesn't support multiple APIs`
          )
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
          const output = s.render(gen.indentStr)
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
