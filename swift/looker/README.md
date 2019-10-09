# Looker SDK

The Looker SDK for Swift provides a convenient way to communicate with the Looker API available on your Looker server. The SDK is written in Swift and uses `URLSession` for HTTP request processing.

**DISCLAIMER**: This is a _beta_ version of the Looker SDK, using a completely new code generator developed by Looker. Implementations are still subject to change, but we expect most SDK method calls to work correctly. If you run into problems with the SDK, please feel free to [report an issue](https://github.com/looker-open-source/sdk-codegen/issues), and please indicate which language SDK you're using in the report.

## Getting started

The Looker SDK can be used in a Swift application in 3 steps:

* install
* configure
* use

### Install the Looker SDK into your node application


### Configure the SDK for your Looker server

**Note**: The `.ini` configuration for the Looker SDK is a sample implementation intended to speed up the initial development of Node applications using the Looker API. See the [Securing your SDK Credentials](#securing-your-sdk-credentials) section below for warnings about using `.ini` files that contain your API credentials in a source code repository or production environment.

Create a `looker.ini` file with your server URL and API credentials assigned as shown in this example.

```ini
[Looker]
# API version is required. 3.1 and 3.0 are currently supported. 3.1 is highly recommended.
api_version=3.1
# Base URL for API. Do not include /api/* in the url
base_url=https://<your-looker-server>:19999
# API 3 client id
client_id=your_API3_client_id
# API 3 client secret
client_secret=your_API3_client_secret
```

**Note**: If the application using the Looker SDK is going to be committed to a version control system, be sure to
**ignore** the `looker.ini` file so the API credentials aren't unintentionally published.

### Use the SDK in your code

When the SDK is installed and the server location and API credentials are configured in your `looker.ini` file, it's ready to be used.

Verify authentication works and that API calls will succeed with code similar to the following:

```swift
```

## Using AuthSession for automatic authentication

**NOTE**: As we secure the design of the Looker SDK's authentication practices, the authentication behavior described in this section will likely change.

Almost all requests to Looker's API require an access token. This token is established when the `login` endpoint is called with correct API3 credentials for `client_id` and `client_secret`. When `login` is successful, the user whose API3 credentials are provided is considered the active user. For this discussion of `AuthSession`, we'll
call this user the **API User**.

The `settings` provided to the `AuthSession` class include the base URL for the Looker instance, and the API3 credentials. When API requests are made, if the auth session is not yet established, `AuthSession` will automatically authenticate the **API User**. The `AuthSession` also directly support logging in as another user, usually called `sudo as` another user in the Looker browser application.

API users with appropriate permissions can `sudo` as another user by specifying a specific user ID in the `AuthSession.login()` method. Only one user can be impersonated at a time via `AuthSession`. When a `sudo` session is active, all SDK methods will be processed as that user.

### Sudo behavior with AuthSession

The rest of this section shows sample code for typical use cases for authentication and sudo. This code sample is extracted directly from the sdk methods Jest tests, and assumes `apiUser` is the default authenticated user record with `sudo` abilities, and `sudoA` and `sudoB` are other enabled Looker user records.

## Classes vs. Structs

Both the [Swift documentation](https://developer.apple.com/documentation/swift/choosing_between_structures_and_classes) and LearnAppMaking has an excellent [overview of Swift classes vs. structs](https://learnappmaking.com/struct-vs-class-swift-how-to/) explain the choices between structs and classes in Swift.

The SDK generator uses both classes and structs. Classes are used where required in the SDK where class-specific features for:

* inheritance
* destructors (aka `deinit`)
* identity comparisons

Otherwise, structs or interfaces are used for the declaration of complex method inputs such as `body` parameters.
