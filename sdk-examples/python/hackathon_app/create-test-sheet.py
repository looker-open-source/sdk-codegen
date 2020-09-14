"""Create a test sheet for local dev

Execute with create-test-sheet.sh passing in your email address:

    ./create-test-sheet.sh joel.dodge@looker.com

Mostly copied from tests/conftest.py with the addition of
sharing/transfering ownership to you.

"""
import base64
import json
import os
import sys

from google.oauth2 import service_account  # type: ignore
from googleapiclient import discovery  # type: ignore

email = sys.argv[1]
google_creds = os.environ.get("GOOGLE_APPLICATION_CREDENTIAL_ENCODED")
assert google_creds
with open("./google-creds.json", "wb") as f:
    f.write(base64.b64decode(google_creds))
scopes = [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/spreadsheets",
]

credentials = service_account.Credentials.from_service_account_file(
    "google-creds.json", scopes=scopes
)

os.remove("./google-creds.json")

service = discovery.build("sheets", "v4", credentials=credentials)
spreadsheet_client = service.spreadsheets()
with open("tests/data/data.json", "r") as t:
    test_data = json.load(t)
request = spreadsheet_client.create(body=test_data)
response = request.execute()
print(f"Created spreadsheet {response['spreadsheetId']}")
drive_client = discovery.build("drive", "v3", credentials=credentials)


def callback(request_id, response, exception):
    if exception:
        # Handle error
        raise exception
    else:
        print(f"Permission Id:{response.get('id')}")


batch = drive_client.new_batch_http_request(callback=callback)
user_permission = {"type": "user", "role": "owner", "emailAddress": email}
batch.add(
    drive_client.permissions().create(
        transferOwnership=True,
        fileId=response["spreadsheetId"],
        body=user_permission,
        fields="id",
    )
)
batch.execute()
print(f"Shared spreadsheet {response['spreadsheetId']} with {email}")
