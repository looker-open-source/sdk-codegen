from typing import List

from looker_sdk import client, models, methods
import pytest  # type: ignore

import looker
import sheets


@pytest.fixture
def sdk():
    sdk = client.setup()
    yield sdk
    sdk.logout()


@pytest.fixture
def test_user(sdk: methods.LookerSDK, test_users: List[sheets.User]):
    test_user = test_users[0]
    yield test_user
    users = sdk.search_users(email=test_user.email)
    if len(users) > 0:
        assert users[0].id
        sdk.delete_user(user_id=users[0].id)


@pytest.mark.parametrize("register_twice", [False, True])
def test_register_user(
    test_user: sheets.User, sdk: methods.LookerSDK, register_twice: bool
):

    test_hackathon = "Some Hackathon"

    looker.register_user(
        hackathon=test_hackathon,
        first_name=test_user.first_name,
        last_name=test_user.last_name,
        email=test_user.email,
    )
    if register_twice:
        looker.register_user(
            hackathon=test_hackathon,
            first_name=test_user.first_name,
            last_name=test_user.last_name,
            email=test_user.email,
        )

    users = sdk.search_users(email=test_user.email)
    assert len(users) > 0
    actual_user = users[0]

    assert actual_user.first_name == test_user.first_name
    assert actual_user.last_name == test_user.last_name
    assert actual_user.credentials_email
    assert actual_user.credentials_api3
    assert len(actual_user.credentials_api3) == 1
    assert actual_user.role_ids
    assert len(actual_user.role_ids) == 2
    assert actual_user.is_disabled

    roles = sdk.all_roles(
        fields="name", ids=models.DelimSequence(list(actual_user.role_ids))
    )
    assert {r.name for r in roles} == {"Developer", "Hackathon"}

    assert actual_user.id
    actual_attributes = sdk.user_attribute_user_values(user_id=actual_user.id)
    assert actual_attributes
    for actual_attribute in actual_attributes:
        if actual_attribute.name == "hackathon":
            assert actual_attribute.value == test_hackathon
            break
    else:
        assert False, "Not assigned hackathon role"
