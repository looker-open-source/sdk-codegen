package rtl

import (
	"os"
	"reflect"
	"testing"
)

func TestNewSettingsFromFile(t *testing.T) {
	type args struct {
		file    string
		section *string
	}
	tests := []struct {
		name    string
		args    args
		want    ApiSettings
		wantErr bool
	}{
		{
			name: "basic",
			args: args{
				file:    "testdata/settings.ini",
				section: nil,
			},
			want: ApiSettings{
				BaseUrl:      "BaseUrlValue",
				VerifySsl:    false,
				Timeout:      160,
				AgentTag:     "AgentTagValue",
				FileName:     "FileNameValue",
				ClientId:     "client-id",
				ClientSecret: "client-secret",
				ApiVersion:   "10.0",
			},
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := NewSettingsFromFile(tt.args.file, tt.args.section)
			if (err != nil) != tt.wantErr {
				t.Errorf("NewSettingsFromFile() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("NewSettingsFromFile() got = %v, want %v", got, tt.want)
			}
		})
	}
}

type pair struct {
	k string
	v string
}

func TestNewSettingsFromEnv(t *testing.T) {
	getEnv := func() []pair {
		var pairs []pair

		if v, present := os.LookupEnv(baseUrlEnvKey); present {
			pairs = append(pairs, pair{k: baseUrlEnvKey, v: v})
		}
		if v, present := os.LookupEnv(apiVersionEnvKey); present {
			pairs = append(pairs, pair{k: apiVersionEnvKey, v: v})
		}
		if v, present := os.LookupEnv(verifySslEnvKey); present {
			pairs = append(pairs, pair{k: verifySslEnvKey, v: v})
		}
		if v, present := os.LookupEnv(timeoutEnvKey); present {
			pairs = append(pairs, pair{k: timeoutEnvKey, v: v})
		}
		if v, present := os.LookupEnv(clientIdEnvKey); present {
			pairs = append(pairs, pair{k: clientIdEnvKey, v: v})
		}
		if v, present := os.LookupEnv(clientSecretEnvKey); present {
			pairs = append(pairs, pair{k: clientSecretEnvKey, v: v})
		}

		return pairs
	}

	clearEnv := func() {
		os.Unsetenv(baseUrlEnvKey)
		os.Unsetenv(apiVersionEnvKey)
		os.Unsetenv(verifySslEnvKey)
		os.Unsetenv(timeoutEnvKey)
		os.Unsetenv(clientIdEnvKey)
		os.Unsetenv(clientSecretEnvKey)
	}

	setEnv := func(pairs []pair) {
		clearEnv()
		for _, pair := range pairs {
			os.Setenv(pair.k, pair.v)
		}
	}

	tests := []struct {
		name string
		env  []pair
		want ApiSettings
	}{
		{
			name: "NewSettingsFromEnv() returns settings when all environment variables set",
			env: []pair{
				{baseUrlEnvKey, "url"},
				{apiVersionEnvKey, "5.0"},
				{verifySslEnvKey, "false"},
				{timeoutEnvKey, "360"},
				{clientIdEnvKey, "id"},
				{clientSecretEnvKey, "secret"},
			},
			want: ApiSettings{
				BaseUrl:      "url",
				ApiVersion:   "5.0",
				VerifySsl:    false,
				Timeout:      360,
				ClientId:     "id",
				ClientSecret: "secret",
			},
		},
		{
			name: "NewSettingsFromEnv() sets defaults correctly if env vars not set for them",
			env: []pair{
				{baseUrlEnvKey, "url"},
				{clientIdEnvKey, "id"},
				{clientSecretEnvKey, "secret"},
			},
			want: ApiSettings{
				BaseUrl:      "url",
				ApiVersion:   "4.0",
				VerifySsl:    true,
				Timeout:      120,
				ClientId:     "id",
				ClientSecret: "secret",
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			origEnv := getEnv()
			defer setEnv(origEnv)

			setEnv(tt.env)

			got, _ := NewSettingsFromEnv()
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("NewSettingsFromEnv() got = %v, want %v", got, tt.want)
			}
		})
	}
}
