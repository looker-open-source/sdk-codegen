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

module.exports = (api) => {
  const isTest = api.env('test')
  api.cache(true)

  const testIgnore = [
    '**/*.test.js',
    '**/*.test.jsx',
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/*.spec.js',
    '**/*.spec.jsx',
    '**/*.spec.ts',
    '**/*.spec.tsx',
  ]

  const ignore = isTest ? [] : ['node_modules', ...testIgnore]

  return {
    sourceType: 'unambiguous',
    env: {
      build: {
        ignore: [
          '**/*.d.ts',
          '__snapshots__',
          // '__tests__',
          // '**/testUtils',
          // '**/test-data',
          // ...testIgnore,
        ],
      },
    },
    ignore,
    plugins: [
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-object-rest-spread',
      'babel-plugin-styled-components',
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-nullish-coalescing-operator',
    ],

    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            esmodules: true,
          },
          useBuiltIns: false,
          modules: process.env.BABEL_ENV === 'build_cjs' ? 'auto' : false,
        },
      ],
      [
        '@babel/preset-react',
        {
          development: !(
            process.env.BABEL_ENV === 'build' ||
            process.env.BABEL_ENV === 'build_cjs'
          ),
        },
      ],
      '@babel/preset-typescript',
    ],
  }
}
