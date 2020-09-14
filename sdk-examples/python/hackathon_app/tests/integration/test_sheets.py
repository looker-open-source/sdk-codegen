import datetime
from typing import Sequence

from sheets import User, Users, RegisterUser, Registrant, Registrations, Sheets


def test_gets_all_hackathons(sheets: Sheets, test_data):
    """get_hackathons() should return all active hackathons."""
    hackathons = sheets.get_hackathons()
    assert isinstance(hackathons, list)
    assert len(hackathons) > 0


def test_register_user_registers(
    sheets: Sheets, users: Users, registrations: Registrations, test_data
):
    """register_user() should register new users by adding them to the Users sheet
    and to the Registrations sheet
    """
    new_user = sheets.register_user(
        RegisterUser(
            hackathon="sanfrancisco_2019",
            first_name="New",
            last_name="Registrant",
            email="newregistrant@newompany.com",
            organization="New Company",
            role="Data person",
            tshirt_size="M",
        )
    )

    all_users = users.rows()
    last_inserted_user = all_users[-1]
    assert new_user == last_inserted_user

    all_registrants = registrations.rows()
    last_registrant = all_registrants[-1]
    assert last_registrant.user_email == new_user.email
    assert last_registrant.hackathon_name == "sanfrancisco_2019"
    assert last_registrant.date_registered
    assert (
        last_registrant.date_registered.date()
        == datetime.datetime.now(tz=datetime.timezone.utc).date()
    )
    assert last_registrant.attended is None


def test_register_user_registers_when_user_exists(
    test_users: Sequence[User],
    sheets: Sheets,
    users: Users,
    registrations: Registrations,
):
    """register_user() should register a user by adding them to the Registrations sheet
    if user already exists in the Users sheet but not in the Registrations sheet.
    """
    existing_user = test_users[0]
    registered_user = sheets.register_user(
        RegisterUser(
            hackathon="newhackathon_2019",
            first_name=existing_user.first_name,
            last_name=existing_user.last_name,
            email=existing_user.email,
            organization=existing_user.organization,
            role=existing_user.role,
            tshirt_size=existing_user.tshirt_size,
        )
    )

    assert registered_user == existing_user
    all_users = sorted(users.rows(), key=lambda a: a.id)
    test_users = sorted(test_users, key=lambda t: t.id)
    assert all_users == test_users

    all_registrants = registrations.rows()
    last_registrant = all_registrants[-1]
    assert last_registrant.user_email == existing_user.email
    assert last_registrant.hackathon_name == "newhackathon_2019"
    assert last_registrant.date_registered
    assert (
        last_registrant.date_registered.date()
        == datetime.datetime.now(tz=datetime.timezone.utc).date()
    )
    assert last_registrant.attended is None


def test_register_updates_user_if_user_is_registered(
    users: Users,
    test_users: Sequence[User],
    test_registrants: Sequence[Registrant],
    sheets: Sheets,
    registrations: Registrations,
):
    """register_user() should update the user but not re-register if user is already registered"""
    existing_registrant = test_registrants[0]
    for user in test_users:
        if user.email == existing_registrant.user_email:
            updated_user = user
            break

    updated_user.first_name = "updated_first"
    updated_user.last_name = "updated_last"
    updated_user.organization = "updated_org"
    updated_user.tshirt_size = "update_size"

    sheets.register_user(
        RegisterUser(
            hackathon="newhackathon_2019",
            first_name=updated_user.first_name,
            last_name=updated_user.last_name,
            email=updated_user.email,
            organization=updated_user.organization,
            role=updated_user.role,
            tshirt_size=updated_user.tshirt_size,
        )
    )

    retrieved_user = users.find(existing_registrant.user_email)
    assert retrieved_user == updated_user
