/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import * as Models from "./sdkModels"
import {PythonFormatter} from "./python.fmt"

const apiModel = Models.ApiModel.fromFile('./Looker.3.1.oas.json')

const fmt = new PythonFormatter()
const indent = ''

describe('python formatter', () => {
    describe('parameter declarations', () => {
        it ('required parameter', () => {
            const param = apiModel.methods['run_query'].params[0]
            const actual =  fmt.declareParameter(indent, param)
            expect(actual).toEqual("# Id of query\nquery_id: int")
        })
        it ('optional parameter', () => {
            const param = apiModel.methods['run_query'].params[2]
            const actual =  fmt.declareParameter(indent, param)
            expect(actual).toEqual("# Row limit (may override the limit in the saved query).\n" +
                "limit: int = 0")
        })
        it ('required typed parameter', () => {
            const param = apiModel.methods['create_query'].params[0]
            const actual =  fmt.declareParameter(indent, param)
            expect(actual).toEqual(`# Requested fields.\nfields: str = ""`)
        })
    })

    describe('args locations', () => {
        it ('path and query args', () => {
            const method = apiModel.methods['run_query']
            expect(method.pathArgs).toEqual(['query_id','result_format'])
            expect(method.bodyArg).toEqual('')
            expect(method.queryArgs).toEqual([
                "limit",
                "apply_formatting",
                "apply_vis",
                "cache",
                "image_width",
                "image_height",
                "generate_drill_links",
                "force_production",
                "cache_only",
                "path_prefix",
                "rebuild_pdts",
                "server_table_calcs",
                ])
            expect(method.headerArgs).toEqual([])
            expect(method.cookieArgs).toEqual([])
        })
        it ('body for create_query', () => {
            // TODO get resolution working correctly
            const method = apiModel.methods['create_query']
            expect(method.pathArgs).toEqual([])
            const body = method.getParams('body')
            expect(body.length).toEqual(1)
            expect(body[0].type.name).toEqual('Query')
            expect(method.bodyArg).toEqual("body")
            expect(method.queryArgs).toEqual(["fields"])
            expect(method.headerArgs).toEqual([])
            expect(method.cookieArgs).toEqual([])
        })
        it ('body for create_dashboard', () => {
          // TODO get resolution working correctly
          const method = apiModel.methods['create_dashboard']
          expect(method.pathArgs).toEqual([])
          const body = method.getParams('body')
          expect(body.length).toEqual(1)
          expect(body[0].type.name).toEqual('Dashboard')
          expect(method.bodyArg).toEqual("body")
          expect(method.queryArgs).toEqual([])
          expect(method.headerArgs).toEqual([])
          expect(method.cookieArgs).toEqual([])
      })
    })

    describe('httpArgs', () => {
      it ('add_group_group', () => {
          const method = apiModel.methods['add_group_group']
          const args = fmt.httpArgs('', method).trim()
          expect(args).toEqual("{'group_id': group_id}, None, body")
      })
      it ('create_query', () => {
          // TODO get resolution working correctly
          const method = apiModel.methods['create_query']
          const args = fmt.httpArgs('', method).trim()
          expect(args).toEqual("None, \n{'fields': fields}, body")
      })
      it ('create_dashboard', () => {
        // TODO get resolution working correctly
        const method = apiModel.methods['create_dashboard']
        const args = fmt.httpArgs('', method).trim()
        expect(args).toEqual("None, None, body")
      })
  })

  describe('type creation', () => {
        it ('with arrays and hashes', () => {
            const type = apiModel.types['Workspace']
            const actual =  fmt.declareType(indent, type)
            expect(actual).toEqual("# Id of query\nquery_id: long")
        })
        it ('with refs, arrays and nullable', () => {
            const type = apiModel.types['ApiVersion']
            const actual =  fmt.declareType(indent, type)
            expect(actual).toEqual("# Id of query\nquery_id: long")
        })
    })
})
