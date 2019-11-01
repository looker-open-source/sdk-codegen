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
    assert actual_user.group_ids
    assert len(actual_user.group_ids) == 2
    assert actual_user.is_disabled

    groups = sdk.all_groups(ids=models.DelimSequence(actual_user.group_ids))
    for group in groups:
        if group.name == f"Looker_Hack: {test_hackathon}":
            break
    else:
        pytest.fail(f"Failed to find or create 'Looker_Hack: {test_hackathon}'")
    for role in sdk.all_roles(fields="name,id"):
        if role.name == "Hackathon":
            break
    else:
        pytest.fail("Bad test setup, failed to find 'Hackathon' role")
    assert role.id
    role_groups = sdk.role_groups(role_id=role.id, fields="id")
    for role_group in role_groups:
        if role_group.id == group.id:
            break
    else:
        pytest.fail(
            f"Failed to assign group 'Looker_Hack: {test_hackathon}' to role 'Hackathon'"
        )

    assert actual_user.id
    actual_attributes = sdk.user_attribute_user_values(user_id=actual_user.id)
    assert actual_attributes
    for actual_attribute in actual_attributes:
        if actual_attribute.name == "hackathon":
            assert actual_attribute.value == test_hackathon
            break
    else:
        assert False, "Not assigned hackathon role"
