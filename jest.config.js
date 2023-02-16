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

const { ResizeObserver } = require('resize-observer-polyfill')
const { excludeNodeModulesExcept } = require('./babel.common')

process.env.TZ = 'UTC'

module.exports = {
  automock: false,
  moduleDirectories: ['./node_modules', './packages'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  moduleNameMapper: {
    '@looker/api-explorer/src/utils':
      '<rootDir>/packages/api-explorer/src/utils',
    '@looker/sdk-codegen-utils/src': '<rootDir>/packages/sdk-codegen-utils/src',
    '@looker/((?!components-test-utils|components|design|icons|chatty|i18n)(.+))$':
      '<rootDir>/packages/$1/src',
    '\\.(css)$': '<rootDir>/config/jest/styleMock.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/config/jest/fileMock.js',
  },
  restoreMocks: true,
  setupFilesAfterEnv: [
    // eslint-disable-next-line node/no-path-concat
    `${__dirname}/jest.setup.js`,
    '@testing-library/jest-dom/extend-expect',
    'regenerator-runtime/runtime',
  ],
  setupFiles: ['jest-localstorage-mock'],
  testMatch: ['**/?(*.)(spec|test).(ts|js)?(x)'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'ts-jest',
  },
  transformIgnorePatterns: [excludeNodeModulesExcept.string],
  testPathIgnorePatterns: ['packages/.*?/lib'],
  testEnvironment: require.resolve('jest-environment-jsdom'),
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
  globals: {
    'ts-jest': {
      isolatedModules: true,
      diagnostics: false,
    },
  },
}

globalThis.ResizeObserver = ResizeObserver
