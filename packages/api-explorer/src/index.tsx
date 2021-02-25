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

import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import ReactDOM from 'react-dom'

import { ApiModel } from '@looker/sdk-codegen'
import { SpecItems } from './ApiExplorer'
import { StandaloneApiExplorer } from './StandaloneApiExplorer'

export const specs: SpecItems = {
  '3.1': {
    status: 'current',
    specURL: 'https://self-signed.looker.com:19999/api/3.1/swagger.json',
    specContent: require('../../../spec/Looker.3.1.oas.json'),
  },
  '4.0': {
    status: 'experimental',
    isDefault: true,
    specURL: 'https://self-signed.looker.com:19999/api/4.0/swagger.json',
    specContent: require('../../../spec/Looker.4.0.oas.json'),
  },
}

// TODO implement fetching and compiling the spec on demand
Object.values(specs).forEach((spec) => {
  if (spec.specContent && !spec.api) {
    const json =
      typeof spec.specContent === 'string'
        ? JSON.parse(spec.specContent)
        : spec.specContent
    spec.api = ApiModel.fromJson(json)
  }
  // Memory footprint reduction
  spec.specContent = undefined
})

ReactDOM.render(
  <Router>
    <StandaloneApiExplorer specs={specs} />
  </Router>,
  document.getElementById('container')
)
