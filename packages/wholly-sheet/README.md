# Looker GSheets as data tables API

This package contains routines for treating a GSheet (Google Sheet) as a database where each sheet (tab) is a data table.

## WhollySheet

[**WhollySheet**](src/WhollySheet.ts) is the base component for data table-like operations on GSheet tabs.

The original version of WhollySheet is the Python [sheets.py](/examples/python/hackathon_app/sheets.py) created for the initial Looker Hackathon registration application in 2019.

WhollySheet was ported to Typescript for the new Looker-based [Hackathon application](/packages/hackathon) using the [Looker Extension Framework](https://docs.looker.com/data-modeling/extension-framework/extension-framework-intro).

## SheetSDK

The Google API for Javascript can't be used inside the Looker extension framework.

Instead, [`SheetSDK.ts`](src/SheetSDK.ts) uses the Google Sheets API [RESTful endpoints](https://developers.google.com/sheets/api/reference/rest).

We're only using the GSheet to process "raw" values with none of the advanced GSheets features, so creating our own wrapper for the calls we needed was very feasible.

There should be some more calls added in the future for getting the list of sheets a service account can access, and creating new sheets and tabs.

## Sheet tabs as data tables

[`WhollySheet.ts`](src/WhollySheet.ts) supports strongly-typed rows of data that consume and update the raw value arrays used in the `SheetSDK`.

A single GSheet document, including multiple tabs, is the "database."

A single named Sheet (what we often call a "tab" or "sheet tab" for clarity) is a "data table." The name of the tab is the name of the table.

A single row is a data row of the data table.

The first row of the tab is the header row, and must contain at least the **id** and **updated** column. We have adopted naming conventions to simplify marshalling typed row properties into the sheet.

A WhollySheet manages a list of [`RowModel`](src/RowModel.ts) descendant objects, supporting features like:

- loading a sheet into typed rows
- indexing the rows by id
- find by constraint, row, or indexed id lookup
- row operations:
  - creating
  - deleting (by default checks if the local copy of the row is outdated before saving)
  - updating (by default checks if the local copy of the row is outdated before saving)
  - batch mode supporting multiple create, delete, and update requests. For best performance, this should be the default mode for modifying sheets

See [`WhollySheet.spec.ts`](src/WhollySheet.spec.ts) and [`RowModel.spec.ts`](src/RowModel.spec.ts) for usage patterns expressed in the tests.

### Naming conventions

Rules for property names in a typed row

- any property name beginning with an underscore (`_`) is considered an _internal_ property and is considered hidden, but still a data-bound value that is written to the GSheet. It will be included in the `header` collection used for reading and storing values in the sheet in the proper order.
- any property name beginning with a dollar sign (`$`) is considered a "calculated" property that is never persisted to a sheet. It is also considered hidden. It will not be included in the `header` or `displayHeader` collection.
- any property name that does not start with an underscore or a dollar sign a visible data column. It is included in the `displayHeader` collection that can be used for building a UI, and the `header` collection for data binding.

### Special property names

| Property  | Type    | Description                                                                                                                                                          |
| --------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| \_row     | integer | internal-only property used to address the corresponding row in the sheet. Not a column in the database.                                                             |
| \_id      | string  | UUID or other unique id for this row. Recommended to be the first column in the tab's row.                                                                           |
| \_updated | date    | datetime stamp of the last time this sheet was updated. Automatically updated in the row's `prepare()` method. Recommended to be the second column in the tab's row. |

### Type handling

Because we are creating a greatly simplified "relational database" with no true primary keys, no foreign keys, constraints, referential integrity, etc. there are many things that are not automatically supported, and type support is limited.

WhollySheet supports the following raw value conversions. No raw values should have any quotes:

| Data type | Sample raw value in tab    | Property default | Description                                                                                                                                        |
| --------- | -------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| string    | `mystring`                 | empty string     | A standard string value without quotes                                                                                                             |
| integer   | `123`                      | `0`              | if the number has no decimal, it will be parsed as integer                                                                                         |
| float     | `1.23`                     | `0`              | if the number has a decimal, it will be parsed as float                                                                                            |
| boolean   | `TRUE`                     | `false`          | If it matches a standard set of "true" values, it will be true. Otherwise it will be false.                                                        |
| Date      | `2020-10-15T00:00:00.005Z` | `noDate`         | Zulu-time date string. If it can be parsed to a Datetime, the value will be a Javascript `Date` value                                              |
| string[]  | `a,b`                      | `[]`             | Comma-delimited string converted to `string[]`. If the cell is empty, it's an empty array. Otherwise, there will be at least one item in the array |

When converting from typed properties to a raw value array, `undefined`, `null`, and `noDate` will be set to `nilCell` (ASCII character zero), our convention for indicating that cell has no data.

## Getting your GSheet credentials

1. Go to [IAM Admin](https://console.cloud.google.com/projectselector2/iam-admin/serviceaccounts?supportedpurview=project) and create or find your service account
1. Open your personal [Gsheets site](https://sheets.google.com) and find your "Hackathons DB - Local" sheet
1. Click `share` and see the service account email granted access to the sheet
1. Go to https://console.cloud.google.com/
1. Choose the appropriate project from the dropdown at top
1. Click the upper left hamburger menu | Service Accounts
1. Select the account from step 1
1. Create a new key per https://cloud.google.com/iam/docs/creating-managing-service-account-keys
1. Save the downloaded credentials to `packages/wholly-sheet/src/google-creds.json` (which is git-ignored so you won't accidentally commit it to this repository)
1. Add the id (from the sheet url) of your sheet to `google-creds.json`:

```json
  "sheet_id": "the id (from url) of your sheet"
```

### Old setup notes

To obtain one, [click here](https://developers.google.com/sheets/api/quickstart/js) and follow the instructions in step 1.
