using System;
using System.Globalization;
using System.Net;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Looker.RTL;
using Xunit;
using Xunit.Abstractions;

namespace sdkrtl.Tests
{

    /// <summary>
    /// These tests require the Looker server configured in the root looker.ini file to be running
    /// </summary>
    /// TODO test MakeUrl()
    /// TODO remove reliance on Looker server for these basic tests. Find some other reliable URLs for tests
    /// TODO test binary (image) responses
    public class TransportTests
    {
        private readonly ITestOutputHelper _testOutputHelper;

        private TestConfig _config;
        private dynamic _contentTypes;
        
        public TransportTests(ITestOutputHelper testOutputHelper)
        {
            _testOutputHelper = testOutputHelper;
            _config = new TestConfig();
            _contentTypes = _config.TestData["content_types"];
        }

        [Fact]
        public async Task GetHtmlUrlTest()
        {
            var xp = new Transport(_config.Settings);
            var actual = await xp.RawRequest(
                HttpMethod.Get,
                _config.HtmlTestUrl
            );
            Assert.True(actual.Ok);
            Assert.Equal(HttpStatusCode.OK, actual.StatusCode);
            Assert.Contains("text/html", actual.ContentType);
            var content = actual.Body.ToString();
            Assert.NotNull(content);
            Assert.Contains(_config.HtmlTestContent, content);
        }

        [Fact]
        public async Task GetJsonUrlTest()
        {
            var xp = new Transport(_config.Settings);
            var actual = await xp.RawRequest(
                HttpMethod.Get,
                "/versions"
            );
            Assert.True(actual.Ok);
            Assert.Equal(HttpStatusCode.OK, actual.StatusCode);
            Assert.Contains("application/json", actual.ContentType);
            var content = actual.Body.ToString();
            Assert.NotNull(content);
            Assert.Contains("looker_release_version", content);
            var json = JsonSerializer.Deserialize<Values>(content);
            Assert.Equal(json.Keys, new string[] {"looker_release_version", "current_version", "supported_versions"});
        }

        [Fact]
        public async Task GetTypedUrlTest()
        {
            var xp = new Transport(_config.Settings);
            var actual = await xp.Request<Values, Exception>(
                HttpMethod.Get,
                "/versions"
            );
            Assert.True(actual.Ok);
            Assert.Equal(actual.Value.Keys,
                new string[] {"looker_release_version", "current_version", "supported_versions"});
        }
    }
}