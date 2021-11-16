# Cloud Function Example: Run a Looker query, and write the result to a BigQuery table

This repository contains a [Google Cloud Function](https://cloud.google.com/functions) that leverages Looker Python SDK and the Python client for BigQuery to get the result of a query in Looker and load the result to a BigQuery table.

This script is suitable for light-weighted workloads, such as running one single query to Looker's System Activity and writing the result to BigQuery (currently, System Activity only supports running one query at a time). The table can then be registered as a connection in Looker for additional LookML data modeling logic.

## Consideration
- Consider using Elite System Activity for more flexibility on System Activity.
- Consider using Looker's native actions, designing a custom server, or using an external tool for ELT/ETL workload for heavy workloads. An example would be sending a query as a schedule to a Google Cloud Storage bucket (or an Amazon S3 bucket), then writing the data to a supported database.

# Demo

(coming soon)

# Technical Implementation

One technical challenge is to align the formatting of Looker's column value and BigQuery's accepted format for schema's field names. Column values in JSON from Looker includes a dot (".") (i.e.`user.name`), and column values in CSV includes white space (i.e. `User Name`). In contrast, BigQuery does not accept neither dots (".") or spaces (" ") as fields' name.

The script transforms the column value ("User Name" to "User_Name"), writes the modified header and data to a CSV file stored in a temporary disk in Cloud Functions, and then loads the CSV file to a BigQuery table. Another approach is to transform each key-value directly inside the response (i.e., change `user.name` to `user_name`).
