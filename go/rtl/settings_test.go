package rtl

import (
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
