using System;
using System.Runtime.Serialization;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Looker.RTL;
using Xunit;
using Xunit.Abstractions;
// ReSharper disable InconsistentNaming

namespace sdkrtl.Tests
{
    // public class EnumStrings
    // {
    //     public string[] Values
    //     {
    //         get
    //         {
    //             var t = this.GetType();
    //             var names = t
    //                 .GetProperties()
    //                 .Where(prop => prop.CanRead && prop.PropertyType.IsPublic)
    //                 .Select(p => p.Name)
    //                 .ToArray();
    //             return names;
    //         }
    //     }
    // }

    // Good enum/json ref https://bytefish.de/blog/enums_json_net/
    public enum ResultFormat
    {
        [EnumMember(Value = "csv")]
        csv,
        [EnumMember(Value = "json")]
        json,
        [EnumMember(Value = "json_detail")]
        json_detail,
        [EnumMember(Value = "png")]
        png
    }

    /// <summary>
    /// Test version of a "create query" object
    /// </summary>
    public class EnumUsage
    {
        /// <summary>Input result format</summary>
        [JsonConverter(typeof(StringEnumConverter))]
        public ResultFormat input { get; set; }
        
        /// <summary>Output result format</summary>
        [JsonConverter(typeof(StringEnumConverter))]
        public ResultFormat output { get; set; }
    }
    
    /// <summary>
    /// Utility function tests
    /// </summary>
    /// TODO EncodeParams() test
    /// TODO Extension method tests like IsNullOrEmpty() and Merge()
    /// TODO MOAR TESTS!
    public class SdkUtilsTests
    {
        private readonly ITestOutputHelper _testOutputHelper;
        private readonly dynamic _contentTypes;
        
        public SdkUtilsTests(ITestOutputHelper testOutputHelper)
        {
            _testOutputHelper = testOutputHelper;
            var config = new TestConfig();
            _contentTypes = config.TestData["content_types"];
        }

        [Fact]
        public void ValidEnumStringTest()
        {
            var json = "{\"input\":\"csv\",\"output\":\"json_detail\"}";
            var obj = JsonConvert.DeserializeObject<EnumUsage>(json);
            Assert.Equal(ResultFormat.csv, obj.input);
            Assert.Equal(ResultFormat.json_detail, obj.output);
        }
        
        [Fact]
        public void BadEnumStringTest()
        {
            var json = "{\"input\":\"foo\",\"output\":\"bar\"}";
            var ex = Assert.Throws < JsonSerializationException>(() => JsonConvert.DeserializeObject<EnumUsage>(json));
            Assert.StartsWith("Error converting value \"foo\" to type 'sdkrtl.Tests.ResultFormat'.", ex.Message);
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
        public void DelimArrayTest()
        {
            var ints = new DelimArray<int> {1,2,3};
            var actual = ints.ToString();
            Assert.Equal("1,2,3", actual);
            var strings = new DelimArray<string> {"one", "two", "three"};
            actual = strings.ToString();
            Assert.Equal("one,two,three", actual);
            strings.Delimiter = ", ";
            actual = strings.ToString();
            Assert.Equal("one, two, three", actual);
            strings = new DelimArray<string> {"a b", "c d", "e f"};
            actual = strings.ToString();
            Assert.Equal("a+b,c+d,e+f", actual);
            
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