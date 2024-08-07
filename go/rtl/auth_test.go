package rtl

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"reflect"
	"testing"
	"time"
)

type AccessToken struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int32  `json:"expires_in"`
}

var foreverValidTestToken AccessToken = AccessToken{
	AccessToken: "a_forever_valid_test_token_lol",
	ExpiresIn:   2147483647, // max time
	TokenType:   "Bearer",
}

func setupApi40Login(mux *http.ServeMux, token AccessToken, status int) {
	mux.HandleFunc("/api/4.0/login", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(status)
		s, _ := json.Marshal(token)
		fmt.Fprint(w, string(s))
	})
}

func TestAuthSession_Do_Authorization(t *testing.T) {
	const path = "/someMethod"
	const apiVersion = "/4.0"

	t.Run("Do() sets Authorization header with access token fetched from /login", func(t *testing.T) {
		mux := http.NewServeMux()
		setupApi40Login(mux, foreverValidTestToken, http.StatusOK)
		server := httptest.NewServer(mux)
		defer server.Close()

		mux.HandleFunc("/api"+apiVersion+path, func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			expectedHeader := foreverValidTestToken.TokenType + " " + foreverValidTestToken.AccessToken
			if authHeader != expectedHeader {
				t.Errorf("Authorization header not correct. got=%v want=%v", authHeader, expectedHeader)
			}
		})

		session := NewAuthSession(ApiSettings{
			BaseUrl:    server.URL,
			ApiVersion: apiVersion,
		})

		var r string
		err := session.Do(&r, "GET", apiVersion, path, nil, nil, nil)

		if err != nil {
			t.Errorf("Do() call failed: %v", err)
		}
	})

	t.Run("Do() sets Authorization header with new access token fetched from /login if previous access token expired", func(t *testing.T) {
		mux := http.NewServeMux()
		server := httptest.NewServer(mux)
		defer server.Close()

		recievedAuthHeaders := []string{}
		nearExpiredToken := AccessToken{
			AccessToken: "nearly_expired",
			ExpiresIn:   1, // a second
			TokenType:   "Bearer",
		}

		mux.HandleFunc("/api"+apiVersion+path, func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			recievedAuthHeaders = append(recievedAuthHeaders, authHeader)
		})

		mux.HandleFunc("/api/4.0/login", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			var s []byte
			if len(recievedAuthHeaders) == 0 {
				s, _ = json.Marshal(nearExpiredToken)
			} else {
				s, _ = json.Marshal(foreverValidTestToken)
			}
			fmt.Fprint(w, string(s))
		})

		session := NewAuthSession(ApiSettings{
			BaseUrl:    server.URL,
			ApiVersion: apiVersion,
		})

		var r string
		err := session.Do(&r, "GET", apiVersion, path, nil, nil, nil)

		if err != nil {
			t.Errorf("First Do() call failed: %v", err)
		}

		// wait till previous token is definitely expired
		time.Sleep(2 * time.Second)

		err = session.Do(&r, "GET", apiVersion, path, nil, nil, nil)

		if err != nil {
			t.Errorf("Second Do() call failed: %v", err)
		}

		expectedAuthHeaders := []string{
			nearExpiredToken.TokenType + " " + nearExpiredToken.AccessToken,
			foreverValidTestToken.TokenType + " " + foreverValidTestToken.AccessToken,
		}

		if !reflect.DeepEqual(recievedAuthHeaders, expectedAuthHeaders) {
			t.Errorf("Set Authorization Headers not correct, got= %v wanted= %v", recievedAuthHeaders, expectedAuthHeaders)
		}
	})
}

