# Go Looker SDK


## Basic Usage

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

	// Create new auth session. It will fetch/refresh the access token from the `login` endpoint. 
    session := rtl.NewAuthSession(cfg)

    // Create new instance of the Go Looker SDK 
	sdk := v4.NewLookerSDK(session)

    // Get your user's name
    me, err := sdk.Me("", nil)
	fmt.Printf("Your name is %s %s\n", *(me.first), *(me.last))
}
```