using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Looker.RTL;
using Xunit;
using Xunit.Abstractions;

namespace sdkrtl.Tests
{
    public class ApiMethodsTests
    {
        private class MockSettings : IApiSettings
        {
            public string BaseUrl { get; set; } = "https://mock.looker.com:19999";
            public bool VerifySsl { get; set; } = true;
            public int Timeout { get; set; } = 120;
            public string AgentTag { get; set; } = "CS-SDK";

            public IValues ReadConfig(string section = null) => new Values
            {
                { "base_url", BaseUrl },
                { "client_id", "mock-client-id" },
                { "client_secret", "mock-client-secret" }
            };

            public bool IsConfigured() => true;
        }

        private class MockTransport : ITransport
        {
            private readonly Func<HttpMethod, string, HttpRequestMessage, IRawResponse> _handler;
            public List<(HttpMethod Method, string Path, string AuthHeader)> Calls { get; } = new();

            public MockTransport(Func<HttpMethod, string, HttpRequestMessage, IRawResponse> handler)
            {
                _handler = handler;
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
                var url = path.StartsWith("http", StringComparison.OrdinalIgnoreCase)
                    ? path
                    : $"https://mock.looker.com:19999{path}";
                var req = new HttpRequestMessage(method, url);
                if (authenticator != null)
                {
                    req = await authenticator(req);
                }

                Calls.Add((method, path, req.Headers.Authorization?.ToString()));
                return _handler(method, path, req);
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
                return Transport.ParseResponse<TSuccess, TError>(raw);
            }
        }

        private class UserModel : SdkModel
        {
            public string id { get; set; }
        }

        private readonly ITestOutputHelper _testOutputHelper;
        private TestConfig _config;
        private ITransport _transport;
        
        public ApiMethodsTests(ITestOutputHelper testOutputHelper)
        {
            _testOutputHelper = testOutputHelper;
            _config = new TestConfig();
            _transport = new Transport(_config.Settings);
        }

        private IAuthSession Auth()
        {
            return new AuthSession(_config.Settings, _transport);
        }
        
        [Fact]
        public void Version40Test()
        {
            var sdk = new ApiMethods(Auth(), "4.0");
            var agentTag = $"{Constants.AgentPrefix} {Constants.LookerVersion}.4.0";
            Assert.Equal(agentTag,sdk.AuthSession.Settings.AgentTag);
        }
        
        [Fact]
        public async Task GetHtmlUrlTest()
        {
            var sdk = new ApiMethods(Auth(), "4.0");
            var actual = await sdk.Ok(sdk.AuthRequest<string, Exception>(
                HttpMethod.Get,
                _config.HtmlTestUrl
            ));
            Assert.Contains(_config.HtmlTestContent, actual);
        }

        [Fact]
        public async Task ReauthenticatesOnceOn401Test()
        {
            var loginCount = 0;
            var transport = new MockTransport((method, path, req) =>
            {
                if (path.EndsWith("/login"))
                {
                    loginCount++;
                    return new RawResponse
                    {
                        Method = method,
                        StatusCode = HttpStatusCode.OK,
                        StatusMessage = "OK",
                        ContentType = "application/json",
                        Body = $"{{\"access_token\":\"token-{loginCount}\",\"token_type\":\"Bearer\",\"expires_in\":3600}}"
                    };
                }

                if (req.Headers.Authorization?.Parameter == "token-1")
                {
                    return new RawResponse
                    {
                        Method = method,
                        StatusCode = HttpStatusCode.Unauthorized,
                        StatusMessage = "Unauthorized",
                        ContentType = "application/json",
                        Body = "{\"message\":\"Requires authentication.\"}"
                    };
                }

                return new RawResponse
                {
                    Method = method,
                    StatusCode = HttpStatusCode.OK,
                    StatusMessage = "OK",
                    ContentType = "application/json",
                    Body = "{\"id\":\"user-99\"}"
                };
            });

            var settings = new MockSettings();
            var session = new AuthSession(settings, transport);
            var sdk = new ApiMethods(session, "4.0");

            var user = await sdk.Ok(sdk.AuthRequest<UserModel, Exception>(HttpMethod.Get, "/user"));
            Assert.Equal("user-99", user.id);
            Assert.Equal(2, loginCount);
            Assert.Equal(4, transport.Calls.Count);
            Assert.Equal("Bearer token-1", transport.Calls[1].AuthHeader);
            Assert.Equal("Bearer token-2", transport.Calls[3].AuthHeader);
        }

