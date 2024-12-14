using Xunit;
using IniParser;
using Looker.RTL;

namespace sdkrtl.Tests
{
    /// <summary>
    /// Configuration reading tests
    /// </summary>
    /// TODO create environment variable override tests https://stackoverflow.com/a/43951218/74137
    public class ApiSettingsTests
    {
        private readonly TestConfig _config = new TestConfig();

        [Fact]
        public void TestConfigTest()
        {
            var actual = new TestConfig();
            Assert.NotNull(actual);
            Assert.NotNull(actual.Settings);
            Assert.NotNull(actual.IniFileName);
            Assert.NotNull(actual.Settings.BaseUrl);
        }
        
        [Fact]
        public void ReadConfigTest()
        {
            var parser = new FileIniDataParser();
            var data = parser.ReadFile(_config.IniFileName);
            Assert.Equal("false", data["Looker"]["verify_ssl"]);
        }

        [Fact]
        public void InitializesTest()
        {
            var settings = new ApiSettings();
            Assert.False(settings.IsConfigured());
            Assert.Equal(Constants.VerifySsl, settings.VerifySsl);
            Assert.Equal(Constants.Timeout, settings.Timeout);
        }
    }
}
