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
import { RunItInput } from '../RunIt'
import { testJsonResponse } from '../test-data'
import { StandaloneConfigurator } from '../components/ConfigForm/configUtils'
import { createRequestParams, pathify, runRequest } from './requestUtils'
import { initRunItSdk } from './RunItSDK'

const sdk = initRunItSdk(new StandaloneConfigurator())

describe('requestUtils', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('pathify', () => {
    test('it returns unchanged path if no path params are specified', () => {
      const actual = pathify('/logout')
      expect(actual).toEqual('/logout')
    })

    test('it works path params', () => {
      const pathParams = {
        query_id: 1,
        result_format: 'json',
      }
      const actual = pathify(
        '/queries/{query_id}/run/{result_format}',
        pathParams
      )
      expect(actual).toEqual('/queries/1/run/json')
    })
  })

  describe('createRequestParams', () => {
    const inputs: RunItInput[] = [
      {
        name: 'result_format',
        location: 'path',
        type: 'string',
        required: true,
        description: 'Format of result',
      },
      {
        name: 'cache',
        location: 'query',
        type: 'boolean',
        required: false,
        description: 'Get results from cache if available',
      },
      {
        name: 'body',
        location: 'body',
        type: {
          model: 'string',
          view: 'string',
          fields: ['string'],
          limit: 'string',
        },
        description: 'body',
        required: true,
      },
    ]
    const requestContent = {
      result_format: 'json',
      cache: true,
      body: JSON.stringify({
        model: 'thelook',
        view: 'orders',
        fields: ['orders.created_date', 'orders.count'],
        limit: '500',
      }),
    }

    test('it correctly identifies requestContent params location', () => {
      const [pathParams, queryParams, body] = createRequestParams(
        inputs,
        requestContent
      )
      expect(pathParams).toEqual({
        result_format: requestContent.result_format,
      })
      expect(queryParams).toEqual({
        cache: requestContent.cache,
      })
      expect(body).toEqual(JSON.parse(requestContent.body))
    })

    test('non JSON parsable strings are treated as x-www-form-urlencoded strings', () => {
      const urlParams = 'key1=value1&key2=value2'
      const [, , body] = createRequestParams(
        [
          {
            name: 'body',
            type: 'string',
            required: true,
            description: 'x-www-form-urlencoded data',
            location: 'body',
          },
        ],
        {
          body: urlParams,
        }
      )
      expect(body).toEqual(urlParams)
    })
  })

  describe('defaultRunItCallback', () => {
    test('it makes a request', async () => {
      const spy = jest
        .spyOn(sdk.authSession.transport, 'rawRequest')
        .mockResolvedValueOnce(testJsonResponse)
      jest.spyOn(sdk.authSession, 'isAuthenticated').mockReturnValue(true)

      const resp = await runRequest(
        sdk,
        '/api/3.1',
        'POST',
        '/queries/run/{result_format}',
        { result_format: 'json' },
        { fields: 'first_name, last_name' },
        { model: 'thelook', view: 'orders', fields: ['orders.count'] }
      )

      expect(spy).toHaveBeenCalledWith(
        'POST',
        '/api/3.1/queries/run/json',
        {
          fields: 'first_name, last_name',
        },
        {
          fields: ['orders.count'],
          model: 'thelook',
          view: 'orders',
        },
        expect.any(Function)
      )
      expect(resp).toEqual(testJsonResponse)
    })
  })
})
