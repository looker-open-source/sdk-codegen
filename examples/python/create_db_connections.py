import looker_sdk
from looker_sdk import models
import base64

with open("credentials_file.json", "rb") as f:
    cert = f.read()


cert = base64.b64encode(cert).decode("utf-8")
"""Base64 encoded Certificate body for server authentication"""


sdk = looker_sdk.init40("looker.ini")


sdk.create_connection(
    models.WriteDBConnection(
        name="api created",
        host="host_name",
        database="your_db",
        dialect_name="bigquery_standard_sql",
        certificate=cert,
        username="user_name",
        file_type=".json",
    )
)
