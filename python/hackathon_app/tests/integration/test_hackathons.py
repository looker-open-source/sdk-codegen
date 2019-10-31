from sheets import Hackathons


def test_rows_returns_hackathons(hackathons: Hackathons, test_hackathons):
    """rows() should return a list of Hackathon objects"""
    all_hackathons = hackathons.rows()
    assert isinstance(all_hackathons, list)
    assert len(all_hackathons) == len(test_hackathons)

    hackathon = all_hackathons[0]
    expected = test_hackathons[0]
    assert hackathon == expected
