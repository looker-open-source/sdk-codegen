import datetime

import pytest  # type: ignore

from sheets import User, Users

DATE_FORMAT = "%m/%d/%Y"


def test_rows_returns_users(users: Users, test_users):
    """rows() should return a list of User objects"""
    all_users = users.rows()
    assert isinstance(all_users, list)
    assert len(all_users) == len(test_users)

    user = all_users[0]
    expected = test_users[0]
    assert isinstance(user, User)
    assert user.first_name == expected.first_name
    assert user.last_name == expected.last_name
    assert user.email == expected.email
    assert user.date_created == datetime.datetime.strptime(
        expected.date_created, DATE_FORMAT
    )
    assert user.organization == expected.organization
    assert user.tshirt_size == expected.tshirt_size


def test_is_created_returns_true_for_existing_users(users: Users, test_users):
    """is_created(user) returns True if user already exists"""
    user = test_users[0]
    existing_user = User(
        first_name=f"Updated {user.first_name}",
        last_name=f"Updated {user.last_name}",
        email=user.email,
        organization=f"Updated {user.organization}",
        tshirt_size=f"Updated {user.tshirt_size}",
    )
    result = users.is_created(existing_user)
    assert result


def test_is_created_returns_false_for_new_users(users: Users):
    """is_created(user) returns False for new users"""
    new_user = User(
        first_name="New",
        last_name="Registrant",
        email="newregistrant@newcompany.com",
        organization="company",
        tshirt_size="M",
    )
    result = users.is_created(new_user)
    assert not result


def test_create_user(users: Users):
    """create(user) should add a user to the users sheet"""
    new_user = User(
        first_name="Hundy",
        last_name="P",
        email="hundyp@company.com",
        organization="company",
        tshirt_size="M",
    )
    assert not users.is_created(new_user)
    users.create(new_user)
    assert users.is_created(new_user)
    all_users = users.rows()
    user = all_users[-1]
    assert isinstance(user, User)
    assert user.first_name == new_user.first_name
    assert user.last_name == new_user.last_name
    assert user.email == new_user.email
    assert user.date_created == generate_date()
    assert user.organization == new_user.organization
    assert user.tshirt_size == new_user.tshirt_size


def test_update_user_updates(users: Users):
    """update(user) should modify existing users in the users sheet. The user's
    email is used to uniquely identify a user and cannot be amended from the front end.
    """
    all_users = users.rows()
    updated_user = all_users[0]
    updated_user.first_name = "updated_first"
    updated_user.last_name = "updated_last"
    updated_user.organization = "updated_org"
    updated_user.tshirt_size = "update_size"
    users.update(updated_user)

    all_users = users.rows()
    for u in all_users:
        if u.email == updated_user.email:
            user = u
            break
    else:
        pytest.fail("User not found")
    assert user.first_name == updated_user.first_name
    assert user.last_name == updated_user.last_name
    assert user.organization == updated_user.organization
    assert user.tshirt_size == updated_user.tshirt_size


def generate_date():
    return datetime.datetime.strptime(
        datetime.datetime.now().strftime(DATE_FORMAT), DATE_FORMAT
    )
