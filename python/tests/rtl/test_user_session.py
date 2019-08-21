# pylint: disable=C,R
# pylint: disable=redefined-outer-name

import json

import pytest  # type: ignore

from looker_sdk import error
from looker_sdk.rtl import user_session as us
from looker_sdk.rtl import api_settings as st
from looker_sdk.rtl import serialize as sr
from looker_sdk.rtl import transport as tp


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
def user_session(config_file):
    settings = st.ApiSettings.configure(config_file)
    return us.UserSession(settings, MockTransport.configure(settings), sr.deserialize)


class MockTransport(tp.Transport):
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
        if method == tp.HttpMethod.POST:
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
            response = tp.Response(ok=True, value=access_token)
        elif (method == tp.HttpMethod.DELETE) and (path == "/logout"):
            response = tp.Response(ok=True, value="")
        else:
            raise TypeError("Bad transport layer call")
        return response


def test_auto_admin_login(user_session: us.UserSession):
    assert not user_session.is_admin_authenticated
    auth_header = user_session.authenticate()
    assert auth_header["Authorization"] == "token AdminAccessToken"
    assert user_session.is_admin_authenticated

    # even after explicit logout
    user_session.logout()
    assert not user_session.is_admin_authenticated
    auth_header = user_session.authenticate()
    assert isinstance(auth_header, dict)
    assert auth_header["Authorization"] == "token AdminAccessToken"
    assert user_session.is_admin_authenticated


def test_user_login_auto_logs_in_admin(user_session: us.UserSession):
    assert not user_session.is_admin_authenticated
    assert not user_session.is_user_authenticated
    user_session.login_user(5)
    assert user_session.is_admin_authenticated
    assert user_session.is_user_authenticated
    auth_header = user_session.authenticate()
    assert auth_header["Authorization"] == "token UserAccessToken"


def test_user_logout_leaves_admin_logged_in(user_session: us.UserSession):
    user_session.login_user(5)
    user_session.logout()
    assert not user_session.is_user_authenticated
    assert user_session.is_admin_authenticated


def test_login_user_login_user(user_session: us.UserSession):
    user_session.login_user(5)
    with pytest.raises(error.SDKError):  # type: ignore
        user_session.login_user(10)


def test_is_sudo(user_session: us.UserSession):
    assert user_session.is_sudo is None
    user_session.authenticate()  # auto-login admin
    assert user_session.is_sudo is None
    user_session.login_user(5)
    assert user_session.is_sudo == 5
    user_session.logout()
    assert user_session.is_sudo is None