func TestAuthSession_Do_Parse(t *testing.T) {
	type stringStruct struct {
		Field *string `json:"field"`
	}

	type numStruct struct {
		Field *int64 `json:"field"`
	}

	var numField int64 = 12345
	var stringField = "12345"
	const path = "/someMethod"
	const apiVersion = "/4.0"
	const maxTime int32 = 2147483647

	t.Run("Do() unmarshals num type field to string type field", func(t *testing.T) {
		mux := http.NewServeMux()
		server := httptest.NewServer(mux)
		defer server.Close()

		setupApi40Login(mux, foreverValidTestToken, http.StatusOK)

		mux.HandleFunc("/api"+apiVersion+path, func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			s, _ := json.Marshal(numStruct{
				Field: &numField,
			})
			fmt.Fprint(w, string(s))
		})

		session := NewAuthSession(ApiSettings{
			BaseUrl:    server.URL,
			ApiVersion: apiVersion,
		})

		var result stringStruct
		session.Do(&result, "GET", apiVersion, path, nil, nil, nil)

		if *result.Field != stringField {
			t.Error("num type field was not unmarshaled correctly into string type field")
		}
	})

	t.Run("Do() unmarshals string type field to num type field", func(t *testing.T) {
		mux := http.NewServeMux()
		server := httptest.NewServer(mux)
		defer server.Close()

		setupApi40Login(mux, foreverValidTestToken, http.StatusOK)

		mux.HandleFunc("/api"+apiVersion+path, func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			s, _ := json.Marshal(stringStruct{
				Field: &stringField,
			})
			fmt.Fprint(w, string(s))
		})

		session := NewAuthSession(ApiSettings{
			BaseUrl:    server.URL,
			ApiVersion: apiVersion,
		})

		var result numStruct
		session.Do(&result, "GET", apiVersion, path, nil, nil, nil)

		if *result.Field != numField {
			t.Error("string type field was not unmarshaled correctly into num type field")
		}
	})

	t.Run("Do{} unmarshals struct with mixed string and num types correctly", func(t *testing.T) {
		mux := http.NewServeMux()
		setupApi40Login(mux, foreverValidTestToken, http.StatusOK)
		server := httptest.NewServer(mux)
		defer server.Close()

		mux.HandleFunc("/api"+apiVersion+path, func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			var string1 int64 = 1
			var num1 int64 = 1
			string2 := "2"
			num2 := "2"
			string3 := "3"
			var num3 int64 = 3
			string4 := "4"
			var num4 int64 = 4
			originalStruct := struct {
				String1 *int64  `json:"string1"`
				Num1    *int64  `json:"num1"`
				String2 *string `json:"string2"`
				Num2    *string `json:"num2"`
				String3 *string `json:"string3"`
				Num3    *int64  `json:"num3"`
				String4 *string `json:"string4"`
				Num4    *int64  `json:"num4"`
			}{
				String1: &string1,
				Num1:    &num1,
				String2: &string2,
				Num2:    &num2,
				String3: &string3,
				Num3:    &num3,
				String4: &string4,
				Num4:    &num4,
			}
			s, _ := json.Marshal(originalStruct)
			fmt.Fprint(w, string(s))
		})

		session := NewAuthSession(ApiSettings{
			BaseUrl:    server.URL,
			ApiVersion: apiVersion,
		})

		type expectedStructType struct {
			String1 *string `json:"string1"`
			Num1    *int64  `json:"num1"`
			String2 *string `json:"string2"`
			Num2    *int64  `json:"num2"`
			String3 *string `json:"string3"`
			Num3    *int64  `json:"num3"`
		}

		string1 := "1"
		var num1 int64 = 1
		string2 := "2"
		var num2 int64 = 2
		string3 := "3"
		var num3 int64 = 3

		expectedStruct := expectedStructType{
			String1: &string1,
			Num1:    &num1,
			String2: &string2,
			Num2:    &num2,
			String3: &string3,
			Num3:    &num3,
		}

		var result expectedStructType

		session.Do(&result, "GET", apiVersion, path, nil, nil, nil)

		if !reflect.DeepEqual(result, expectedStruct) {
			t.Error("fields of mixed types were not unmarshaled correctly into the right types")
		}
	})

	t.Run("Do() parses response as string type if result is string type", func(t *testing.T) {
		mux := http.NewServeMux()
		setupApi40Login(mux, foreverValidTestToken, http.StatusOK)
		server := httptest.NewServer(mux)
		defer server.Close()

		mux.HandleFunc("/api"+apiVersion+path, func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			fmt.Fprint(w, "a response")
		})

		session := NewAuthSession(ApiSettings{
			BaseUrl:    server.URL,
			ApiVersion: apiVersion,
		})

		var result string

		err := session.Do(&result, "GET", apiVersion, path, nil, nil, nil)

		if err != nil {
			t.Errorf("Do() failed. error=%v", err)
		}

		if result != "a response" {
			t.Error("Do() failed to parse response as string")
		}
	})

	t.Run("Do() json decodes response as map[string]interface{} type if result is interface{} type", func(t *testing.T) {
		mux := http.NewServeMux()
		setupApi40Login(mux, foreverValidTestToken, http.StatusOK)
		server := httptest.NewServer(mux)
		defer server.Close()

		mux.HandleFunc("/api"+apiVersion+path, func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			originalStruct := struct {
				Field float64 `json:"field"`
			}{
				Field: 10,
			}
			s, _ := json.Marshal(originalStruct)
			fmt.Fprint(w, string(s))
		})

		session := NewAuthSession(ApiSettings{
			BaseUrl:    server.URL,
			ApiVersion: apiVersion,
		})

		var result interface{}
		var expectedField float64 = 10

		err := session.Do(&result, "GET", apiVersion, path, nil, nil, nil)

		if err != nil {
			t.Errorf("Do() failed. error=%v", err)
		}

		if result.(map[string]interface{})["field"] != expectedField {
			t.Error("Do() failed to json decode response")
		}
	})

	t.Run("Do() json decodes response as struct type if result is struct type", func(t *testing.T) {
		mux := http.NewServeMux()
		setupApi40Login(mux, foreverValidTestToken, http.StatusOK)
		server := httptest.NewServer(mux)
		defer server.Close()

		mux.HandleFunc("/api"+apiVersion+path, func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			originalStruct := struct {
				Field1 int64  `json:"field1"`
				Field2 string `json:"field2"`
			}{
				Field1: 10,
				Field2: "a value",
			}
			s, _ := json.Marshal(originalStruct)
			fmt.Fprint(w, string(s))
		})

		session := NewAuthSession(ApiSettings{
			BaseUrl:    server.URL,
			ApiVersion: apiVersion,
		})

		type expectedStructType struct {
			Field1 *int64  `json:"field1"`
			Field2 *string `json:"field2"`
		}

		var field1 int64 = 10
		field2 := "a value"

		expectedStruct := expectedStructType{
			Field1: &field1,
			Field2: &field2,
		}

		var result expectedStructType

		err := session.Do(&result, "GET", apiVersion, path, nil, nil, nil)

		if err != nil {
			t.Errorf("Do() failed. error=%v", err)
		}

		if !reflect.DeepEqual(result, expectedStruct) {
			t.Error("Do() failed to json decode response properly")
		}
	})
}

