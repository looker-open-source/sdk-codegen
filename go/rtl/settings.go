package rtl

import (
	"fmt"
	"gopkg.in/ini.v1"
	"os"
	"strconv"
	"strings"
)

var defaultSectionName string = "Looker"

type ApiSettings struct {
	BaseUrl      string `ini:"base_url"`
	VerifySsl    bool   `ini:"verify_ssl"`
	Timeout      int32  `ini:"timeout"`
	AgentTag     string `ini:"agent_tag"`
	FileName     string `ini:"file_name"`
	ClientId     string `ini:"client_id"`
	ClientSecret string `ini:"client_secret"`
	ApiVersion   string `ini:"api_version"`
	Headers      map[string]string
}

var defaultSettings ApiSettings = ApiSettings{
	VerifySsl:  true,
	ApiVersion: "4.0",
	Timeout:    120,
}

func NewSettingsFromFile(file string, section *string) (ApiSettings, error) {
	if section == nil {
		section = &defaultSectionName
	}

	// Default values
	s := defaultSettings

	cfg, err := ini.Load(file)
	if err != nil {
		return s, fmt.Errorf("error reading ini file: %w", err)
	}

	err = cfg.Section(*section).MapTo(&s)
	return s, err

}

func NewSettingsFromEnv() (ApiSettings, error) {
	settings := defaultSettings

	if v, present := os.LookupEnv(baseUrlEnvKey); present {
		settings.BaseUrl = v
	}
	if v, present := os.LookupEnv(apiVersionEnvKey); present {
		settings.ApiVersion = v
	}
	if v, present := os.LookupEnv(verifySslEnvKey); present {
		s := strings.ToLower(v)
		settings.VerifySsl = s == "true" || s == "t" || s == "1" || s == "y" || s == "yes"
	}
	if v, present := os.LookupEnv(timeoutEnvKey); present {
		timeout, err := strconv.ParseInt(v, 10, 32)
		if err == nil {
			settings.Timeout = int32(timeout)
		}
	}
	if v, present := os.LookupEnv(clientIdEnvKey); present {
		settings.ClientId = v
	}
	if v, present := os.LookupEnv(clientSecretEnvKey); present {
		settings.ClientSecret = v
	}

	return settings, nil
}
