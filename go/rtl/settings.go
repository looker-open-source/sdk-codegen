package rtl

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	"gopkg.in/ini.v1"
)

var defaultSectionName string = "Looker"

type ApiSettings struct {
	BaseUrl      string `ini:"base_url"`
	AuthUrl      string `ini:"auth_url"`
	RedirectPort int64  `ini:"redirect_port"`
	RedirectPath string `ini:"redirect_path"`
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
	VerifySsl:    true,
	ApiVersion:   "4.0",
	Timeout:      120,
	RedirectPort: 8080,
	RedirectPath: "/callback",
	BaseUrl:      "",
	AuthUrl:      "",
}

func NewSettingsFromFile(file string, section *string) (ApiSettings, error) {
	if section == nil {
		section = &defaultSectionName
	}

	// Default values
	settings := defaultSettings

	cfg, err := ini.Load(file)
	if err != nil {
		return settings, fmt.Errorf("error reading ini file: %w", err)
	}

	err = cfg.Section(*section).MapTo(&settings)
	if settings.AuthUrl == "" && settings.BaseUrl != "" {
		settings.AuthUrl = settings.BaseUrl + "/auth"
	}

	return settings, err

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
	if v, present := os.LookupEnv(authUrlEnvKey); present {
		settings.AuthUrl = v
	}
	if v, present := os.LookupEnv(redirectPortEnvKey); present {
		redirectPort, err := strconv.ParseInt(v, 10, 64)
		if err == nil {
			settings.RedirectPort = int64(redirectPort)
		}
	}
	if v, present := os.LookupEnv(redirectPathEnvKey); present {
		settings.RedirectPath = v
	}

	if settings.AuthUrl == "" && settings.BaseUrl != "" {
		settings.AuthUrl = settings.BaseUrl + "/auth"
	}

	return settings, nil
}
