using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json;

namespace Looker.RTL
{
    /**
     * Notes:
     *     https://docs.microsoft.com/en-us/aspnet/core/fundamentals/http-requests?view=aspnetcore-3.1
     * 
     */
    /** Interface for API transport values */
    public interface ITransportSettings
    {
        /** base URL of API REST web service */
        string BaseUrl { get; set; }

        /** whether to verify ssl certs or not. Defaults to true */
        bool VerifySsl { get; set; }

        /** request timeout in seconds. Default to 30 */
        int Timeout { get; set; }

        /** agent tag to use for the SDK requests  */
        string AgentTag { get; set; }
    }

    /**
     * HTTP response without any error handling. Based on Looker SDK response interface
     */
    public interface IRawResponse
    {
        /** ok is `true` if the response is successful, `false` otherwise */
        bool Ok { get; }

        /** HTTP response code */
        HttpStatusCode StatusCode { get; set; }

        /** HTTP response status message text */
        string StatusMessage { get; set; }

        /** MIME type of the response from the HTTP response header */
        string ContentType { get; set; }

        /** The body of the HTTP response, without any additional processing */
        object Body { get; set; }
    }

    public interface ISdkResponse<TSuccess, TError>
    {
        bool Ok { get; }
        TSuccess Value { get; set; }
        TError Error { get; set; }
    }

    public struct SdkResponse<TSuccess, TError> : ISdkResponse<TSuccess, TError>
    {
        public bool Ok => Value != null;
        public TSuccess Value { get; set; }
        public TError Error { get; set; }
    }

    /**
     * Http request authenticator callback used by AuthSession and any other automatically authenticating
     * request processor
     */
    public delegate HttpRequestMessage Authenticator(HttpRequestMessage init);

    /**
     * Concrete implementation of IRawResponse interface
     *
     * The `Ok` property is read-only, based on checking `StatusCode`.
     */
    public struct RawResponse : IRawResponse
    {
        public bool Ok => (StatusCode >= HttpStatusCode.OK && StatusCode < HttpStatusCode.Ambiguous);

        public HttpStatusCode StatusCode { get; set; }
        public string StatusMessage { get; set; }
        public string ContentType { get; set; }
        public object Body { get; set; }
    }

    public interface ITransport
    {
        Task<IRawResponse> RawRequest(
            HttpMethod method,
            string path,
            Values queryParams = null,
            object body = null,
            Authenticator authenticator = null,
            ITransportSettings options = null
        );

        Task<SdkResponse<TSuccess, TError>> Request<TSuccess, TError>(
            HttpMethod method,
            string path,
            Values queryParams = null,
            object body = null,
            Authenticator authenticator = null,
            ITransportSettings options = null
        ) where TSuccess : class where TError : class;
    }

    /// <summary>
    /// HTPP request processor
    /// </summary>
    public class Transport : ITransport, ITransportSettings
    {
        private readonly HttpClient _client;
        private readonly ITransportSettings _settings;

        static Transport()
        {
            // Long docs on DateTime support at https://docs.microsoft.com/en-us/dotnet/standard/datetime/system-text-json-support
            // JsonSerializerSettings settings = new JsonSerializerSettings
            // {
            //     DateFormatHandling = DateFormatHandling.IsoDateFormat,
            //     DateTimeZoneHandling = DateTimeZoneHandling.Utc
            // };            
        }

        public Transport(ITransportSettings settings, HttpClient client = null)
        {
            _client = client ?? new HttpClient();
            _settings = settings;
        }

        /**
         * Makes adjustments to path based on whether the path is relative or not
         */
        public string MakeUrl(string path, Values queryParams = null, Authenticator authenticator = null)
        {
            if (path.StartsWith("http:", StringComparison.InvariantCultureIgnoreCase)
                || path.StartsWith("https:", StringComparison.InvariantCultureIgnoreCase))
                return path;
            // TODO I don't think authenticator is needed here any more?
            return AddQueryParams($"{BaseUrl}{path}", queryParams);
        }

        /**
         * Encode parameter if not already encoded
         * @param value value of parameter
         * @returns URI encoded value
         */
        public static string EncodeParam(object value)
        {
            string encoded;
            switch (value)
            {
                case null:
                    return "";
                case DateTime time:
                {
                    var d = time;
                    encoded = d.ToString("O");
                    break;
                }
                case bool toggle:
                {
                    encoded = Convert.ToString(toggle).ToLowerInvariant();
                    break;
                }
                default:
                    encoded = Convert.ToString(value);
                    break;
            }

            var decoded = WebUtility.UrlDecode(encoded);
            if (encoded == decoded)
            {
                encoded = WebUtility.UrlEncode(encoded);
            }

            return encoded;
        }

