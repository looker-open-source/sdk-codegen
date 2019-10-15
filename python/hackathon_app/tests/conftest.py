import json
import pytest  # type: ignore

from google.oauth2 import service_account  # type: ignore
from googleapiclient import discovery  # type: ignore

# sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@pytest.fixture(scope="session")
def create_test_sheet(test_data, spreadsheet_client, drive_client):
    request = spreadsheet_client.create(body=test_data)
    response = request.execute()

    yield response

    drive_client.files().delete(fileId=response["spreadsheetId"]).execute()


@pytest.fixture(name="test_users")
def get_test_users(test_data):
    users_sheet = test_data["sheets"][0]
    assert users_sheet["properties"]["title"] == "users"
    users = users_sheet["data"][0]["rowData"][1:]
    return users


@pytest.fixture(name="test_data", scope="session")
def get_test_data():
    # TODO: use special notatation for dynamically generating dates
    with open("data/data.json", "r") as f:
        data = json.load(f)
    return data


@pytest.fixture(scope="session")
def spreadsheet_client(credentials):
    service = discovery.build("sheets", "v4", credentials=credentials)
    spreadsheet_client = service.spreadsheets()

    return spreadsheet_client


@pytest.fixture(scope="session")
def drive_client(credentials):
    drive_client = discovery.build("drive", "v3", credentials=credentials)

    return drive_client


@pytest.fixture(scope="session")
def credentials():
    scopes = [
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/spreadsheets",
    ]

    credentials = service_account.Credentials.from_service_account_file(
        "/Users/jax/Documents/sdk-examples/python/hackathon_app/tests/jaxdata-a93316beb3a0.json",
        scopes=scopes,
    )

    return credentials
