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
import type { RunItInput } from '../RunIt';
import { api, testJsonResponse } from '../test-data';
import {
  createInputs,
  createRequestParams,
  initRequestContent,
  pathify,
  runRequest,
} from './requestUtils';
import { initRunItSdk } from './RunItSDK';

const sdk = initRunItSdk();

describe('requestUtils', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('pathify', () => {
    test('it returns unchanged path if no path params are specified', () => {
      const actual = pathify('/logout');
      expect(actual).toEqual('/logout');
    });

    test('it works path params', () => {
      const pathParams = {
        query_id: 1,
        result_format: 'json',
      };
      const actual = pathify(
        '/queries/{query_id}/run/{result_format}',
        pathParams
      );
      expect(actual).toEqual('/queries/1/run/json');
    });
  });

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
    ];
    const requestContent = {
      result_format: 'json',
      cache: true,
      body: JSON.stringify({
        model: 'thelook',
        view: 'orders',
        fields: ['orders.created_date', 'orders.count'],
        limit: '500',
      }),
    };

    const noBody = {
      result_format: 'json',
      cache: true,
      body: '{}',
    };

    test('empty json body is not removed', () => {
      const [pathParams, queryParams, body] = createRequestParams(
        inputs,
        noBody
      );
      expect(pathParams).toEqual({
        result_format: noBody.result_format,
      });
      expect(queryParams).toEqual({
        cache: noBody.cache,
      });
      expect(body).toEqual({});
    });

    test('it correctly identifies requestContent params location', () => {
      const [pathParams, queryParams, body] = createRequestParams(
        inputs,
        requestContent
      );
      expect(pathParams).toEqual({
        result_format: requestContent.result_format,
      });
      expect(queryParams).toEqual({
        cache: requestContent.cache,
      });
      expect(body).toEqual(JSON.parse(requestContent.body));
    });

    test('non JSON parsable strings are treated as x-www-form-urlencoded strings', () => {
      const urlParams = 'key1=value1&key2=value2';
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
      );
      expect(body).toEqual(urlParams);
    });
  });

  describe('defaultRunItCallback', () => {
    test('it makes a request', async () => {
      const spy = jest
        .spyOn(sdk.authSession.transport, 'rawRequest')
        .mockResolvedValueOnce(testJsonResponse);
      jest.spyOn(sdk.authSession, 'isAuthenticated').mockReturnValue(true);

      const resp = await runRequest(
        sdk,
        '/api/4.0',
        'POST',
        '/queries/run/{result_format}',
        { result_format: 'json' },
        { fields: 'first_name, last_name' },
        { model: 'thelook', view: 'orders', fields: ['orders.count'] }
      );

      expect(spy).toHaveBeenCalledWith(
        'POST',
        '/api/4.0/queries/run/json',
        {
          fields: 'first_name, last_name',
        },
        {
          fields: ['orders.count'],
          model: 'thelook',
          view: 'orders',
        },
        expect.any(Function)
      );
      expect(resp).toEqual(testJsonResponse);
    });
  });

  describe('createInputs', () => {
    test('converts delimarray to string', () => {
      const method = api.methods.all_roles;
      const actual = createInputs(api, method);
      expect(actual).toHaveLength(method.allParams.length);
      expect(actual[1]).toEqual({
        name: 'ids',
        location: 'query',
        type: 'string',
        required: false,
        description: 'Optional list of ids to get specific roles.',
      });
    });

    test('converts enums in body to string', () => {
      const method = api.methods.create_query_task;
      const actual = createInputs(api, method);
      expect(actual).toHaveLength(method.allParams.length);
      expect(actual[0]).toEqual({
        name: 'body',
        location: 'body',
        type: {
          query_id: '',
          result_format: '',
          source: '',
          deferred: false,
          look_id: '',
          dashboard_id: '',
        },
        required: true,
        description: '',
      });
    });

    test('works with various param types', () => {
      const method = api.methods.run_inline_query;
      const actual = createInputs(api, method);
      expect(actual).toHaveLength(method.allParams.length);

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
      );
    });
  });

  describe('request content initialization', () => {
    test('it initializes body params with default values', () => {
      const inputs = createInputs(api, api.methods.run_inline_query);
      const actual = initRequestContent(inputs);
      expect(actual).toEqual({
        body: {
          client_id: '',
          column_limit: '',
          dynamic_fields: '',
          fields: [],
          fill_fields: [],
          filter_config: {},
          filter_expression: '',
          filters: {},
          limit: '',
          model: '',
          pivots: [],
          query_timezone: '',
          row_total: '',
          sorts: [],
          subtotals: [],
          total: false,
          view: '',
          vis_config: {},
          visible_ui_sections: '',
        },
      });
    });

    test('it contains default-empty body params', () => {
      const inputs = createInputs(api, api.methods.fetch_integration_form);
      const bodyInput = inputs.find(i => i.location === 'body')!;
      expect(bodyInput.name).toEqual('body');
      expect(bodyInput.type).toEqual({});
      const actual = initRequestContent(inputs);
      expect(actual).toEqual({
        body: {},
      });
    });
  });

  describe('createRequestParams', () => {
    const inputs = createInputs(api, api.methods.run_inline_query);

    test('removes empties for path, query and body params', () => {
      const requestContent = initRequestContent(inputs);
      const [pathParams, queryParams, body] = createRequestParams(
        inputs,
        requestContent
      );
      expect(pathParams).toEqual({});
      expect(queryParams).toEqual({});
      expect(body).toEqual({
        total: false,
      });
    });

    test('does not remove empty bodies', () => {
      const requestContent = { body: {} };
      const [pathParams, queryParams, body] = createRequestParams(
        inputs,
        requestContent
      );
      expect(pathParams).toEqual({});
      expect(queryParams).toEqual({});
      expect(body).toEqual({});
    });
  });
});
