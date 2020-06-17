using System;
using System.IO;
using Looker.RTL;
using Newtonsoft.Json;

namespace sdkrtl.Tests
{
    public interface ITestConfig
    {
        /// <summary>
        /// Name of the root looker.ini file
        /// </summary>
        string IniFileName { get; set; }
        
        /// <summary>
        /// Name of the test data file
        /// </summary>
        string TestFileName { get; set; }
        
        /// <summary>
        /// Test data parsed from <c>/test/data.yml.json</c>
        /// </summary>
        dynamic TestData { get; set; }
        
        /// <summary>
        /// API settings read from <c>IniFileName</c>
        /// </summary>
        IApiSettings Settings { get; set; }
    }

    /// <summary>
    /// This class needs the NewtonSoft JSON processor for <c>dynamic</c> deserialization support
    /// The "standard" .NET core JSON processor doesn't yet support <c>dynamic</c> correctly.
    /// </summary>
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