# Looker API for Dart SDK

A dart implementation of the Looker API. Note that only the SDK for Looker 4.0 API is generated.

## Usage

See examples and tests.

Create a `.env` file in the same directory as this `README.md`. The format is as follows:

```
URL=looker_instance_api_endpoint
CLIENT_ID=client_id_from_looker_instance
CLIENT_SECRET=client_secret_from_looker_instance
```

## Add to project

Add following to project `pubspec.yaml` dependencies. Replace `{SHA}` with the sha of the version of the SDK you want to use (a more permanent solution may be added in the future).

```
  looker_sdk:
    git:
      url: https://github.com/looker-open-source/sdk-codegen
      ref: {SHA}
      path: dart/looker_sdk
```

## Developing

Relies on `yarn` and `dart` being installed. This was developed with `dart` version `2.15.1` so the recommendation is to have a version of dart that is at least at that version.

### Generate

Run `yarn sdk Gen` from the `{reporoot}`. Note that the SDK generator needs to be built using `yarn build`. If changing the generator run 'yarn watch` in a separate window. This command generates two files:

1. `{reporoot}/dart/looker_sdk/lib/src/sdk/methods.dart`
2. `{reporoot}/dart/looker_sdk/lib/src/sdk/models.dart`

The files are automatically formatted using `dart` tooling. Ensure that the `dart` binary is available on your path.

### Run example

Run `yarn example` from `{reporoot}/dart/looker_sdk`

### Run tests

Run `yarn test:e2e` from `{reporoot}/dart/looker_sdk` to run end to end tests. Note that these tests require that a `.env` file has been created (see above) and that the Looker instance is running.

Run `yarn test:unit` from `{reporoot}/dart/looker_sdk` to run unit tests. These tests do not require a Looker instance to be running.

Run `yarn test` from `{reporoot}/dart/looker_sdk` to run all tests.

### Run format

Run `yarn format` from `{reporoot}/dart/looker_sdk` to format the `dart` files correctly. This should be run if you change any of the run time library `dart` files. The repo CI will run the `format-check` and will fail if the files have not been correctly formatted.

### Run format-check

Run `yarn format-check` from `{reporoot}/dart/looker_sdk` to verify the formatting of the `dart` files. This is primarily for CI. It's the same as `yarn format` but does not format the files.

### Run analyze

Run `yarn format-analyze` from `{reporoot}/dart/looker_sdk` to lint the `dart` files. This should be run prior to commiting as CI will this task and will fail if the script fails.

## TODOs

1. Make enum mappers private to package. They are currently public as some enums are not used by by the models and a warning for unused class is displayed by visual code. It could also be a bug in either the generator or the spec generator (why are enums being generated if they are not being used?).
2. Add optional timeout parameter to methods and implement timeout support.
3. Add additional authorization methods to api keys.
4. Revisit auth session. There is some duplication of code in generated methods.
5. Add base class for models. Move common props to base class. Maybe add some utility methods for primitive types. Should reduce size of models.dart file.
6. More and better generator tests. They are a bit hacky at that moment.
7. Generate dart documentation.

## Notes

1. Region folding: Dart does not currently support region folding. visual studio code has a generic extension that supports region folding for dart. [Install](https://marketplace.visualstudio.com/items?itemName=maptz.regionfolder) if you wish the generated regions to be honored.
