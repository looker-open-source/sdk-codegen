# Looker GSheets API extentions

This package contains routines for treating a GSheet as a database where each sheet (tab) is a data table.

This is based on the Python [sheets.py](/examples/python/hackathon_app/sheets.py) created for the initial Looker Hackathon registration application.

## Typescript Google Sheets API

Because these Google sheet services need to work **both** for Looker extensions, the Google API for Javascript can't be used. 

Instead, the Google Sheets API [RESTful endpoints](https://developers.google.com/sheets/api/reference/rest) is used for all sheet operations. 

For RESTful calls, the GSheets API requires an API key to access the Google sheets API. 

### Restful SheetSDK implementation

This can be found in the [`SheetSDK.ts](src/SheetSDK.ts) file.

### Sheet tabs as data tables 

[`WhollySheet.ts`](src/WhollySheet.ts) is the abstraction that supports strongly-typed data tables on top of the `SheetSDK`.

See [`WhollySheet.spec.ts](src/WhollySheet.spec.ts) for usage patterns.


### Configuration

The following values need to be defined in the `/packages/wholly-sheet-/src/google-creds.json` file.

```json
{
  "api_key": "your api key",
  "sheet_id": "the id (from url) of your sheet"
}
```

- `api_key` can be found or created in the [google developer console](https://console.developers.google.com/).
- `sheet_id` **IMPORTANT** because we're using just the API key for REST calls, the sheet must be shared with the permission for anyone with the link to edit it.

### Old setup notes
To obtain one, [click here](https://developers.google.com/sheets/api/quickstart/js) and follow the instructions in step 1. 

#### Getting your GSheet credentials

1. Open your personal https://sheets.google.com account and find your "Hackathons DB - Local" sheet
1. Click `share` and see what service account email you shared it with
1. Go to https://console.cloud.google.com/
1. Choose the appropriate project from the dropdown at top
1. Click the upper left hamburger menu | Service Accounts
1. Select the account from step 1
1. Create a new key per https://cloud.google.com/iam/docs/creating-managing-service-account-keys (`credentials.json` can only be downloaded upon creation, not for existing keys)
1. Follow the instructions in [env.list.sample](/examples/python/hackathon_app/env.list.sample) to convert that to a base64 string to add to set `GOOGLE_APPLICATION_CREDENTIAL_ENCODED`
