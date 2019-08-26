# pylint: disable=C,R
# pylint: disable=redefined-outer-name

import json

import pytest  # type: ignore

from looker_sdk import error
from looker_sdk.rtl import auth_session as auth
from looker_sdk.rtl import api_settings
from looker_sdk.rtl import serialize
from looker_sdk.rtl import transport


@pytest.fixture(scope="module")  # type: ignore
def config_file(tmpdir_factory):
    """Creates a sample looker.ini file and returns it"""
    filename = tmpdir_factory.mktemp("settings").join("looker.ini")
    filename.write(
        """
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
# Set to false if testing locally against self-signed certs. Otherwise leave True
verify_ssl=True
# leave verbose off by default
verbose=false
        """
    )
    return filename


@pytest.fixture(scope="function")  # type: ignore
def auth_session(config_file):
    settings = api_settings.ApiSettings.configure(config_file)
    return auth.AuthSession(
        settings, MockTransport.configure(settings), serialize.deserialize
    )


class MockTransport(transport.Transport):
    """A mock transport layer used for testing purposes"""

    @classmethod
    def configure(cls, settings):
        return cls()

    def request(
        self,
        method,
        path,
        query_params=None,
        body=None,
        authenticator=None,
        headers=None,
    ):
        if authenticator:
            authenticator()
        if method == transport.HttpMethod.POST:
            if path == "/login":
                token = "AdminAccessToken"
                expected_header = {"Content-Type": "application/x-www-form-urlencoded"}
                if headers != expected_header:
                    raise TypeError(f"Must send {expected_header}")
            elif path == "/login/5":
                token = "UserAccessToken"
            access_token = json.dumps(
                {"access_token": token, "token_type": "Bearer", "expires_in": 3600}
            )
            response = transport.Response(ok=True, value=access_token)
        elif (method == transport.HttpMethod.DELETE) and (path == "/logout"):
            response = transport.Response(ok=True, value="")
        else:
            raise TypeError("Bad transport layer call")
        return response


def test_auto_admin_login(auth_session: auth.AuthSession):
    assert not auth_session.is_admin_authenticated
    auth_header = auth_session.authenticate()
    assert auth_header["Authorization"] == "token AdminAccessToken"
    assert auth_session.is_admin_authenticated

    # even after explicit logout
    auth_session.logout()
    assert not auth_session.is_admin_authenticated
    auth_header = auth_session.authenticate()
    assert isinstance(auth_header, dict)
    assert auth_header["Authorization"] == "token AdminAccessToken"
    assert auth_session.is_admin_authenticated


def test_user_login_auto_logs_in_admin(auth_session: auth.AuthSession):
    assert not auth_session.is_admin_authenticated
    assert not auth_session.is_user_authenticated
    auth_session.login_user(5)
    assert auth_session.is_admin_authenticated
    assert auth_session.is_user_authenticated
    auth_header = auth_session.authenticate()
    assert auth_header["Authorization"] == "token UserAccessToken"


def test_user_logout_leaves_admin_logged_in(auth_session: auth.AuthSession):
    auth_session.login_user(5)
    auth_session.logout()
    assert not auth_session.is_user_authenticated
    assert auth_session.is_admin_authenticated


def test_login_user_login_user(auth_session: auth.AuthSession):
    auth_session.login_user(5)
    with pytest.raises(error.SDKError):  # type: ignore
        auth_session.login_user(10)


def test_is_sudo(auth_session: auth.AuthSession):
    assert auth_session.is_sudo is None
    auth_session.authenticate()  # auto-login admin
    assert auth_session.is_sudo is None
    auth_session.login_user(5)
    assert auth_session.is_sudo == 5
    auth_session.logout()
    assert auth_session.is_sudo is None
