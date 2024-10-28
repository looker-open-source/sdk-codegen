# Looker SDK

The Looker SDK for Swift provides a convenient way to communicate with the Looker API available on your Looker server. The SDK is written in Swift and uses `URLSession` for HTTP request processing.

**DISCLAIMER**: This is an _experimental_ version of the Looker SDK. Implementations are still subject to change, but SDK method calls are expected to work correctly. Please [report any issues](https://github.com/looker-open-source/sdk-codegen/issues) encountered, and indicate the SDK language in the report.

## Getting started

The Looker SDK can be used in a Swift application in 3 steps:

- configure
- install
- use

### Configure the SDK for your Looker server

**Note**: The `.ini` configuration for the Looker SDK is a sample implementation intended to speed up the initial development of Node applications using the Looker API. See this note on [Securing your SDK Credentials](https://github.com/looker-open-source/sdk-codegen/blob/main/README.md#securing-your-sdk-credentials) for warnings about using `.ini` files that contain your API credentials in a source code repository or production environment.

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
yarn gen swift
```

If this command fails the first time, read the [instructions for setting up `yarn`](https://github.com/looker-open-source/sdk-codegen/blob/main/README.md#using-the-yarnnode-based-generator)

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

/// Retrieve the API user record. If this return nil, your Looker server or credentials are bad
let me = try? sdk.ok(sdk.me())

/// continue making SDK calls
```

### SDK model type initialization

All SDK model types can be initialized with named parameters. A `public init(...)` is generated for every SDK model type (either a `struct` or a `class`).
If an SDK type has all optional properties, this is the only constructor generated.

For types with any required properties, the code generator also produces a positional constructor.
The `class` type's positional constructor has the syntax `public convenience init(...)`, but `struct` types do not have `convenience` init methods.

This sample code from [modelsTests.swift](Tests/lookerTests/modelsTests.swift) shows both constructor patterns for both a `class` and a `struct`:

```swift
public class ClassInit: SDKModel {
    /// required property
    public var name: String
    /// optional property
    public var id: String?

    // named parameter initializer
    public init(name: String, id: String? = nil) {
        self.name = name
        self.id = id
    }

    /// positional initializer
    public convenience init(_ name: String, id: String? = nil) {
        self.init(name: name, id: id)
    }
}

public struct StructInit: SDKModel {
    /// required property
    public var name: String
    /// optional property
    public var id: String?

    // named parameter initializer
    public init(name: String, id: String? = nil) {
        self.name = name
        self.id = id
    }

    /// positional initializer
    public init(_ name: String, id: String? = nil) {
        self.init(name: name, id: id)
    }
}

func testBothPositionalAndNamed() {
    let name = "one"
    let id = "id"
    var testClass = ClassInit(name, id: id) // positional
    XCTAssertEqual(testClass.name, name)
    XCTAssertEqual(testClass.id, id)
    testClass = ClassInit(name: name, id: id) // named
    XCTAssertEqual(testClass.name, name)
    XCTAssertEqual(testClass.id, id)
    var testStruct = StructInit(name, id: id) // positional
    XCTAssertEqual(testStruct.name, name)
    XCTAssertEqual(testStruct.id, id)
    testStruct = StructInit(name: name, id: id) // named
    XCTAssertEqual(testStruct.name, name)
    XCTAssertEqual(testStruct.id, id)
}
```

### AnyString usage

Some of the API model structures have a private variable of type `AnyString`. This special type was introduced to handle JSON values that can be either string or numeric.

For Looker API 4.0, all entity ID references are being converted to string (some are currently integer) to prepare for potential scalability changes for entity references.

This special `AnyString` wrapper supports an ID being either numeric or string, so it will work for older Looker releases that still have numeric IDs, and will also work for string IDs.

### More examples

Additional Swift SDK usage examples may be found in the [SDK Examples repository](https://github.com/looker-open-source/sdk-examples/tree/main/swift).

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

Both the [Swift documentation](https://developer.apple.com/documentation/swift/choosing_between_structures_and_classes) and LearnAppMaking has an [overview of Swift classes vs. structs](https://learnappmaking.com/struct-vs-class-swift-how-to/) explain the choices between structs and classes in Swift.

The SDK generator uses both classes and structs. Classes are used where required in the SDK where class-specific features for:

- inheritance
- destructors (aka `deinit`)
- identity comparisons

Otherwise, `struct`s, `enum`s, or `protocol`s are used for the declaration of complex method inputs, such as `body` parameters and the complex API structures returned from API endpoints.

Enjoy, and thanks for trying out the bleeding edge!

## Downloading binary responses (images)

In a step toward streaming support, the Swift SDK now has `LookerSDKStream` which is not **truly** a set of streaming functions, but will return binary payloads as a `Data` object for all SDK requests.

The contents of this `Data` object can be used to initialize an image using Swift UI components. The use of `Data` responses was adopted for Swift because conversion of `Data` to a true binary `String` representation is problematic.

The primary SDK methods class `LookerSDK` now has a property called `stream` that is a reference to an initialized `LookerSDKStream` class.

Requests for _image_ types like **PNG** and **JPEG** should use this kind of pattern:

```swift
let xp = BaseTransport(settings)
let auth = AuthSession(settings, xp)
let sdk = LookerSDK(auth)
let body = simpleQuery() // However you want to express your query
let query = try! sdk.ok(sdk.create_query(body))
let png = try! sdk.ok(sdk.stream.run_query(query.id!, "png"))
let jpg = try! sdk.ok(sdk.stream.run_query(query.id!, "jpg"))
```

## Use of AnyCodable

There's a decent JSON encode/decode solution for JSON with ambiguously typed values from [AnyCodable](https://github.com/Flight-School/AnyCodable) directly imported into this project because I haven't yet been able to figure out how to get the package reference to work. My apologies for that. I'll fix it when I figure out how to use Swift packages better!
