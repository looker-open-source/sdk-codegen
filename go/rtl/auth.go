package rtl

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"reflect"
	"time"
)

type AccessToken struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int32  `json:"expires_in"`
	ExpireTime  time.Time
}

func (t AccessToken) IsExpired() bool {
	return t.ExpireTime.IsZero() || time.Now().After(t.ExpireTime)
}

func NewAccessToken(js []byte) (AccessToken, error) {
	token := AccessToken{}
	if err := json.Unmarshal(js, &token); err != nil {
		return token, err
	}
	token.ExpireTime = time.Now().Add(time.Duration(token.ExpiresIn) * time.Second)
	return token, nil
}

type AuthSession struct {
	Config ApiSettings
	token  AccessToken
}

func NewAuthSession(config ApiSettings) *AuthSession {
	return &AuthSession{
		Config: config,
	}
}

func (s *AuthSession) login(id *string) error {
	u := fmt.Sprintf("%s/api/%s/login", s.Config.BaseUrl, s.Config.ApiVersion)
	data := url.Values{
		"client_id":     {s.Config.ClientId},
		"client_secret": {s.Config.ClientSecret},
	}
	tran := &(*http.DefaultTransport.(*http.Transport))
	tran.TLSClientConfig = &tls.Config{InsecureSkipVerify: !s.Config.VerifySsl}
	cl := http.Client{
		Transport: tran,
		Timeout:   time.Duration(s.Config.Timeout) * time.Second,
	}
	res, err := cl.PostForm(u, data)
	if err != nil {
		return err
	}

	if res.StatusCode != http.StatusOK {
		return fmt.Errorf("status not OK: %s", res.Status)
	}

	defer res.Body.Close()
	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return fmt.Errorf("error reading response body: %w", err)
	}

	s.token, err = NewAccessToken(body)

	return err
}

// Authenticate checks if the token is expired (do the token refresh if so), and updates the request header with Authorization
func (s *AuthSession) Authenticate(req *http.Request) error {
	if s.token.IsExpired() {
		if err := s.login(nil); err != nil {
			return err
		}
	}
	req.Header.Add("Authorization", fmt.Sprintf("token %s", s.token.AccessToken))
	return nil
}

func (s *AuthSession) Do(result interface{}, method, ver, path string, reqPars map[string]interface{},  body interface{}, options *ApiSettings) error {

	// prepare URL
	u := fmt.Sprintf("%s/api%s%s", s.Config.BaseUrl, ver, path)

	bodyString := serializeBody(body)

	// create new request
	req, err := http.NewRequest(method, u, bytes.NewBufferString(bodyString))
	if err != nil {
		return err
	}

	// set query params
	setQuery(req.URL, reqPars)

	// set auth header
	if err := s.Authenticate(req); err != nil {
		return err
	}

	tran := &(*http.DefaultTransport.(*http.Transport))
	tran.TLSClientConfig = &tls.Config{InsecureSkipVerify: !s.Config.VerifySsl}
	cl := http.Client{
		Transport: tran,
		Timeout:   time.Duration(s.Config.Timeout) * time.Second,
	}

	// do the actual http call
	res, err := cl.Do(req)
	if err != nil {
		return err
	}

	if res.StatusCode < 200 || res.StatusCode > 226 {
		return fmt.Errorf("response error: %s", res.Status)
	}

	err = json.NewDecoder(res.Body).Decode(&result)

	return nil
}

// serializeBody serializes body to a json, if the body is already string, it will just return it unchanged
func serializeBody(body interface{}) string {
	ret := ""
	if body == nil {
		return ret
	}

	// get the `body` type
	kind := reflect.TypeOf(body).Kind()
	value := reflect.ValueOf(body)

	// check if it is pointer
	if kind == reflect.Ptr {
		// if so, use the value kind
		kind = reflect.ValueOf(body).Elem().Kind()
		value = reflect.ValueOf(body).Elem()
	}

	// it is string, return it as it is
	if kind == reflect.String {
		return fmt.Sprintf("%v", value)
	}

	bb, err := json.Marshal(body)
	if err != nil {
		_, _ = fmt.Fprintf(os.Stderr, "error serializing body: %v", err)
	}

	return string(bb)

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
		// marshal the value to json
		jsn, err := json.Marshal(v)
		if err != nil {
			_, _ = fmt.Fprintf(os.Stderr, "error serializing parameter: %s, error: %v", k, err)
		}
		q.Add(k, string(jsn))
	}
	u.RawQuery = q.Encode()
}
