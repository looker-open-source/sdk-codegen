# Looker GSheets API extentions

This package contains routines for treating a GSheet as a database where each sheet (tab) is a data table.

This is based on the Python [sheets.py](/examples/python/hackathon_app/sheets.py) created for the initial Looker Hackathon registration application.

## Getting your GSheet credentials

1. Open your personal https://sheets.google.com account and find your "Hackathons DB - Local" sheet
1. Click `share` and see what service account email you shared it with
1. Go to https://console.cloud.google.com/
1. Choose the appropriate project from the dropdown at top
1. Click the upper left hamburger menu | Service Accounts
1. Select the account from step 1
1. Create a new key per https://cloud.google.com/iam/docs/creating-managing-service-account-keys (`credentials.json` can only be downloaded upon creation, not for existing keys)
1. Follow the instructions in [env.list.sample](/examples/python/hackathon_app/env.list.sample) to convert that to a base64 string to add to set `GOOGLE_APPLICATION_CREDENTIAL_ENCODED`
