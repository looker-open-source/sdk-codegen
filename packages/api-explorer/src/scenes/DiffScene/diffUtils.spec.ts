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

import type { DiffRow } from '@looker/sdk-codegen'
import { startCount } from '@looker/sdk-codegen'
import { api, api40, getLoadedSpecs } from '../../test-data'
import {
  diffToSpec,
  getValidDiffMethods,
  getValidDiffOptions,
  standardDiffToggles,
} from './diffUtils'

describe('diffUtils', () => {
  test('builds a psuedo spec from diff', () => {
    const delta: DiffRow[] = [
      {
        name: 'create_query',
        id: 'POST /create_query',
        diffCount: startCount(),
        bodyDiff: '',
        typeDiff: '',
        lStatus: 'stable',
        rStatus: 'beta',
        paramsDiff: '',
        responseDiff: '',
      },
      {
        name: 'search_dashboards',
        id: 'Get /search_dashboards',
        diffCount: startCount(),
        bodyDiff: '',
        typeDiff: '',
        lStatus: 'stable',
        rStatus: 'beta',
        paramsDiff: '',
        responseDiff: '',
      },
    ]
    const spec = diffToSpec(delta, api, api40)
    expect(Object.keys(spec.methods)).toEqual([
      'create_query',
      'search_dashboards',
    ])
    expect(Object.keys(spec.tags)).toEqual(['Query', 'Dashboard'])
    expect(Object.keys(spec.types)).toEqual([])
  })

  describe('getValidDiffOptions', () => {
    test('returns null if provided null input', () => {
      expect(getValidDiffOptions(null)).toBeNull()
    })

    test('returns null if input contains no valid diffscene options', () => {
      const testOptionsParam = 'INVALID,INVALID1,INVALID2'
      expect(getValidDiffOptions(testOptionsParam)).toBeNull()
    })

    test('omits invalid diffScene options given input with valid options', () => {
      const testOptionsParam = 'INVALID,missing,INVALID,type,INVALID'
      expect(getValidDiffOptions(testOptionsParam)).toEqual(['missing', 'type'])
    })

    test('omits duplicate diffScene options from input', () => {
      const testOptionsParam = 'missing,missing,type,type,type'
      expect(getValidDiffOptions(testOptionsParam)).toEqual(['missing', 'type'])
    })

    test('disregards case sensitivity of options', () => {
      const testOptionsParam = 'mIssInG,tYpE,PARAMS,boDy'
      expect(getValidDiffOptions(testOptionsParam)).toEqual([
        'missing',
        'type',
        'params',
        'body',
      ])
    })
  })

  describe('getValidDiffMethods', () => {
    const specs = getLoadedSpecs()
    const leftApi = specs['3.1'].api!
    const rightApi = specs['4.0'].api!
    test('returns null if provided null input', () => {
      expect(
        getValidDiffMethods(leftApi, rightApi, standardDiffToggles, null)
      ).toBeNull()
    })

    test('returns null if method is not in list of diffs', () => {
      expect(
        getValidDiffMethods(
          leftApi,
          rightApi,
          standardDiffToggles,
          'NOT_IN_LIST'
        )
      ).toBeNull()
    })

    test('returns method if it exists in list of diffs', () => {
      expect(
        getValidDiffMethods(
          leftApi,
          rightApi,
          standardDiffToggles,
          'delete_alert'
        )
      ).toEqual(['delete_alert'])
    })

    test('returns list of methods if they exist in list of diffs', () => {
      expect(
        getValidDiffMethods(
          leftApi,
          rightApi,
          standardDiffToggles,
          'delete_alert,delete_board_item,delete_board_section'
        )
      ).toEqual(['delete_alert', 'delete_board_item', 'delete_board_section'])
    })

    test('ignores case sensitivity of input methods', () => {
      expect(
        getValidDiffMethods(
          leftApi,
          rightApi,
          standardDiffToggles,
          'deLetE_AlErT,delEtE_bOarD_item,dEleTe_bOard_section'
        )
      ).toEqual(['delete_alert', 'delete_board_item', 'delete_board_section'])
    })

    test('omits invalid methods from output', () => {
      expect(
        getValidDiffMethods(
          leftApi,
          rightApi,
          standardDiffToggles,
          'delete_alert,INVALID_METHOD,delete_board_section'
        )
      ).toEqual(['delete_alert', 'delete_board_section'])
    })
  })
})
