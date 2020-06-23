using System;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Looker.RTL;
using Looker.SDK.API40;
using Xunit;
using Xunit.Abstractions;

namespace sdkrtl.Tests
{
    public class SdkMethodsTests
    {
        private readonly ITestOutputHelper _testOutputHelper;
        private TestConfig _config;
        private ITransport _transport;
        private IAuthSession _auth;
        private Looker40SDK sdk;
        
        public SdkMethodsTests(ITestOutputHelper testOutputHelper)
        {
            _testOutputHelper = testOutputHelper;
            _config = new TestConfig();
            _transport = new Transport(_config.Settings);
            _auth = new AuthSession(_config.Settings, _transport);
            sdk = new Looker40SDK(_auth);
        }

        [Fact]
        public async void AllDashboardsTest()
        {
            var actual = await sdk.Ok(sdk.all_dashboards());
            Assert.NotNull(actual);
            Assert.True(actual.Length > 0);
            var dashes = actual
                .Where(d => d.title!.Contains("SDK"))
                .Select(x => x)
                .ToList();
            Assert.True(dashes.Count > 0);
        }
        
        [Fact]
        public async void MeTest()
        {
            var actual = await sdk.Ok(sdk.me());
            Assert.NotNull(actual);
            Assert.NotNull(actual.first_name);
        }
    }
}