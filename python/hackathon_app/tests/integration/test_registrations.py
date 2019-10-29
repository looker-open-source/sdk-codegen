import datetime

from sheets import Registrant, Registrations

DATE_FORMAT = "%m/%d/%Y"


def test_rows_returns_registrants(registrations: Registrations, test_registrants):
    """rows() should return a list of Registrant objects"""
    all_registrations = registrations.rows()
    assert isinstance(all_registrations, list)
    assert len(all_registrations) == len(test_registrants)

    registrant = all_registrations[0]
    expected = test_registrants[0]
    assert isinstance(registrant, Registrant)
    assert registrant.user_email == expected.user_email
    assert registrant.hackathon_name == expected.hackathon_name
    hackathon_date = datetime.datetime.strptime(expected.date_registered, DATE_FORMAT)
    assert registrant.date_registered == hackathon_date
    assert (
        registrant.attended == bool(expected.attended)
        if hackathon_date < datetime.datetime.now()
        else None
    )


def test_is_registered_returns_true_for_existing_registrants(
    registrations: Registrations, test_registrants
):
    """is_registered(registrant) should return True for already registered users"""
    registrant = test_registrants[0]
    existing_registrant = Registrant(
        user_email=registrant.user_email,
        hackathon_name=registrant.hackathon_name,
        date_registered=datetime.datetime.strptime(
            registrant.date_registered, DATE_FORMAT
        ),
        attended=bool(registrant.attended),
    )
    assert registrations.is_registered(existing_registrant)


def test_is_registered_returns_false_for_new_registrants(
    registrations: Registrations, test_registrants
):
    """is_registered(registrant) should return False for already registered users"""
    new_registrant = Registrant(
        user_email="newregistrant@newompany.com",
        hackathon_name="brand_new_hackathon",
        date_registered=datetime.datetime.now(),
        attended=None,
    )
    assert not registrations.is_registered(new_registrant)


def test_register(registrations: Registrations):
    """register() should append new registrants to registrations sheets"""
    new_registrant = Registrant(
        user_email="newregistrant@newompany.com",
        hackathon_name="brand_new_hackathon",
        date_registered=datetime.datetime.now(),
        attended=None,
    )
    assert not registrations.is_registered(new_registrant)
    registrations.register(new_registrant)
    assert registrations.is_registered(new_registrant)
