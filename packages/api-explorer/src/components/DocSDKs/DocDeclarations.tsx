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
import { Tab, TabList, TabPanel, TabPanels, useTabs } from '@looker/components'
import type { KeyedCollection } from '@looker/sdk-codegen'
import type { FC } from 'react'
import React from 'react'
import { DocCode } from '../DocCode'

interface DocDeclarationsProps {
  declarations: KeyedCollection<string>
}

/**
 * Renders all provided declarations
 * @param declarations A collection of SDK declarations in various languages
 */
export const DocDeclarations: FC<DocDeclarationsProps> = ({ declarations }) => {
  const tabs = useTabs()

  return (
    <>
      <TabList {...tabs}>
        {Object.keys(declarations).map((language) => (
          <Tab key={language}>{language}</Tab>
        ))}
      </TabList>
      <TabPanels {...tabs} pt="0">
        {Object.entries(declarations).map(([language, code]) => (
          <TabPanel key={language}>
            <DocCode language={language} code={code} />
          </TabPanel>
        ))}
      </TabPanels>
    </>
  )
}
