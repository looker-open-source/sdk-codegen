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
import { CSharpGen } from './csharp.gen'
import { TestConfig } from './testUtils'

const config = TestConfig()
const apiTestModel = config.apiTestModel

const gen = new CSharpGen(apiTestModel)
const indent = ''

describe('csharp generator', () => {
  it('comment header', () => {
    const text = 'line1\nline2'
    const actual = gen.commentHeader(indent, text)
    const expected = `/// line1
/// line2
`
    expect(actual).toEqual(expected)
  })

  it('summary comment', () => {
    const text = 'description'
    const actual = gen.summary(indent, text)
    expect(actual).toEqual(`/// <summary>description</summary>
`)
  })

  it('generates a type', () => {
    const type = apiTestModel.types.AccessToken
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
}`
    const actual = gen.declareType(indent, type)
    expect(actual).toEqual(expected)
  })

  it('generates a method', () => {
    const method = apiTestModel.methods.run_sql_query
    const expected = `/// Execute a SQL Runner query in a given result_format.
/// 
/// POST /sql_queries/{slug}/run/{result_format} -> string
/// 
/// **Note**: Binary content may be returned by this method.
/// <param name="slug">slug of query</param>
/// <param name="result_format">Format of result, options are: ["inline_json", "json", "json_detail", "json_fe", "csv", "html", "md", "txt", "xlsx", "gsxml", "json_label"]</param>
/// <param name="download">Defaults to false. If set to true, the HTTP response will have content-disposition and other headers set to make the HTTP response behave as a downloadable attachment instead of as inline content.</param>
public async Task<SdkResponse<TSuccess, TError>> run_sql_query<TSuccess, TError>(
  string slug,
  string result_format,
  string? download = null,
  ITransportSettings? options = null) where TSuccess : class where TError : Exception
{
    slug = SdkUtils.EncodeParam(slug);
    result_format = SdkUtils.EncodeParam(result_format);
  return await AuthRequest<TSuccess, TError>(HttpMethod.Post, $"/sql_queries/{slug}/run/{result_format}", new Values {
      { "download", download }},null,options);
}`
    const actual = gen.declareMethod(indent, method)
    expect(actual).toEqual(expected)
  })

})
