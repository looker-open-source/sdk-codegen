package rtl

import (
	"bytes"
	"context"
	"crypto/tls"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"reflect"
	"time"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/clientcredentials"

	json "github.com/json-iterator/go"
	extra "github.com/json-iterator/go/extra"
)

func init() {
	// Register fuzzy json decoders to parse
	// from string to num and vice versa
	extra.RegisterFuzzyDecoders()
}

// This struct implements the Roundtripper interface (golang's http middleware)
// It sets the "x-looker-appid" Header on requests
type transportWithHeaders struct {
	Base http.RoundTripper
}

func (t *transportWithHeaders) RoundTrip(req *http.Request) (*http.Response, error) {
	req.Header.Set("x-looker-appid", "go-sdk")
	return t.Base.RoundTrip(req)
}

type AuthSession struct {
	Config ApiSettings
	Client http.Client
}

func NewAuthSession(config ApiSettings) *AuthSession {
	transport := &http.Transport{
		TLSClientConfig: &tls.Config{
			InsecureSkipVerify: !config.VerifySsl,
		},
	}

	return NewAuthSessionWithTransport(config, transport)
}

// The transport parameter may override your VerifySSL setting
func NewAuthSessionWithTransport(config ApiSettings, transport http.RoundTripper) *AuthSession {
	// This transport (Roundtripper) sets
	// the "x-looker-appid" Header on requests
	appIdHeaderTransport := &transportWithHeaders{
		Base: transport,
	}

	// clientcredentials.Config manages the token refreshing
	oauthConfig := clientcredentials.Config{
		ClientID:     config.ClientId,
		ClientSecret: config.ClientSecret,
		TokenURL:     fmt.Sprintf("%s/api/%s/login", config.BaseUrl, config.ApiVersion),
		AuthStyle:    oauth2.AuthStyleInParams,
	}

	ctx := context.WithValue(
		context.Background(),
		oauth2.HTTPClient,
		// Will set "x-looker-appid" Header on TokenURL requests
		&http.Client{Transport: appIdHeaderTransport},
	)

	// Make use of oauth2 transport to handle token management
	oauthTransport := &oauth2.Transport{
		Source: oauthConfig.TokenSource(ctx),
		// Will set "x-looker-appid" Header on all other requests
		Base: appIdHeaderTransport,
	}

	return &AuthSession{
		Config: config,
		Client: http.Client{Transport: oauthTransport},
	}
}

func (s *AuthSession) Do(result interface{}, method, ver, path string, reqPars map[string]interface{}, body interface{}, options *ApiSettings) error {

	// prepare URL
	u := fmt.Sprintf("%s/api%s%s", s.Config.BaseUrl, ver, path)

	bodyString := ""
	contentTypeHeader := ""

	// serialize body to string and determine request's Content-Type header
	if body != nil {
		// get the `body`'s type
		kind := reflect.TypeOf(body).Kind()
		value := reflect.ValueOf(body)

		// check if it is pointer
		if kind == reflect.Ptr {
			// if so find the type it points to
			kind = reflect.ValueOf(body).Elem().Kind()
			value = reflect.ValueOf(body).Elem()
		}

		if kind == reflect.String {
			contentTypeHeader = "text/plain"
			bodyString = fmt.Sprintf("%v", value)
		} else {
			contentTypeHeader = "application/json"
			serializedBody, err := json.Marshal(body)

			if err != nil {
				_, _ = fmt.Fprintf(os.Stderr, "error serializing body: %v", err)
			}

			bodyString = string(serializedBody)
		}
	}

	// create request context with timeout
	var timeoutInSeconds int32 = 120 //seconds
	if s.Config.Timeout != 0 {
		timeoutInSeconds = s.Config.Timeout
	}
	if options != nil && options.Timeout != 0 {
		timeoutInSeconds = options.Timeout
	}

	ctx, cncl := context.WithTimeout(context.Background(), time.Second * time.Duration(timeoutInSeconds))
	defer cncl()

	// create new request
	req, err := http.NewRequestWithContext(ctx, method, u, bytes.NewBufferString(bodyString))
	if err != nil {
		return err
	}

	// set headers
	req.Header.Set("Content-Type", contentTypeHeader)

	if s.Config.AgentTag != "" {
		req.Header.Set("User-Agent", s.Config.AgentTag)
	}
	if options != nil && options.AgentTag != "" {
		req.Header.Set("User-Agent", options.AgentTag)
	}

	if s.Config.Headers != nil {
		for key, value := range s.Config.Headers {
			req.Header.Set(key, value)
		}
	}
	if options != nil && options.Headers != nil {
		for key, value := range options.Headers {
			req.Header.Set(key, value)
		}
	}

	// set query params
	setQuery(req.URL, reqPars)

	// do the actual http call
	res, err := s.Client.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	if res.StatusCode < 200 || res.StatusCode > 226 {
		b, err := ioutil.ReadAll(res.Body)
		if err != nil {
			return fmt.Errorf("response error. status=%s. error parsing error body", res.Status)
		}

		return fmt.Errorf("response error. status=%s. error=%s", res.Status, string(b))
	}

	if res.StatusCode == 204 { // 204 No Content. DELETE endpoints returns response with no body
		return nil
	}

	// TODO: Make parsing content-type aware. Requires change to go model generation to use interface{} for all union types.
	// Github Issue: https://github.com/looker-open-source/sdk-codegen/issues/1022
	switch v := result.(type) {
	case *string:
		b, err := ioutil.ReadAll(res.Body)
		if err != nil {
			return err
		}
		*v = string(b)
	default:
		return json.NewDecoder(res.Body).Decode(&result)
	}

	return nil
}

func isStringType(v interface{}) bool {
	return reflect.ValueOf(v).Kind() == reflect.String
}

func isPtrToStringType(v interface{}) bool {
	return reflect.ValueOf(v).Type() == reflect.PtrTo(reflect.TypeOf(""))
}

// setQuery takes the provided parameter map and sets it as query parameters of the provided url
func setQuery(u *url.URL, pars map[string]interface{}) {

	if pars == nil || u == nil {
		return
	}

	q := u.Query()
	for k, v := range pars {
		// skip nil and ""
		if v == nil || v == "" || (reflect.ValueOf(v).Kind() == reflect.Ptr && reflect.ValueOf(v).IsNil()) {
			continue
		}
		if isPtrToStringType(v) {
			q.Add(k, *(v.(*string)))
		} else if isStringType(v) {
			q.Add(k, v.(string))
		} else {
			// marshal the value to json
			jsn, err := json.Marshal(v)
			if err != nil {
				_, _ = fmt.Fprintf(os.Stderr, "error serializing parameter: %s, error: %v", k, err)
			}
			q.Add(k, string(jsn))
		}
	}
	u.RawQuery = q.Encode()
}
