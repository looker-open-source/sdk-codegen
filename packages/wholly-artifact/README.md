# Looker Artifact API SDK

This package combines the design of [wholly-sheet](../wholly-sheet) with the Looker Artifact API to replace the GSheets "data table" implementation of WhollySheet with the key/value store of the Looker Artifact API.

At this time, the Looker Artifact API is reserved for Looker's own extensions and is not available for other uses. The artifact endpoints in the API are marked as `alpha`.

## Design

This SDK supports CRUDS (Create, Read, Update, Delete, Search) operations for typed objects to be managed by the Artifact API, replacing the GSheets-based persistence layer in WhollySheet.