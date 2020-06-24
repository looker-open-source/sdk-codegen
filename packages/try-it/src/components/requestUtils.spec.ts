import { BrowserTransport } from '@looker/sdk/lib/browser'

import { TryItInput } from '../TryIt'
import {
  createRequestParams,
  pathify,
  defaultRequestCallback,
} from './requestUtils'
import { testJsonResponse } from '../test-data'

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
  const inputs: TryItInput[] = [
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

  test('it throws for invalid input locations', () => {
    expect(() =>
      createRequestParams([{ ...inputs[0], location: 'bogus' }], requestContent)
    ).toThrowError("Invalid input location: 'bogus'")
  })
})

describe('defaultRequestCallback', () => {
  test('it makes a request', async () => {
    const spy = jest
      .spyOn(BrowserTransport.prototype, 'rawRequest')
      .mockResolvedValueOnce(testJsonResponse)

    const resp = await defaultRequestCallback(
      'POST',
      '/queries/run/{result_format}',
      { result_format: 'json' },
      { fields: 'first_name, last_name' },
      { model: 'thelook', view: 'orders', fields: ['orders.count'] }
    )

    expect(spy).toHaveBeenCalledWith(
      'POST',
      '/queries/run/json',
      {
        fields: 'first_name, last_name',
      },
      {
        fields: ['orders.count'],
        model: 'thelook',
        view: 'orders',
      }
    )
    expect(resp).toEqual(testJsonResponse)
  })
})
