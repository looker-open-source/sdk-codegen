# Run a Looker query and write the result to a BigQuery table using Cloud Function

This repository contains a [Google Cloud Function](https://cloud.google.com/functions) that leverages Looker Python SDK and the Python client for BigQuery to get the result of a query in Looker and load the result to a BigQuery table.

A potential use case is to get data from Looker's System Activity and write to BigQuery (currently, Looker's System Activity stores a maximum of 100k rows, or 90 days of historical query and event data). These BigQuery tables can then be registered as a connection in Looker for additional LookML data modeling. For more flexibility on System Activity, consider using [Elite System Activity](https://docs.looker.com/admin-options/system-activity/elite-system-activity).

Cloud Function is easy to set up and suitable for light-weighted, on-the-fly tasks. For heavy ETL/ELT workloads, consider using Looker's native actions (sending to Google Cloud Storage) or ETL/ELT tools (such as GCP's Dataflow).

## Demo

<p align="center">
  <img src="https://storage.googleapis.com/tutorials-img/Cloud%20Function%20Write%20to%20BQ%20from%20Looker.gif" alt="Setting environmental variables in Cloud Function UI">
</p>
