using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Looker.RTL;
using Newtonsoft.Json;
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
        private readonly string[] _versionKeys = { "looker_release_version", "current_version", "supported_versions" };

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
            var json = JsonConvert.DeserializeObject<Values>(content);
            Assert.Equal(json.Keys, _versionKeys);
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
            Assert.Equal(actual.Value.Keys, _versionKeys);
        }

        class TestModel : SdkModel
        {
            public string? string1 { get; set; } = null;
            public long? num1 { get; set; } = null;
            public string? string2 { get; set; } = null;
            public long? num2 { get; set; } = null;
            public string? string3 { get; set; } = null;
            public long? num3 { get; set; } = null;
        }

        [Fact]
        public async Task JsonTypingTest()
        {
            var payload = @"
{
  ""string1"": 1,
    ""num1"": 1,
    ""string2"": ""2"",
    ""num2"": ""2"",
    ""string3"": ""3"",
    ""num3"": 3,
    ""string4"": ""4"",
    ""num4"": 4
}
";
            var resp = new RawResponse
            {
                Method = HttpMethod.Get,
                Body = payload,
                StatusCode = HttpStatusCode.OK,
                StatusMessage = "test",
                ContentType = "application/json"
            } as IRawResponse;
            var actual = Transport.ParseResponse<TestModel, Exception>(resp).Value;
            Assert.Equal("1", actual.string1);
            Assert.Equal(1, actual.num1);
            Assert.Equal("2", actual.string2);
            Assert.Equal(2, actual.num2);
            Assert.Equal("3", actual.string3);
            Assert.Equal(3, actual.num3);
        }
    }
}
