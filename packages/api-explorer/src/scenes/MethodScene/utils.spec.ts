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

import { api } from '../../test-data'
import { createInputs } from './utils'

describe('MethodScene utils', () => {
  describe('run-it utils', () => {
    test('createInputs works with various param types', () => {
      const method = api.methods.run_inline_query
      const actual = createInputs(api, method)
      expect(actual).toHaveLength(method.allParams.length)

      expect(actual).toEqual(
        expect.arrayContaining([
          /** Boolean param */
          {
            name: 'cache',
            location: 'query',
            type: 'boolean',
            required: false,
            description: 'Get results from cache if available.',
          },
          /** Number param */
          {
            name: 'limit',
            location: 'query',
            type: 'int64',
            required: false,
            description: expect.any(String),
          },
          /** String param */
          {
            name: 'result_format',
            location: 'path',
            type: 'string',
            required: true,
            description: 'Format of result',
          },
          /** Body param */
          {
            name: 'body',
            location: 'body',
            type: expect.objectContaining({
              model: '',
              view: '',
              fields: [],
              pivots: [],
              fill_fields: [],
              filters: {},
              filter_expression: '',
              sorts: [],
              limit: '',
              column_limit: '',
              total: false,
              row_total: '',
              subtotals: [],
              vis_config: {},
              filter_config: {},
              visible_ui_sections: '',
              dynamic_fields: '',
              client_id: '',
              query_timezone: '',
            }),
            required: true,
            description: '',
          },
        ])
      )
    })
  })
})
