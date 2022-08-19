import pytest  # type: ignore

from looker_sdk.sdk.api40 import methods as mtds
from looker_sdk.sdk.api40 import models as ml

@pytest.fixture(scope="module")
def sdk(sdk40) -> mtds.Looker40SDK:
    return sdk40


TEST_FIRST_NAME = "Rudolphontronix"
TEST_LAST_NAME = "Doe"


def test_crud_user(sdk: mtds.Looker40SDK):
    """Test creating, retrieving, updating and deleting a user."""

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
    
    user_id = user.id
    sdk.create_user_credentials_email(
        user_id, ml.WriteCredentialsEmail(email="john.doe@looker.com")
    )
    user = sdk.user(user_id)
    assert isinstance(user.credentials_email, ml.CredentialsEmail)
    assert user.credentials_email.email == "john.doe@looker.com"

    # Delete user
    resp = sdk.delete_user(user_id)
    assert resp == ""
