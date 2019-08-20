import pytest  # type: ignore
from typing import Dict, List, Union

from looker_sdk.sdk import methods as mtds
from looker_sdk.sdk import models as ml


def test_crud_user(looker_client: mtds.LookerSDK):
    """Test creating, retrieving, updating and deleting a user.
    """

    # Create user
    user = looker_client.create_user(
        ml.WriteUser(first_name="John", last_name="Doe", is_disabled=True, locale="fr")
    )
    assert isinstance(user, ml.User)
    assert isinstance(user.id, int)
    assert user.first_name == "John"
    assert user.last_name == "Doe"
    assert user.is_disabled
    assert user.locale == "fr"

    # sudo checks
    user_id = user.id
    looker_client.login_user(user_id)
    user = looker_client.me()
    assert user.first_name == "John"
    assert user.last_name == "Doe"
    looker_client.logout()
    user = looker_client.me()
    assert user.first_name != "John"
    assert user.last_name != "Doe"

    # Update user and check fields we didn't intend to change didn't change
    update_user = ml.WriteUser(is_disabled=False, locale="uk")
    looker_client.update_user(user_id, update_user)
    user = looker_client.user(user_id)
    assert user.first_name == "John"
    assert user.last_name == "Doe"
    assert user.locale == "uk"
    assert not user.is_disabled

    # Update user and check fields we intended to wipe out are now None
    # first way to specify nulling out a field
    update_user = ml.WriteUser(first_name=ml.EXPLICIT_NULL)  # type: ignore
    # second way
    update_user.last_name = None
    looker_client.update_user(user_id, update_user)
    user = looker_client.user(user_id)
    assert user.first_name is None
    assert user.last_name is None

    # Try adding email creds
    looker_client.create_user_credentials_email(
        user_id, ml.WriteCredentialsEmail(email="john.doe@looker.com")
    )
    user = looker_client.user(user_id)
    assert isinstance(user.credentials_email, ml.CredentialsEmail)
    assert user.credentials_email.email == "john.doe@looker.com"
    # Delete user
    resp = looker_client.delete_user(user_id)
    assert resp == ""


def test_me_returns_correct_result(looker_client: mtds.LookerSDK):
    """me() should return the right user
    """
    me = looker_client.me()
    assert isinstance(me, ml.User)
    assert isinstance(me.credentials_api3, list)
    assert len(me.credentials_api3) > 0
    assert isinstance(me.credentials_api3[0], ml.CredentialsApi3)


def test_me_field_filters(looker_client: mtds.LookerSDK):
    """me() should return only the requested fields.
    """
    me = looker_client.me("id, first_name, last_name")
    assert isinstance(me, ml.User)
    assert isinstance(me.id, int)
    assert isinstance(me.first_name, str)
    assert me.first_name != ""
    assert isinstance(me.last_name, str)
    assert me.last_name != ""
    assert not me.display_name
    assert not me.email
    assert not me.personal_space_id


@pytest.mark.usefixtures("create_users")  # type: ignore
def test_bad_user_search_returns_no_results(looker_client: mtds.LookerSDK):
    """search_users() should return an empty list when no match is found.
    """
    resp = looker_client.search_users(first_name="Bad", last_name="News")
    assert isinstance(resp, list)
    assert len(resp) == 0


@pytest.mark.usefixtures("create_users")  # type: ignore
def test_it_searches_and_sorts_users(
    looker_client: mtds.LookerSDK,
    test_data: Dict[str, Union[List[Dict[str, str]], str]],
):
    """search_users should return a list of all matches.
    """
    r = looker_client.search_users(email=f"%{test_data['email_domain']}")
    assert len(r) == len(test_data["users"])


def test_it_retrieves_session(looker_client: mtds.LookerSDK):
    """session() should return the current session
    """
    resp = looker_client.session()
    assert resp.workspace_id == "production"


def test_it_updates_session(looker_client: mtds.LookerSDK):
    """update_session() should allow us to change the current workspace
    """
    # Switch workspace to dev mode
    looker_client.update_session(ml.WriteApiSession(workspace_id="dev"))
    resp = looker_client.session()

    assert isinstance(resp, ml.ApiSession)
    assert resp.workspace_id == "dev"

    # Switch workspace back to production
    resp = looker_client.update_session(ml.WriteApiSession(workspace_id="production"))

    assert isinstance(resp, ml.ApiSession)
    assert resp.workspace_id == "production"
