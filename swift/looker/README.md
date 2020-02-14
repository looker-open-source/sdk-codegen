# Looker SDK

The Looker SDK for Swift provides a convenient way to communicate with the Looker API available on your Looker server. The SDK is written in Swift and uses `URLSession` for HTTP request processing.

**DISCLAIMER**: This is an _alpha_ version of the Looker SDK, using a completely new code generator developed by Looker. Implementations are still subject to major change. If you run into problems with the SDK, feel free to [report an issue](https://github.com/looker-open-source/sdk-codegen/issues), and please indicate which language SDK you're using in the report.

## Getting started

The Looker SDK can be used in a Swift application in 3 steps:

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

### Install the Looker SDK for Swift

The alpha version of the Looker SDK is not published to the Swift Package Manager. Currently, the only way to get the source code is by cloning the Looker SDK Codegen repository and use the source code in the `swift` folder.

To ensure you have the version of the SDK that matches your Looker version, you can regenerate `methods.swift` and `models.swift` from the root of the repository with the command:

```bash
yarn sdk swift
```

If this command fails the first time, read the [instructions for setting up `yarn`](https://github.com/looker-open-source/sdk-codegen/blob/master/README.md#using-the-yarnnode-based-generator)

### Use the SDK in your code

When the SDK is installed and the server location and API credentials are configured in your `looker.ini` file, it's ready to be used.

Verify authentication works and that API calls will succeed with code similar to the following:

```swift
import looker

/// read the Looker configuration file
let config = try? ApiConfig("looker.ini")

/// unwrap optional config results
let settings = config!

/// Use the standard transport based on URLSession
let xp = BaseTransport(settings)

/// Use the authentication session manager to automatically handle session expiration
/// See the section below for more on `AuthSession`
let auth = AuthSession(settings, xp)

/// Create you Looker SDK instance
let sdk = LookerSDK(auth)

/// Retrieve the API user record. If this fails, your Looker server or credentials are bad
let me = sdk.ok(sdk.me())

/// continue making SDK calls
```

### More examples

Additional Swift SDK usage examples may be found in the [SDK Examples repository](https://github.com/looker-open-source/sdk-examples/tree/master/swift).

## Using AuthSession for automatic authentication

**NOTE**: As we secure the design of the Looker SDK's authentication practices, the authentication behavior described in this section will likely change.

Almost all requests to Looker's API require an access token. This token is established when the `login` endpoint is called with correct API3 credentials for `client_id` and `client_secret`. When `login` is successful, the user whose API3 credentials are provided is considered the active user. For this discussion of `AuthSession`, we'll
call this user the **API User**.

The `settings` provided to the `AuthSession` class include the base URL for the Looker instance, and the API3 credentials. When API requests are made, if the auth session is not yet established, `AuthSession` will automatically authenticate the **API User**. The `AuthSession` also directly support logging in as another user, usually called `sudo as` another user in the Looker browser application.

API users with appropriate permissions can `sudo` as another user by specifying a specific user ID in the `AuthSession.login()` method. Only one user can be impersonated at a time via `AuthSession`. When a `sudo` session is active, all SDK methods will be processed as that user.

## Environment variable configuration

[Environment variables](https://github.com/looker-open-source/sdk-codegen#environment-variable-configuration) can be used to configure access for the Looker SDK.

## A note about security

Any script or configuration file used to provide credentials to your Looker SDK instance [needs to be secured](https://github.com/looker-open-source/sdk-codegen#securing-your-sdk-credentials).

## Classes vs. Structs

Both the [Swift documentation](https://developer.apple.com/documentation/swift/choosing_between_structures_and_classes) and LearnAppMaking has an  [overview of Swift classes vs. structs](https://learnappmaking.com/struct-vs-class-swift-how-to/) explain the choices between structs and classes in Swift.

The SDK generator uses both classes and structs. Classes are used where required in the SDK where class-specific features for:

* inheritance
* destructors (aka `deinit`)
* identity comparisons

Otherwise, `struct`s, `enum`s, or `protocol`s are used for the declaration of complex method inputs, such as `body` parameters and the complex API structures returned from API endpoints.

Enjoy, and thanks for trying out the bleeding edge!

## Use of AnyCodable

There's a decent JSON encode/decode solution from [AnyCodable](https://github.com/Flight-School/AnyCodable) directly imported into this project because I haven't yet been able to figure out how to get the package reference to work. My apologies for that. I'll fix it when I figure out how to use Swift packages better!
