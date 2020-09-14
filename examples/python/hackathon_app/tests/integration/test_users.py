import datetime

from sheets import User, Users


def test_rows_returns_users(users: Users, test_users):
    """rows() should return a list of User objects"""
    all_users = users.rows()
    assert isinstance(all_users, list)
    assert len(all_users) == len(test_users)

    user = all_users[0]
    expected = test_users[0]
    assert user == expected


def test_find_returns_existing_user(users: Users, test_users):
    """find(user) returns True if user already exists"""
    expected_user = test_users[0]
    actual_user = users.find(expected_user.email)
    assert actual_user == expected_user


def test_find_returns_false_non_existant_user(users: Users):
    """find(user) returns False for new users"""
    assert not users.find("no-one-has-this-email")


def test_create_user(users: Users):
    """create(user) should add a user to the users sheet"""
    new_user = User(
        first_name="Hundy",
        last_name="P",
        email="hundyp@company.com",
        organization="company",
        role="BI analyst",
        tshirt_size="M",
    )
    users.save(new_user)
    all_users = users.rows()
    user = all_users[-1]
    assert user == new_user
    assert user.date_created < datetime.datetime.now(tz=datetime.timezone.utc)


def test_update_user_updates(users: Users):
    """update(user) should modify existing users in the users sheet. The user's
    email is used to uniquely identify a user and cannot be amended from the front end.
    """
    all_users = users.rows()
    updated_user = all_users[0]
    updated_user.first_name = "updated_first"
    updated_user.last_name = "updated_last"
    updated_user.organization = "updated_org"
    updated_user.organization = "updated_role"
    updated_user.tshirt_size = "update_size"
    users.save(updated_user)

    user = users.find(updated_user.email)
    assert user == updated_user