func TestAuthSession_Do_Headers(t *testing.T) {
	const path = "/someMethod"
	const apiVersion = "/4.0"

	t.Run("Do() sets custom headers if Headers is set in the AuthSession's api settings", func(t *testing.T) {
		mux := http.NewServeMux()
		setupApi40Login(mux, foreverValidTestToken, http.StatusOK)
		server := httptest.NewServer(mux)
		defer server.Close()

		mux.HandleFunc("/api"+apiVersion+path, func(w http.ResponseWriter, r *http.Request) {
			headerValue1 := r.Header.Get("Key1")
			headerValue2 := r.Header.Get("Key2")

			expectedHeaderValue1 := "Value1"
			expectedHeaderValue2 := "Value2"
			if headerValue1 != expectedHeaderValue1 || headerValue2 != expectedHeaderValue2 {
				t.Errorf("Custom headers not set correctly. got=%v and %v  want=%v and %v", headerValue1, headerValue2, expectedHeaderValue1, expectedHeaderValue2)
			}
		})

		s := NewAuthSession(ApiSettings{
			BaseUrl:    server.URL,
			ApiVersion: apiVersion,
			Headers:    map[string]string{"Key1": "Value1", "Key2": "Value2"},
		})

		var r string
		err := s.Do(&r, "GET", apiVersion, path, nil, nil, nil)

		if err != nil {
			t.Errorf("Do() call failed: %v", err)
		}
	})

	t.Run("Do()'s options.Headers will overwrite the Headers in the AuthSession's api settings", func(t *testing.T) {
		mux := http.NewServeMux()
		setupApi40Login(mux, foreverValidTestToken, http.StatusOK)
		server := httptest.NewServer(mux)
		defer server.Close()

		mux.HandleFunc("/api"+apiVersion+path, func(w http.ResponseWriter, r *http.Request) {
			headerValue1 := r.Header.Get("Key1")
			headerValue2 := r.Header.Get("Key2")

			expectedHeaderValue1 := "Value1"
			expectedHeaderValue2 := "OverwriteValue2"
			if headerValue1 != expectedHeaderValue1 || headerValue2 != expectedHeaderValue2 {
				t.Errorf("Custom headers not set correctly. got=%v and %v  want=%v and %v", headerValue1, headerValue2, expectedHeaderValue1, expectedHeaderValue2)
			}
		})

		s := NewAuthSession(ApiSettings{
			BaseUrl:    server.URL,
			ApiVersion: apiVersion,
			Headers:    map[string]string{"Key1": "Value1", "Key2": "Value2"},
		})

		options := ApiSettings{
			Headers: map[string]string{"Key1": "Value1", "Key2": "OverwriteValue2"},
		}
		var r string
		err := s.Do(&r, "GET", apiVersion, path, nil, nil, &options)

		if err != nil {
			t.Errorf("Do() call failed: %v", err)
		}
	})

	t.Run("Do() sets Content-Type header to 'application/json' if body is json", func(t *testing.T) {
		mux := http.NewServeMux()
		setupApi40Login(mux, foreverValidTestToken, http.StatusOK)
		server := httptest.NewServer(mux)
		defer server.Close()

		mux.HandleFunc("/api"+apiVersion+path, func(w http.ResponseWriter, r *http.Request) {
			contentTypeHeader := r.Header.Get("Content-Type")
			expectedHeader := "application/json"
			if contentTypeHeader != expectedHeader {
				t.Errorf("Content-Type header not correct. got=%v want=%v", contentTypeHeader, expectedHeader)
			}
		})

		session := NewAuthSession(ApiSettings{
			BaseUrl:    server.URL,
			ApiVersion: apiVersion,
		})

		var r string
		body := struct {
			key string
		}{
			key: "value",
		}

		err := session.Do(&r, "GET", apiVersion, path, nil, body, nil)

		if err != nil {
			t.Errorf("Do() call failed: %v", err)
		}
	})

	t.Run("Do() sets Content-Type header to 'text/plain' if body is a string", func(t *testing.T) {
		mux := http.NewServeMux()
		setupApi40Login(mux, foreverValidTestToken, http.StatusOK)
		server := httptest.NewServer(mux)
		defer server.Close()

		mux.HandleFunc("/api"+apiVersion+path, func(w http.ResponseWriter, r *http.Request) {
			contentTypeHeader := r.Header.Get("Content-Type")
			expectedHeader := "text/plain"
			if contentTypeHeader != expectedHeader {
				t.Errorf("Content-Type header not correct. got=%v want=%v", contentTypeHeader, expectedHeader)
			}
		})

		session := NewAuthSession(ApiSettings{
			BaseUrl:    server.URL,
			ApiVersion: apiVersion,
		})

		var r string
		err := session.Do(&r, "GET", apiVersion, path, nil, "body", nil)

		if err != nil {
			t.Errorf("Do() call failed: %v", err)
		}
	})

	t.Run("Do() sets User-Agent header with AuthSession config's AgentTag", func(t *testing.T) {
		mux := http.NewServeMux()
		setupApi40Login(mux, foreverValidTestToken, http.StatusOK)
		server := httptest.NewServer(mux)
		defer server.Close()

		mux.HandleFunc("/api"+apiVersion+path, func(w http.ResponseWriter, r *http.Request) {
			userAgentHeader := r.Header.Get("User-Agent")
			expectedHeader := "some-agent-tag"
			if userAgentHeader != expectedHeader {
				t.Errorf("User-Agent header not correct. got=%v want=%v", userAgentHeader, expectedHeader)
			}
		})

		session := NewAuthSession(ApiSettings{
			BaseUrl:    server.URL,
			ApiVersion: apiVersion,
			AgentTag:   "some-agent-tag",
		})

		var r string
		err := session.Do(&r, "GET", apiVersion, path, nil, nil, nil)

		if err != nil {
			t.Errorf("Do() call failed: %v", err)
		}
	})

	t.Run("Do() sets User-Agent header with Do's option's AgentTag, which will overwrite  AuthSession config", func(t *testing.T) {
		mux := http.NewServeMux()
		setupApi40Login(mux, foreverValidTestToken, http.StatusOK)
		server := httptest.NewServer(mux)
		defer server.Close()

		mux.HandleFunc("/api"+apiVersion+path, func(w http.ResponseWriter, r *http.Request) {
			userAgentHeader := r.Header.Get("User-Agent")
			expectedHeader := "new-agent-tag"
			if userAgentHeader != expectedHeader {
				t.Errorf("User-Agent header not correct. got=%v want=%v", userAgentHeader, expectedHeader)
			}
		})

		session := NewAuthSession(ApiSettings{
			BaseUrl:    server.URL,
			ApiVersion: apiVersion,
			AgentTag:   "some-agent-tag",
		})

		var r string
		options := ApiSettings{
			AgentTag: "new-agent-tag",
		}
		err := session.Do(&r, "GET", apiVersion, path, nil, nil, &options)

		if err != nil {
			t.Errorf("Do() call failed: %v", err)
		}
	})
}

