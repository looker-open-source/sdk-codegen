from datetime import datetime
import pytest  # type: ignore
from sheets import Sheets


@pytest.fixture(name="sheets")
def initialize_sheets(create_test_sheet):
    spreadsheet = create_test_sheet
    return Sheets(spreadsheet["spreadsheetId"])


def test_gets_all_hackathons(test_data, sheets: Sheets):
    """get_hackathons should return all active hackathons."""
    hackathons = sheets.get_hackathons()
    assert isinstance(list, hackathons)
    assert len(hackathons) > 0


def test_get_users_returns_all_users(test_users, sheets: Sheets):
    """get_users should return all users in the users sheet."""
    actual = sheets.get_users()
    assert len(actual) == len(test_users)


def test_create_user(sheets: Sheets):
    """create_user should append a user to the very end of the users sheet."""
    users = [
        {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@foo.com",
            "company": "Foo",
            "country": "UK",
            "tshirt_size": "M",
        },
        {
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "jane@company.com",
            "company": "Company",
            "country": "Germany",
            "tshirt_size": "S",
        },
    ]

    for user in users:
        sheets.create_user(**user)

    user = sheets.get_users()[-2:]
    assert user[0]["first_name"] == "John"
    assert user[0]["last_name"] == "Doe"
    assert user[0]["email"] == "john@foo.com"
    assert user[0]["company"] == "Foo"
    assert user[0]["country"] == "UK"
    assert user[0]["tshirt_size"] == "M"
    assert user[0]["created_date"] == datetime.now().strftime("%m/%d/%Y")

    assert user[1]["first_name"] == "Jane"
    assert user[1]["last_name"] == "Doe"
    assert user[1]["email"] == "jane@company.com"
    assert user[1]["company"] == "Company"
    assert user[1]["country"] == "Germany"
    assert user[1]["tshirt_size"] == "S"
    assert user[1]["created_date"] == datetime.now().strftime("%m/%d/%Y")
