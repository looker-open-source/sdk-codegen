using System;
using System.Net.Http;
using System.Threading.Tasks;

namespace Looker.RTL
{
    public class ApiMethods
    {
        private readonly string _apiPath = "";
        private Authenticator _authenticator;
        public string ApiVersion = Constants.DefaultApiVersion;
        public IAuthSession AuthSession;


        /// <summary>
        /// Bare bones constructor in case someone wants none of the automatic behavior at all
        /// </summary>
        public ApiMethods()
        {
            _authenticator = request => AuthSession.Authenticate(request);
        }

        /// <summary>
        /// Recommended constructor for ApiMethods
        /// </summary>
        /// <param name="authSession">AuthSession to manage automatic auth</param>
        /// <param name="apiVersion">Version of the API. Should be "4.0"</param>
        public ApiMethods(IAuthSession authSession, string apiVersion = Constants.DefaultApiVersion)
        {
            _authenticator = request => AuthSession.Authenticate(request);
            AuthSession = authSession;
            ApiVersion = apiVersion;
            AuthSession.Settings.AgentTag = $"{Constants.AgentPrefix} {Constants.LookerVersion}.{ApiVersion}";
            _apiPath = AuthSession.Settings.BaseUrl.IsNullOrEmpty()
                ? ""
                : $"{AuthSession.Settings.BaseUrl}/api/{ApiVersion}";
        }

        // TODO do we need a factory for the various looker versions similar to TypeScript's:
        // static create<T extends APIMethods>(
        // type: new (authSession: IAuthSession) => T,
        // authSession: IAuthSession
        // ): T {
        //     return new type(authSession)
        // }

        public Task<TSuccess> Ok<TSuccess, TError>(Task<SdkResponse<TSuccess, TError>> task) where TSuccess : class
            where TError : Exception
        {
            return SdkUtils.Ok(task);
        }


        /// <summary>
        /// Determine whether the URL should be an API path, relative to BaseUrl, or is already a full URL
        /// </summary>
        /// <param name="path">path to update</param>
        /// <param name="settings">settings with <c>BaseUrl</c> assigned</param>
        /// <param name="authenticator">Optional authenticator callback</param>
        /// <remarks>Relative paths are expected to start with <c>/</c></remarks>
        /// <returns>Current path if full, api or base url path if relative</returns>
        public string MakePath(string path, ITransportSettings settings, Authenticator authenticator = null)
        {
            if (path.StartsWith("http:", StringComparison.InvariantCultureIgnoreCase) ||
                path.StartsWith("https:", StringComparison.InvariantCultureIgnoreCase)) return path;
            var root = (authenticator == null ? settings.BaseUrl : _apiPath);
            return $"{root}{path}";
        }

        /// <summary>
        /// Authenticate and process an HTTP request, converting it to the indicated type
        /// </summary>
        /// <param name="method">the <c>HttpMethod</c> to use</param>
        /// <param name="path">the url path (either absolute or relative)</param>
        /// <param name="queryParams">optional query parameters</param>
        /// <param name="body">optional body value.
        /// If the body is a <c>string</c> type, the post will be marked as <c>x-www-urlformencoded</c>.
        /// Otherwise, it will be converted to JSON.
        /// </param>
        /// <param name="settings">Transport option overrides, such as a different timeout.
        /// TODO not implemented yet
        /// </param>
        /// <typeparam name="TSuccess">Type of response if the request succeeds</typeparam>
        /// <typeparam name="TError">Type of response if the request fails</typeparam>
        /// <returns>SDKResponse with success or failure</returns>
        public async Task<SdkResponse<TSuccess, TError>> AuthRequest<TSuccess, TError>(
            HttpMethod method,
            string path,
            Values queryParams = null,
            object body = null,
            ITransportSettings settings = null
        ) where TSuccess : class where TError : class
        {
            settings = settings.Spread(AuthSession.Settings);
            path = MakePath(path, settings, _authenticator);
            return await AuthSession.Transport.Request<TSuccess, TError>(
                method,
                path,
                queryParams,
                body,
                _authenticator,
                settings
            );
        }

        // TODO delete if we decide the method-specific abstractions are fluff
        // /// <summary>
        // /// Make an authenticated GET request
        // /// </summary>
        // /// <param name="path">Request path</param>
        // /// <param name="queryParams">Optional query params</param>
        // /// <param name="body">Optional body</param>
        // /// <param name="settings">Optional settings overrides</param>
        // /// <typeparam name="TSuccess">Type of success response</typeparam>
        // /// <typeparam name="TError">Type of error response</typeparam>
        // /// <returns>SDKResponse with success or failure</returns>
        // public async Task<SdkResponse<TSuccess, TError>> Get<TSuccess, TError>(
        //     string path,
        //     Values queryParams = null,
        //     object body = null,
        //     ITransportSettings settings = null
        // ) where TSuccess : class where TError : class
        // {
        //     return await this.AuthRequest<TSuccess, TError>(
        //         HttpMethod.Get,
        //         path,
        //         queryParams,
        //         body,
        //         settings
        //     );
        // }
    }
}
