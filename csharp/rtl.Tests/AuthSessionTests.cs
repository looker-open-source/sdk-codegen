using System;
using Looker.RTL;
using Xunit;
using Xunit.Abstractions;
using Xunit.Sdk;

namespace sdkrtl.Tests
{
    public class AuthSessionTests
    {
        private readonly ITestOutputHelper _testOutputHelper;
        private TestConfig _config;
        private ITransport _transport;
        
        public AuthSessionTests(ITestOutputHelper testOutputHelper)
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
        public async void LogoutIsFalseWhenNotAuthenticatedTest()
        {
            var session = Auth();
            Assert.False(session.IsAuthenticated());
            var actual = await session.Logout();
            Assert.False(actual);
        }
        
        [Fact]
        public void InitializationTest()
        {
            var session = Auth();
            Assert.False(session.IsAuthenticated());
            Assert.Equal(_config.Settings, session.Settings);
            Assert.False(session.IsSudo());
        }

        [Fact]
        public async void LogsInWithGoodCredsTest()
        {
            var session = Auth();
            Assert.False(session.IsAuthenticated());
            try
            {
                var result = await session.Login();
                Assert.NotNull(result);
                var token = result as AuthToken;
                Assert.NotNull(token);
                Assert.NotNull(token.access_token);
                Assert.Equal(3600, token.expires_in);
                Assert.True(session.IsAuthenticated());
                var actual = await session.Logout();
                Assert.True(actual);
                Assert.False(session.IsAuthenticated());
            }
            catch (Exception e)
            {
                _testOutputHelper.WriteLine(e.ToString());
            }
        }
    }
}