package rtl

import (
	"net/url"
	"testing"
	"time"
)

func TestNewAccessToken(t *testing.T) {
	type args struct {
		js []byte
	}
	tests := []struct {
		name    string
		args    args
		want    AccessToken
		wantErr bool
	}{
		{
			name: "basic",
			args: args{
				js: []byte("{\"access_token\":\"token\", \"token_type\":\"type\", \"expires_in\":5}"),
			},
			want: AccessToken{
				AccessToken: "token",
				TokenType:   "type",
				ExpiresIn:   5,
				ExpireTime:  time.Time{},
			},
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := NewAccessToken(tt.args.js)
			if (err != nil) != tt.wantErr {
				t.Errorf("NewAccessToken() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got.AccessToken != tt.want.AccessToken || got.TokenType != tt.want.TokenType || got.ExpiresIn != tt.want.ExpiresIn {
				t.Errorf("NewAccessToken() got = %v, want %v", got, tt.want)
			}
			// test the expiration, this should be probably in a separated test (too lazy)
			if got.IsExpired() {
				t.Errorf("can't be expired")
			}
			time.Sleep(time.Duration(got.ExpiresIn+1) * time.Second)
			if !got.IsExpired() {
				t.Errorf("must be expired")
			}
		})
	}
}

func TestAuthSession_login(t *testing.T) {
	cfg, err := NewSettingsFromFile("../../looker.ini", nil)
	if err != nil {
		t.Error(err)
	}
	type fields struct {
		config ApiSettings
		token  AccessToken
	}
	type args struct {
		id *string
	}
	tests := []struct {
		name    string
		fields  fields
		args    args
		wantErr bool
	}{
		{
			name: "basic",
			fields: fields{
				config: cfg,
				token:  AccessToken{},
			},
			args: args{
				id: nil,
			},
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := &AuthSession{
				Config: tt.fields.config,
				token:  tt.fields.token,
			}
			if err := s.login(tt.args.id); (err != nil) != tt.wantErr {
				t.Errorf("login() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestSetQuery(t *testing.T) {
	somestring := "somestring"
	testcases := []struct {
		url      string
		params   map[string]interface{}
		expected string
	}{
		// ignores empty/nil
		{
			url:      "https://foo",
			params:   map[string]interface{}{"integer": "", "str": nil},
			expected: "https://foo",
		},
		// strings and integers work as expected no quotes
		{
			url:      "https://foo",
			params:   map[string]interface{}{"integer": 5, "str": "string", "pstr": &somestring},
			expected: "https://foo?integer=5&pstr=somestring&str=string",
		},
	}
	for i, testcase := range testcases {
		url, _ := url.Parse(testcase.url)
		setQuery(url, testcase.params)
		strURLWithQuery := url.String()
		if strURLWithQuery != testcase.expected {
			t.Errorf("case %d: wanted: %s got %s", i, testcase.expected, strURLWithQuery)
		}
	}
}
