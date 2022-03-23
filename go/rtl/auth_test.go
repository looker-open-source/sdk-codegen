package rtl

import (
	"encoding/json"
	"reflect"
	"fmt"
	"net/http"
	"net/http/httptest"
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

func TestAuthSession_Authenticate(t *testing.T) {
	const apiVersion = "/4.0"
	tests := []struct {
		name			string
		originalTokan 	AccessToken
		loginStatusCode	int
		loginToken  	AccessToken
		wantHeader 		string
		wantErr 		bool
	}{
		{
			name: "Authenticate() sets header with current AccessToken if not expired",
			loginStatusCode: http.StatusOK,
			originalTokan: AccessToken{
				AccessToken: "testToken",
				TokenType:   "testTokenType",
				ExpireTime:  time.Now().AddDate(1, 0, 0),
			},
			loginToken:  	AccessToken{},
			wantHeader:		"token testToken",
			wantErr: 		false,
		},
		{
			name: "Authenticate() fetches new Access Token from /login and sets header with it if old AccessToken is expired",
			loginStatusCode: http.StatusOK,
			originalTokan: AccessToken{
				AccessToken: "testToken",
				TokenType:   "testTokenType",
				ExpireTime:  time.Now().AddDate(-1, 0, 0),
			},
			loginToken: AccessToken{
				AccessToken: "newToken",
				TokenType:   "testTokenType",
				ExpiresIn:  31536000, // in a year
			},
			wantHeader:		"token newToken",
			wantErr: 		false,
		},
		{
			name: "Authenticate() errors if /login errors when fetching new Access Token if old AccessToken is expired",
			loginStatusCode: http.StatusUnauthorized,
			originalTokan: AccessToken{
				AccessToken: "testToken",
				TokenType:   "testTokenType",
				ExpireTime:  time.Now().AddDate(-1, 0, 0),
			},
			loginToken: AccessToken{},
			wantErr: 		true,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mux := http.NewServeMux()
			server := httptest.NewServer(mux)
			defer server.Close()

			mux.HandleFunc("/api" + apiVersion + "/login", func(w http.ResponseWriter, r *http.Request) {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(tt.loginStatusCode)
				s, _ := json.Marshal(tt.loginToken)
				fmt.Fprint(w, string(s))
			})

			s := &AuthSession{
				Config: ApiSettings{
					BaseUrl: server.URL,
					ApiVersion:  apiVersion,
				},
				token: tt.originalTokan,
			}

			req, _ := http.NewRequest("GET", "URL", nil)
			err := s.Authenticate(req)

			if tt.wantErr {
				if err == nil {
					t.Errorf("case: %s, wanted error, did not get error", tt.name)
				}
			} else {
				if req.Header["Authorization"][0] != tt.wantHeader {
					t.Errorf("case: %s, wanted Authorization header: \"%s\", got: \"%s\"", tt.name, tt.wantHeader, req.Header["Authorization"][0])
				}
			}
		})
	}
}

