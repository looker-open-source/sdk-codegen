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
import React, { FC, useEffect } from 'react'
import { ExtensionProvider } from '@looker/extension-sdk-react'
import { Text, ComponentsProvider } from '@looker/components'
import { hot } from 'react-hot-loader/root'

import { IProject } from '@looker/hackathon'
// Projects
const projects: IProject = [
  {
    registration_id: 1,
    title: 'Project1',
    description: 'Some project description',
    date_created: new Date(),
    project_type: 'API',
    contestant: true,
    locked: true,
  },
]

export const App: FC = hot(() => {
  return (
    <ExtensionProvider>
      <ComponentsProvider>
        <Text>Just some text</Text>
      </ComponentsProvider>
    </ExtensionProvider>
  )
})
