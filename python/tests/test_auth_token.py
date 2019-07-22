from looker.rtl.auth_token import AuthToken
from looker.sdk.models import AccessToken


def test_defaults_with_empty_token():
    actual = AuthToken()

    assert actual.access_token == ''
    assert actual.token_type == ''
    assert actual.expires_in == 0
    assert actual.is_active is False


def test_is_active_with_full_token():
    actual = AuthToken(AccessToken('all-access', 'backstage', 3600))

    assert actual.access_token == 'all-access'
    assert actual.token_type == 'backstage'
    assert actual.expires_in == 3600
    assert actual.is_active is True
