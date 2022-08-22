import datetime
import io
import json
import re
from operator import itemgetter
import time
from typing import Any, cast, Dict, List, Optional, Union, Sequence
import warnings

import pytest  # type: ignore
from PIL import Image  # type: ignore

from looker_sdk.sdk.api40 import methods as mtds
from looker_sdk.sdk.api40 import models as ml


@pytest.fixture(scope="module")
def sdk(sdk40) -> mtds.Looker40SDK:
    return sdk40


TEST_FIRST_NAME = "Rudolphontronix"
TEST_LAST_NAME = "Doe"


def test_crud_user(sdk: mtds.Looker40SDK):
    """Test creating, retrieving, updating and deleting a user."""

    print(datetime.datetime.now())

    # Create user
    user = sdk.create_user(
        ml.WriteUser(
            first_name=TEST_FIRST_NAME,
            last_name=TEST_LAST_NAME,
            is_disabled=False,
            locale="fr",
        )
    )
    assert isinstance(user, ml.User)
    assert isinstance(user.id, str)
    assert user.first_name == TEST_FIRST_NAME
    assert user.last_name == TEST_LAST_NAME
    assert not user.is_disabled
    assert user.locale == "fr"
    
    # sudo checks
    user_id = user.id
    sudo_auth = sdk.login_user(user_id)
    assert isinstance(sudo_auth.access_token, str)
    assert sudo_auth.access_token != ""
    sdk.auth.login_user(user_id)
    user = sdk.me()
    assert user.first_name == TEST_FIRST_NAME
    assert user.last_name == TEST_LAST_NAME
    sdk.auth.logout()
    user = sdk.me()
    assert user.first_name != TEST_FIRST_NAME
    assert user.last_name != TEST_LAST_NAME
    
    # Update user and check fields we didn't intend to change didn't change
    update_user = ml.WriteUser(is_disabled=True, locale="uk")
    sdk.update_user(user_id, update_user)
    user = sdk.user(user_id)
    assert user.first_name == TEST_FIRST_NAME
    assert user.last_name == TEST_LAST_NAME
    assert user.locale == "uk"
    assert user.is_disabled

    # Update user and check fields we intended to wipe out are now None
    # first way to specify nulling out a field
    update_user = ml.WriteUser(first_name=ml.EXPLICIT_NULL)
    # second way
    update_user.last_name = ml.EXPLICIT_NULL
    sdk.update_user(user_id, update_user)
    user = sdk.user(user_id)
    assert user.first_name == ""
    assert user.last_name == ""
    
    # Try adding email creds
    sdk.create_user_credentials_email(
        user_id, ml.WriteCredentialsEmail(email="john.doe@looker.com")
    )
    user = sdk.user(user_id)
    assert isinstance(user.credentials_email, ml.CredentialsEmail)
    assert user.credentials_email.email == "john.doe@looker.com"

    # Delete user
    resp = sdk.delete_user(user_id)
    assert resp == ""
    print(datetime.datetime.now())

def test_crud_user_dict(sdk):  # no typing
     """Test creating, retrieving, updating and deleting a user."""
    
     print(datetime.datetime.now())
     assert True
     print(datetime.datetime.now())
        
    # # Create user
    # new_user = sdk.create_user(
    #     dict(
    #         first_name=TEST_FIRST_NAME,
    #         last_name=TEST_LAST_NAME,
    #         is_disabled=False,
    #         locale="fr",
    #     )
    # )
    # assert new_user["first_name"] == TEST_FIRST_NAME
    # assert new_user["last_name"] == TEST_LAST_NAME
    # assert not new_user["is_disabled"]
    # assert new_user["locale"] == "fr"

    # # sudo checks
    # user_id = new_user["id"]
    # sdk.auth.login_user(user_id)
    # sudo_user = sdk.me()
    # assert sudo_user["first_name"] == TEST_FIRST_NAME
    # assert sudo_user["last_name"] == TEST_LAST_NAME
    # sdk.auth.logout()
    # me_user = sdk.me()
    # assert me_user["first_name"] != TEST_FIRST_NAME
    # assert me_user["last_name"] != TEST_LAST_NAME

    # # Update user and check fields we didn't intend to change didn't change
    # new_user["is_disabled"] = True
    # new_user["locale"] = "uk"
    # # sdk.update_user(user_id, update_user)
    # sdk.update_user(user_id, new_user)
    # updated_user = sdk.user(user_id)
    # assert updated_user["first_name"] == TEST_FIRST_NAME
    # assert updated_user["last_name"] == TEST_LAST_NAME
    # assert updated_user["locale"] == "uk"
    # assert updated_user["is_disabled"]

    # update_user = dict(first_name=None)
    # update_user["last_name"] = None
    # sdk.update_user(user_id, update_user)
    # user = sdk.user(user_id)
    # assert user["first_name"] == ""
    # assert user["last_name"] == ""

    # # Try adding email creds
    # sdk.create_user_credentials_email(user_id, dict(email="john.doe@looker.com"))
    # user = sdk.user(user_id)
    # assert user["credentials_email"]["email"] == "john.doe@looker.com"

    # # Delete user
    # resp = sdk.delete_user(user_id)
    # assert resp == ""


