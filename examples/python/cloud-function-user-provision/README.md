# Cloud Function Example: User Provisioner

This repository contains a [Google Cloud Function](https://cloud.google.com/functions) that leverages Looker Python SDK. The repository can be used as a starter template to build serverless microservices that interact with Looker through the following workflow:

1. Trigger an HTTP-based Cloud Function
2. Initialize the Looker Python SDK
3. Call Looker SDK methods and build custom logic to manage users, content, queries, etc.

In this repository, the `main.py` file takes an email address as an input and checks if this email has been registered with an existing Looker user. If a current user is found, an email to reset the password will be sent to the user. Otherwise, a new user will be created, and a setup email will be sent.

Check out [Looker's Python SDK examples](https://github.com/looker-open-source/sdk-codegen/tree/main/examples/python) for more code examples.

## Demo

<p align="center">
  <img src="https://storage.googleapis.com/tutorials-img/Cloud%20Function%20Demo%20-%20SD%20480p.gif" alt="Demo">
</p>

## Setup

The following steps assume deployment using Google Cloud UI Console. Check out ["Your First Function: Python"](https://cloud.google.com/functions/docs/first-python) for steps to deploy using the `gcloud` command-line tool

1. Obtain a [Looker API3 Key](https://docs.looker.com/admin-options/settings/users#api3_keys)

2. Follow the steps [provided here](https://cloud.google.com/functions/docs/quickstart-python) to create a new Google Cloud Function

3. If using Google Sheet: Grant "Viewer" permission to the email address associated with the "Runtime service account" in Cloud Functions. The recommendation is to use the [Default App Engine Service Account](https://cloud.google.com/appengine/docs/standard/python/service-account) and share its email (`YOUR_PROJECT_ID@appspot.gserviceaccount.com`) to the Google Sheet.

4. Configure runtime environment variables using the Cloud Function UI: Edit > Configuration > Runtime, build, connections and security settings > Runtime environment variables. Alternatively, environment variables can be configured through the `os` module or a `.ini` file. Check [Configuring Looker Python SDK](https://github.com/looker-open-source/sdk-codegen/tree/main/python#configuring-the-sdk) for more information

<p align="center">
  <img src="https://storage.googleapis.com/tutorials-img/Cloud%20Function_env%20-%20SD%20480p.gif" alt="Setting environmental variables in Cloud Function UI">
</p>

5. Copy and paste the contents of `main.py` in this repository into the `main.py` file once inside Cloud Function's inline editor. Change the "Entry point" in the top right to the main function. `main.py` is executed once the function is triggered

6. Copy and paste the contents of `requirements.txt` in this repository to the `requirements.txt` file once inside Cloud Function's inline editor. This file is used to install necessary libraries to execute the function

7. Deploy and test the function. Check out [this article](https://cloud.google.com/functions/docs/quickstart-python#test_the_function) for instruction
