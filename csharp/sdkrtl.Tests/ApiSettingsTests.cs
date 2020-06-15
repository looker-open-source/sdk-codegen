using System.Reflection.Metadata;
using Xunit;
using IniParser;
using Looker.RTL;

namespace sdkrtl.Tests
{
    static class TestConstants
    {
        public const string localIni = "../../../../looker.ini";
        public const int timeout = 120;
    }
    
    public class ApiSettingsTests
    {
        [Fact]
        public void ReadConfigTest()
        {
            var parser = new FileIniDataParser();
            var data = parser.ReadFile(TestConstants.localIni);
            Assert.Equal("false", data["Looker"]["verify_ssl"]);
        }

        [Fact]
        public void InitializesTest()
        {
            var settings = new ApiSettings();
            Assert.False(settings.IsConfigured());
            Assert.True(settings.verify_ssl);
            Assert.Equal(TestConstants.timeout, settings.timeout);
        }
    }
}
