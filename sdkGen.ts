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
import { log, quit } from './utils'
import {openApiFileName} from "./fetchSpec"
import {SdkGenerator, TypeGenerator} from "./sdkGenerator"
import { getFormatter, TargetLanguages } from './targetLanguages'
import { logConvert } from './convert'

// tslint:disable-next-line: no-floating-promises
(async () => {
  let args = process.argv.slice(2)
  let languages = TargetLanguages.map(l => l.language)
  if (args.length > 0) {
    if (args.toString().toLowerCase() !== "all") {
      languages = []
      for (let arg of args) {
        const values = arg.toString().split(',')
        values.forEach(v => v.trim() ? languages.push(v.trim()) : null)
      }
    }
  }

  try {
    const config = SDKConfig()
    for (let language of languages) {
      log(`generating ${language} ...`)
      for (let [name, props] of Object.entries(config) ) {
        await logConvert(name, props)
        const oasFile = openApiFileName(name, props)
        const apiModel = Models.ApiModel.fromFile(oasFile)
        const formatter = getFormatter(language, apiModel)
        const sdkPath = `${formatter.codePath}/${formatter.package}/sdk`
        if (!fs.existsSync(sdkPath)) fs.mkdirSync(sdkPath, { recursive: true })
        const types = new TypeGenerator(apiModel, formatter)
        let output = types.render('')
        fs.writeFileSync(formatter.fileName('sdk/models'), output)
        const sdk = new SdkGenerator(apiModel, formatter)
        output = sdk.render(formatter.indentStr)
        fs.writeFileSync(formatter.fileName('sdk/methods'), output)
        break
      }
    }
  } catch (e) {
    quit(e)
  }
})()
