using System;
using System.Net.Http;
using System.Threading.Tasks;
using Looker.RTL;
using Xunit;
using Xunit.Abstractions;

namespace sdkrtl.Tests
{
    public class ApiMethodsTests
    {
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
    }
}