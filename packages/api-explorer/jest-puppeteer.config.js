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

const base = require('../../jest.config');
module.exports = {
  ...base,
  rootDir: '../..',
  preset: 'jest-puppeteer',
  setupFilesAfterEnv: ['expect-puppeteer'],
  launch: {
    // `headless:false` and `slowMo:250` can be useful for "test-watch" usage
    headless: true,
    // slowMo: 250,

    // Other launch settings constant for both dev and testing usage
    args: ['--ignore-certificate-errors'],
    product: 'chrome',
    devtools: true,
    defaultViewport: {
      // override default 800x600 pixel browser setting
      width: 1024,
      height: 768,
    },
  },
  browserContext: 'default',
  server: {
    command: 'yarn develop',
    port: 8080,
    launchTimeout: 50000,
  },
};
