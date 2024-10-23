using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace Looker.RTL
{
    public interface IAuthSession
    {
        IApiSettings Settings { get; set; }
        ITransport Transport { get; set; }

        /// <summary>
        /// ID of sudo user. Empty if not sudoing
        /// </summary>
        string SudoId { get; }

        /// <summary>
        /// Is the current session already authenticated?
        /// </summary>
        /// <returns>True if authenticated and token is active</returns>
        bool IsAuthenticated();

        /// <summary>
        /// Add authentication information to the HTTP request
        /// </summary>
        /// <param name="request">Request to update</param>
        /// <returns>Request with authentication information added</returns>
        Task<HttpRequestMessage> Authenticate(HttpRequestMessage request);

        /// <summary>
        /// Log out the current user
        /// </summary>
        /// <remarks>
        /// If the current user is a sudo user, the API user becomes the active user
        /// If the current user is the API user, the API session is logged out.
        /// However, any subsequent SDK method calls automatically log the API user back in
        /// </remarks>
        /// <returns><c>True</c> if a logout happened, <c>false</c> otherwise</returns>
        Task<bool> Logout();

        /// <summary>
        /// Typically returns an <c>IAccessToken</c> but could be any data used for auth.
        /// </summary>
        /// <returns>authentication payload</returns>
        Task<object> GetToken();

        /// <summary>
        /// Is the SDK session sudoing?
        /// </summary>
        /// <returns><c>True</c> if a sudo user is using the SDK session</returns>
        bool IsSudo();

        /// <summary>
        /// Authenticates the SDK session 
        /// </summary>
        /// <param name="sudoId">Optional ID of the user to login</param>
        /// <returns></returns>
        Task<object> Login(string sudoId = null);

        /// <summary>
        /// Clears all authentication information, but does NOT log the API user out
        /// </summary>
        /// <remarks>This is based on the default <c>AuthSession</c> behavior</remarks>
        void Reset();
    }

    public class AuthSession : IAuthSession
    {
        private readonly string _apiPath = $"/api/{Constants.DefaultApiVersion}";
        private AuthToken _authToken = new AuthToken();
        private AuthToken _sudoToken = new AuthToken();

        private AuthToken ActiveToken => _sudoToken.access_token.IsFull() ? _sudoToken : _authToken;

        public IApiSettings Settings { get; set; }
        public ITransport Transport { get; set; }
        public string SudoId { get; private set; } = null;

        public AuthSession()
        {
        }

        public AuthSession(IApiSettings settings, ITransport transport)
        {
            Settings = settings;
            Transport = transport;
        }

        public bool IsAuthenticated()
        {
            return ActiveToken.IsActive();
        }

        public async Task<HttpRequestMessage> Authenticate(HttpRequestMessage request)
        {
            if ((await GetToken() is IAccessToken token) && token.access_token.IsFull())
            {
                request.Headers.Authorization = new AuthenticationHeaderValue(
                    Constants.Bearer, token.access_token);
            }

            return request;
        }

        private async Task<bool> SudoLogout()
        {
            var result = false;
            if (IsSudo())
            {
                result = await Logout(); // Logout current sudo user
                _sudoToken.Reset();
            }

            return result;
        }

        protected Task<TSuccess> Ok<TSuccess, TError>(Task<SdkResponse<TSuccess, TError>> task) where TSuccess : class
            where TError : Exception
        {
            return SdkUtils.Ok(task);
        }

        private async Task<object> _login(string sudoId = null)
        {
            await SudoLogout();
            if (sudoId != SudoId)
            {
                SudoId = sudoId;
            }

            if (!_authToken.IsActive())
            {
                Reset();
                // only retain client API3 credentials for the lifetime of the login request
                var section = Settings.ReadConfig();
                var clientId = section["client_id"].ToString();
                var secret = section["client_secret"].ToString();
                if (clientId.IsNullOrEmpty() || secret.IsNullOrEmpty())
                {
                    throw new SdkError("API3 credentials client_id and/or client_secret are not set");
                }

                var body = $"client_id={SdkUtils.EncodeParam(clientId)}&client_secret={SdkUtils.EncodeParam(secret)}";
                var apiToken = await Ok(Transport.Request<AccessToken, Exception>(
                    HttpMethod.Post,
                    $"{_apiPath}/login",
                    null,
                    body
                ));
                this._authToken.SetToken(apiToken);
            }

            if (sudoId.IsNullOrEmpty()) return this.ActiveToken;
            // Now that API user is logged in, login as the Sudo user
            var token = this.ActiveToken;

            async Task<HttpRequestMessage> Auth(HttpRequestMessage request)
            {
                if (token.access_token.IsFull())
                {
                    request.Headers.Authorization = new AuthenticationHeaderValue(
                        Constants.Bearer, token.access_token);
                }

                return await Task.FromResult(request);
            }

            var sudoPath = $"{_apiPath}/login/{SdkUtils.EncodeParam(sudoId)}";
            var sudoToken = await Ok(Transport.Request<AccessToken, Exception>(
                HttpMethod.Post,
                sudoPath,
                null,
                null,
                Auth
            ));

            _sudoToken.SetToken(sudoToken);
            return ActiveToken;
        }

        private async Task<bool> _logout()
        {
            var token = ActiveToken;

            async Task<HttpRequestMessage> Auth(HttpRequestMessage request)
            {
                if (token.access_token.IsFull())
                {
                    request.Headers.Authorization = new AuthenticationHeaderValue(
                        Constants.Bearer, token.access_token);
                }

                return await Task.FromResult(request);
            }

            await Ok(Transport.Request<string, SdkError>(
                HttpMethod.Delete,
                $"{_apiPath}/logout",
                null,
                null,
                Auth
            ));
            if (SudoId.IsFull())
            {
                SudoId = null;
                _sudoToken.Reset();
                if (!_authToken.IsActive())
                {
                    await _login();
                }
            }
            else
            {
                // completely logged out
                Reset();
            }

            return true;
        }

        public async Task<bool> Logout()
        {
            var result = false;
            if (IsAuthenticated())
            {
                result = await this._logout();
            }

            return result;
        }

        public async Task<object> GetToken()
        {
            if (!IsAuthenticated()) await Login();
            return ActiveToken;
        }

        public bool IsSudo()
        {
            return SudoId.IsFull();
        }

        public async Task<object> Login(string sudoId = null)
        {
            if ((sudoId.IsFull() && sudoId != SudoId) || !IsAuthenticated())
            {
                await _login(sudoId);
            }
            else
            {
                await _login();
            }

            return ActiveToken;
        }

        public void Reset()
        {
            SudoId = null;
            _authToken.Reset();
            _sudoToken.Reset();
        }
    }
}