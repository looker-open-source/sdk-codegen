# Example Looker SDK Java Project using Maven

This is a sample Java project demonstrating the use of Java with the Kotlin
Looker SDK. This particular project uses Maven for building and running a very
simple Java class.

# Prerequisites

## Looker client id and secret

See [Looker documentation](https://docs.looker.com/reference/api-and-integration/api-auth#authentication_with_an_sdk)
on how to create these.

## Kotlin Looker SDK Jar

Currently Looker does not publish the Kotlin Looker SDK jar so you need to do
the following steps and copy the resultant jar into the `lib` folder of this project. Build
the Kotlin Looker SDK jar as follows

1. clone this repo.
2. `cd {repolocation}/kotlin`
3. `./gradlew jar`
4. copy `./build/libs/looker-kotlin-sdk.jar` to the `lib` directory of this
   project.

# Run

Once the `looker-kotlin-sdk.jar` has been copied into this project, you can run
the example class.

1. cd to the root of this example project.
2. Create a `.env` in the root of this project. A sample .env_sample file is
   provided. You will need to populate the .env file with the Looker client id and
   secret obtained earlier.
3. `./mvnw compile`
4. `./mvnw exec:java`

The run should print out:

`User name is {user name associated with Looker client id}`

## Configuration

Note the example uses a `.env` file to configure the SDK. The example class
copies these values into java system properties. The Looker INI file is also
supported but an example is not provided. Please see the SDK Kotlin tests for
examples of using the Looker INI.
