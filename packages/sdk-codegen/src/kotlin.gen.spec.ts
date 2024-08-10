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

import { DelimArray } from '@looker/sdk-rtl';
import { TestConfig } from '@looker/sdk-codegen-utils';
import type { IEnumType } from './sdkModels';
import { KotlinGen } from './kotlin.gen';

const config = TestConfig();
const apiTestModel = config.apiTestModel;
const gen = new KotlinGen(apiTestModel);
const indent = '';

describe('Kotlin generator', () => {
  describe('comment header', () => {
    it('is empty with no comment', () => {
      expect(gen.commentHeader(indent, '')).toEqual('');
    });

    it('is four lines with a two line comment', () => {
      const expected = `/**
 * foo
 * bar
 */
`;
      expect(gen.commentHeader(indent, 'foo\nbar')).toEqual(expected);
    });
  });

  describe('types', () => {
    it('enum type', () => {
      const type = apiTestModel.types.PermissionType as IEnumType;
      expect(type).toBeDefined();
      expect(type.values).toEqual(['view', 'edit']);
      const expected = `/**
 * Type of permission: "view" or "edit" Valid values are: "view", "edit". (Enum defined in ContentMetaGroupUser)
 */
enum class PermissionType : Serializable {
    view,
    edit
}`;
      const actual = gen.declareType('', type);
      expect(actual).toEqual(expected);
    });

    it('noComment enum type', () => {
      const type = apiTestModel.types.PermissionType as IEnumType;
      expect(type).toBeDefined();
      expect(type.values).toEqual(['view', 'edit']);
      const expected = `enum class PermissionType : Serializable {
    view,
    edit
}`;
      gen.noComment = true;
      const actual = gen.declareType('', type);
      gen.noComment = false;
      expect(actual).toEqual(expected);
    });

    it('special needs', () => {
      const type = apiTestModel.types.HyphenType;
      const actual = gen.declareType('', type);
      const expected = `/**
 * @property project_name A normal variable name (read-only)
 * @property project_digest A hyphenated property name (read-only)
 * @property computation_time A spaced out property name (read-only)
 */
data class HyphenType (
    var project_name: String? = null,
    @SerializedName("project-digest")
    var project_digest: String? = null,
    @SerializedName("computation time")
    var computation_time: Float? = null
) : Serializable`;
      expect(actual).toEqual(expected);
    });
  });

  it('deprecated method with deprecated params', () => {
    const method = apiTestModel.methods.old_login;
    const arg = method.params[0];
    expect(arg.deprecated).toEqual(true);
    const space = ' ';
    const expected = `
/**
 * Endpoint to test deprecation flags
 *
 * @param {String} old_cred (DEPRECATED) obsolete parameter
 *
 * GET /old_login -> AccessToken
 */
@Deprecated(message = "Deprecated method")
@JvmOverloads fun old_login(
    old_cred: String? = null
) : SDKResponse {
    return this.get<AccessToken>("/old_login",${space}
        mapOf("old_cred" to old_cred))
}`;
    const actual = gen.declareMethod(indent, method);
    expect(actual).toEqual(expected);
  });

  describe('makeTheCall', () => {
    const fields = 'id,user_id,title,description';
    it('handles no params', () => {
      const inputs = {};
      const method = apiTestModel.methods.look;
      const actual = gen.makeTheCall(method, inputs);
      const expected = 'val response = await sdk.ok<LookWithQuery>(sdk.look())';
      expect(actual).toEqual(expected);
    });

    it('assigns single param', () => {
      const inputs = { look_id: 17 };
      const method = apiTestModel.methods.look;
      const actual = gen.makeTheCall(method, inputs);
      const expected = `val response = await sdk.ok<LookWithQuery>(sdk.look("17"))`;
      expect(actual).toEqual(expected);
    });

    it('assigns simple params', () => {
      const inputs = { look_id: 17, fields };
      const method = apiTestModel.methods.look;
      const actual = gen.makeTheCall(method, inputs);
      const expected = `val response = await sdk.ok<LookWithQuery>(sdk.look(
    "17", fields = "${fields}"))`;
      expect(actual).toEqual(expected);
    });

    it('assigns a body param', () => {
      const body = {
        title: 'test title',
        description: 'gen test',
        query: {
          model: 'the_look',
          view: 'users',
          total: true,
        },
      };
      const inputs = { look_id: 17, body, fields };
      const method = apiTestModel.methods.update_look;
      const actual = gen.makeTheCall(method, inputs);
      const expected = `val response = await sdk.ok<LookWithQuery>(sdk.update_look(
    "17", WriteLookWithQuery(
        title = "test title",
        description = "gen test",
        query = WriteQuery(
            model = "the_look",
            view = "users",
            total = true
        )
    ), fields = "id,user_id,title,description"))`;
      expect(actual).toEqual(expected);
    });

    it('treats void response type as String', () => {
      const inputs = { look_id: 17, result_format: 'png', limit: 10 };
      const method = apiTestModel.methods.run_look;
      const actual = gen.makeTheCall(method, inputs);
      const expected = `val response = await sdk.ok<String>(sdk.run_look(
    "17", "png", limit = 10))`;
      expect(actual).toEqual(expected);
    });

    it('assigns an enum', () => {
      const inputs = {
        body: {
          query_id: 1,
          result_format: 'csv',
        },
      };
      const method = apiTestModel.methods.create_query_task;
      const actual = gen.makeTheCall(method, inputs);
      const expected = `val response = await sdk.ok<QueryTask>(sdk.create_query_task(
    WriteCreateQueryTask(
        query_id = "1",
        result_format = ResultFormat.csv
    )))`;
      expect(actual).toEqual(expected);
    });

    it('assigns a DelimArray', () => {
      const inputs = {
        ids: new DelimArray<number>([1, 2, 3]),
      };
      const method = apiTestModel.methods.all_users;
      const actual = gen.makeTheCall(method, inputs);
      const expected = `val response = await sdk.ok<Array<User>>(sdk.all_users(
    ids = DelimArray<String>(arrayOf(1,2,3))))`;
      expect(actual).toEqual(expected);
    });

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
      };
      const inputs = { body, fields };
      const method = apiTestModel.methods.create_merge_query;
      const actual = gen.makeTheCall(method, inputs);
      const expected = `val response = await sdk.ok<MergeQuery>(sdk.create_merge_query(
    body = WriteMergeQuery(
        pivots = arrayOf(
            "one",
            "two",
            "three"
        ),
        sorts = arrayOf("a"),
        source_queries = arrayOf(
            MergeQuerySourceQuery(
                merge_fields = arrayOf(
                    MergeFields(
                        field_name = "merge_1",
                        source_field_name = "source_1"
                    )
                ),
                name = "first query",
                query_id = "1"
            ),
            MergeQuerySourceQuery(
                merge_fields = arrayOf(
                    MergeFields(
                        field_name = "merge_2",
                        source_field_name = "source_2"
                    )
                ),
                name = "second query",
                query_id = "2"
            )
        )
    ), fields = "id,user_id,title,description"))`;
      expect(actual).toEqual(expected);
    });

    it('assigns dictionaries', () => {
      const query = {
        connection_name: 'looker',
        model_name: 'the_look',
        vis_config: { first: 1, second: 'two' },
      };
      const inputs = { body: query };
      const method = apiTestModel.methods.create_sql_query;
      const expected = `val response = await sdk.ok<SqlQuery>(sdk.create_sql_query(
    SqlQueryCreate(
        connection_name = "looker",
        model_name = "the_look",
        vis_config = mapOf(
            "first" to 1,
            "second" to "two"
        )
    )))`;
      const actual = gen.makeTheCall(method, inputs);
      expect(actual).toEqual(expected);
    });

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
      };
      const method = apiTestModel.methods.update_dashboard;
      const expected = `val response = await sdk.ok<Dashboard>(sdk.update_dashboard(
    "10", WriteDashboard(
        description = "",
        hidden = false,
        query_timezone = "",
        refresh_interval = "",
        folder = WriteFolderBase(),
        title = "",
        slug = "",
        preferred_viewer = "",
        alert_sync_with_dashboard_filter_enabled = false,
        background_color = "",
        crossfilter_enabled = false,
        deleted = false,
        filters_bar_collapsed = false,
        load_configuration = "",
        lookml_link_id = "",
        show_filters_bar = false,
        show_title = false,
        folder_id = "",
        text_tile_text_color = "",
        tile_background_color = "",
        tile_text_color = "",
        title_color = "",
        appearance = DashboardAppearance(
            page_side_margins = 0,
            page_background_color = "",
            tile_title_alignment = "",
            tile_space_between = 0,
            tile_background_color = "",
            tile_shadow = false,
            key_color = ""
        )
    )))`;
      const actual = gen.makeTheCall(method, inputs);
      expect(actual).toEqual(expected);
    });

    describe('hashValue', () => {
      it('assigns a hash with heterogeneous values', () => {
        const token = {
          access_token: 'backstage',
          token_type: 'test',
          expires_in: 10,
        };
        const oneItem = [1];
        const threeItems = ['Abe', 'Zeb', token];
        const inputs = {
          item: oneItem,
          items: threeItems,
          first: 1,
          second: 'two',
          third: false,
          token,
        };
        const expected = `mapOf(
    "item" to arrayOf(1),
    "items" to arrayOf(
        "Abe",
        "Zeb",
        mapOf(
            "access_token" to "backstage",
            "token_type" to "test",
            "expires_in" to 10
        )
    ),
    "first" to 1,
    "second" to "two",
    "third" to false,
    "token" to mapOf(
        "access_token" to "backstage",
        "token_type" to "test",
        "expires_in" to 10
    )
)`;
        const actual = gen.hashValue('', inputs);
        expect(actual).toEqual(expected);
      });
    });
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
        };
        const type = apiTestModel.types.MergeQuerySourceQuery;
        expect(type).toBeDefined();
        const expected = `MergeQuerySourceQuery(
        merge_fields = arrayOf(
            MergeFields(
                field_name = "merge_1",
                source_field_name = "source_1"
            )
        ),
        name = "first query",
        query_id = "1"
    )`;
        const actual = gen.assignType(gen.indentStr, type, inputs);
        expect(actual).toEqual(expected);
      });
    });
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
        ];
        const props = apiTestModel.types.WriteMergeQuery.properties;
        const type = props.source_queries.type;
        expect(type).toBeDefined();
        const actual = gen.arrayValue('', type, sourceQueries);
        const expected = `arrayOf(
    MergeQuerySourceQuery(
        merge_fields = arrayOf(
            MergeFields(
                field_name = "merge_1",
                source_field_name = "source_1"
            )
        ),
        name = "first query",
        query_id = "1"
    ),
    MergeQuerySourceQuery(
        merge_fields = arrayOf(
            MergeFields(
                field_name = "merge_2",
                source_field_name = "source_2"
            )
        ),
        name = "second query",
        query_id = "2"
    )
)`;
        expect(actual).toEqual(expected);
      });
    });
  });
});