func TestAuthSession_Do_Timeout(t *testing.T) {
	const path = "/someMethod"
	const apiVersion = "/4.0"

	t.Run("Do() follows Timeout set in AuthSession config", func(t *testing.T) {
		mux := http.NewServeMux()
		setupApi40Login(mux, foreverValidTestToken, http.StatusOK)
		server := httptest.NewServer(mux)
		defer server.Close()

		mux.HandleFunc("/api"+apiVersion+path, func(w http.ResponseWriter, r *http.Request) {
			time.Sleep(4 * time.Second)
		})

		session := NewAuthSession(ApiSettings{
			BaseUrl:    server.URL,
			ApiVersion: apiVersion,
			Timeout:    1, // seconds
		})

		err := session.Do(nil, "GET", apiVersion, path, nil, nil, nil)

		if err == nil {
			t.Errorf("Do() call did not error/timeout")
		} else if !errors.Is(err, context.DeadlineExceeded) {
			t.Errorf("Do() call did not error with context.DeadlineExceeded, got=%v", err)
		}
	})

	t.Run("Do() follows Timeout set in Do()'s options", func(t *testing.T) {
		mux := http.NewServeMux()
		setupApi40Login(mux, foreverValidTestToken, http.StatusOK)
		server := httptest.NewServer(mux)
		defer server.Close()

		mux.HandleFunc("/api"+apiVersion+path, func(w http.ResponseWriter, r *http.Request) {
			time.Sleep(4 * time.Second)
		})

		session := NewAuthSession(ApiSettings{
			BaseUrl:    server.URL,
			ApiVersion: apiVersion,
		})

		options := ApiSettings{
			Timeout: 1, //seconds
		}

		err := session.Do(nil, "GET", apiVersion, path, nil, nil, &options)

		if err == nil {
			t.Errorf("Do() call did not error/timeout")
		} else if !errors.Is(err, context.DeadlineExceeded) {
			t.Errorf("Do() call did not error with context.DeadlineExceeded, got=%v", err)
		}
	})

	t.Run("Do() follows Context set in AuthSession config", func(t *testing.T) {
		mux := http.NewServeMux()
		setupApi40Login(mux, foreverValidTestToken, http.StatusOK)
		server := httptest.NewServer(mux)
		defer server.Close()

		mux.HandleFunc("/api"+apiVersion+path, func(w http.ResponseWriter, r *http.Request) {
			time.Sleep(4 * time.Second)
		})

		ctx, cncl := context.WithTimeout(context.Background(), 1*time.Second)
		defer cncl()

		session := NewAuthSession(ApiSettings{
			BaseUrl:    server.URL,
			ApiVersion: apiVersion,
			Context:    ctx,
		})

		err := session.Do(nil, "GET", apiVersion, path, nil, nil, nil)

		if err == nil {
			t.Errorf("Do() call did not error/timeout")
		} else if !errors.Is(err, context.DeadlineExceeded) {
			t.Errorf("Do() call did not error with context.DeadlineExceeded, got=%v", err)
		}
	})

	t.Run("Do() follows Context set in Do()'s options", func(t *testing.T) {
		mux := http.NewServeMux()
		setupApi40Login(mux, foreverValidTestToken, http.StatusOK)
		server := httptest.NewServer(mux)
		defer server.Close()

		mux.HandleFunc("/api"+apiVersion+path, func(w http.ResponseWriter, r *http.Request) {
			time.Sleep(4 * time.Second)
		})

		ctx, cncl := context.WithTimeout(context.Background(), 1*time.Second)
		defer cncl()

		session := NewAuthSession(ApiSettings{
			BaseUrl:    server.URL,
			ApiVersion: apiVersion,
		})

		options := ApiSettings{
			Context: ctx,
		}

		err := session.Do(nil, "GET", apiVersion, path, nil, nil, &options)

		if err == nil {
			t.Errorf("Do() call did not error/timeout")
		} else if !errors.Is(err, context.DeadlineExceeded) {
			t.Errorf("Do() call did not error with context.DeadlineExceeded, got=%v", err)
		}
	})

	t.Run("Timeout set in Do()'s options overrides Authsession", func(t *testing.T) {
		mux := http.NewServeMux()
		setupApi40Login(mux, foreverValidTestToken, http.StatusOK)
		server := httptest.NewServer(mux)
		defer server.Close()

		mux.HandleFunc("/api"+apiVersion+path, func(w http.ResponseWriter, r *http.Request) {
			time.Sleep(4 * time.Second)
		})

		session := NewAuthSession(ApiSettings{
			BaseUrl:    server.URL,
			ApiVersion: apiVersion,
			Timeout:    5,
		})

		options := ApiSettings{
			Timeout: 1, //seconds
		}

		err := session.Do(nil, "GET", apiVersion, path, nil, nil, &options)

		if err == nil {
			t.Errorf("Do() call did not error/timeout")
		} else if !errors.Is(err, context.DeadlineExceeded) {
			t.Errorf("Do() call did not error with context.DeadlineExceeded, got=%v", err)
		}
	})

	t.Run("Context set in AuthSession config overrides Timeouts", func(t *testing.T) {
		mux := http.NewServeMux()
		setupApi40Login(mux, foreverValidTestToken, http.StatusOK)
		server := httptest.NewServer(mux)
		defer server.Close()

		mux.HandleFunc("/api"+apiVersion+path, func(w http.ResponseWriter, r *http.Request) {
			time.Sleep(4 * time.Second)
		})

		ctx, cncl := context.WithTimeout(context.Background(), 1*time.Second)
		defer cncl()

		session := NewAuthSession(ApiSettings{
			BaseUrl:    server.URL,
			ApiVersion: apiVersion,
			Context:    ctx,
			Timeout:    5,
		})

		options := ApiSettings{
			Timeout: 5,
		}

		err := session.Do(nil, "GET", apiVersion, path, nil, nil, &options)

		if err == nil {
			t.Errorf("Do() call did not error/timeout")
		} else if !errors.Is(err, context.DeadlineExceeded) {
			t.Errorf("Do() call did not error with context.DeadlineExceeded, got=%v", err)
		}
	})

	t.Run("Context set in options overrides config ctx and all Timeouts", func(t *testing.T) {
		mux := http.NewServeMux()
		setupApi40Login(mux, foreverValidTestToken, http.StatusOK)
		server := httptest.NewServer(mux)
		defer server.Close()

		mux.HandleFunc("/api"+apiVersion+path, func(w http.ResponseWriter, r *http.Request) {
			time.Sleep(4 * time.Second)
		})

		octx, ocncl := context.WithTimeout(context.Background(), 1*time.Second)
		defer ocncl()

		sctx, scncl := context.WithTimeout(context.Background(), 5*time.Second)
		defer scncl()

		session := NewAuthSession(ApiSettings{
			BaseUrl:    server.URL,
			ApiVersion: apiVersion,
			Context:    sctx,
			Timeout:    5,
		})

		options := ApiSettings{
			Timeout: 5,
			Context: octx,
		}

		err := session.Do(nil, "GET", apiVersion, path, nil, nil, &options)

		if err == nil {
			t.Errorf("Do() call did not error/timeout")
		} else if !errors.Is(err, context.DeadlineExceeded) {
			t.Errorf("Do() call did not error with context.DeadlineExceeded, got=%v", err)
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
