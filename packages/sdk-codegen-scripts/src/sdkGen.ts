/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

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
import { IVersionInfo } from '@looker/sdk-codegen'
import { logConvertSpec } from './fetchSpec'
import {
  MethodGenerator,
  specFromFile,
  StreamGenerator,
  TypeGenerator,
} from './sdkGenerator'
import { FilesFormatter } from './reformatter'
import { quit } from './nodeUtils'
import { getGenerator } from './languages'
import { prepGen, sdkPathPrep } from './utils'

const formatter = new FilesFormatter()

/**
 * Writes the output file and registers it with the file reformatter for processing
 * @param fileName name of source file
 * @param content contents to (over) write into source file
 * @returns the name of the file written
 */
export const writeFile = (fileName: string, content: string): string => {
  fs.writeFileSync(fileName, content)
  formatter.addFile(fileName)
  return fileName
}
;(async () => {
  const {
    name,
    props,
    languages,
    apis,
    lookerVersion,
    lookerVersions,
    lastApi,
  } = await prepGen()

  try {
    for (const language of languages) {
      for (const api of apis) {
        const p = { ...props }
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
            `skipping API ${api} for ${language} because it doesn't support multiple API versions`
          )
          continue
        }
        log(
          `generating ${language} from ${props.base_url} ${api} (${oasFile})...`
        )

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
