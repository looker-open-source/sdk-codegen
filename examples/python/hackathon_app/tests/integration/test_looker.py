from typing import List

import looker_sdk
from looker_sdk import models, methods
import pytest  # type: ignore

import looker
import sheets


@pytest.fixture
def sdk():
    sdk = looker_sdk.init31()
    yield sdk
    sdk.logout()


@pytest.fixture
def looker_test_users(sdk: methods.LookerSDK, test_users: List[sheets.User]):
    yield test_users
    for test_user in test_users:
        users = sdk.search_users(email=test_user.email)
        if len(users) > 0:
            assert users[0].id
            sdk.delete_user(user_id=users[0].id)


@pytest.mark.parametrize("register_twice", [False, True])
def test_register_user(
    looker_test_users: List[sheets.User], sdk: methods.LookerSDK, register_twice: bool
):

    test_hackathon = "Some Hackathon"

    test_user = looker_test_users[0]
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


def test_enable_users_by_hackathons(
    looker_test_users: List[sheets.User], sdk: methods.LookerSDK
):
    test_user1, test_user2, test_user3, test_user4 = looker_test_users
    looker.register_user(
        hackathon="hack_1",
        first_name=test_user1.first_name,
        last_name=test_user1.last_name,
        email=test_user1.email,
    )
    looker.register_user(
        hackathon="hack_2",
        first_name=test_user2.first_name,
        last_name=test_user2.last_name,
        email=test_user2.email,
    )
    looker.register_user(
        hackathon="hack_1",
        first_name=test_user3.first_name,
        last_name=test_user3.last_name,
        email=test_user3.email,
    )
    looker.register_user(
        hackathon="hack_2",
        first_name=test_user4.first_name,
        last_name=test_user4.last_name,
        email=test_user4.email,
    )

    assert sdk.search_users(fields="is_disabled", email=test_user1.email)[0].is_disabled
    assert sdk.search_users(fields="is_disabled", email=test_user2.email)[0].is_disabled
    assert sdk.search_users(fields="is_disabled", email=test_user3.email)[0].is_disabled
    assert sdk.search_users(fields="is_disabled", email=test_user4.email)[0].is_disabled

    looker.enable_users_by_hackathons(hackathons=["hack_1", "hack_2"])

    assert not sdk.search_users(fields="is_disabled", email=test_user1.email)[
        0
    ].is_disabled
    assert not sdk.search_users(fields="is_disabled", email=test_user2.email)[
        0
    ].is_disabled
    assert not sdk.search_users(fields="is_disabled", email=test_user3.email)[
        0
    ].is_disabled
    assert not sdk.search_users(fields="is_disabled", email=test_user4.email)[
        0
    ].is_disabled
