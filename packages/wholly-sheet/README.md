# Looker GSheets as data tables API

This package contains routines for treating a GSheet (Google Sheet) as a database where each sheet (tab) is a data table. 

## WhollySheet
We call the base component that supports data-table like operations on GSheet tabs [**WhollySheet**](src/WhollySheet.ts).

The original version of this implementation is the Python [sheets.py](/examples/python/hackathon_app/sheets.py) created for the initial Looker Hackathon registration application.

Porting WhollySheet to Typescript was required for the new Looker [Hackathon application](/packages/hackathon) extension.

## Sheet SDK

The [Sheet SDK](src/SheetSDK.ts) implements the REST requests for managing a GSheet. We couldn't use the Google-provided API because it would not be available inside a Looker extension.

## Typescript Google Sheets API

Because these Google sheet services need to work inside Looker extensions, the Google API for Javascript can't be used. 

Instead, [`SheetSDK.ts`](src/SheetSDK.ts) uses the Google Sheets API [RESTful endpoints](https://developers.google.com/sheets/api/reference/rest). 

### Sheet tabs as data tables 

[`WhollySheet.ts`](src/WhollySheet.ts) is the abstraction that supports strongly-typed data tables on top of the `SheetSDK`.

See [`WhollySheet.spec.ts](src/WhollySheet.spec.ts) for usage patterns.

## Getting your GSheet credentials

1. Go to [IAM Admin](https://console.cloud.google.com/projectselector2/iam-admin/serviceaccounts?supportedpurview=project) and create or find your service account
1. Open your personal [Gsheets site](https://sheets.google.com) and find your "Hackathons DB - Local" sheet
1. Click `share` and see what service account email you shared it with
1. Go to https://console.cloud.google.com/
1. Choose the appropriate project from the dropdown at top
1. Click the upper left hamburger menu | Service Accounts
1. Select the account from step 1
1. Create a new key per https://cloud.google.com/iam/docs/creating-managing-service-account-keys
1. Save the downloaded credentials to `packages/wholly-sheet/src/google-creds.json` which is git ignored so you won't save it to this repository
1. Add the id (from url) of your sheet to `google-creds.json`

```json
  "sheet_id": "the id (from url) of your sheet"
```

### Old setup notes
To obtain one, [click here](https://developers.google.com/sheets/api/quickstart/js) and follow the instructions in step 1. 