        [Fact]
        public async Task PreservesSudoIdOn401ReauthTest()
        {
            var adminLoginCount = 0;
            var sudoLoginCount = 0;
            var transport = new MockTransport((method, path, req) =>
            {
                if (path.EndsWith("/login"))
                {
                    adminLoginCount++;
                    return new RawResponse
                    {
                        Method = method,
                        StatusCode = HttpStatusCode.OK,
                        StatusMessage = "OK",
                        ContentType = "application/json",
                        Body = $"{{\"access_token\":\"admin-{adminLoginCount}\",\"token_type\":\"Bearer\",\"expires_in\":3600}}"
                    };
                }

                if (path.EndsWith("/login/42"))
                {
                    sudoLoginCount++;
                    return new RawResponse
                    {
                        Method = method,
                        StatusCode = HttpStatusCode.OK,
                        StatusMessage = "OK",
                        ContentType = "application/json",
                        Body = $"{{\"access_token\":\"sudo-{sudoLoginCount}\",\"token_type\":\"Bearer\",\"expires_in\":3600}}"
                    };
                }

                if (req.Headers.Authorization?.Parameter == "sudo-1")
                {
                    return new RawResponse
                    {
                        Method = method,
                        StatusCode = HttpStatusCode.Unauthorized,
                        StatusMessage = "Unauthorized",
                        ContentType = "application/json",
                        Body = "{\"message\":\"Requires authentication.\"}"
                    };
                }

                return new RawResponse
                {
                    Method = method,
                    StatusCode = HttpStatusCode.OK,
                    StatusMessage = "OK",
                    ContentType = "application/json",
                    Body = $"{{\"id\":\"{req.Headers.Authorization?.Parameter}\"}}"
                };
            });

            var settings = new MockSettings();
            var session = new AuthSession(settings, transport);
            await session.Login("42");
            Assert.Equal("42", session.SudoId);

            var sdk = new ApiMethods(session, "4.0");
            var user = await sdk.Ok(sdk.AuthRequest<UserModel, Exception>(HttpMethod.Get, "/user"));
            Assert.Equal("sudo-2", user.id);
            Assert.Equal("42", session.SudoId);
            Assert.Equal(2, sudoLoginCount);
        }

        [Fact]
        public async Task DoesNotLoopOnPersistent401Test()
        {
            var loginCount = 0;
            var userCallCount = 0;
            var transport = new MockTransport((method, path, _) =>
            {
                if (path.EndsWith("/login"))
                {
                    loginCount++;
                    return new RawResponse
                    {
                        Method = method,
                        StatusCode = HttpStatusCode.OK,
                        StatusMessage = "OK",
                        ContentType = "application/json",
                        Body = $"{{\"access_token\":\"token-{loginCount}\",\"token_type\":\"Bearer\",\"expires_in\":3600}}"
                    };
                }

                userCallCount++;
                return new RawResponse
                {
                    Method = method,
                    StatusCode = HttpStatusCode.Unauthorized,
                    StatusMessage = "Unauthorized",
                    ContentType = "application/json",
                    Body = "{\"message\":\"Requires authentication.\"}"
                };
            });

            var settings = new MockSettings();
            var session = new AuthSession(settings, transport);
            var sdk = new ApiMethods(session, "4.0");

            var response = await sdk.AuthRequest<UserModel, Exception>(HttpMethod.Get, "/user");
            Assert.False(response.Ok);
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            Assert.Equal(2, userCallCount);
            Assert.False(session.IsAuthenticated());
        }

        [Fact]
        public void StripsTrailingSlashesInSettingsTransportAndApiMethodsTest()
        {
            var apiSettings = new ApiSettings();
            apiSettings.Load(new Values
            {
                { "base_url", "\"https://mock.looker.com:19999///\"" }
            });
            Assert.Equal("https://mock.looker.com:19999", apiSettings.BaseUrl);
            Assert.True(apiSettings.IsConfigured());

            var slashOnly = new ApiSettings { BaseUrl = "///" };
            Assert.Equal("", slashOnly.BaseUrl);
            Assert.False(slashOnly.IsConfigured());

            var customSettings = new MockSettings { BaseUrl = "https://mock.looker.com:19999/" };
            var realTransport = new Transport(customSettings);
            Assert.Equal("https://mock.looker.com:19999/api/4.0/login", realTransport.MakeUrl("/api/4.0/login"));

            var session = new AuthSession(customSettings, realTransport);
            var sdk = new ApiMethods(session, "4.0");
            Assert.Equal("https://mock.looker.com:19999/login", sdk.MakePath("/login", customSettings));
            Assert.Equal(
                "https://mock.looker.com:19999/api/4.0/user",
                sdk.MakePath("/user", customSettings, req => Task.FromResult(req))
            );
        }

