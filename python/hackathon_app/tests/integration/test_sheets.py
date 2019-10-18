import pytest  # type: ignore
from sheets import Sheets


@pytest.fixture(name="sheets")
def initialize_sheets(spreadsheet, cred_file):
    spreadsheet = spreadsheet
    return Sheets(spreadsheet_id=spreadsheet["spreadsheetId"], cred_file=cred_file)


def test_gets_all_hackathons(test_data, sheets: Sheets):
    """get_hackathons should return all active hackathons."""
    hackathons = sheets.get_hackathons()
    assert isinstance(hackathons, list)
    assert len(hackathons) > 0


def test_register_user():
    pass