        /**
         * Converts `Values` to query string parameter format
         * @param values Name/value collection to encode
         * @returns {string} query string parameter formatted values. Both `false` and `null` are included. Only `undefined` are omitted.
         */
        public static string EncodeParams(Values values = null)
        {
            if (values == null) return "";

            var args = values
                .Where(pair =>
                    pair.Value != null || (pair.Value is string && !string.IsNullOrEmpty(pair.Value.ToString())))
                .Select(x => $"{x.Key}=encodeParam(x.Value)");

            return string.Join("&", args);
        }

        /**
         * constructs the path argument including any optional query parameters
         * @param path the base path of the request
         * @param obj optional collection of query parameters to encode and append to the path
         */
        public static string AddQueryParams(string path, Values obj = null)
        {
            if (obj == null)
            {
                return path;
            }

            var sb = new StringBuilder(path);
            var qp = EncodeParams(obj);
            if (string.IsNullOrEmpty(qp)) return sb.ToString();
            sb.Append("?");
            sb.Append(qp);

            return sb.ToString();
        }

        public async Task<IRawResponse> RawRequest(
            HttpMethod method,
            string path,
            Values queryParams = null,
            object body = null,
            Authenticator authenticator = null,
            ITransportSettings options = null
        )
        {
            var url = MakeUrl(path, queryParams, authenticator);
            var request = new HttpRequestMessage(method,
                url);
            if (body != null)
            {
                if (body is string)
                {
                    request.Content = new StringContent(
                        body.ToString(),
                        Encoding.UTF8,
                        "application/x-www-form-urlencoded");
                }
                else
                {
                    request.Content =
                        new StringContent(
                            JsonSerializer.Serialize(body),
                            Encoding.UTF8,
                            "application/json");
                }
            }

            if (authenticator != null) request = authenticator(request);
            var response = await _client.SendAsync(request);
            var result = new RawResponse();
            response.Content.Headers.TryGetValues("Content-Type", out var values);
            result.StatusCode = response.StatusCode;
            result.StatusMessage = response.ReasonPhrase;
            // if (response.IsSuccessStatusCode)
            await using var stream = await response.Content.ReadAsStreamAsync();
            result.ContentType = string.Join("; ", values);
            // Simple content conversion here to make body easily readable in consumers
            switch (Constants.ResponseMode(result.ContentType))
            {
                case ResponseMode.Binary:
                    result.Body = Constants.StreamToByteArray(stream);
                    break;
                case ResponseMode.String:
                    using (var sr = new StreamReader(stream))
                    {
                        result.Body = await sr.ReadToEndAsync();
                    }

                    break;
                case ResponseMode.Unknown:
                    result.Body = Constants.StreamToByteArray(stream);
                    break;
                default:
                    throw new ArgumentOutOfRangeException($"Unrecognized Content Type {result.ContentType}");
            }

            return result;
        }

        public SdkResponse<TSuccess, TError> ParseResponse<TSuccess, TError>(IRawResponse response)
            where TSuccess : class where TError : class
        {
            switch (Constants.ResponseMode(response.ContentType))
            {
                case ResponseMode.Binary:
                    return new SdkResponse<TSuccess, TError>() {Value = response.Body as TSuccess};
                case ResponseMode.String:
                    if (response.ContentType.StartsWith("application/json"))
                    {
                        return new SdkResponse<TSuccess, TError>()
                        {
                            Value = JsonSerializer.Deserialize<TSuccess>(response.Body.ToString())
                        };
                    }
                    else
                    {
                        return new SdkResponse<TSuccess, TError>() {Value = response.Body.ToString() as TSuccess};
                    }
                case ResponseMode.Unknown:
                    return new SdkResponse<TSuccess, TError>()
                    {
                        Error = JsonSerializer.Deserialize<TError>(response.Body.ToString())
                    };
                default:
                    throw new ArgumentOutOfRangeException($"Unrecognized Content Type {response.ContentType}");
            }
        }

        public async Task<SdkResponse<TSuccess, TError>> Request<TSuccess, TError>(
            HttpMethod method,
            string path,
            Values queryParams = null,
            object body = null,
            Authenticator authenticator = null,
            ITransportSettings options = null
        ) where TSuccess : class where TError : class
        {
            var raw = await RawRequest(method, path, queryParams, body, authenticator, options);
            return ParseResponse<TSuccess, TError>(raw);
        }

        public string BaseUrl
        {
            get => _settings.BaseUrl;
            set => _settings.BaseUrl = value;
        }

        public bool VerifySsl
        {
            get => _settings.VerifySsl;
            set => _settings.VerifySsl = value;
        }

        public int Timeout
        {
            get => _settings.Timeout;
            set => _settings.Timeout = value;
        }

        public string AgentTag
        {
            get => _settings.AgentTag;
            set => _settings.AgentTag = value;
        }
    }
}