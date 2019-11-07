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
import * as Models from './sdkModels'
import { SDKConfig } from './sdkConfig'
import { danger, isDirSync, log, quit, success } from './utils'
import { getVersionInfo, openApiFileName, specFileName } from './fetchSpec'
import { MethodGenerator, StreamGenerator, TypeGenerator } from './sdkGenerator'
import { getFormatter, Languages } from './languages'
import { logConvert } from './convert'
import { IVersionInfo } from './codeGen'

// tslint:disable-next-line: no-floating-promises
(async () => {
  let args = process.argv.slice(2)
  let languages = Languages
    .filter(l => l.factory !== undefined)
    .map(l => l.language)
  if (args.length > 0) {
    if (args.toString().toLowerCase() !== 'all') {
      languages = []
      for (let arg of args) {
        const values = arg.toString().split(',')
        values.forEach(v => v.trim() ? languages.push(v.trim()) : null)
      }
    }
  }

  try {
    const config = SDKConfig()
    let versions: IVersionInfo | undefined
    for (let language of languages) {
      log(`generating ${language} ...`)
      for (let [name, props] of Object.entries(config)) {
        await logConvert(name, props)
        if (!versions) {
          versions = await getVersionInfo(props)
        }
        const oasFile = openApiFileName(name, props)
        const swaggerFile = specFileName(name, props)
        const apiModel = Models.ApiModel.fromFile(oasFile, swaggerFile)
        const gen = getFormatter(language, apiModel, versions)
        if (!gen) {
          danger(`${language} does not have a code generator defined`)
          continue
        }
        const sdkPath = `${gen.codePath}/${gen.packagePath}/sdk`
        if (!isDirSync(sdkPath)) fs.mkdirSync(sdkPath, {recursive: true})
        // Generate standard method declarations
        const sdk = new MethodGenerator(apiModel, gen)
        let output = sdk.render(gen.indentStr)
        fs.writeFileSync(gen.fileName('sdk/methods'), output)

        if (gen.willItStream) {
          // Generate streaming method declarations
          const s = new StreamGenerator(apiModel, gen)
          let output = s.render(gen.indentStr)
          fs.writeFileSync(gen.fileName('sdk/streams'), output)
        }

        const types = new TypeGenerator(apiModel, gen)
        output = types.render('')
        fs.writeFileSync(gen.fileName('sdk/models'), output)
        const reformatted = gen.reformat()
        if (reformatted.length > 0) {
          success(`reformatted ${reformatted.join(',')}`)
        }
        gen.versionStamp()
        break
      }
    }
  } catch (e) {
    quit(e)
  }
})()
