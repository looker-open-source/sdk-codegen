using System.IO;
using Looker.RTL;

namespace sdkrtl.Tests
{
    public interface ITestConfig
    {
        string IniFileName { get; set; }
        IApiSettings Settings { get; set; }
    }
    
    public class TestConfig : ITestConfig
    {
        public string IniFileName { get; set; }
        public IApiSettings Settings { get; set; }

        public TestConfig(string iniFile = null, string sectionName = null)
        {
            IniFileName = iniFile ?? "../../../../looker.ini";
            if (File.Exists(IniFileName))
            {
                Settings = new ApiSettings(IniFileName);
            }
        }
        
    }
}