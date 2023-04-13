/*

 MIT License

 Copyright (c) 2023 Looker Data Sciences, Inc.

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
import path from 'path'
import * as fs from 'fs'
import { environmentPrefix } from '@looker/sdk'
import { NodeSession, NodeSettingsIniFile } from '@looker/sdk-node'

const homeToRoost = '../../../../'

export const getRootPath = () => path.join(__dirname, homeToRoost)
export const rootFile = (fileName = '') => path.join(getRootPath(), fileName)
const localIni = process.env.LOOKERSDK_INI || rootFile('looker.ini')

const settings = new NodeSettingsIniFile(environmentPrefix, localIni, 'Looker')
export const session = new NodeSession(settings)

export const timeout = 3600000 // 1 hr

interface ITestConfig {
  testData: any
}

export const TestConfig = (): ITestConfig => {
  const testFile = 'data.yml.json'
  const testPath = rootFile('test/')
  const dataFile = `${testPath}${testFile}`
  const testData = JSON.parse(fs.readFileSync(dataFile, 'utf-8'))
  return {
    testData,
  }
}
