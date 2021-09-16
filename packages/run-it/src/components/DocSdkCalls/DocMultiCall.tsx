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
import React, { FC } from 'react'
import { Tab, TabList, TabPanel, TabPanels, useTabs } from '@looker/components'

import { CodeCopy } from '@looker/code-editor'
import { getGenerators } from './callUtils'
import { DocSdkCallsProps } from './DocSdkCalls'

/**
 * Generates the SDK call syntax for all supported languages
 */
export const DocMultiCall: FC<Omit<DocSdkCallsProps, 'sdkLanguage'>> = ({
  api,
  inputs,
  method,
}) => {
  const tabs = useTabs()
  const generators = getGenerators(api)
  return (
    <>
      <TabList {...tabs}>
        {Object.keys(generators).map((language) => (
          <Tab key={language}>{language}</Tab>
        ))}
      </TabList>
      <TabPanels {...tabs} pt="0">
        {Object.entries(generators).map(([language, gen]) => {
          const code = gen.makeTheCall(method, inputs)
          return (
            <TabPanel key={language}>
              <CodeCopy code={code} language={language} />
            </TabPanel>
          )
        })}
      </TabPanels>
    </>
  )
}
