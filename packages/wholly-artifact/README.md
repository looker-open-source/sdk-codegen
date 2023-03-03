# Looker Artifact API SDK

This package combines the design of [wholly-sheet](../wholly-sheet) with the Looker Artifact API to replace the GSheets "data table" implementation of WhollySheet with the key/value store of the Looker Artifact API.

This package for using the artifact API to create dynamic tables is classified as `alpha` or `experimental` and subject to drastic change or removal at any time.

Currently, the Looker Artifact API is reserved for Looker's own extensions and is not available for other uses. The artifact endpoints in the Looker API are also marked as `alpha`.

## Design

This SDK supports CRUDS (Create, Read, Update, Delete, Search) operations for typed object collection to be managed by the Artifact API, replacing the GSheets-based persistence layer in WhollySheet.