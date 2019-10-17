import datetime
import pytest  # type: ignore

from sheets import User, Users

DATE_FORMAT = "%m/%d/%Y"


@pytest.fixture(scope="module", name="users")
def instantiate_users(spreadsheet_client, spreadsheet):
    """Creates and returns an instance of Users"""
    client = spreadsheet_client.values()
    return Users(client, spreadsheet["spreadsheetId"])


def test_rows_returns_users(users: Users, test_users):
    """rows() should return a list of User objects"""
    all_users = users.rows()
    assert isinstance(all_users, list)
    assert len(all_users) == len(test_users)

    user = all_users[0]
    expected = test_users[0]
    assert isinstance(user, User)
    assert user.first_name == expected["first_name"]
    assert user.last_name == expected["last_name"]
    assert user.email == expected["email"]
    assert user.date_created == datetime.datetime.strptime(
        expected["date_created"], DATE_FORMAT
    )
    assert user.organization == expected["organization"]
    assert user.tshirt_size == expected["tshirt_size"]


def test_is_created_returns_true_for_existing_users(users: Users, test_users):
    """is_created(user) returns True if user already exists"""
    user = test_users[0]
    existing_user = User(
        first_name=user["first_name"],
        last_name=user["last_name"],
        email=user["email"],
        date_created=datetime.datetime.strptime(user["date_created"], DATE_FORMAT),
        organization=user["organization"],
        tshirt_size=user["tshirt_size"],
    )
    result = users.is_created(existing_user)
    assert result


def test_is_created_returns_false_for_new_users(users: Users):
    """is_created(user) returns False for new users"""
    new_user = User(
        first_name="New",
        last_name="Registrant",
        email="newregistrant@newcompany.com",
        date_created=generate_date(),
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
        date_created=generate_date(),
        organization="company",
        tshirt_size="M",
    )
    assert not users.is_created(new_user)
    users.create(new_user)
    assert users.is_created(new_user)


def generate_date():
    return datetime.datetime.strptime(
        datetime.datetime.now().strftime(DATE_FORMAT), DATE_FORMAT
    )
