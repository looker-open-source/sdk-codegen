## Overview

A Python script that extracts [System Activity](https://docs.looker.com/admin-options/system-activity) data from the last 10 minutes, formats the data as Audit Logs, and exports the logs to Cloud Logging. The data formatting/mapping is best effort. See [data mapping](#gcp-audit-log-fields-to-looker-system-activity-mapping) below.

**_NOTE:_**  You can schedule this script to run every 10 minutes using a cron job or equivalent to continually create and export logs.

## Requirements
- Looker Instance in which you have Admin or `see_system_activity` permission
- Google Cloud Project with Cloud Logging API enabled
- python 3.6+ installed
- [pyenv](https://github.com/pyenv/pyenv#installation) installed
- [gcloud](https://cloud.google.com/sdk/docs/install) installed

## Deployment

- Create [Looker API credentials](https://docs.looker.com/reference/api-and-integration/api-auth) and set the below environment variables
  ```
  export LOOKERSDK_BASE_URL="<Your API URL>"
  export LOOKERSDK_CLIENT_ID="<Your Client ID>"
  export LOOKERSDK_CLIENT_SECRET="<Your Client Secret>"
  ```

- Create and configure a [service account](https://cloud.google.com/logging/docs/reference/libraries#setting_up_authentication) to write log entries to Cloud Logging and download the keys
  ```
  export GOOGLE_APPLICATION_CREDENTIALS="<Service Account Key Path>"
  ```

- Clone the repo
  ```
  git clone https://github.com/itodotimothy6/extract-looker-logs.git
  cd extract-looker-logs/
  ```
  
- Setup python virtual environment 
  ```
  pyenv install 3.8.2
  pyenv local 3.8.2
  python -m venv .venv
  source .venv/bin/activate
  ```

- Install dependencies 
  ```
  pip install looker-sdk
  pip install google-cloud-logging
  ```


- Run `main.py`
  ```
  python main.py
  ```


## GCP Audit Log Fields to Looker System Activity Mapping

| GCP Audit Log Field       | Looker System Actvity Field or Value|
| -----------               | -----------                 |
| [logName](https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#:~:text=Fields-,logName,-string) | `looker_system_activity_logs` |
| [timestamp](https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#:~:text=reported%20the%20error.-,timestamp,-string) | [event.created](https://docs.looker.com/admin-options/tutorials/events#:~:text=for%20example%2C%20create_dashboard-,created,-Date%20and%20time) |
| [resource.type](https://cloud.google.com/logging/docs/reference/v2/rest/v2/MonitoredResource#:~:text=Fields-,type,-string)  | `looker_system_activity_logs`  |
| [insertId](https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#:~:text=is%20LogSeverity.DEFAULT.-,insertid,-string)  | [event.id](https://docs.looker.com/admin-options/tutorials/events#:~:text=Description-,id,-Unique%20numeric%20identifier)  |
| `protoPayload.status` | [event.attribute.status](https://docs.looker.com/admin-options/tutorials/events#:~:text=Trigger-,Attributes,-add_external_email_to_scheduled_task) |
| `protoPayload.authenticationInfo`  | [event.user_id](https://docs.looker.com/admin-options/tutorials/events#:~:text=of%20the%20event-,user_id,-Unique%20numeric%20ID), [event.sudo_user_id](https://docs.looker.com/admin-options/tutorials/events#:~:text=for%20example%2C%20dashboard-,sudo_user_id,-Unique%20numeric%20ID)  |
| `protoPayload.authorizationInfo`  | `permission_set.permissions`  |
| `protoPayload.methodName`  | [event.name](https://docs.looker.com/admin-options/tutorials/events#:~:text=triggered%20the%20event-,name,-Name%20of%20the) |
| `protoPayload.response` | [event_attributes](https://docs.looker.com/admin-options/tutorials/events#:~:text=Trigger-,Attributes,-add_external_email_to_scheduled_task) |
