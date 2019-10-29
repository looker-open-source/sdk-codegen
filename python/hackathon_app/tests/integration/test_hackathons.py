import datetime
import pytest  # type: ignore

from sheets import Hackathon, Hackathons

DATE_FORMAT = "%m/%d/%Y"


def test_rows_returns_hackathons(hackathons: Hackathons, test_hackathons):
    """rows() should return a list of Hackathon objects"""
    all_hackathons = hackathons.rows()
    assert isinstance(all_hackathons, list)
    assert len(all_hackathons) == len(test_hackathons)

    hackathon = all_hackathons[0]
    expected = test_hackathons[0]
    assert isinstance(hackathon, Hackathon)
    assert hackathon.name == expected.name
    assert hackathon.location == expected.location
    assert hackathon.date == datetime.datetime.strptime(expected.date, DATE_FORMAT)
    assert hackathon.duration_in_days == int(expected.duration_in_days)
