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
