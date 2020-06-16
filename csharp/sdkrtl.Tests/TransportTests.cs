using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Looker.RTL;
using Xunit;

namespace sdkrtl.Tests
{
    public class TransportTests
    {
        /**
         * These tests require the local Looker server is running and versions can be retrieved
         */
        private const string HtmlUrl = "https://github.com/looker-open-source/sdk-codegen";

        private const string HtmlContent = "One SDK to rule them all";
        private readonly TestConfig _config = new TestConfig();

        [Fact]
        public async Task GetHtmlUrlTest()
        {
            var xp = new Transport(_config.Settings);
            var actual = await xp.RawRequest(
                HttpMethod.Get,
                HtmlUrl
            );
            Assert.True(actual.Ok);
            Assert.Equal(HttpStatusCode.OK, actual.StatusCode);
            Assert.Contains("text/html", actual.ContentType);
            var content = actual.Body.ToString();
            Assert.NotNull(content);
            Assert.Contains(HtmlContent, content);
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

        /**
         * This test requires the local Looker server is running and versions can be retrieved
         */
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