func TestAuthSession_Do(t *testing.T) {
	type stringStruct struct {
		Field *string `json:"field"`
	}

	type numStruct struct {
		Field *int64 `json:"field"`
	}

	var numField int64 = 12345
	var stringField = "12345"
	const path  = "/someMethod"
	const apiVersion = "/4.0"
	const maxTime int32 = 2147483647

	t.Run("Do() unmarshals num type field to string type field",func(t *testing.T) {
		mux := http.NewServeMux()
		server := httptest.NewServer(mux)
		defer server.Close()

		mux.HandleFunc("/api" + apiVersion + "/login", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			s, _ := json.Marshal(AccessToken{
				ExpiresIn: maxTime,
			})
			fmt.Fprint(w, string(s))
		})

		mux.HandleFunc("/api" + apiVersion + path, func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			s, _ := json.Marshal(numStruct{
				Field: &numField,
			})
			fmt.Fprint(w, string(s))
		})

		s := &AuthSession{
			Config: ApiSettings{
				BaseUrl: server.URL,
				ApiVersion:  apiVersion,
			},
		}

		var result stringStruct
		s.Do(&result, "GET", apiVersion, path, nil, nil, nil)

		if *result.Field != stringField {
			t.Error("num type field was not unmarshaled correctly into string type field")
		}
	})

	t.Run("Do() unmarshals string type field to num type field", func(t *testing.T) {
		mux := http.NewServeMux()
		server := httptest.NewServer(mux)
		defer server.Close()

		mux.HandleFunc("/api" + apiVersion + "/login", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			s, _ := json.Marshal(AccessToken{
				ExpiresIn: maxTime,
			})
			fmt.Fprint(w, string(s))
		})

		mux.HandleFunc("/api" + apiVersion + path, func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			s, _ := json.Marshal(stringStruct{
				Field: &stringField,
			})
			fmt.Fprint(w, string(s))
		})

		s := &AuthSession{
			Config: ApiSettings{
				BaseUrl: server.URL,
				ApiVersion:  apiVersion,
			},
		}

		var result numStruct
		s.Do(&result, "GET", apiVersion, path, nil, nil, nil)

		if *result.Field != numField {
			t.Error("string type field was not unmarshaled correctly into num type field")
		}
	})

	t.Run("Do{} unmarshals struct with mixed string and num types correctly", func(t *testing.T) {
		mux := http.NewServeMux()
		server := httptest.NewServer(mux)
		defer server.Close()

		mux.HandleFunc("/api" + apiVersion + "/login", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			s, _ := json.Marshal(AccessToken{
				ExpiresIn: maxTime,
			})
			fmt.Fprint(w, string(s))
		})

		mux.HandleFunc("/api" + apiVersion + path, func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			var string1 int64 = 1
			var num1 int64 = 1
			string2 := "2"
			num2:= "2"
			string3 := "3"
			var num3 int64 = 3
			string4 := "4"
			var num4 int64 = 4
			originalStruct := struct {
				String1 *int64 `json:"string1"`
				Num1 *int64 `json:"num1"`
				String2 *string `json:"string2"`
				Num2 *string `json:"num2"`
				String3 *string `json:"string3"`
				Num3 *int64 `json:"num3"`
				String4 *string `json:"string4"`
				Num4 *int64 `json:"num4"`
			}{
				String1: &string1,
				Num1: &num1,
				String2: &string2,
				Num2: &num2,
				String3: &string3,
				Num3: &num3,
				String4: &string4,
				Num4: &num4,
			}
			s, _ := json.Marshal(originalStruct)
			fmt.Fprint(w, string(s))
		})

		s := &AuthSession{
			Config: ApiSettings{
				BaseUrl: server.URL,
				ApiVersion:  apiVersion,
			},
		}

		type expectedStructType struct {
			String1 *string `json:"string1"`
			Num1 *int64 `json:"num1"`
			String2 *string `json:"string2"`
			Num2 *int64 `json:"num2"`
			String3 *string `json:"string3"`
			Num3 *int64 `json:"num3"`
		}

		string1 := "1"
		var num1 int64 = 1
		string2 := "2"
		var num2 int64 = 2
		string3 := "3"
		var num3 int64 = 3

		expectedStruct := expectedStructType{
			String1: &string1,
			Num1: &num1,
			String2: &string2,
			Num2: &num2,
			String3: &string3,
			Num3: &num3,
		}

		var result expectedStructType

		s.Do(&result, "GET", apiVersion, path, nil, nil, nil)

		if !reflect.DeepEqual(result, expectedStruct) {
			t.Error("fields of mixed types were not unmarshaled correctly into the right types")
		}
	})

	t.Run("Do() parses response as string type if result is string type", func(t *testing.T) {
		mux := http.NewServeMux()
		server := httptest.NewServer(mux)
		defer server.Close()

		mux.HandleFunc("/api" + apiVersion + "/login", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			s, _ := json.Marshal(AccessToken{
				ExpiresIn: maxTime,
			})
			fmt.Fprint(w, string(s))
		})

		mux.HandleFunc("/api" + apiVersion + path, func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			fmt.Fprint(w, "a response")
		})

		s := &AuthSession{
			Config: ApiSettings{
				BaseUrl: server.URL,
				ApiVersion:  apiVersion,
			},
		}

		var result string

		err := s.Do(&result, "GET", apiVersion, path, nil, nil, nil)

		if err != nil {
			t.Errorf("Do() failed. error=%v", err)
		}

		if result != "a response" {
			t.Error("Do() failed to parse response as string")
		}
	})

	t.Run("Do() json decodes response as map[string]interface{} type if result is interface{} type", func(t *testing.T) {
		mux := http.NewServeMux()
		server := httptest.NewServer(mux)
		defer server.Close()

		mux.HandleFunc("/api" + apiVersion + "/login", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			s, _ := json.Marshal(AccessToken{
				ExpiresIn: maxTime,
			})
			fmt.Fprint(w, string(s))
		})

		mux.HandleFunc("/api" + apiVersion + path, func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			originalStruct := struct {
				Field float64 `json:"field"`
			}{
				Field: 10,
			}
			s, _ := json.Marshal(originalStruct)
			fmt.Fprint(w, string(s))
		})

		s := &AuthSession{
			Config: ApiSettings{
				BaseUrl: server.URL,
				ApiVersion:  apiVersion,
			},
		}

		var result interface{}
		var expectedField float64 = 10

		err := s.Do(&result, "GET", apiVersion, path, nil, nil, nil)

		if err != nil {
			t.Errorf("Do() failed. error=%v", err)
		}

		if result.(map[string]interface{})["field"] != expectedField {
			t.Error("Do() failed to json decode response")
		}
	})

	t.Run("Do() json decodes response as struct type if result is struct type", func(t *testing.T) {
		mux := http.NewServeMux()
		server := httptest.NewServer(mux)
		defer server.Close()

		mux.HandleFunc("/api" + apiVersion + "/login", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			s, _ := json.Marshal(AccessToken{
				ExpiresIn: maxTime,
			})
			fmt.Fprint(w, string(s))
		})

		mux.HandleFunc("/api" + apiVersion + path, func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			originalStruct := struct {
				Field1 int64 `json:"field1"`
				Field2 string `json:"field2"`
			}{
				Field1: 10,
				Field2: "a value",
			}
			s, _ := json.Marshal(originalStruct)
			fmt.Fprint(w, string(s))
		})

		s := &AuthSession{
			Config: ApiSettings{
				BaseUrl: server.URL,
				ApiVersion:  apiVersion,
			},
		}

		type expectedStructType struct {
			Field1 *int64 `json:"field1"`
			Field2 *string `json:"field2"`
		}

		var field1 int64 = 10
		field2 := "a value"

		expectedStruct := expectedStructType{
			Field1: &field1,
			Field2: &field2,
		}

		var result expectedStructType

		err := s.Do(&result, "GET", apiVersion, path, nil, nil, nil)

		if err != nil {
			t.Errorf("Do() failed. error=%v", err)
		}

		if !reflect.DeepEqual(result, expectedStruct) {
			t.Error("Do() failed to json decode response properly")
		}
	})
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
