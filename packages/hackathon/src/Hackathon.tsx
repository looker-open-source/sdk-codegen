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
import React, { FC, useContext } from 'react'
import { Route, Switch } from 'react-router-dom'
import {
  ExtensionContext,
  ExtensionContextData,
} from '@looker/extension-sdk-react'
// import { ProjectsScene } from './scenes'
import { SheetData } from './models/SheetData'
import { HomeScene } from './scenes/HomeScene/HomeScene'

// TODO sheetData will NOT be passed down as a property
interface HackathonProps {
  sheetData: SheetData
}

export const Hackathon: FC<HackathonProps> = ({ sheetData }) => {
  // TODO the extensionSDK will be passed to wholly sheets which will do a
  // bunch of setup
  // 1. verify user attributes have been defined
  // 2. Get an access token from the access token server
  // 3. Get the sheets data.
  const { extensionSDK } = useContext<ExtensionContextData>(ExtensionContext)
  // TODO remove this. My OCD put it in because I did not want to see a warning
  console.log(extensionSDK.lookerHostData)
  return (
    <Switch>
      {/*  <Route path="/projects" exact> */}
      {/*    {sheetData && <ProjectsScene projects={sheetData.projects} />} */}
      {/*  </Route> */}
      <Route exact>
        <HomeScene sheetData={sheetData} />
      </Route>
    </Switch>
  )
}
