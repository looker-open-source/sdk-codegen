using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using IniParser;

namespace Looker.RTL
{
    public interface IApiSection : IDictionary<string, object> { }

    public interface IApiSettings : ITransportSettings
    {
        IApiSection ReadConfig(string section);

        bool IsConfigured();
    }

    public class ApiSection : Dictionary<string, object>, IApiSection { }
    
    public class ApiSettings : IApiSettings
    {
        public string base_url { get; set; }
        public bool verify_ssl { get; set; } = true;
        public int timeout { get; set; } = 120;
        public string agentTag { get; set; }
        private string fileName { get; }
        
        public ApiSettings(string fileName = "")
        {
            if (!string.IsNullOrEmpty(fileName))
            {
                if (!File.Exists(fileName))
                {
                    throw new ArgumentException($"File {fileName} does not exist.");
                }
            }
            this.fileName = fileName ?? "looker.ini";
            if (File.Exists(this.fileName))
            {
                this.Load(this.ReadConfig(this.fileName));
            }
        }

        public IApiSection ReadConfig(string sectionName = "Looker")
        {
            var parser = new FileIniDataParser();
            var data = parser.ReadFile(this.fileName);
            var section = data[sectionName];
            IApiSection result = new ApiSection();
            foreach (var pair in section)
            {
                result[pair.KeyName] = pair.Value;
            }
            // TODO: figure out how to do toDictionary
            return result;
        }

        public IApiSettings Load(IApiSection values)
        {
            foreach (var pair in values)
            {
                switch (pair.Key)
                {
                    case "base_url":
                        this.base_url = Convert.ToString(pair.Value);
                        break;
                    case "verify_ssl":
                        this.verify_ssl = Convert.ToBoolean(pair.Value);
                        break;
                    case "timeout":
                        this.timeout = Convert.ToInt32(pair.Value);
                        break;
                    case "agentTag":
                        this.agentTag = Convert.ToString(pair.Value);
                        break;
                    default:
                        throw new ArgumentException($"Unrecognized key: {pair.Key}");
                }
            }
            return this;
        }

        public bool IsConfigured()
        {
            return this.base_url == String.Empty;
        }
    }
}
