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

import { DelimArray } from '@looker/sdk-rtl'
import { TestConfig } from './testUtils'
import { TypescriptGen } from './typescript.gen'
import { EnumType, titleCase } from './sdkModels'
import { trimInputs } from './codeGen'

const config = TestConfig()
const apiTestModel = config.apiTestModel

const gen = new TypescriptGen(apiTestModel)
const indent = ''

describe('typescript generator', () => {
  describe('trimInputs tests here instead of CodeGen', () => {
    it('trims top level', () => {
      const inputs = {
        one: undefined,
        two: 'assigned',
        three: true,
        four: false,
        five: '',
        six: {},
        seven: [],
      }
      const expected = { two: 'assigned', three: true, four: false, six: {} }
      const actual = trimInputs(inputs)
      expect(actual).toEqual(expected)
    })

    it('assigns arrays', () => {
      const inputs = {
        zero: [0, 1, 2, 3],
      }
      const expected = {
        zero: [0, 1, 2, 3],
      }
      const actual = trimInputs(inputs)
      expect(actual).toEqual(expected)
    })

    it('returns DelimArray', () => {
      const inputs = {
        ids: new DelimArray<number>([1, 2, 3]),
      }
      const actual = trimInputs(inputs)
      expect(actual).toEqual(inputs)
    })

    it('trims nested levels', () => {
      const inputs = {
        zero: [0, 1, 2, 3],
        one: undefined,
        two: 'assigned',
        three: true,
        four: false,
        five: '',
        six: { a: true, b: 0, c: null, d: {}, e: '' },
      }
      const expected = {
        zero: [0, 1, 2, 3],
        two: 'assigned',
        three: true,
        four: false,
        six: { a: true, b: 0 },
      }
      const actual = trimInputs(inputs)
      expect(actual).toEqual(expected)
    })

    it('keeps empty body values', () => {
      const inputs = {
        one: '1',
        two: 2,
        four: '',
        body: { a: true, b: 0, c: null, d: {}, e: '' },
      }
      const expected = {
        one: '1',
        two: 2,
        body: { a: true, b: 0, c: null, d: {}, e: '' },
      }
      const actual = trimInputs(inputs, true)
      expect(actual).toEqual(expected)
    })

    it('keeps empty body objects', () => {
      const inputs = {
        one: '1',
        two: 2,
        four: '',
        body: {
          description: '',
          hidden: false,
          query_timezone: '',
          refresh_interval: '',
          folder: {},
          title: '',
          slug: '',
          preferred_viewer: '',
          space: {},
          alert_sync_with_dashboard_filter_enabled: false,
          background_color: '',
          crossfilter_enabled: false,
          deleted: false,
          filters_bar_collapsed: false,
          load_configuration: '',
          lookml_link_id: '',
          show_filters_bar: false,
          show_title: false,
          space_id: '',
          folder_id: '',
          text_tile_text_color: '',
          tile_background_color: '',
          tile_text_color: '',
          title_color: '',
          appearance: {
            page_side_margins: 0,
            page_background_color: '',
            tile_title_alignment: '',
            tile_space_between: 0,
            tile_background_color: '',
            tile_shadow: false,
            key_color: '',
          },
        },
      }
      const expected = {
        one: '1',
        two: 2,
        body: {
          description: '',
          hidden: false,
          query_timezone: '',
          refresh_interval: '',
          folder: {},
          title: '',
          slug: '',
          preferred_viewer: '',
          space: {},
          alert_sync_with_dashboard_filter_enabled: false,
          background_color: '',
          crossfilter_enabled: false,
          deleted: false,
          filters_bar_collapsed: false,
          load_configuration: '',
          lookml_link_id: '',
          show_filters_bar: false,
          show_title: false,
          space_id: '',
          folder_id: '',
          text_tile_text_color: '',
          tile_background_color: '',
          tile_text_color: '',
          title_color: '',
          appearance: {
            page_side_margins: 0,
            page_background_color: '',
            tile_title_alignment: '',
            tile_space_between: 0,
            tile_background_color: '',
            tile_shadow: false,
            key_color: '',
          },
        },
      }
      const actual = trimInputs(inputs, true)
      expect(actual).toEqual(expected)
    })
    /**
     * {
     *   "description": "",
     *   "hidden": false,
     *   "query_timezone": "",
     *   "refresh_interval": "",
     *   "folder": {},
     *   "title": "",
     *   "slug": "",
     *   "preferred_viewer": "",
     *   "space": {},
     *   "alert_sync_with_dashboard_filter_enabled": false,
     *   "background_color": "",
     *   "crossfilter_enabled": false,
     *   "deleted": false,
     *   "filters_bar_collapsed": false,
     *   "load_configuration": "",
     *   "lookml_link_id": "",
     *   "show_filters_bar": false,
     *   "show_title": false,
     *   "space_id": "",
     *   "folder_id": "",
     *   "text_tile_text_color": "",
     *   "tile_background_color": "",
     *   "tile_text_color": "",
     *   "title_color": "",
     *   "appearance": {
     *     "page_side_margins": 0,
     *     "page_background_color": "",
     *     "tile_title_alignment": "",
     *     "tile_space_between": 0,
     *     "tile_background_color": "",
     *     "tile_shadow": false,
     *     "key_color": ""
     *   }
     * }
     */
  })

  it('comment header', () => {
    const text = 'line 1\nline 2'
    let actual = gen.commentHeader(indent, text)
    let expected = `/**
 * line 1
 * line 2
 */
`
    expect(actual).toEqual(expected)

    actual = gen.commentHeader(indent, text, ' ')
    expected = `/**

 line 1
 line 2
 */
`
    expect(actual).toEqual(expected)
  })

  it('license comment header', () => {
    const text =
      'MIT License\n\nCopyright (c) 2021 Looker Data Sciences, Inc.\n\nPermission\n'
    const actual = gen.commentHeader('', text, ' ')
    const expected = `/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

 Permission

 */
`
    expect(actual).toEqual(expected)
  })

  describe('parameter declarations', () => {
    it('required parameter', () => {
      const method = apiTestModel.methods.run_query
      const param = method.params[0]
      const actual = gen.declareParameter(indent, method, param)
      expect(actual).toEqual(`query_id: number`)
    })

    it('intrinsic body', () => {
      const method = apiTestModel.methods.parse_saml_idp_metadata
      const param = method.params[0]
      const actual = gen.declareParameter(indent, method, param)
      expect(actual).toEqual(`body: string`)
    })

    it('optional parameter', () => {
      const method = apiTestModel.methods.run_query
      const param = method.params[2]
      const actual = gen.declareParameter(indent, method, param)
      expect(actual).toEqual(`limit?: number`)
    })

    it('required typed parameter', () => {
      const method = apiTestModel.methods.create_query_render_task
      const param = method.params[2]
      const actual = gen.declareParameter(indent, method, param)
      expect(actual).toEqual(`width: number`)
    })

    it('csv formatted parameter', () => {
      const method = apiTestModel.methods.query_task_multi_results
      const param = method.params[0]
      const actual = gen.declareParameter(indent, method, param)
      expect(actual).toEqual(`query_task_ids: DelimArray<string>`)
    })
  })

  describe('makeTheCall', () => {
    const fields = 'id,user_id,title,description'
    it('handles no params', () => {
      const inputs = {}
      const method = apiTestModel.methods.run_look
      const actual = gen.makeTheCall(method, inputs)
      const expected = `// functional SDK syntax is recommended for minimizing browser payloads
let response = await sdk.ok(run_look(sdk))
// monolithic SDK syntax can also be used for Node apps
let response = await sdk.ok(sdk.run_look())`
      expect(actual).toEqual(expected)
    })

    it('assigns single param', () => {
      const inputs = { look_id: 17 }
      const method = apiTestModel.methods.look
      const actual = gen.makeTheCall(method, inputs)
      const expected = `// functional SDK syntax is recommended for minimizing browser payloads
let response = await sdk.ok(look(sdk,17))
// monolithic SDK syntax can also be used for Node apps
let response = await sdk.ok(sdk.look(17))`
      expect(actual).toEqual(expected)
    })

    it('assigns simple params', () => {
      const inputs = { look_id: 17, fields }
      const method = apiTestModel.methods.look
      const actual = gen.makeTheCall(method, inputs)
      const expected = `// functional SDK syntax is recommended for minimizing browser payloads
let response = await sdk.ok(look(sdk,
  17, '${fields}'))
// monolithic SDK syntax can also be used for Node apps
let response = await sdk.ok(sdk.look(
  17, '${fields}'))`
      expect(actual).toEqual(expected)
    })

    it('assigns a body param', () => {
      const body = {
        title: 'test title',
        description: 'gen test',
        query: {
          model: 'the_look',
          view: 'users',
          total: true,
        },
      }
      const inputs = { look_id: 17, body, fields }
      const method = apiTestModel.methods.update_look
      const actual = gen.makeTheCall(method, inputs)
      const expected = `// functional SDK syntax is recommended for minimizing browser payloads
let response = await sdk.ok(update_look(sdk,
  17, {
    title: 'test title',
    description: 'gen test',
    query: {
      model: 'the_look',
      view: 'users',
      total: true
    }
  }, 'id,user_id,title,description'))
// monolithic SDK syntax can also be used for Node apps
let response = await sdk.ok(sdk.update_look(
  17, {
    title: 'test title',
    description: 'gen test',
    query: {
      model: 'the_look',
      view: 'users',
      total: true
    }
  }, 'id,user_id,title,description'))`
      expect(actual).toEqual(expected)
    })

    it('assigns request params', () => {
      const inputs = { look_id: 17, result_format: 'png' }
      const method = apiTestModel.methods.run_look
      const actual = gen.makeTheCall(method, inputs)
      const expected = `// functional SDK syntax is recommended for minimizing browser payloads
let response = await sdk.ok(run_look(sdk,
  {
    look_id: 17,
    result_format: 'png'
  }))
// monolithic SDK syntax can also be used for Node apps
let response = await sdk.ok(sdk.run_look(
  {
    look_id: 17,
    result_format: 'png'
  }))`
      expect(actual).toEqual(expected)
    })

    it('assigns an enum', () => {
      const inputs = {
        body: {
          query_id: 1,
          result_format: 'csv',
        },
      }
      const method = apiTestModel.methods.create_query_task
      const actual = gen.makeTheCall(method, inputs)
      const expected = `// functional SDK syntax is recommended for minimizing browser payloads
let response = await sdk.ok(create_query_task(sdk,
  {
    body: {
      query_id: 1,
      result_format: ResultFormat.csv
    }
  }))
// monolithic SDK syntax can also be used for Node apps
let response = await sdk.ok(sdk.create_query_task(
  {
    body: {
      query_id: 1,
      result_format: ResultFormat.csv
    }
  }))`
      expect(actual).toEqual(expected)
    })

    it('assigns a DelimArray', () => {
      const inputs = {
        ids: new DelimArray<number>([1, 2, 3]),
      }
      const method = apiTestModel.methods.all_users
      const actual = gen.makeTheCall(method, inputs)
      const expected = `// functional SDK syntax is recommended for minimizing browser payloads
let response = await sdk.ok(all_users(sdk,
  {
    ids: new DelimArray<number>([1,2,3])
  }))
// monolithic SDK syntax can also be used for Node apps
let response = await sdk.ok(sdk.all_users(
  {
    ids: new DelimArray<number>([1,2,3])
  }))`
      expect(actual).toEqual(expected)
    })

    it('assigns simple and complex arrays', () => {
      const body = {
        pivots: ['one', 'two', 'three'],
        sorts: ['a'],
        source_queries: [
          {
            name: 'first query',
            query_id: 1,
            merge_fields: [
              {
                field_name: 'merge_1',
                source_field_name: 'source_1',
              },
            ],
          },
          {
            name: 'second query',
            query_id: 2,
            merge_fields: [
              {
                field_name: 'merge_2',
                source_field_name: 'source_2',
              },
            ],
          },
        ],
      }
      const inputs = { body, fields }
      const method = apiTestModel.methods.create_merge_query
      const actual = gen.makeTheCall(method, inputs)
      const expected = `// functional SDK syntax is recommended for minimizing browser payloads
let response = await sdk.ok(create_merge_query(sdk,
  {
    body: {
      pivots: [
        'one',
        'two',
        'three'
      ],
      sorts: ['a'],
      source_queries: [
        {
          merge_fields: [
            {
              field_name: 'merge_1',
              source_field_name: 'source_1'
            }
          ],
          name: 'first query',
          query_id: 1
        },
        {
          merge_fields: [
            {
              field_name: 'merge_2',
              source_field_name: 'source_2'
            }
          ],
          name: 'second query',
          query_id: 2
        }
      ]
    },
    fields: 'id,user_id,title,description'
  }))
// monolithic SDK syntax can also be used for Node apps
let response = await sdk.ok(sdk.create_merge_query(
  {
    body: {
      pivots: [
        'one',
        'two',
        'three'
      ],
      sorts: ['a'],
      source_queries: [
        {
          merge_fields: [
            {
              field_name: 'merge_1',
              source_field_name: 'source_1'
            }
          ],
          name: 'first query',
          query_id: 1
        },
        {
          merge_fields: [
            {
              field_name: 'merge_2',
              source_field_name: 'source_2'
            }
          ],
          name: 'second query',
          query_id: 2
        }
      ]
    },
    fields: 'id,user_id,title,description'
  }))`
      expect(actual).toEqual(expected)
    })

    it('assigns dictionaries', () => {
      const query = {
        connection_name: 'looker',
        model_name: 'the_look',
        vis_config: { first: 1, second: 'two' },
      }
      const inputs = { body: query }
      const method = apiTestModel.methods.create_sql_query
      const expected = `// functional SDK syntax is recommended for minimizing browser payloads
let response = await sdk.ok(create_sql_query(sdk,
  {
    connection_name: 'looker',
    model_name: 'the_look',
    vis_config: {
      first: 1,
      second: 'two'
    }
  }))
// monolithic SDK syntax can also be used for Node apps
let response = await sdk.ok(sdk.create_sql_query(
  {
    connection_name: 'looker',
    model_name: 'the_look',
    vis_config: {
      first: 1,
      second: 'two'
    }
  }))`
      const actual = gen.makeTheCall(method, inputs)
      expect(actual).toEqual(expected)
    })

    it('includes empty objects', () => {
      const inputs = {
        dashboard_id: '10',
        body: {
          description: '',
          hidden: false,
          query_timezone: '',
          refresh_interval: '',
          folder: {},
          title: '',
          slug: '',
          preferred_viewer: '',
          alert_sync_with_dashboard_filter_enabled: false,
          background_color: '',
          crossfilter_enabled: false,
          deleted: false,
          filters_bar_collapsed: false,
          load_configuration: '',
          lookml_link_id: '',
          show_filters_bar: false,
          show_title: false,
          folder_id: '',
          text_tile_text_color: '',
          tile_background_color: '',
          tile_text_color: '',
          title_color: '',
          appearance: {
            page_side_margins: 0,
            page_background_color: '',
            tile_title_alignment: '',
            tile_space_between: 0,
            tile_background_color: '',
            tile_shadow: false,
            key_color: '',
          },
        },
      }
      const method = apiTestModel.methods.update_dashboard
      const expected = `// functional SDK syntax is recommended for minimizing browser payloads
let response = await sdk.ok(update_dashboard(sdk,
  '10', {
    description: '',
    hidden: false,
    query_timezone: '',
    refresh_interval: '',
    folder: {},
    title: '',
    background_color: '',
    crossfilter_enabled: false,
    deleted: false,
    load_configuration: '',
    lookml_link_id: '',
    show_filters_bar: false,
    show_title: false,
    slug: '',
    folder_id: '',
    text_tile_text_color: '',
    tile_background_color: '',
    tile_text_color: '',
    title_color: '',
    appearance: {
      page_side_margins: 0,
      page_background_color: '',
      tile_title_alignment: '',
      tile_space_between: 0,
      tile_background_color: '',
      tile_shadow: false,
      key_color: ''
    },
    preferred_viewer: ''
  }))
// monolithic SDK syntax can also be used for Node apps
let response = await sdk.ok(sdk.update_dashboard(
  '10', {
    description: '',
    hidden: false,
    query_timezone: '',
    refresh_interval: '',
    folder: {},
    title: '',
    background_color: '',
    crossfilter_enabled: false,
    deleted: false,
    load_configuration: '',
    lookml_link_id: '',
    show_filters_bar: false,
    show_title: false,
    slug: '',
    folder_id: '',
    text_tile_text_color: '',
    tile_background_color: '',
    tile_text_color: '',
    title_color: '',
    appearance: {
      page_side_margins: 0,
      page_background_color: '',
      tile_title_alignment: '',
      tile_space_between: 0,
      tile_background_color: '',
      tile_shadow: false,
      key_color: ''
    },
    preferred_viewer: ''
  }))`
      const actual = gen.makeTheCall(method, inputs)
      expect(actual).toEqual(expected)
    })

    describe('hashValue', () => {
      it('assigns a hash with heterogeneous values', () => {
        const token = {
          access_token: 'backstage',
          token_type: 'test',
          expires_in: 10,
        }
        const oneItem = [1]
        const threeItems = ['Abe', 'Zeb', token]
        const inputs = {
          item: oneItem,
          items: threeItems,
          first: 1,
          second: 'two',
          third: false,
          token,
        }
        const expected = `{
  item: [1],
  items: [
    'Abe',
    'Zeb',
    {
      access_token: 'backstage',
      token_type: 'test',
      expires_in: 10
    }
  ],
  first: 1,
  second: 'two',
  third: false,
  token: {
    access_token: 'backstage',
    token_type: 'test',
    expires_in: 10
  }
}`
        const actual = gen.hashValue('', inputs)
        expect(actual).toEqual(expected)
      })
    })
    describe('assignType', () => {
      it('assigns a complex type', () => {
        const inputs = {
          name: 'first query',
          query_id: 1,
          merge_fields: [
            {
              field_name: 'merge_1',
              source_field_name: 'source_1',
            },
          ],
        }
        const type = apiTestModel.types.MergeQuerySourceQuery
        expect(type).toBeDefined()
        const expected = `{
    merge_fields: [
      {
        field_name: 'merge_1',
        source_field_name: 'source_1'
      }
    ],
    name: 'first query',
    query_id: 1
  }`
        const actual = gen.assignType(gen.indentStr, type, inputs)
        expect(actual).toEqual(expected)
      })
    })

    describe('arrayValue', () => {
      it('assigns complex arrays', () => {
        const sourceQueries = [
          {
            name: 'first query',
            query_id: 1,
            merge_fields: [
              {
                field_name: 'merge_1',
                source_field_name: 'source_1',
              },
            ],
          },
          {
            name: 'second query',
            query_id: 2,
            merge_fields: [
              {
                field_name: 'merge_2',
                source_field_name: 'source_2',
              },
            ],
          },
        ]
        const props = apiTestModel.types.WriteMergeQuery.properties
        const type = props.source_queries.type
        expect(type).toBeDefined()
        const actual = gen.arrayValue('', type, sourceQueries)
        const expected = `[
  {
    merge_fields: [
      {
        field_name: 'merge_1',
        source_field_name: 'source_1'
      }
    ],
    name: 'first query',
    query_id: 1
  },
  {
    merge_fields: [
      {
        field_name: 'merge_2',
        source_field_name: 'source_2'
      }
    ],
    name: 'second query',
    query_id: 2
  }
]`
        expect(actual).toEqual(expected)
      })
    })
  })

  describe('args locations', () => {
    it('path and query args', () => {
      const method = apiTestModel.methods.run_query
      expect(method.pathArgs).toEqual(['query_id', 'result_format'])
      expect(method.bodyArg).toEqual('')
      expect(method.queryArgs).toEqual([
        'limit',
        'apply_formatting',
        'apply_vis',
        'cache',
        'image_width',
        'image_height',
        'generate_drill_links',
        'force_production',
        'cache_only',
        'path_prefix',
        'rebuild_pdts',
        'server_table_calcs',
      ])
      expect(method.headerArgs).toEqual([])
      expect(method.cookieArgs).toEqual([])
    })

    it('body for create_query', () => {
      const method = apiTestModel.methods.create_query
      expect(method.pathArgs).toEqual([])
      const body = method.getParams('body')
      expect(body.length).toEqual(1)
      expect(body[0].type.name).toEqual('Query')
      const param = gen.declareParameter(indent, method, body[0])
      expect(param).toEqual(`body: Partial<IWriteQuery>`)
      expect(method.bodyArg).toEqual('body')
      expect(method.queryArgs).toEqual(['fields'])
      expect(method.headerArgs).toEqual([])
      expect(method.cookieArgs).toEqual([])
    })

    it('body for create_dashboard', () => {
      const method = apiTestModel.methods.create_dashboard
      expect(method.pathArgs).toEqual([])
      const body = method.getParams('body')
      expect(body.length).toEqual(1)
      expect(body[0].type.name).toEqual('Dashboard')
      const param = gen.declareParameter(indent, method, body[0])
      expect(param).toEqual(`body: Partial<IWriteDashboard>`)
      expect(method.bodyArg).toEqual('body')
      expect(method.queryArgs).toEqual([])
      expect(method.headerArgs).toEqual([])
      expect(method.cookieArgs).toEqual([])
    })
  })

  describe('httpArgs', () => {
    it('add_group_group', () => {
      const method = apiTestModel.methods.add_group_group
      const args = gen.httpArgs('', method).trim()
      expect(args).toEqual('null, body, options')
    })
    it('create_query', () => {
      const method = apiTestModel.methods.create_query
      const args = gen.httpArgs('', method).trim()
      expect(args).toEqual('{fields}, body, options')
    })
    it('create_dashboard', () => {
      const method = apiTestModel.methods.create_dashboard
      const args = gen.httpArgs('', method).trim()
      expect(args).toEqual('null, body, options')
    })
  })

  describe('method signature', () => {
    // TODO find a new method with an optional body, or modify these tests to use other non-Looker spec input
    it('optional body and additional param', () => {
      const method = apiTestModel.methods.create_user_credentials_email
      expect(method).toBeDefined()
      const expected = `/**
 * ### Email/password login information for the specified user.
 *
 * POST /users/{user_id}/credentials_email -> ICredentialsEmail
 *
 * @param user_id id of user
 * @param body Partial<IWriteCredentialsEmail>
 * @param fields Requested fields.
 * @param options one-time API call overrides
 *
 */
async create_user_credentials_email(
  user_id: number,
  body: Partial<IWriteCredentialsEmail>,
  fields?: string, options?: Partial<ITransportSettings>): Promise<SDKResponse<ICredentialsEmail, IError | IValidationError>> {
`
      const actual = gen.methodSignature('', method)
      expect(actual).toEqual(expected)
    })
    it('noComment optional body and additional param', () => {
      const method = apiTestModel.methods.create_user_credentials_email
      expect(method).toBeDefined()
      const expected = `async create_user_credentials_email(
  user_id: number,
  body: Partial<IWriteCredentialsEmail>,
  fields?: string, options?: Partial<ITransportSettings>): Promise<SDKResponse<ICredentialsEmail, IError | IValidationError>> {
`
      gen.noComment = true
      const actual = gen.methodSignature('', method)
      gen.noComment = false
      expect(actual).toEqual(expected)
    })
    it('no params', () => {
      const method = apiTestModel.methods.all_datagroups
      expect(method).toBeDefined()
      const expected = `/**
 * ### Get information about all datagroups.
 *
 * GET /datagroups -> IDatagroup[]
 *
 * @param options one-time API call overrides
 *
 */
async all_datagroups(options?: Partial<ITransportSettings>): Promise<SDKResponse<IDatagroup[], IError>> {
`
      const actual = gen.methodSignature('', method)
      expect(actual).toEqual(expected)
    })
  })

  describe('method body', () => {
    it('encodes string path params', () => {
      const method = apiTestModel.methods.run_url_encoded_query
      const expected = `  model_name = encodeParam(model_name)
  view_name = encodeParam(view_name)
  result_format = encodeParam(result_format)
`
      const actual = gen.encodePathParams('', method)
      expect(actual).toEqual(expected)
    })
    // TODO eventually add method that has a date type path param
    it('encodes only string or date path params', () => {
      const method = apiTestModel.methods.run_look
      // should NOT escape request.look_id (int)
      const expected =
        '  request.result_format = encodeParam(request.result_format)\n'
      const actual = gen.encodePathParams('', method)
      expect(actual).toEqual(expected)
    })
    it('assert response is model add_group_group', () => {
      const method = apiTestModel.methods.add_group_group
      const expected =
        // eslint-disable-next-line no-template-curly-in-string
        'return this.post<IGroup, IError>(`/groups/${group_id}/groups`, null, body, options)'
      const actual = gen.httpCall(indent, method)
      expect(actual).toEqual(expected)
    })
    it('assert response is None delete_group_from_group', () => {
      const method = apiTestModel.methods.delete_group_from_group
      const expected =
        // eslint-disable-next-line no-template-curly-in-string
        'return this.delete<void, IError>(`/groups/${group_id}/groups/${deleting_group_id}`, null, null, options)'
      const actual = gen.httpCall(indent, method)
      expect(actual).toEqual(expected)
    })
    it('assert response is list active_themes', () => {
      const method = apiTestModel.methods.active_themes
      const expected = `return this.get<ITheme[], IError>('/themes/active', {name: request.name, ts: request.ts, fields: request.fields}, null, options)`
      const actual = gen.httpCall(indent, method)
      expect(actual).toEqual(expected)
    })
  })

  describe('accessor syntax', () => {
    it.each<[string, string, string]>([
      ['foo', '', 'foo'],
      ['foo', 'bar', 'bar.foo'],
      ['f-o-o', 'bar', "bar['f-o-o']"],
    ])('name:"%s" prefix:"%s" should be "%s"', (name, prefix, expected) => {
      const actual = gen.accessor(name, prefix)
      expect(actual).toEqual(expected)
    })
  })

  describe('complete declarations', () => {
    it('streaming method', () => {
      const method = apiTestModel.methods.logout
      const expected = `/**
 * ### Logout of the API and invalidate the current access token.
 *
 * DELETE /logout -> string
 *
 * @param callback streaming output function
 * @param options one-time API call overrides
 *
 */
async logout(
  callback: (readable: Readable) => Promise<string>,options?: Partial<ITransportSettings>) {
  return this.authStream<string>(callback, 'DELETE', '/logout', null, null, options)
}`
      const actual = gen.declareStreamer(indent, method)
      expect(actual).toEqual(expected)
    })

    it('method with request body', () => {
      const method = apiTestModel.methods.create_dashboard_render_task
      const expected = `/**
 * ### Create a new task to render a dashboard to a document or image.
 *
 * Returns a render task object.
 * To check the status of a render task, pass the render_task.id to [Get Render Task](#!/RenderTask/get_render_task).
 * Once the render task is complete, you can download the resulting document or image using [Get Render Task Results](#!/RenderTask/get_render_task_results).
 *
 * POST /render_tasks/dashboards/{dashboard_id}/{result_format} -> IRenderTask
 *
 * @param request composed interface "IRequestCreateDashboardRenderTask" for complex method parameters
 * @param options one-time API call overrides
 *
 */
async create_dashboard_render_task(request: IRequestCreateDashboardRenderTask, options?: Partial<ITransportSettings>): Promise<SDKResponse<IRenderTask, IError | IValidationError>> {
  request.dashboard_id = encodeParam(request.dashboard_id)
  request.result_format = encodeParam(request.result_format)
  return this.post<IRenderTask, IError | IValidationError>(\`/render_tasks/dashboards/\${request.dashboard_id}/\${request.result_format}\`, {width: request.width, height: request.height, fields: request.fields, pdf_paper_size: request.pdf_paper_size, pdf_landscape: request.pdf_landscape, long_tables: request.long_tables}, request.body, options)
}`
      const actual = gen.declareMethod(indent, method)
      expect(actual).toEqual(expected)
    })

    it('deprecated method with deprecated params', () => {
      const method = apiTestModel.methods.old_login
      const arg = method.params[0]
      expect(arg.deprecated).toEqual(true)
      const expected = `/**
 * Endpoint to test deprecation flags
 *
 * GET /old_login -> IAccessToken
 *
 * @deprecated
 *
 * @param old_cred (DEPRECATED) obsolete parameter
 * @param options one-time API call overrides
 *
 */
async old_login(
  old_cred?: string, options?: Partial<ITransportSettings>): Promise<SDKResponse<IAccessToken, IError>> {
  return this.get<IAccessToken, IError>('/old_login', {old_cred}, null, options)
}`
      const actual = gen.declareMethod(indent, method)
      expect(actual).toEqual(expected)
    })

    it('function with request body', () => {
      const method = apiTestModel.methods.create_dashboard_render_task
      const expected = `/**
 * ### Create a new task to render a dashboard to a document or image.
 *
 * Returns a render task object.
 * To check the status of a render task, pass the render_task.id to [Get Render Task](#!/RenderTask/get_render_task).
 * Once the render task is complete, you can download the resulting document or image using [Get Render Task Results](#!/RenderTask/get_render_task_results).
 *
 * POST /render_tasks/dashboards/{dashboard_id}/{result_format} -> IRenderTask
 *
 * @param sdk IAPIMethods implementation
 * @param request composed interface "IRequestCreateDashboardRenderTask" for complex method parameters
 * @param options one-time API call overrides
 *
 */
export const create_dashboard_render_task = async (sdk: IAPIMethods, request: IRequestCreateDashboardRenderTask, options?: Partial<ITransportSettings>): Promise<SDKResponse<IRenderTask, IError | IValidationError>> => {
  request.dashboard_id = encodeParam(request.dashboard_id)
  request.result_format = encodeParam(request.result_format)
  return sdk.post<IRenderTask, IError | IValidationError>(\`/render_tasks/dashboards/\${request.dashboard_id}/\${request.result_format}\`, {width: request.width, height: request.height, fields: request.fields, pdf_paper_size: request.pdf_paper_size, pdf_landscape: request.pdf_landscape, long_tables: request.long_tables}, request.body, options)
}`
      const actual = gen.declareFunction(indent, method)
      expect(actual).toEqual(expected)
    })

    it('interface with request body', () => {
      const method = apiTestModel.methods.create_dashboard_render_task
      const expected = `/**
 * ### Create a new task to render a dashboard to a document or image.
 *
 * Returns a render task object.
 * To check the status of a render task, pass the render_task.id to [Get Render Task](#!/RenderTask/get_render_task).
 * Once the render task is complete, you can download the resulting document or image using [Get Render Task Results](#!/RenderTask/get_render_task_results).
 *
 * POST /render_tasks/dashboards/{dashboard_id}/{result_format} -> IRenderTask
 *
 * @param request composed interface "IRequestCreateDashboardRenderTask" for complex method parameters
 * @param options one-time API call overrides
 *
 */
create_dashboard_render_task(request: IRequestCreateDashboardRenderTask, options?: Partial<ITransportSettings>): Promise<SDKResponse<IRenderTask, IError | IValidationError>>
`
      const actual = gen.declareInterface(indent, method)
      expect(actual).toEqual(expected)
    })
    it('method without request body', () => {
      const method = apiTestModel.methods.content_thumbnail
      const expected = `/**
 * ### Get an image representing the contents of a dashboard or look.
 *
 * The returned thumbnail is an abstract representation of the contents of a dashbord or look and does not
 * reflect the actual data displayed in the respective visualizations.
 *
 * GET /content_thumbnail/{type}/{resource_id} -> string
 *
 * @remarks
 * **NOTE**: Binary content may be returned by this function.
 *
 * @param request composed interface "IRequestContentThumbnail" for complex method parameters
 * @param options one-time API call overrides
 *
 */
async content_thumbnail(request: IRequestContentThumbnail, options?: Partial<ITransportSettings>): Promise<SDKResponse<string, IError>> {
  request.type = encodeParam(request.type)
  request.resource_id = encodeParam(request.resource_id)
  return this.get<string, IError>(\`/content_thumbnail/$\{request.type}/\${request.resource_id}\`, {reload: request.reload, format: request.format, width: request.width, height: request.height}, null, options)
}`
      const actual = gen.declareMethod(indent, method)
      expect(actual).toEqual(expected)
    })

    it('function without request body', () => {
      const method = apiTestModel.methods.content_thumbnail
      const expected = `/**
 * ### Get an image representing the contents of a dashboard or look.
 *
 * The returned thumbnail is an abstract representation of the contents of a dashbord or look and does not
 * reflect the actual data displayed in the respective visualizations.
 *
 * GET /content_thumbnail/{type}/{resource_id} -> string
 *
 * @remarks
 * **NOTE**: Binary content may be returned by this function.
 *
 * @param sdk IAPIMethods implementation
 * @param request composed interface "IRequestContentThumbnail" for complex method parameters
 * @param options one-time API call overrides
 *
 */
export const content_thumbnail = async (sdk: IAPIMethods, request: IRequestContentThumbnail, options?: Partial<ITransportSettings>): Promise<SDKResponse<string, IError>> => {
  request.type = encodeParam(request.type)
  request.resource_id = encodeParam(request.resource_id)
  return sdk.get<string, IError>(\`/content_thumbnail/$\{request.type}/\${request.resource_id}\`, {reload: request.reload, format: request.format, width: request.width, height: request.height}, null, options)
}`
      const actual = gen.declareFunction(indent, method)
      expect(actual).toEqual(expected)
    })

    it('deprecated function', () => {
      const method = apiTestModel.methods.vector_thumbnail
      const expected = `/**
 * ### Get a vector image representing the contents of a dashboard or look.
 *
 * # DEPRECATED:  Use [content_thumbnail()](#!/Content/content_thumbnail)
 *
 * The returned thumbnail is an abstract representation of the contents of a dashbord or look and does not
 * reflect the actual data displayed in the respective visualizations.
 *
 * GET /vector_thumbnail/{type}/{resource_id} -> string
 *
 * @deprecated
 *
 * @param sdk IAPIMethods implementation
 * @param type Either dashboard or look
 * @param resource_id ID of the dashboard or look to render
 * @param reload Whether or not to refresh the rendered image with the latest content
 * @param options one-time API call overrides
 *
 */
export const vector_thumbnail = async (
sdk: IAPIMethods,
  type: string,
  resource_id: string,
  reload?: string, options?: Partial<ITransportSettings>): Promise<SDKResponse<string, IError>> => {
  type = encodeParam(type)
  resource_id = encodeParam(resource_id)
  return sdk.get<string, IError>(\`/vector_thumbnail/$\{type}/$\{resource_id}\`, {reload}, null, options)
}`
      const actual = gen.declareFunction(indent, method)
      expect(actual).toEqual(expected)
    })

    it('interface without request body', () => {
      const method = apiTestModel.methods.content_thumbnail
      const expected = `/**
 * ### Get an image representing the contents of a dashboard or look.
 *
 * The returned thumbnail is an abstract representation of the contents of a dashbord or look and does not
 * reflect the actual data displayed in the respective visualizations.
 *
 * GET /content_thumbnail/{type}/{resource_id} -> string
 *
 * @remarks
 * **NOTE**: Binary content may be returned by this function.
 *
 * @param request composed interface "IRequestContentThumbnail" for complex method parameters
 * @param options one-time API call overrides
 *
 */
content_thumbnail(request: IRequestContentThumbnail, options?: Partial<ITransportSettings>): Promise<SDKResponse<string, IError>>
`
      const actual = gen.declareInterface(indent, method)
      expect(actual).toEqual(expected)
    })

    it('interface without initializer', () => {
      const method = apiTestModel.methods.fetch_integration_form
      const expected = `/**
 * Returns the Integration form for presentation to the user.
 *
 * POST /integrations/{integration_id}/form -> IDataActionForm
 *
 * @param integration_id Id of integration
 * @param body Partial<IDictionary<string>>
 * @param options one-time API call overrides
 *
 */
fetch_integration_form(
  integration_id: string,
  body?: Partial<IDictionary<string>>, options?: Partial<ITransportSettings>): Promise<SDKResponse<IDataActionForm, IError | IValidationError>>
`
      const actual = gen.declareInterface(indent, method)
      expect(actual).toEqual(expected)
    })
  })

  describe('type creation', () => {
    it('request type with body', () => {
      const method = apiTestModel.methods.create_dashboard_render_task
      const type = apiTestModel.getRequestType(method)
      expect(type).toBeDefined()
      if (type) {
        const dashboard_id = type.properties.dashboard_id
        const actual_dashboard_id = gen.declareProperty(indent, dashboard_id)
        expect(actual_dashboard_id).toEqual(`/**
 * Id of dashboard to render. The ID can be a LookML dashboard also.
 */
dashboard_id: string`)
        const body = type.properties.body
        const actual_body = gen.declareProperty(indent, body)
        expect(actual_body).toEqual(`/**
 * body parameter for dynamically created request type
 */
body: ICreateDashboardRenderTask`)
      }
    })
    it('with arrays and hashes', () => {
      const type = apiTestModel.types.Workspace
      const actual = gen.declareType(indent, type)
      expect(actual).toEqual(`export interface IWorkspace {
  /**
   * Operations the current user is able to perform on this object (read-only)
   */
  can?: IDictionary<boolean>
  /**
   * The unique id of this user workspace. Predefined workspace ids include "production" and "dev" (read-only)
   */
  id?: string
  /**
   * The local state of each project in the workspace (read-only)
   */
  projects?: IProject[] | null
}`)
    })
    it('with refs, arrays and nullable', () => {
      const type = apiTestModel.types.ApiVersion
      const actual = gen.declareType(indent, type)
      expect(actual).toEqual(`export interface IApiVersion {
  /**
   * Current Looker release version number (read-only)
   */
  looker_release_version?: string | null
  current_version?: IApiVersionElement
  /**
   * Array of versions supported by this Looker instance (read-only)
   */
  supported_versions?: IApiVersionElement[] | null
}`)
    })
    it('required properties', () => {
      const type = apiTestModel.types.CreateQueryTask
      const actual = gen.declareType(indent, type)
      const name = titleCase('result_format')
      expect(actual).toEqual(`export interface ICreateQueryTask {
  /**
   * Operations the current user is able to perform on this object (read-only)
   */
  can?: IDictionary<boolean>
  /**
   * Id of query to run
   */
  query_id: number | null
  /**
   * Desired async query result format. Valid values are: "inline_json", "json", "json_detail", "json_fe", "csv", "html", "md", "txt", "xlsx", "gsxml".
   */
  result_format: ${name} | null
  /**
   * Source of query task
   */
  source?: string | null
  /**
   * Create the task but defer execution
   */
  deferred?: boolean
  /**
   * Id of look associated with query.
   */
  look_id?: number | null
  /**
   * Id of dashboard associated with query.
   */
  dashboard_id?: string | null
}`)
    })

    describe('special symbol names', () => {
      interface HiFen {
        'a-one': string
        'a two': boolean
        'a-three': number
      }

      it('handles special names in json', () => {
        const json = `{"a-one":"one", "a two":true, "a-three":3}`
        const actual: HiFen = JSON.parse(json)
        expect(actual['a-one']).toEqual('one')
        expect(actual['a two']).toEqual(true)
        expect(actual['a-three']).toEqual(3)
      })

      it('does not reserve body param array type names', () => {
        const actual = gen.reserve('IProjectGeneratorTable[]')
        expect(actual).toEqual('IProjectGeneratorTable[]')
      })

      it('reserves special names in method parameters', () => {
        const method = apiTestModel.methods.me
        const save = method.params[0].name
        method.params[0].name = 'hi-test'
        const actual = gen.declareMethod(indent, method)
        method.params[0].name = save
        const expected = `/**
 * ### Get information about the current user; i.e. the user account currently calling the API.
 *
 * GET /user -> IUser
 *
 * @param hi-test Requested fields.
 * @param options one-time API call overrides
 *
 */
async me(
  'hi-test'?: string, options?: Partial<ITransportSettings>): Promise<SDKResponse<IUser, IError>> {
  return this.get<IUser, IError>('/user', {'hi-test'}, null, options)
}`
        expect(actual).toEqual(expected)
      })

      it('reserves special names in method request objects', () => {
        const method = apiTestModel.methods.role_users
        const swap = 2
        const save = method.params[swap].name
        method.params[swap].name = 'direct-association-only'
        const actual = gen.declareMethod(indent, method)
        method.params[swap].name = save
        const expected = `/**
 * ### Get information about all the users with the role that has a specific id.
 *
 * GET /roles/{role_id}/users -> IUser[]
 *
 * @param request composed interface "IRequestRoleUsers" for complex method parameters
 * @param options one-time API call overrides
 *
 */
async role_users(request: IRequestRoleUsers, options?: Partial<ITransportSettings>): Promise<SDKResponse<IUser[], IError>> {
  return this.get<IUser[], IError>(\`/roles/\${request.role_id}/users\`, {fields: request.fields, 'direct-association-only': request['direct-association-only']}, null, options)
}`
        expect(actual).toEqual(expected)
      })
    })

    describe('enums', () => {
      it('Result format declaration', () => {
        const type =
          apiTestModel.types.CreateQueryTask.properties.result_format.type
        expect(type instanceof EnumType).toBeTruthy()
        const actual = gen.declareType('', type)
        expect(actual).toEqual(`/**
 * Desired async query result format. Valid values are: "inline_json", "json", "json_detail", "json_fe", "csv", "html", "md", "txt", "xlsx", "gsxml". (Enum defined in CreateQueryTask)
 */
export enum ResultFormat {
  inline_json = 'inline_json',
  json = 'json',
  json_detail = 'json_detail',
  json_fe = 'json_fe',
  csv = 'csv',
  html = 'html',
  md = 'md',
  txt = 'txt',
  xlsx = 'xlsx',
  gsxml = 'gsxml'
}`)
      })
      it('Align declaration', () => {
        const type =
          apiTestModel.types.LookmlModelExploreField.properties.align.type
        expect(type instanceof EnumType).toBeTruthy()
        const actual = gen.declareType('', type)
        expect(actual).toEqual(`/**
 * The appropriate horizontal text alignment the values of this field should be displayed in. Valid values are: "left", "right". (Enum defined in LookmlModelExploreField)
 */
export enum Align {
  left = 'left',
  right = 'right'
}`)
      })
      it('array of enums', () => {
        const type = apiTestModel.types.RequiredResponseWithEnums
        const actual = gen.declareType(indent, type)
        expect(actual).toEqual(`export interface IRequiredResponseWithEnums {
  /**
   * Id of query to run
   */
  query_id: number | null
  /**
   * Desired async query result format. Valid values are: "inline_json", "json", "json_detail", "json_fe", "csv", "html", "md", "txt", "xlsx", "gsxml".
   */
  result_format: ResultFormat | null
  /**
   * An array of user attribute types that are allowed to be used in filters on this field. Valid values are: "advanced_filter_string", "advanced_filter_number", "advanced_filter_datetime", "string", "number", "datetime", "relative_url", "yesno", "zipcode". (read-only)
   */
  an_array_of_enums?: AnArrayOfEnums[]
  user: IUserPublic
  /**
   * Roles assigned to group (read-only)
   */
  roles?: IRole[] | null
}`)
      })

      it('duplicate enum resolution', () => {
        const type = apiTestModel.types.SecondResponseWithEnums
        // Should have:
        // - a fully named ResultFormat type because it doesn't match the other `ResultFormat` type declared previously
        // - an `another_format` property with `AnotherFormat` enum name with the same values as the previously declared `ResultFormat` type
        const type1 = apiTestModel.types.RequiredResponseWithEnums
        const rf1 = type1.properties.result_format.type as EnumType
        const rf2 = type.properties.another_format.type as EnumType
        const rf3 = type.properties.result_format.type as EnumType
        const otherValues = [
          'other',
          'json',
          'csv',
          'html',
          'md',
          'txt',
          'xlsx',
          'gsxml',
        ]
        expect(rf1.values).toEqual(rf2.values)
        expect(rf3.values).toEqual(otherValues)

        const actual = gen.declareType(indent, type)
        expect(actual).toEqual(`export interface ISecondResponseWithEnums {
  /**
   * Id of query to run
   */
  query_id: number | null
  /**
   * Desired async query result format. Valid values are: "inline_json", "json", "json_detail", "json_fe", "csv", "html", "md", "txt", "xlsx", "gsxml".
   */
  result_format: SecondResponseWithEnumsResultFormat | null
  /**
   * Desired async query result format. Valid values are: "inline_json", "json", "json_detail", "json_fe", "csv", "html", "md", "txt", "xlsx", "gsxml".
   */
  another_format?: AnotherFormat | null
  /**
   * An array of user attribute types that are allowed to be used in filters on this field. Valid values are: "advanced_filter_string", "advanced_filter_number", "advanced_filter_datetime", "string", "number", "datetime", "relative_url", "yesno", "zipcode". (read-only)
   */
  an_array_of_enums?: AnArrayOfEnums[]
  user: IUserPublic
  /**
   * Roles assigned to group (read-only)
   */
  roles?: IRole[] | null
}`)
      })
    })
  })
  describe.only('quokkas', () => {
    it.only('create TDD', () => {
      const method = apiTestModel.methods.create_user
      const expected = `
export const createUserSlice = createCreateDataSlice<
  IUser,
  { body?: Partial<IWriteUser>; fields?: string; options?: Partial<ITransportSettings> }
>({
  key: create_user.name,
  fetchFn: params => sdk.ok(create_user(sdk, params.body, params.fields, params.options)),
  defaultValue: {},
})`
      const actual = gen.declareSlice(indent, method)
      expect(actual).toEqual(expected)
    })

    it.only('read TDD', () => {
      const method = apiTestModel.methods.user
      const expected = `
`
      const actual = gen.declareSlice(indent, method)
      expect(actual).toEqual(expected)
    })
    it('readAll TDD', () => {
      const method = apiTestModel.methods.all_users
      const expected = `
`
      const actual = gen.declareSlice(indent, method)
      expect(actual).toEqual(expected)
    })
    it('update TDD', () => {
      const method = apiTestModel.methods.update_user
      const expected = `
`
      const actual = gen.declareSlice(indent, method)
      expect(actual).toEqual(expected)
    })
    it('delete TDD', () => {
      const method = apiTestModel.methods.delete_user
      const expected = `
`
      const actual = gen.declareSlice(indent, method)
      expect(actual).toEqual(expected)
    })
  })
})

// export const allUsersSlice = createReadDataSlice<
//   IUser[],
//   { request: IRequestAllUsers; options?: Record<string, unknown> }
// >({
//   key: all_users.name,
//   fetchFn: (params = { request: {} }) => {
//     return sdk.ok(all_users(sdk, params.request, params.options))
//   },
//   defaultValue: [],
// })
