using System;
using System.IO;
using IniParser;

namespace Looker.RTL
{
    // TODO file configuration provider
    // https://docs.microsoft.com/en-us/dotnet/api/microsoft.extensions.configuration.fileconfigurationprovider?view=dotnet-plat-ext-3.1
    // instead of IniParser

    public interface IApiSettings : ITransportSettings
    {
        /// <summary>
        /// return configuration values as a name/value collection from the configuration store
        /// </summary>
        /// <param name="section">Configuration section name to read</param>
        /// <returns><c>IValues</c> collection</returns>
        IValues ReadConfig(string section = null);

        /// <summary>
        /// Are all required API Settings configured?
        /// </summary>
        /// <returns>returns True if the API settings are configured correctly</returns>
        bool IsConfigured();
    }

    /// <summary>
    /// Base ApiSettings class that reads configuration values from looker.ini by default
    /// </summary>
    public class ApiSettings : IApiSettings
    {
        public string BaseUrl { get; set; }
        public bool VerifySsl { get; set; } = true;
        public int Timeout { get; set; } = 120;
        public string AgentTag { get; set; }
        private string FileName { get; }
        private string SectionName { get; }

        public ApiSettings()
        {
        }

        /// <summary>
        /// Read ApiSettings from an ini file 
        /// </summary>
        /// <param name="fileName">Name of file to read. Defaults to <c>looker.ini</c> in the current path.
        /// If specified and the file does not exist, an error is thrown.</param>
        /// <param name="sectionName">Name of section to read from <c>.ini</c> file. Defaults to "Looker"</param>
        /// <exception cref="ArgumentException"></exception>
        public ApiSettings(string fileName = "", string sectionName = null)
        {
            if (fileName.IsFull())
            {
                if (!File.Exists(fileName))
                {
                    throw new ArgumentException($"File {fileName} does not exist.");
                }
            }

            FileName = fileName ?? "looker.ini";
            SectionName = sectionName ?? "Looker";
            if (File.Exists(FileName))
            {
                Load(ReadConfig(sectionName));
            }
        }

        public IValues ReadConfig(string sectionName = null)
        {
            var parser = new FileIniDataParser();
            var data = parser.ReadFile(FileName);
            sectionName ??= SectionName;
            var section = data[sectionName];
            IValues result = new Values();
            foreach (var pair in section)
            {
                result[pair.KeyName] = pair.Value;
            }

            // TODO: figure out how to make section.toDictionary() work
            return result;
        }

        public IApiSettings Load(IValues values)
        {
            foreach (var pair in values)
            {
                switch (pair.Key)
                {
                    case "base_url":
                        BaseUrl = Convert.ToString(pair.Value);
                        break;
                    case "verify_ssl":
                        VerifySsl = Convert.ToBoolean(pair.Value);
                        break;
                    case "timeout":
                        Timeout = Convert.ToInt32(pair.Value);
                        break;
                    case "agentTag":
                        AgentTag = Convert.ToString(pair.Value);
                        break;
                }
            }

            return this;
        }

        public bool IsConfigured()
        {
            return BaseUrl.IsFull();
        }
    }
}