# Looker SDK

The Looker SDK for Kotlin provides a convenient way to communicate with the Looker API available on your Looker server.

**DISCLAIMER**: This is an _experimental_ version of the Kotlin SDK for Looker, using a completely new code generator developed by Looker. Implementations are still subject to major change. If you run into problems with the SDK, feel free to [report an issue](https://github.com/looker-open-source/sdk-codegen/issues), and please indicate which language SDK you're using in the report.

## Getting started

The Looker SDK can be used in a Kotlin application in 3 steps:

* configure
* install
* use

### Configure the SDK for your Looker server

**Note**: The `.ini` configuration for the Looker SDK is a sample implementation intended to speed up the initial development of Node applications using the Looker API. See this note on [Securing your SDK Credentials](https://github.com/looker-open-source/sdk-codegen/blob/master/README.md#securing-your-sdk-credentials) for warnings about using `.ini` files that contain your API credentials in a source code repository or production environment.

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
yarn sdk kotlin
```

If this command fails the first time, read the [instructions for setting up `yarn`](https://github.com/looker-open-source/sdk-codegen/blob/master/README.md#using-the-yarnnode-based-generator)

### Use the SDK in your code

Looker 7.2 introduces an experimental API 4.0 that should be used for strongly-typed languages like Kotlin. (In fact, 4.0 was explicitly created to support languages like Swift and Kotlin.)

**NOTE**: For the Kotlin SDK, to correctly deserialize the JSON payloads from the Looker API, you **must** use the 4.0 client `Looker40SDK`, not `Looker31SDK`.

When the SDK is installed and the server location and API credentials are configured in your `looker.ini` file, it's ready to be used.

Verify authentication works and that API calls will succeed with code similar to the following:

```kotlin
val localIni = "./looker.ini"
val settings = ApiSettingsIniFile(localIni, "Looker")
val session = UserSession(settings, Transport(settings))
val sdk = Looker40SDK(session)
// Verify minimal SDK call works
val me = sdk.ok<User>(sdk.me())

/// continue making SDK calls
val users = sdk.ok<Array<User>>(sdk.all_users())
```

### More examples

Additional Kotlin SDK usage examples may be found in the [SDK Examples repository](https://github.com/looker-open-source/sdk-examples/tree/master/kotlin)

## Using AuthSession for automatic authentication

Almost all requests to Looker's API require an access token. This token is established when the `login` endpoint is called with correct API3 credentials for `client_id` and `client_secret`. When `login` is successful, the user whose API3 credentials are provided is considered the active user. For this discussion of `AuthSession`, we'll
call this user the **API User**.

The `settings` provided to the `AuthSession` class include the base URL for the Looker instance, and the API3 credentials. When API requests are made, if the auth session is not yet established, `AuthSession` will automatically authenticate the **API User**. The `AuthSession` also directly support logging in as another user, usually called `sudo as` another user in the Looker browser application.

API users with appropriate permissions can `sudo` as another user by specifying a specific user ID in the `AuthSession.login()` method. Only one user can be impersonated at a time via `AuthSession`. When a `sudo` session is active, all SDK methods will be processed as that user.

## Environment variable configuration

[Environment variables](https://github.com/looker-open-source/sdk-codegen#environment-variable-configuration) can be used to configure access for the Looker SDK.

## A note about security

Any script or configuration file used to provide credentials to your Looker SDK instance [needs to be secured](https://github.com/looker-open-source/sdk-codegen#securing-your-sdk-credentials).
