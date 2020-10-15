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

import React, { FC, useState, useEffect } from 'react'
import {
  Box,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  useTabs,
} from '@looker/components'
import { IMethod, IType, ApiModel } from '@looker/sdk-codegen'

import { getGenerators } from '@looker/run-it'
import { DocCode } from '../DocCode'
import { CollapserCard } from '../Collapser'
import { noComment } from './utils'

interface LanguageSDKProps {
  /** API spec */
  api: ApiModel
  /** An SDK method */
  method?: IMethod
  /** An SDK type */
  type?: IType
}

/**
 * Given a method or a type, it renders its SDK declaration in all supported languages.
 */
export const DocSDKs: FC<LanguageSDKProps> = ({ api, method, type }) => {
  const tabs = useTabs()
  const generators = getGenerators(api)
  const [item, setItem] = useState(method ? noComment(method) : type!)

  useEffect(() => {
    setItem(method ? noComment(method) : type!)
  }, [method, type])

  return (
    <Box mb="xlarge">
      <CollapserCard heading="SDK declarations">
        <>
          <TabList {...tabs}>
            {Object.keys(generators).map((language) => (
              <Tab key={language}>{language}</Tab>
            ))}
          </TabList>
          <TabPanels {...tabs} pt="0">
            {Object.entries(generators).map(([language, gen]) => {
              const code = method
                ? gen.declareMethod('', item as IMethod)
                : gen.declareType('', item as IType)
              return (
                <TabPanel key={language}>
                  <DocCode language={language} code={code} />
                </TabPanel>
              )
            })}
          </TabPanels>
        </>
      </CollapserCard>
    </Box>
  )
}
