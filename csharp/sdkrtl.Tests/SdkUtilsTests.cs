using System;
using Looker.RTL;
using Xunit;
using Xunit.Abstractions;

namespace sdkrtl.Tests
{
    /// <summary>
    /// Utility function tests
    /// </summary>
    /// TODO EncodeParams() test
    /// TODO Extension method tests like IsNullOrEmpty() and Merge()
    /// TODO MOAR TESTS!
    public class SdkUtilsTests
    {
        private readonly ITestOutputHelper _testOutputHelper;
        private TestConfig _config;
        private dynamic _contentTypes;
        
        public SdkUtilsTests(ITestOutputHelper testOutputHelper)
        {
            _testOutputHelper = testOutputHelper;
            _config = new TestConfig();
            _contentTypes = _config.TestData["content_types"];
        }

        [Fact]
        public void BinaryModeTest()
        {
            var contents = _contentTypes["binary"];
            Assert.NotNull(contents);
            foreach (var content in contents)
            {
                var s = Convert.ToString(content);
                var actual = SdkUtils.ResponseMode(s);
                if (actual != ResponseMode.Binary)
                {
                    _testOutputHelper.WriteLine($"{s} is not binary");
                }
                Assert.Equal(ResponseMode.Binary, actual);
            }
        }
        
        [Fact]
        public void StringModeTest()
        {
            var contents = _contentTypes["string"];
            Assert.NotNull(contents);
            foreach (var content in contents)
            {
                var s = Convert.ToString(content);
                var actual = SdkUtils.ResponseMode(s);
                if (actual != ResponseMode.String)
                {
                    _testOutputHelper.WriteLine($"{s} is not test/string");
                }
                Assert.Equal(ResponseMode.String, actual);
            }
        }

        [Fact]
        public void EncodeParamTest()
        {
            // TODO figure out the always painful DateTime conversions
            // var date = DateTime.Parse("2020-01-01T14:48:00.00Z");
            // Assert.Equal("2020-01-01T14%3A48%3A00.000Z", Transport.EncodeParam(date));
            Assert.Equal("foo%2Fbar", SdkUtils.EncodeParam("foo%2Fbar"));
            Assert.Equal("foo%2Fbar", SdkUtils.EncodeParam("foo/bar"));
            var actual = SdkUtils.EncodeParam(true);
            Assert.Equal("true", actual);
            actual = SdkUtils.EncodeParam(2.3);
            Assert.Equal("2.3", actual);

        }

        [Fact]
        public void SpreadTest()
        {
            var settings = new ApiSettings { BaseUrl = "url", AgentTag = "A", Timeout = 120 };
            var options = new ApiSettings { Timeout = 5, VerifySsl = false };
            options.Spread(settings);
            Assert.Equal("url", options.BaseUrl);
            Assert.Equal(5, options.Timeout);
            Assert.Equal("A", options.AgentTag);
            Assert.False(options.VerifySsl);
        }
    }
}