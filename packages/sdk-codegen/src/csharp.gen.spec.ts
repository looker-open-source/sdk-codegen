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

import { CSharpGen } from './csharp.gen';
import { TestConfig } from './testUtils';

const config = TestConfig();
const apiTestModel = config.apiTestModel;

const gen = new CSharpGen(apiTestModel);
const indent = '';

describe('c# generator', () => {
  describe('reserved words', () => {
    it('readonly', () => {
      expect(gen.reserve('readonly')).toEqual('@readonly');
      expect(gen.reserve('readOnly')).toEqual('readOnly');
    });
    it('string', () => {
      expect(gen.reserve('string')).toEqual('@string');
      expect(gen.reserve('String')).toEqual('String');
    });
  });
  it('comment header', () => {
    const text = 'line1\nline2';
    const actual = gen.commentHeader(indent, text);
    const expected = `/// line1
/// line2
`;
    expect(actual).toEqual(expected);
  });

  describe('summarizes', () => {
    it('one line', () => {
      const text = 'description';
      const actual = gen.summary(indent, text);
      expect(actual).toEqual(`/// <summary>${text}</summary>
`);
    });
    it('two lines', () => {
      const text = 'two\nlines';
      const actual = gen.summary(indent, text);
      expect(actual).toEqual(`/// <summary>
/// two
/// lines
/// </summary>
`);
    });
  });

  it('deprecated method with deprecated params', () => {
    const method = apiTestModel.methods.old_login;
    const arg = method.params[0];
    expect(arg.deprecated).toEqual(true);
    const expected = `/// Endpoint to test deprecation flags
///
/// GET /old_login -> AccessToken
///
/// <returns><c>AccessToken</c> Access token with metadata. (application/json)</returns>
///
/// <param name="old_cred">(DEPRECATED) obsolete parameter</param>
[Obsolete("Deprecated")]
public async Task<SdkResponse<AccessToken, Exception>> old_login(
  string? old_cred = null,
  ITransportSettings? options = null)
{
  return await AuthRequest<AccessToken, Exception>(HttpMethod.Get, "/old_login", new Values {
      { "old_cred", old_cred }},null,options);
}`;
    const actual = gen.declareMethod(indent, method);
    expect(actual).toEqual(expected);
  });

  describe('type creation', () => {
    it('generates a type', () => {
      const type = apiTestModel.types.AccessToken;
      const expected = `public class AccessToken : SdkModel
{
  /// <summary>Access Token used for API calls (read-only)</summary>
  public string? access_token { get; set; } = null;
  /// <summary>Type of Token (read-only)</summary>
  public string? token_type { get; set; } = null;
  /// <summary>Number of seconds before the token expires (read-only)</summary>
  public long? expires_in { get; set; } = null;
  /// <summary>Refresh token which can be used to obtain a new access token (read-only)</summary>
  public string? refresh_token { get; set; } = null;
}`;
      const actual = gen.declareType(indent, type);
      expect(actual).toEqual(expected);
    });

    it('noComment type', () => {
      const type = apiTestModel.types.AccessToken;
      const expected = `public class AccessToken : SdkModel
{
  public string? access_token { get; set; } = null;
  public string? token_type { get; set; } = null;
  public long? expires_in { get; set; } = null;
  public string? refresh_token { get; set; } = null;
}`;
      gen.noComment = true;
      const actual = gen.declareType(indent, type);
      gen.noComment = false;
      expect(actual).toEqual(expected);
    });

    it('with special names', () => {
      const type = apiTestModel.types.HyphenType;
      const actual = gen.declareType(indent, type);
      expect(actual).toEqual(`public class HyphenType : SdkModel
{
  /// <summary>A normal variable name (read-only)</summary>
  public string? project_name { get; set; } = null;
  /// <summary>A hyphenated property name (read-only)</summary>
  [JsonProperty("project-digest")]
  public string? project_digest { get; set; } = null;
  /// <summary>A spaced out property name (read-only)</summary>
  [JsonProperty("computation time")]
  public float? computation_time { get; set; } = null;
}`);
    });

    it('with arrays and hashes', () => {
      const type = apiTestModel.types.Workspace;
      const actual = gen.declareType(indent, type);
      expect(actual).toEqual(`public class Workspace : SdkModel
{
  /// <summary>Operations the current user is able to perform on this object (read-only)</summary>
  public StringDictionary<bool>? can { get; set; } = null;
  /// <summary>The unique id of this user workspace. Predefined workspace ids include "production" and "dev" (read-only)</summary>
  public string? id { get; set; } = null;
  /// <summary>The local state of each project in the workspace (read-only)</summary>
  public Project[]? projects { get; set; } = null;
}`);
    });
    it('required properties', () => {
      const type = apiTestModel.types.CreateQueryTask;
      const actual = gen.declareType(indent, type);
      expect(actual).toEqual(`public class CreateQueryTask : SdkModel
{
  /// <summary>Operations the current user is able to perform on this object (read-only)</summary>
  public StringDictionary<bool>? can { get; set; } = null;
  /// <summary>Id of query to run</summary>
  public long query_id { get; set; }
  /// <summary>Desired async query result format. Valid values are: "inline_json", "json", "json_detail", "json_fe", "csv", "html", "md", "txt", "xlsx", "gsxml".</summary>
  [JsonConverter(typeof(StringEnumConverter))]
  public ResultFormat result_format { get; set; }
  /// <summary>Source of query task</summary>
  public string? source { get; set; } = null;
  /// <summary>Create the task but defer execution</summary>
  public bool? deferred { get; set; } = null;
  /// <summary>Id of look associated with query.</summary>
  public long? look_id { get; set; } = null;
  /// <summary>Id of dashboard associated with query.</summary>
  public string? dashboard_id { get; set; } = null;
}`);
    });
    it.skip('enum declaration with reserved words', () => {
      const type =
        apiTestModel.types.LookmlModelExploreField.properties
          .user_attribute_filter_types.type;
      const actual = gen.declareType('', type);
      const expected = `/// An array of user attribute types that are allowed to be used in filters on this field. Valid values are: "advanced_filter_string", "advanced_filter_number", "advanced_filter_datetime", "string", "number", "datetime", "relative_url", "yesno", "zipcode".
public enum UserAttributeFilterTypes
{
  [EnumMember(Value = "advanced_filter_string")]
  advanced_filter_string,
  [EnumMember(Value = "advanced_filter_number")]
  advanced_filter_number,
  [EnumMember(Value = "advanced_filter_datetime")]
  advanced_filter_datetime,
  [EnumMember(Value = "string")]
  @string,
  [EnumMember(Value = "number")]
  number,
  [EnumMember(Value = "datetime")]
  datetime,
  [EnumMember(Value = "relative_url")]
  relative_url,
  [EnumMember(Value = "yesno")]
  yesno,
  [EnumMember(Value = "zipcode")]
  zipcode
}`;
      expect(actual).toEqual(expected);
    });
  });

  describe('methods', () => {
    it('generates a method with multiple return types', () => {
      const method = apiTestModel.methods.run_sql_query;
      const expected = `/// Execute a SQL Runner query in a given result_format.
///
/// POST /sql_queries/{slug}/run/{result_format} -> string
///
/// **Note**: Binary content may be returned by this method.
///
/// <returns>
/// <c>string</c> SQL Runner Query (text)
/// <c>string</c> SQL Runner Query (application/json)
/// <c>string</c> SQL Runner Query (image/png)
/// <c>string</c> SQL Runner Query (image/jpeg)
/// </returns>
///
/// <param name="slug">slug of query</param>
/// <param name="result_format">Format of result, options are: ["inline_json", "json", "json_detail", "json_fe", "csv", "html", "md", "txt", "xlsx", "gsxml", "json_label"]</param>
/// <param name="download">Defaults to false. If set to true, the HTTP response will have content-disposition and other headers set to make the HTTP response behave as a downloadable attachment instead of as inline content.</param>
public async Task<SdkResponse<TSuccess, Exception>> run_sql_query<TSuccess>(
  string slug,
  string result_format,
  string? download = null,
  ITransportSettings? options = null) where TSuccess : class
{
    slug = SdkUtils.EncodeParam(slug);
    result_format = SdkUtils.EncodeParam(result_format);
  return await AuthRequest<TSuccess, Exception>(HttpMethod.Post, $"/sql_queries/{slug}/run/{result_format}", new Values {
      { "download", download }},null,options);
}`;
      const actual = gen.declareMethod(indent, method);
      expect(actual).toEqual(expected);
    });
    it('noComment method with multiple return types', () => {
      const method = apiTestModel.methods.run_sql_query;
      const expected = `public async Task<SdkResponse<TSuccess, Exception>> run_sql_query<TSuccess>(
  string slug,
  string result_format,
  string? download = null,
  ITransportSettings? options = null) where TSuccess : class
{
    slug = SdkUtils.EncodeParam(slug);
    result_format = SdkUtils.EncodeParam(result_format);
  return await AuthRequest<TSuccess, Exception>(HttpMethod.Post, $"/sql_queries/{slug}/run/{result_format}", new Values {
      { "download", download }},null,options);
}`;
      gen.noComment = true;
      const actual = gen.declareMethod(indent, method);
      gen.noComment = false;
      expect(actual).toEqual(expected);
    });
    it('generates a method with a single return type', () => {
      const method = apiTestModel.methods.query_task_multi_results;
      const expected = `/// ### Fetch results of multiple async queries
///
/// Returns the results of multiple async queries in one request.
///
/// For Query Tasks that are not completed, the response will include the execution status of the Query Task but will not include query results.
/// Query Tasks whose results have expired will have a status of 'expired'.
/// If the user making the API request does not have sufficient privileges to view a Query Task result, the result will have a status of 'missing'
///
/// GET /query_tasks/multi_results -> StringDictionary<string>
///
/// <returns><c>StringDictionary<string></c> Multiple query results (application/json)</returns>
///
/// <param name="query_task_ids">List of Query Task IDs</param>
public async Task<SdkResponse<StringDictionary<string>, Exception>> query_task_multi_results(
  DelimArray<string> query_task_ids,
  ITransportSettings? options = null)
{
  return await AuthRequest<StringDictionary<string>, Exception>(HttpMethod.Get, "/query_tasks/multi_results", new Values {
      { "query_task_ids", query_task_ids }},null,options);
}`;
      const actual = gen.declareMethod(indent, method);
      expect(actual).toEqual(expected);
    });
  });
});
