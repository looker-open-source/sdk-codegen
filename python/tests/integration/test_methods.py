# mypy
import pytest
from typing import Dict, List, Union

from looker.sdk import methods as mtds
from looker.sdk import models as ml


@pytest.mark.skip(
    reason="Currently fails because update_user assigns Nones to arguments that are not passed through."
)
def test_crud_user(client: mtds.LookerSDK):
    """Test creating, retrieving, updating and deleting a user.
    """

    # Create user
    user = client.create_user(
        ml.WriteUser(first_name="John", last_name="Doe", is_disabled=True, locale="fr")
    )
    assert isinstance(user, ml.User)
    assert isinstance(user.id, int)
    assert user.first_name == "John"
    assert user.last_name == "Doe"
    assert user.is_disabled
    assert user.locale == "fr"

    # Update user
    user_id = user.id
    client.update_user(user_id, ml.WriteUser(is_disabled=False, locale="uk"))
    client.create_user_credentials_email(
        user_id, ml.WriteCredentialsEmail(email="john.doe@looker.com")
    )

    # Retrieve user details
    user = client.user(user_id)
    assert user.locale == "uk"
    assert not user.is_disabled
    assert isinstance(user.credentials_email, ml.CredentialsEmail)
    assert user.credentials_email.email == "john.doe@looker.com"
    assert user.first_name == "John"
    assert user.last_name == "Doe"

    # Delete user
    resp = client.delete_user(user_id)
    assert resp == ""


def test_me_returns_correct_result(client: mtds.LookerSDK):
    """me() should return the right user
    """
    me = client.me()
    assert isinstance(me, ml.User)
    assert isinstance(me.credentials_api3, list)
    assert isinstance(me.credentials_api3[0], ml.CredentialsApi3)
    assert len(me.credentials_api3) > 0


def test_me_field_filters(client: mtds.LookerSDK):
    """me() should return only the requested fields.
    """
    me = client.me("id, first_name, last_name")
    assert isinstance(me, ml.User)
    assert isinstance(me.id, int)
    assert isinstance(me.first_name, str)
    assert me.first_name != ""
    assert isinstance(me.last_name, str)
    assert me.last_name != ""
    assert not me.display_name
    assert not me.email
    assert not me.personal_space_id


@pytest.mark.usefixtures("create_users")
def test_bad_user_search_returns_no_results(client: mtds.LookerSDK):
    """search_users() should return an empty list when no match is found.
    """
    resp = client.search_users(first_name="Bad", last_name="News")
    assert isinstance(resp, list)
    assert len(resp) == 0


@pytest.mark.usefixtures("create_users")
def test_it_searches_and_sorts_users(
    client: mtds.LookerSDK, test_data: Dict[str, Union[List[Dict[str, str]], str]]
):
    """search_users should return a list of all matches.
    """
    r = client.search_users(email=f"%{test_data['email_domain']}")
    assert len(r) == len(test_data["users"])


def test_it_retrieves_session(client: mtds.LookerSDK):
    """session() should return the current session
    """
    resp = client.session()
    assert resp.workspace_id == "production"


def test_it_updates_session(client: mtds.LookerSDK):
    """update_session() should allow us to change the current workspace
    """
    # Switch workspace to dev mode
    client.update_session(ml.WriteApiSession(workspace_id="dev"))
    resp = client.session()

    assert isinstance(resp, ml.ApiSession)
    assert resp.workspace_id == "dev"

    # Switch workspace back to production
    resp = client.update_session(ml.WriteApiSession(workspace_id="production"))

    assert isinstance(resp, ml.ApiSession)
    assert resp.workspace_id == "production"
