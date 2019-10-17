import json
import pytest  # type: ignore

from google.oauth2 import service_account  # type: ignore
from googleapiclient import discovery  # type: ignore

# sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@pytest.fixture(scope="session", name="spreadsheet")
def create_test_sheet(test_data, spreadsheet_client, drive_client):
    request = spreadsheet_client.create(body=test_data)
    response = request.execute()

    yield response

    drive_client.files().delete(fileId=response["spreadsheetId"]).execute()


@pytest.fixture(name="test_users")
def get_test_users(test_data):
    """Returns a list of dicts representing the users sheet"""
    users_sheet = test_data["sheets"][0]
    assert users_sheet["properties"]["title"] == "users"
    return create_sheet_repr(users_sheet)


@pytest.fixture(name="test_hackathons")
def get_test_hackathons(test_data):
    """Returns a list of dicts representing the hackathons sheet"""
    hackathons_sheet = test_data["sheets"][1]
    assert hackathons_sheet["properties"]["title"] == "hackathons"
    return create_sheet_repr(hackathons_sheet)


@pytest.fixture(name="test_registrants")
def get_test_registrants(test_data):
    """Returns a list of dicts representing the registrations sheet"""
    registrations_sheet = test_data["sheets"][2]
    assert registrations_sheet["properties"]["title"] == "registrations"
    return create_sheet_repr(registrations_sheet)


def create_sheet_repr(sheet):
    """Converts a JSON representation of a sheet into a list of dicts. Each element
    in the list represents a row in the sheet, where each cell value can be accessed
    using the cell header as a key
    """
    header = get_header(sheet)
    data = get_data(sheet)
    result = [dict(zip(header, d)) for d in data]
    return result


def get_header(sheet):
    """Get the header as a list"""
    sheet_header = sheet["data"][0]["rowData"][0]["values"]
    header = []
    for cell in sheet_header:
        cell_value = cell["userEnteredValue"]["stringValue"]
        header.append(cell_value)
    return header


def get_data(sheet):
    """Return data (exc headers) from a sheet as a list of rows, with each
     row being a list representing all cell values in that row
     """
    rows_exc_header = sheet["data"][0]["rowData"][1:]
    data = []
    for row in rows_exc_header:
        row_data = []
        for cell in row["values"]:
            cell_value = cell["userEnteredValue"]["stringValue"]
            row_data.append(cell_value)
        data.append(row_data)
    return data


@pytest.fixture(name="test_data", scope="session")
def get_test_data():
    # TODO: use special notation for dynamically generating dates
    with open("tests/data/data.json", "r") as f:
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
