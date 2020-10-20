# Looker GSheets as data tables API

This package contains routines for treating a GSheet (Google Sheet) as a database where each sheet (tab) is a data table. 

## WhollySheet

We call the base component for data table-like operations on GSheet tabs [**WhollySheet**](src/WhollySheet.ts).

The original version of this implementation is the Python [sheets.py](/examples/python/hackathon_app/sheets.py) created for the initial Looker Hackathon registration application.

WhollySheet was ported to Typescript for the new Looker-based [Hackathon application](/packages/hackathon) using the [Looker Extension Framework](https://docs.looker.com/data-modeling/extension-framework/extension-framework-intro).

## Sheet SDK

The [Sheet SDK](src/SheetSDK.ts) implements the REST requests for managing a GSheet. The Google GSheets API can't be used in a Looker extension.

We're only using the GSheet to process "raw" values with no advanced sheet features, so creating our own wrapper for the calls we needed was very feasible.

There should be some more calls added in the future for creating sheets from scratch, and batch updating a sheet for better performance.

## Typescript Google Sheets API

Because these Google sheet services need to work inside Looker extensions, the Google API for Javascript can't be used. 

Instead, [`SheetSDK.ts`](src/SheetSDK.ts) uses the Google Sheets API [RESTful endpoints](https://developers.google.com/sheets/api/reference/rest). 

### Sheet tabs as data tables 

[`WhollySheet.ts`](src/WhollySheet.ts) is the abstraction that supports strongly-typed data tables on top of the `SheetSDK`.

See [`WhollySheet.spec.ts](src/WhollySheet.spec.ts) for usage patterns.

## Getting your GSheet credentials

1. Go to [IAM Admin](https://console.cloud.google.com/projectselector2/iam-admin/serviceaccounts?supportedpurview=project) and create or find your service account
1. Open your personal [Gsheets site](https://sheets.google.com) and find your "Hackathons DB - Local" sheet
1. Click `share` and see the service account email granted access to the sheet
1. Go to https://console.cloud.google.com/
1. Choose the appropriate project from the dropdown at top
1. Click the upper left hamburger menu | Service Accounts
1. Select the account from step 1
1. Create a new key per https://cloud.google.com/iam/docs/creating-managing-service-account-keys
1. Save the downloaded credentials to `packages/wholly-sheet/src/google-creds.json` (which is git ignored so you won't save it to this repository)
1. Add the id (from the sheet url) of your sheet to `google-creds.json`:

```json
  "sheet_id": "the id (from url) of your sheet"
```

### Old setup notes
To obtain one, [click here](https://developers.google.com/sheets/api/quickstart/js) and follow the instructions in step 1. 

