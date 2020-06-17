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
    expect(actual).toEqual(`/// <summary>
/// ${text}
/// </summary>
`)
  })

  it('generates a method', () => {
    const method = apiTestModel.methods.run_sql_query
    const expected = `/// Execute a SQL Runner query in a given result_format.
/// 
/// POST /sql_queries/{slug}/run/{result_format} -> string
/// 
/// **Note**: Binary content may be returned by this method.
async Task<SdkResponse<TSuccess, TError>> run_sql_query<TSuccess, TError>(
  /// <param name=string>slug of query</param>
  slug: string,
  /// <param name=string>Format of result, options are: ["inline_json", "json", "json_detail", "json_fe", "csv", "html", "md", "txt", "xlsx", "gsxml", "json_label"]</param>
  result_format: string,
  /// <param name=string>Defaults to false. If set to true, the HTTP response will have content-disposition and other headers set to make the HTTP response behave as a downloadable attachment instead of as inline content.</param>
  download: string = null,
  ITransportSettings options = null)
{
    slug = EncodeParam(slug);
    result_format = EncodeParam(result_format);
  return this.AuthRequest<TSuccess, TError>(HttpMethod.Post, $"/sql_queries/{slug}/run/{result_format}", new Values = {{ "download" = download }});
}`
    const actual = gen.declareMethod(indent, method)
    expect(actual).toEqual(expected)
  })

})

