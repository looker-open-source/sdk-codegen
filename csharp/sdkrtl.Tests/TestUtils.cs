using System;
using System.IO;
using Looker.RTL;
// Need this serializer for dynamic support
using Newtonsoft.Json;

namespace sdkrtl.Tests
{
    public interface ITestConfig
    {
        string IniFileName { get; set; }
        string TestFileName { get; set; }
        dynamic TestData { get; set; }
        IApiSettings Settings { get; set; }
    }

    public class TestConfig : ITestConfig
    {
        public string IniFileName { get; set; }
        public string TestFileName { get; set; }
        public dynamic TestData { get; set; }
        public IApiSettings Settings { get; set; }

        public TestConfig(string iniFile = null, string sectionName = null)
        {
            var rootPath = Path.GetFullPath("../../../../");
            IniFileName = iniFile ?? Environment.GetEnvironmentVariable("LOOKERSDK_INI") ??
                Path.Combine(rootPath, "looker.ini");
            TestFileName = Path.Combine(rootPath, "test/data.yml.json");
            if (File.Exists(IniFileName))
            {
                Settings = new ApiSettings(IniFileName);
            }
            else
            {
                throw new ArgumentException($"Couldn't find %{IniFileName}");
            }

            if (File.Exists(TestFileName))
            {
                TestData = JsonConvert.DeserializeObject<dynamic>(File.ReadAllText(TestFileName));
            }
            else
            {
                throw new ArgumentException($"Couldn't find %{TestFileName}");
            }
        }
    }
}