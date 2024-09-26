using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace Looker.RTL
{
    // Ref: https://docs.microsoft.com/en-us/aspnet/core/fundamentals/http-requests?view=aspnetcore-3.1

    /// <summary>
    /// Interface for API transport values
    /// </summary>
    public interface ITransportSettings
    {
        /// base URL of API REST web service
        string BaseUrl { get; }

        /// whether to verify ssl certs or not. Defaults to true
        bool VerifySsl { get; }

        /// request timeout in seconds. Default to 30
        int Timeout { get; }

        /// agent tag to use for the SDK requests
        string AgentTag { get; set; }

        IDictionary<string, string> Headers { get; }
    }

    /// <summary>
    /// HTTP response without any error handling. Based on Looker SDK response interface
    /// </summary>
    public interface IRawResponse
    {
        /// <summary>
        /// ok is <c>true</c> if the response is successful, <c>false</c> otherwise
        /// </summary>
        bool Ok { get; }

        HttpStatusCode StatusCode { get; set; }

        /// <summary>
        /// HTTP response status message text
        /// </summary>
        string StatusMessage { get; set; }

        /// <summary>
        /// MIME type of the response from the HTTP response header as a semicolon-delimited string
        /// </summary>
        string ContentType { get; set; }

        /// <summary>
        /// The body of the HTTP response, with minimal conversion
        /// </summary>
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

    /// <summary>
    /// Http request authenticator callback used by AuthSession and any other automatically authenticating request processor
    /// </summary>
    /// <param name="request">request to update with auth properties</param>
    public delegate Task<HttpRequestMessage> Authenticator(HttpRequestMessage request);

    /// <summary>
    /// Concrete implementation of IRawResponse interface
    /// </summary>
    /// <remarks>
    /// The <c>Ok</c> property is read-only, determining its value by checking <c>StatusCode</c>.
    /// </remarks>
    public struct RawResponse : IRawResponse
    {
        public bool Ok => (StatusCode >= HttpStatusCode.OK && StatusCode < HttpStatusCode.Ambiguous);
        public HttpMethod Method { get; set; }
        public HttpStatusCode StatusCode { get; set; }
        public string StatusMessage { get; set; }
        public string ContentType { get; set; }
        public object Body { get; set; }
    }

    /// <summary>
    /// The HTTP request/response processing interface
    /// </summary>
    public interface ITransport
    {
        /// <summary>
        /// Process a request without type conversion or error handling
        /// </summary>
        /// <param name="method">the <c>HttpMethod</c> to use</param>
        /// <param name="path">the url path (either absolute or relative)</param>
        /// <param name="queryParams">optional query parameters</param>
        /// <param name="body">optional body value.
        /// If the body is a <c>string</c> type, the post will be marked as <c>x-www-urlformencoded</c>.
        /// Otherwise, it will be converted to JSON.
        /// </param>
        /// <param name="authenticator">Optional authenticator callback for the request.</param>
        /// <param name="options">Transport option overrides, such as a different timeout.
        /// TODO not implemented yet
        /// </param>
        /// <returns>the raw response to the HTTP request. The <c>Ok</c> property will be <c>False</c> if the request failed.</returns>
        Task<IRawResponse> RawRequest(
            HttpMethod method,
            string path,
            Values queryParams = null,
            object body = null,
            Authenticator authenticator = null,
            ITransportSettings options = null
        );

        /// <summary>
        /// Process an HTTP request and convert it to the indicated type
        /// </summary>
        /// <param name="method">the <c>HttpMethod</c> to use</param>
        /// <param name="path">the url path (either absolute or relative)</param>
        /// <param name="queryParams">optional query parameters</param>
        /// <param name="body">optional body value.
        /// If the body is a <c>string</c> type, the post will be marked as <c>x-www-urlformencoded</c>.
        /// Otherwise, it will be converted to JSON.
        /// </param>
        /// <param name="authenticator">Optional authenticator callback for the request.</param>
        /// <param name="options">Transport option overrides, such as a different timeout.
        /// TODO not implemented yet
        /// </param>
        /// <typeparam name="TSuccess">Type of response if the request succeeds</typeparam>
        /// <typeparam name="TError">Type of response if the request fails</typeparam>
        /// <returns>A <c>TSuccess</c> response if successful, a <c>TError</c> response if not.</returns>
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
    public class Transport : ITransport
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

        /// <summary>
        ///  Makes adjustments to path based on whether the path is relative or not
        /// </summary>
        /// <param name="path"></param>
        /// <param name="queryParams"></param>
        /// <param name="authenticator"></param>
        /// <returns></returns>
        public string MakeUrl(string path, Values queryParams = null, Authenticator authenticator = null)
        {
            if (path.StartsWith("http:", StringComparison.InvariantCultureIgnoreCase)
                || path.StartsWith("https:", StringComparison.InvariantCultureIgnoreCase))
                return SdkUtils.AddQueryParams(path, queryParams);
            // TODO I don't think authenticator is needed here any more?
            return SdkUtils.AddQueryParams($"{_settings.BaseUrl}{path}", queryParams);
        }

        private static RawResponse InitRawResponse(HttpResponseMessage response)
        {
            var raw = new RawResponse();
            if (response != null)
            {
                raw.Method = response.RequestMessage.Method;
                raw.StatusCode = response.StatusCode;
                raw.StatusMessage = response.ReasonPhrase;
                response.Content.Headers.TryGetValues("Content-Type", out var values);
                raw.ContentType = string.Join("; ", values ?? new [] {"text/plain"});
            }
            else
            {
                raw.StatusCode = HttpStatusCode.BadRequest;
                raw.ContentType = "text/plain";
                raw.Body = new SdkError("Response is null. That's all I know.");
            }
            return raw;
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
            request.Headers.Add(Constants.LookerAppiId, _settings.AgentTag);
            foreach(var h in _settings.Headers)
            {
                if (request.Headers.Contains(h.Key))
                {
                    request.Headers.Remove(h.Key);
                }
                request.Headers.Add(h.Key, h.Value);
            }
            if (options != null)
            {
                foreach (var h in options.Headers)
                {
                    if (request.Headers.Contains(h.Key))
                    {
                        request.Headers.Remove(h.Key);
                    }
                    request.Headers.Add(h.Key, h.Value);
                }
            }

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
                            JsonConvert.SerializeObject(body, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore }),
                            Encoding.UTF8,
                            "application/json");
                }
            }

            if (authenticator != null) request = await authenticator(request);
            RawResponse result = new RawResponse();
            HttpResponseMessage response = null;
            try
            {
                response = await _client.SendAsync(request);
                response.EnsureSuccessStatusCode();
                result = InitRawResponse(response);
                // if (response.IsSuccessStatusCode)
                using (var stream = await response.Content.ReadAsStreamAsync())
                {
                    // Simple content conversion here to make body easily readable in consumers
                    switch (SdkUtils.ResponseMode(result.ContentType))
                    {
                        case ResponseMode.Binary:
                            result.Body = SdkUtils.StreamToByteArray(stream);
                            break;
                        case ResponseMode.String:
                            using (var sr = new StreamReader(stream))
                            {
                                result.Body = await sr.ReadToEndAsync();
                            }

                            break;
                        case ResponseMode.Unknown:
                            result.Body = SdkUtils.StreamToByteArray(stream);
                            break;
                        default:
                            throw new ArgumentOutOfRangeException($"Unrecognized Content Type {result.ContentType}");
                    }
                }
            }
            catch (Exception e)
            {
                result = InitRawResponse(response);
                result.Body = e;
            }

            return result;
        }

        public static SdkResponse<TSuccess, TError> ParseResponse<TSuccess, TError>(IRawResponse response)
            where TSuccess : class where TError : class
        {
            if (response.Body is Exception)
            {
                return new SdkResponse<TSuccess, TError> { Error = response.Body as TError};
            }

            switch (SdkUtils.ResponseMode(response.ContentType))
            {
                case ResponseMode.Binary:
                    return new SdkResponse<TSuccess, TError> {Value = response.Body as TSuccess};
                case ResponseMode.String:
                    if (response.ContentType.StartsWith("application/json"))
                    {
                        return new SdkResponse<TSuccess, TError>
                        {
                            Value = JsonConvert.DeserializeObject<TSuccess>(response.Body.ToString())
                        };
                    }
                    else
                    {
                        return new SdkResponse<TSuccess, TError> {Value = response.Body.ToString() as TSuccess};
                    }
                case ResponseMode.Unknown:
                    return new SdkResponse<TSuccess, TError>
                    {
                        Error = JsonConvert.DeserializeObject<TError>(response.Body.ToString())
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
    }
}