        [Fact]
        public async Task RenewsExpiredSudoTokenWithApiTokenAndRevertsCleanlyTest()
        {
            var sudoCount = 0;
            var transport = new MockTransport((method, path, req) =>
            {
                if (path.EndsWith("/login"))
                {
                    return new RawResponse
                    {
                        Method = method,
                        StatusCode = HttpStatusCode.OK,
                        StatusMessage = "OK",
                        ContentType = "application/json",
                        Body = "{\"access_token\":\"admin-token\",\"token_type\":\"Bearer\",\"expires_in\":3600}"
                    };
                }

                if (path.EndsWith("/login/5"))
                {
                    sudoCount++;
                    // First sudo token has expires_in=5 (< lagTime=10), so access_token is non-empty but expired
                    var ttl = sudoCount == 1 ? 5 : 3600;
                    return new RawResponse
                    {
                        Method = method,
                        StatusCode = HttpStatusCode.OK,
                        StatusMessage = "OK",
                        ContentType = "application/json",
                        Body = $"{{\"access_token\":\"sudo-{sudoCount}\",\"token_type\":\"Bearer\",\"expires_in\":{ttl}}}"
                    };
                }

                return new RawResponse
                {
                    Method = method,
                    StatusCode = HttpStatusCode.OK,
                    StatusMessage = "OK",
                    ContentType = "application/json",
                    Body = "\"\""
                };
            });

            var settings = new MockSettings();
            var session = new AuthSession(settings, transport);
            await session.Login("5");
            Assert.False(session.IsSudo());
            Assert.False(session.IsAuthenticated());

            var renewed = await session.GetToken() as IAccessToken;
            Assert.NotNull(renewed);
            Assert.Equal("sudo-2", renewed.access_token);
            Assert.True(session.IsSudo());
            Assert.Equal("Bearer admin-token", transport.Calls[1].AuthHeader);
            Assert.Equal("Bearer admin-token", transport.Calls[2].AuthHeader);

            // Repeated Login("5") while active must refresh sudo "5" rather than dropping to admin
            await session.Login("5");
            Assert.Equal("5", session.SudoId);
            Assert.True(session.IsSudo());
            var activeAfterReLogin = await session.GetToken() as IAccessToken;
            Assert.Equal("sudo-3", activeAfterReLogin?.access_token);

            // Logout() after sudo token expires clears SudoId without calling DELETE /logout
            sudoCount = 0;
            transport.Calls.Clear();
            var expiredLogoutSession = new AuthSession(settings, transport);
            await expiredLogoutSession.Login("5");
            var didServerLogout = await expiredLogoutSession.Logout();
            Assert.False(didServerLogout);
            Assert.Null(expiredLogoutSession.SudoId);
            Assert.True(expiredLogoutSession.IsAuthenticated());
            var reverted = await expiredLogoutSession.GetToken() as IAccessToken;
            Assert.Equal("admin-token", reverted?.access_token);
            Assert.DoesNotContain(transport.Calls, c => c.Path.EndsWith("/logout"));
        }

        [Fact]
        public async Task FailedSudoLoginDoesNotEscalateToAdminTokenTest()
        {
            var sudoAttempts = 0;
            var transport = new MockTransport((method, path, _) =>
            {
                if (path.EndsWith("/login"))
                {
                    return new RawResponse
                    {
                        Method = method,
                        StatusCode = HttpStatusCode.OK,
                        StatusMessage = "OK",
                        ContentType = "application/json",
                        Body = "{\"access_token\":\"admin-token\",\"token_type\":\"Bearer\",\"expires_in\":3600}"
                    };
                }

                if (path.EndsWith("/login/999"))
                {
                    sudoAttempts++;
                    return new RawResponse
                    {
                        Method = method,
                        StatusCode = HttpStatusCode.NotFound,
                        StatusMessage = "Not Found",
                        ContentType = "application/json",
                        Body = "{\"message\":\"User not found\"}"
                    };
                }

                return new RawResponse
                {
                    Method = method,
                    StatusCode = HttpStatusCode.OK,
                    StatusMessage = "OK",
                    ContentType = "application/json",
                    Body = "{\"id\":\"unexpected\"}"
                };
            });

            var settings = new MockSettings();
            var session = new AuthSession(settings, transport);
            await Assert.ThrowsAsync<SdkError>(() => session.Login("999"));

            Assert.Equal("999", session.SudoId);
            Assert.False(session.IsSudo());
            Assert.False(session.IsAuthenticated());

            await Assert.ThrowsAsync<SdkError>(() => session.Authenticate(new HttpRequestMessage(HttpMethod.Get, "https://mock.looker.com:19999/api/4.0/user")));
            Assert.Equal(2, sudoAttempts);
        }
    }
}