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

const { excludeNodeModulesExcept } = require('./babel.common');

process.env.TZ = 'UTC';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
if (!global.AbortSignal.timeout) {
  global.AbortSignal.timeout = ms => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(new DOMException('TimeoutError')), ms);
    return controller.signal;
  };
}

function anyAbortInAStorm(signals) {
  const controller = new AbortController();

  function onAbort(signal) {
    controller.abort(signal.reason);
    // Remove the event listeners once aborted to avoid memory leaks
    signals.forEach(signal => signal.removeEventListener('abort', onAbort));
  }

  signals.forEach(signal => {
    if (signal.aborted) {
      onAbort(signal);
    } else {
      signal.addEventListener('abort', onAbort);
    }
  });

  return controller.signal;
}

if (!global.AbortSignal.any) {
  global.AbortSignal.any = signals => anyAbortInAStorm(signals);
}

module.exports = {
  automock: false,
  moduleDirectories: ['./node_modules', './packages'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  moduleNameMapper: {
    '@looker/api-explorer/src/utils':
      '<rootDir>/packages/api-explorer/src/utils',
    '@looker/sdk-codegen-utils/src': '<rootDir>/packages/sdk-codegen-utils/src',
    '@looker/((?!components-test-utils|components|design|icons|chatty|i18n|redux)(.+))$':
      '<rootDir>/packages/$1/src',
    '\\.(css)$': '<rootDir>/config/jest/styleMock.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/config/jest/fileMock.js',
  },
  restoreMocks: true,
  setupFilesAfterEnv: [
    // eslint-disable-next-line node/no-path-concat
    `${__dirname}/jest.setup.js`,
    '@testing-library/jest-dom',
    'regenerator-runtime/runtime',
  ],
  setupFiles: ['jest-localstorage-mock'],
  testMatch: ['**/?(*.)(spec|test).(ts|js)?(x)'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [excludeNodeModulesExcept.string],
  testPathIgnorePatterns: ['packages/.*?/lib'],
  testEnvironment: require.resolve('jest-environment-jsdom'),
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
  globals: {
    fetch: global.fetch,
    AbortController: global.AbortController,
    AbortSignal: global.AbortSignal,
    'ts-jest': {
      isolatedModules: true,
      diagnostics: false,
    },
  },
};
