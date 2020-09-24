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

import { ApiModel, IMethod, trimInputs } from '@looker/sdk-codegen'
import React, { FC } from 'react'
import { Tab, TabList, TabPanel, TabPanels, useTabs } from '@looker/components'
import { RunItValues } from '../../RunIt'
import { CodeStructure } from '../CodeStructure'
import { getGenerators } from './callUtils'

interface SdkCallsProps {
  /** API spec */
  api: ApiModel
  /** current method */
  method: IMethod
  /** Entered RunIt form values */
  inputs: RunItValues
}

export const SdkCalls: FC<SdkCallsProps> = ({ api, method, inputs }) => {
  const tabs = useTabs()
  const generators = getGenerators(api)
  const trimmed = trimInputs(inputs)
  return (
    <>
      <TabList {...tabs}>
        {Object.keys(generators).map((language) => (
          <Tab key={language}>{language}</Tab>
        ))}
      </TabList>
      <TabPanels {...tabs} pt="0">
        {Object.entries(generators).map(([language, gen]) => {
          const code = gen.makeTheCall(method, trimmed)
          return (
            <TabPanel key={language}>
              <CodeStructure code={code} language={language} />
            </TabPanel>
          )
        })}
      </TabPanels>
    </>
  )
}
