# Looker SDK

The Looker SDK for Kotlin provides a convenient way to communicate with the Looker API available on your Looker server.

**NOTICE**: The Kotlin SDK is [community supported](https://docs.looker.com/reference/api-and-integration/api-sdk-support-policy). Please [report any issues](https://github.com/looker-open-source/sdk-codegen/issues) encountered, and indicate the SDK language in the report.

## Getting started

The Looker SDK can be used in a Kotlin application in 3 steps:

* configure
* install
* use

### Configure the SDK for your Looker server

**Note**: The `.ini` configuration for the Looker SDK is a sample implementation intended to speed up the initial development of Node applications using the Looker API. See this note on [Securing your SDK Credentials](/README.md#securing-your-sdk-credentials) for warnings about using `.ini` files that contain your API credentials in a source code repository or production environment.

Create a `looker.ini` file with your server URL and API credentials assigned as shown in this example.

```ini
[Looker]
# Base URL for API. Do not include /api/* in the url
base_url=https://<your-looker-server>:19999
# API 3 client id
client_id=your_API3_client_id
# API 3 client secret
client_secret=your_API3_client_secret
```

**Note**: If the application using the Looker SDK is going to be committed to a version control system, be sure to
**ignore** the `looker.ini` file so the API credentials aren't unintentionally published.

### Install the Looker SDK for Kotlin

This Experimental version of the Looker SDK is not published to a Kotlin Package Manager. Currently, the only way to get the source code is by cloning the Looker SDK Codegen repository and use the source code in the `kotlin` folder.

To ensure you have the version of the SDK that matches your Looker version, you can regenerate `methods.kt` and `models.kt` from the root of the repository with the command:

```bash
yarn gen kotlin
```

If this command fails the first time, read the [instructions for setting up `yarn`](/README.md#generating-an-api-language-binding)

### Use the SDK in your code

API 4.0 should be used for all strongly-typed languages like Kotlin. (API 4.0 was explicitly created to support languages like Swift and Kotlin.)

When the SDK is installed and the server location and API credentials are configured in your `looker.ini` file, it's ready to be used. (There are [other ways](#environment-variable-configuration) of providing API credentials to the Kotlin SDK. Using an `.ini` file is a convenient option for development.)

Verify authentication works and that API calls will succeed with code similar to the following:

```kotlin
import com.looker.sdk.ApiSettings
import com.looker.rtl.AuthSession
import com.looker.sdk.LookerSDK

val localIni = "./looker.ini"
val settings = ApiSettings.fromIniFile(localIni, "Looker")
val session = AuthSession(settings)
val sdk = LookerSDK(session)
// Verify minimal SDK call works
val me = sdk.ok<User>(sdk.me())

/// continue making SDK calls
val users = sdk.ok<Array<User>>(sdk.all_users())
```

### Capturing API Error responses

Detailed error responses from the Looker API can be captured using the `parseSDKError()` function. The following test shows how all error information from an API response can be captured:

```kotlin
@Test
fun testErrorReporting() {
    try {
        val props = ThemeSettings(
            background_color = "invalid"
        )
        val theme = WriteTheme(
            name = "'bogus!",
            settings = props
        )
        val actual = sdk.ok<Theme>(sdk.validate_theme(theme))
        assertNull(actual) // test should never get here
    } catch (e: java.lang.Error) {
        val error = parseSDKError(e.toString())
        assertTrue(error.message.isNotEmpty())
        assertTrue(error.errors.size == 2)
        assertTrue(error.documentationUrl.isNotEmpty())
    }
}
```

### More examples

Additional Kotlin SDK usage examples may be found in the [Kotlin Examples folder](/examples/kotlin)

## Using AuthSession for automatic authentication

Almost all requests to Looker's API require an access token. This token is established when the `login` endpoint is called with correct API3 credentials for `client_id` and `client_secret`. When `login` is successful, the user whose API3 credentials are provided is considered the active user. For this discussion of `AuthSession`, we'll
call this user the **API User**.

The `settings` provided to the `AuthSession` class include the base URL for the Looker instance, and the API3 credentials. When API requests are made, if the auth session is not yet established, `AuthSession` will automatically authenticate the **API User**. The `AuthSession` also directly support logging in as another user, usually called `sudo as` another user in the Looker browser application.

API users with appropriate permissions can `sudo` as another user by specifying a specific user ID in the `AuthSession.login()` method. Only one user can be impersonated at a time via `AuthSession`. When a `sudo` session is active, all SDK methods will be processed as that user.

## Environment variable configuration

[Environment variables](/README.md#environment-variable-configuration) can be used to configure access for the Looker SDK.

## A note about security

Any script or configuration file used to provide credentials to your Looker SDK instance [needs to be secured](/README.md#securing-your-sdk-credentials).
