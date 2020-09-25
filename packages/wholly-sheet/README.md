# Looker GSheets API extentions

This package contains routines for treating a GSheet as a database where each sheet (tab) is a data table.

This is based on the Python [sheets.py](/examples/python/hackathon_app/sheets.py) created for the initial Looker Hackathon registration application.

## Typescript Google Sheets API setup

Because these Google sheet services need to work **both** for Looker extensions and plain old files, the Google API for Javascript can't be used. 

Instead, the Google Sheets API [RESTful endpoints](https://developers.google.com/sheets/api/reference/rest) are used for all sheet operations.
 
For RESTful calls, the GSheets API requires a client id and an API key to access the Google sheets API. 
To obtain one, [click here](https://developers.google.com/sheets/api/quickstart/js) and follow the instructions in step 1. 

The following values need to be setup in the `.env` file. These values can be found in the [google developer console](https://console.developers.google.com/).

```ini
GOOGLE_CLIENT_ID=Application OAUTH2 client ID
GOOGLE_API_KEY=Application API key
```

When the user uses the Google OAUTH2 authorization mechanism the client id is used. The extension accesses the sheets API directly. Note that the OAUTH2 implicit flow is used to authorize with Google.
When the user uses the other authorization mechanisms, the extension access the sheets API using the serverProxy call. The data server uses the API key to access the sheets API. This way the API key is NOT exposed in the extension code.

## Getting your GSheet credentials

1. Open your personal https://sheets.google.com account and find your "Hackathons DB - Local" sheet
1. Click `share` and see what service account email you shared it with
1. Go to https://console.cloud.google.com/
1. Choose the appropriate project from the dropdown at top
1. Click the upper left hamburger menu | Service Accounts
1. Select the account from step 1
1. Create a new key per https://cloud.google.com/iam/docs/creating-managing-service-account-keys (`credentials.json` can only be downloaded upon creation, not for existing keys)
1. Follow the instructions in [env.list.sample](/examples/python/hackathon_app/env.list.sample) to convert that to a base64 string to add to set `GOOGLE_APPLICATION_CREDENTIAL_ENCODED`
