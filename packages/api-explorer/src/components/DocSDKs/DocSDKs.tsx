/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2020 Looker Data Sciences, Inc.
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

import React from 'react'
import {
  Box,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  useTabs,
} from '@looker/components'
import {
  PythonGen,
  TypescriptGen,
  KotlinGen,
  SwiftGen,
  IMethod,
  IType,
  ApiModel,
} from '@looker/sdk-codegen'

import { DocCode } from '../DocCode'
import { noComment } from './utils'

interface LanguageSDKProps {
  api: ApiModel
  method?: IMethod
  type?: IType
}

export const DocSDKs: React.FC<LanguageSDKProps> = ({ api, method, type }) => {
  const tabs = useTabs()
  const generators = {
    Kotlin: new KotlinGen(api),
    Python: new PythonGen(api),
    Swift: new SwiftGen(api),
    Typescript: new TypescriptGen(api),
  }

  const languageKey = () => (method ? method.name : type!.name)

  return (
    <Box pt="large">
      <Heading as="h3" color="palette.charcoal700" mb="large">
        Language SDK declarations
      </Heading>
      <TabList {...tabs}>
        {Object.keys(generators).map((language) => (
          <Tab key={`${languageKey()}.${language}`}>{language}</Tab>
        ))}
      </TabList>
      <TabPanels {...tabs}>
        {Object.entries(generators).map(([language, gen]) => {
          const code = method
            ? gen.declareMethod('', noComment(api, method))
            : gen.declareType('', type!)
          return (
            <TabPanel key={`${languageKey()}.${language}`}>
              <DocCode language={language} code={code} />
            </TabPanel>
          )
        })}
      </TabPanels>
    </Box>
  )
}
