from looker.sdk import methods as mtds
from looker.sdk import models as ml


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

    # Delete user
    resp = client.delete_user(user_id)
    assert resp == ""


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
