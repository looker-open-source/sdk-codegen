# pylint: disable=C,R
# pylint: disable=redefined-outer-name

import json

import pytest  # type: ignore

from looker.rtl.user_session import UserSession
from looker.rtl import api_settings as st
from looker.rtl import transport as tp


@pytest.fixture(scope='session')
def config_file(tmpdir_factory):
    """Creates a sample looker.ini file and returns it"""
    filename = tmpdir_factory.mktemp('settings').join('looker.ini')
    filename.write("""
[Looker]
# API version is required
api_version=3.1
# Base URL for API. Do not include /api/* in the url
base_url=https://host1.looker.com:19999
# API 3 client id
client_id=your_API3_client_id
# API 3 client secret
client_secret=your_API3_client_secret
# Optional embed secret for SSO embedding
embed_secret=your_embed_SSO_secret
# Optional user_id to impersonate
user_id=
# Set to false if testing locally against self-signed certs. Otherwise leave True
verify_ssl=True
# leave verbose off by default
verbose=false
        """)
    return filename


# pylasdfint: disable=no-method-argument
class MockTransport(tp.Transport):
    """A mock transport layer used for testing purposes"""
    @classmethod
    def configure(cls, settings):
        return cls()

    def request(self,
                method,
                path,
                query_params=None,
                body=None,
                authenticator=None):
        if method == tp.HttpMethod.POST and path.startswith('/login'):
            access_token = json.dumps({
                'access_token': 'myACCESStokEN',
                'token_type': 'Bearer',
                'expires_in': 3600
            })
            response = tp.Response(ok=True, value=access_token)
        elif (method == tp.HttpMethod.DELETE) and (path == '/logout'):
            response = tp.Response(ok=True, value='')
        else:
            raise TypeError('Bad transport layer call')
        return response


def test_is_authenticated_returns_true_when_authenticated(config_file):
    """is_authenticated should return true when session is authenticated"""
    # Given a user session that is not authenticated
    settings = st.ApiSettings.configure(config_file)
    user_session = UserSession(settings, MockTransport.configure(settings))

    # On instantiation, user_session should not be authenticated
    assert not user_session.is_authenticated

    # After logging in, user_session should be authenticated
    user_session.login()
    assert user_session.is_authenticated


def test_is_impersonating_returns_false_when_not_impersonating(config_file):
    """is_impersonating should return false when session is not authenticated 
    or is authenticated but not as another user"""
    # Given a user session that is not authenticated
    settings = st.ApiSettings.configure(config_file)
    user_session = UserSession(settings, MockTransport.configure(settings))

    # On instantiation, user_session should not be impersonating
    assert not user_session.is_impersonating

    # After logging in without impersonating, user_session should not be impersonating
    user_session.login()
    assert not user_session.is_impersonating


def test_is_impersonating_returns_true_when_impersonating(config_file):
    """is_impersonating should return true when session is authenticated
    with a specific user_id"""
    # Given a user session that is not authenticated
    settings = st.ApiSettings.configure(config_file)
    user_session = UserSession(settings, MockTransport.configure(settings))

    # On instantiation, user_session should not be impersonating
    assert not user_session.is_impersonating

    # After logging in without impersonating, user_session should not be impersonating
    user_session.login('5')
    assert user_session.is_authenticated
    assert user_session.is_impersonating

    # After logging out the impersonated user, user_session logs back in as the original user
    user_session.logout()
    assert user_session.is_authenticated
    assert not user_session.is_impersonating


def test_unauthenticated_logout_returns_false():
    """logout() should return false when current session is unauthenticated."""
    user_session = UserSession(object, object)

    # Default state should be unauthenticated
    assert not user_session.is_authenticated

    # Session should remain unauthenticated after logout
    actual = user_session.logout()
    assert not actual


def test_authenticated_logout_returns_true(config_file):
    """logout() should return true when current session is authenticated."""
    settings = st.ApiSettings.configure(config_file)
    user_session = UserSession(settings, MockTransport.configure(settings))
    user_session.login()
    assert user_session.logout()
