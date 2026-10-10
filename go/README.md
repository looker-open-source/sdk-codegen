# Go Looker SDK

The Go Looker SDK provides a convenient way to call your Looker instance's [Looker API](https://developers.looker.com/api/overview). The Go Looker SDK supports at least Go version 1.17.6 and 1.16.13 (subject to change). This SDK is community supported with contributions and discussion from the Looker developer community. We strive for functional parity with our original javascript/typescript SDK. Thanks for using our Go Looker SDK!

## Basic Usage

Example code snippet below for basic SDK setup and usage. Also `git clone` this sdk-codegen repo and run the [example code](go/example/main.go).

```go
import (
    "fmt"
    "github.com/looker-open-source/sdk-codegen/go/rtl"
    v4 "github.com/looker-open-source/sdk-codegen/go/sdk/v4"
)

func main() {
    // Get settings from either looker.ini file OR environment:
    // looker.ini file
    cfg, err := rtl.NewSettingsFromFile("path/to/looker.ini", nil)
    // environment
    cfg, err := rtl.NewSettingsFromEnv()

    // Create new auth session with sdk settings.
    // The auth session will fetch/refresh the access
    // token from your Looker instance's `login` endpoint.
    session := rtl.NewAuthSession(cfg)

    // Create new instance of the Go Looker SDK
    sdk := v4.NewLookerSDK(session)

    // Call the Looker API e.g. get your user's name
    me, err := sdk.Me("", nil)
    fmt.Printf("Your name is %s %s\n", *(me.first), *(me.last))
}
```

## Advanced usage

### Custom headers

You can set custom headers on Looker Go SDK's requests. They can either be applied to all outgoing requests or per outgoing request.

#### Custom headers for all requests

Follow the example code snippet below if you want all outgoing requests to have the same custom headers.

```go
func main() {
    cfg, err := rtl.NewSettingsFromFile("path/to/looker.ini", nil)

    // Set the Headers option in the settings/config
    cfg.Headers = map[string]string{
        "HeaderName1": "HeaderValue1",
        "HeaderName2": "HeaderValue2",
    }

    session := rtl.NewAuthSession(cfg)
    sdk := v4.NewLookerSDK(session)
}
```

#### Custom headers per request

Follow the example code snippet below if you want each outgoing request to have different custom headers. **These headers will overwrite any custom headers set in the SDK's settings as outlined in the previous [All Requests section](#custom-headers-for-all-requests).**

```go
func main() {
    cfg, err := rtl.NewSettingsFromFile("path/to/looker.ini", nil)
    session := rtl.NewAuthSession(cfg)
    sdk := v4.NewLookerSDK(session)

    // Set the headers in the options passed into the SDK method
    sdk.Me("", &ApiSettings{Headings: map[string]string{
        "HeaderName1": "HeaderValue1",
        "HeaderName2": "HeaderValue2",
    }})
}
```

### Timeout

You can set a custom timeout (in seconds) on Looker Go SDK's requests. The timeout defaults to 120 seconds. A timeout can either be applied to all outgoing requests or per outgoing request.

#### Timeout for all requests

Set `timeout` in your sdk's looker.ini file then call `NewSettingsFromFile()`.

```YAML
[Looker]
timeout=60
```

OR

Set `LOOKERSDK_TIMEOUT` environment variable then call `NewSettingsFromEnv()`.

```bash
LOOKERSDK_TIMEOUT=60
```

#### Timeout per request

Follow the example code snippet below if you want each outgoing request to have a different timeout. **The timeout will overwrite the timeout set in the SDK's settings as outlined in the previous [All Requests section](#timeout-for-all-requests).**

```go
import "context"

func main() {
    cfg, err := rtl.NewSettingsFromFile("path/to/looker.ini", nil)
    session := rtl.NewAuthSession(cfg)
    sdk := v4.NewLookerSDK(session)

    // Set the timeout in the options passed into the SDK method
    me, err := sdk.Me("", &ApiSettings{Timeout: 60})

    if errors.Is(err, context.DeadlineExceeded) {
        // Timeout exceeded
    }
}
```
### Custom Context

If you want even greater control over the lifecycle of the HTTP requests consider providing a [context](https://pkg.go.dev/context). Contexts can be set for all requests or per request. They can be combined with the timeout options mentioned in the previous section to fine-tune the lifecycle of your requests.

If you wish to include timeout functionality in your custom context then you should leverage [context.WithTimeout](https://pkg.go.dev/context#WithTimeout).

> Note: Custom contexts will be used as the parent context for any timeout you set as specified in the previous section. If the parent context gets cancelled it will propagate to the child context, but if the timeout context times out it does not propagate to the parent context. 

#### Custom Context for all requests

Follow the example code snippet below if you want all requests to use the same parent context:

```go
import "context"

func main() {
    // sets a timeout of 5 minutes
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
    defer cancel()
    
    cfg, err := rtl.NewSettingsFromFile("path/to/looker.ini", nil)
    cfg.Context = ctx

    session := rtl.NewAuthSession(cfg)
    sdk := v4.NewLookerSDK(session)
}
```

> Note: A context set here will become the parent context for all API calls as well as all requests to fetch/refresh oauth tokens, which are normally completely isolated from contexts set via the Timeout property. In this case the token refresh requests and each individual API call will share a common parent context.

#### Custom Context per request

Follow the example here to set a context for a specific request.

> Note: This will be used as the parent context for any timeout setting you've specified for API calls. If you've set contexts in both your API config and in the request options the request options context will be used instead. Background requests to fetch/refresh oauth tokens will NOT use a context set via request options - it will default to use a generic background context or, if you've also set a context in the API config it will still use that as specified in the previous section.

```go
import "context"

func main() {
    // sets a timeout of 5 minutes
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
    defer cancel()
    
    cfg, err := rtl.NewSettingsFromFile("path/to/looker.ini", nil)
    session := rtl.NewAuthSession(cfg)
    sdk := v4.NewLookerSDK(session)

    sdk.Me("", &ApiSettings{Context: ctx})
}
```

> Note: Setting a context per request will NOT affect the context used for the background token fetching requests. If you have also set a context for all requests as mentioned above then that context
will still be used for the token requests, otherwise the SDK will fall back on using a completely separate context for the token fetching requests.