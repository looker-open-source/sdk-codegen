package rtl

import (
	"fmt"
	"gopkg.in/ini.v1"
)

var defaultSectionName string = "Looker"

type ApiSettings struct {
	BaseUrl      string
	VerifySsl    bool
	Timeout      int32
	AgentTag     string
	FileName     string
	ClientId     string
	ClientSecret string
	ApiVersion   string
	SectionName  string `ini:"-"` //don't read this from file
}

func NewSettingsFromFile(file string, section *string) (ApiSettings, error) {
	if section == nil {
		section = &defaultSectionName
	}

	s := ApiSettings{
		SectionName: *section,
		VerifySsl:   true,
		ApiVersion:  DefaultApiVersion,
	}

	cfg, err := ini.Load(file)
	if err != nil {
		return s, fmt.Errorf("error reading ini file: %w", err)
	}

	err = cfg.Section(*section).MapTo(&s)
	return s, err

}
