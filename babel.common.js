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
// Despite its name, this module is not specific to webpack or babel-loader.
// It simply builds a cross-platform (i.e. windows-friendly) negative
// lookahead RegExp that will exclude all node modules except those supplied
// as its arguments.
const excludeNodeModuleExcept = require('babel-loader-exclude-node-modules-except')

// Our own modules are built as esm to allow for tree shaking.
const ownModules = [
  '@looker/components-test-utils',
  '@looker/components',
  '@looker/icons',
  '@looker/design-tokens',
  'd3-color',
  'uuid',
]

const excludeNodeModulesExceptRegExp = excludeNodeModuleExcept([...ownModules])

// Attach as a property to the exported function object so that we can
// conveniently import it in webpack.config.js and jest.config.js without
// interfering with babel's string requires.
module.exports.excludeNodeModulesExcept = {
  // RegExp representation for webpack.config.js
  regExp: excludeNodeModulesExceptRegExp,
  // string representation for jest.config.js
  string: excludeNodeModulesExceptRegExp.toString().slice(1, -2),
}
