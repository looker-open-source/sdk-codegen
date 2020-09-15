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

import path from 'path'
import { CodeMiner, getAllFiles, getCodeFiles, Miner, SDKCalls } from './miner'

describe('miner', () => {
  const sourcePath = path.join(__dirname, '/../../../examples')
  const exampleFile = (fileName: string) => path.join(sourcePath, '/', fileName)

  describe('gets files', () => {
    it('all files', () => {
      const actual = getAllFiles(sourcePath)
      expect(actual.length).toBeGreaterThan(0)
    })

    it('code files', () => {
      const actual = getCodeFiles(sourcePath)
      expect(actual.length).toBeGreaterThan(0)
    })
  })

  describe('CodeMiner', () => {
    const coder = new CodeMiner()
    const probe = (code: string, expected: SDKCalls) => {
      expect(coder.mineCode(code)).toEqual(expected)
    }

    it('is empty for no sdk calls', () => {
      probe('', [])
      probe('one() two() three()', [])
      probe('foo.one() bar.two() boo.three()', [])
      probe('foo.one()\nbar.two()\nboo.three()', [])
    })

    it('finds ts calls', () => {
      probe(`const value = await sdk.ok(sdk.me())`, [
        { sdk: 'sdk', operationId: 'ok', line: 1, column: 20 },
        { sdk: 'sdk', operationId: 'me', line: 1, column: 27 },
      ])
    })

    it('finds kotlin calls', () => {
      probe(`val look = sdk.ok<Look>(sdk.create_look(WriteLookWithQuery(`, [
        { sdk: 'sdk', operationId: 'ok', line: 1, column: 11 },
        { sdk: 'sdk', operationId: 'create_look', line: 1, column: 24 },
      ])
    })

    it('ignores comments', () => {
      probe(
        `// this is a code comment sdk.comment()\nconst value = await coreSDK.ok(coreSDK.me())`,
        [
          { sdk: 'coreSDK', operationId: 'ok', line: 2, column: 20 },
          { sdk: 'coreSDK', operationId: 'me', line: 2, column: 33 },
        ]
      )
    })

    it('mines a python file', () => {
      const fileName = exampleFile('python/run_look_with_filters.py')
      const actual = coder.mineFile(fileName)
      expect(actual.length).toBeGreaterThan(0)
    })

    it('mines a ruby file', () => {
      const fileName = exampleFile('ruby/delete_unused_content.rb')
      const actual = coder.mineFile(fileName)
      expect(actual.length).toBeGreaterThan(0)
    })

    it('mines a swift file', () => {
      const fileName = exampleFile(
        'swift/sample-swift-sdk/sample-swift-sdk/Dashboards.swift'
      )
      const actual = coder.mineFile(fileName)
      expect(actual.length).toBeGreaterThan(0)
    })

    it('mines a typescript file', () => {
      const fileName = exampleFile('typescript/utils.ts')
      const actual = coder.mineFile(fileName)
      expect(actual.length).toBeGreaterThan(0)
    })
  })

  describe('Miner', () => {
    it('processes', () => {
      const miner = new Miner(sourcePath)
      const actual = miner.motherLode
      expect(actual).toBeDefined()
      expect(actual.commitHash).toBeDefined()
      expect(Object.entries(actual.nuggets).length).toBeGreaterThan(50)
    })
  })
})
