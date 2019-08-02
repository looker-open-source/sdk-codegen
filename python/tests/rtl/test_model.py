# pylint: disable=C,R

from looker.rtl import model as ml


def test_access_token_extends_model():
    token = ml.AccessToken()
    assert isinstance(token, ml.Model)


def test_access_token_defaults():
    token = ml.AccessToken()
    assert token.access_token == ''
    assert token.token_type == ''
    assert token.expires_in == 0
