# pylint: disable=C,R

from looker_sdk.rtl import auth_token
from looker_sdk.rtl import model


def test_defaults_with_empty_token():
    """Confirm the defaults when initializing AuthToken without arguments."""
    actual = auth_token.AuthToken()

    assert actual.access_token == ""
    assert actual.token_type == ""
    assert actual.expires_in == 0
    assert actual.is_active is False


def test_is_active_with_full_token():
    """Confirm active token when AuthToken is initialized properly."""
    actual = auth_token.AuthToken(
        model.AccessToken(
            access_token="all-access", token_type="backstage", expires_in=3600
        )
    )

    assert actual.access_token == "all-access"
    assert actual.token_type == "backstage"
    assert actual.expires_in == 3600
    assert actual.is_active is True
