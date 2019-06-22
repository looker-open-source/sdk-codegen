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
import {Method} from "./codeFormatter"

const model: Models.IApi = {
    methods: [
        {
            httpMethod: "get",
            endpoint: "queries/{id}/run",
            description:"run a query",
            summary: "run query",
            operationId: "run_query",
            type: { name: "string" },
            params: [
                {
                    name: "query_id",
                    description: "id of query to run",
                    type: { name: "integer"},
                    location: 'path',
                    required: true,
                },
                {
                    name: "limit",
                    type: { name: "integer"},
                    location: 'query',
                },
            ],
        },
        {
            httpMethod: "post",
            endpoint: "queries/run/inline",
            description: "run inline query",
            summary: "inline query",
            operationId: "run_inline_query",
            type: { name: "string" },
            params: [
                {
                    name: "query",
                    description:"query to create",
                    type: { name: "CreateQuery" },
                    required: true,
                    location: 'body'
                },
            ],
        }]
}

const python = new PythonFormatter()
const indent = ''

describe('python formatter', () => {
    describe('parameter declarations', () => {
        it ('required parameter', () => {
            const param = model.methods[0].params![0]
            const actual =  python.declareParameter(indent, param)
            expect(actual).toEqual("# id of query to run\nquery_id: int")
        })
        it ('optional parameter', () => {
            const param = model.methods![0].params![1]
            const actual =  python.declareParameter(indent, param)
            expect(actual).toEqual("limit: int = None")
        })
        it ('required typed parameter', () => {
            const param = model.methods![1].params![0]
            const actual =  python.declareParameter(indent, param)
            expect(actual).toEqual("# query to create\nquery: CreateQuery")
        })
    })

    describe('args locations', () => {
        it ('path and query args', () => {
            const method = new Method(model.methods[0])
            expect(method.pathArgs).toEqual(['query_id'])
            expect(method.bodyArg).toEqual('')
            expect(method.queryArgs).toEqual(['limit'])
            expect(method.headerArgs).toEqual([])
            expect(method.cookieArgs).toEqual([])
        })
        it ('body', () => {
            const method = new Method(model.methods[1])
            expect(method.pathArgs).toEqual([])
            expect(method.bodyArg).toEqual('query')
            expect(method.queryArgs).toEqual([])
            expect(method.headerArgs).toEqual([])
            expect(method.cookieArgs).toEqual([])
        })
    })
})
