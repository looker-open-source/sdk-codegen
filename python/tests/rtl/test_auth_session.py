# The MIT License (MIT)
#
# Copyright (c) 2019 Looker Data Sciences, Inc.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.

import json
import pytest  # type: ignore
import urllib

from looker_sdk import error
from looker_sdk.rtl import auth_session as auth
from looker_sdk.rtl import api_settings
from looker_sdk.rtl import serialize
from looker_sdk.rtl import transport


@pytest.fixture(scope="module")
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
# Set to false if testing locally against self-signed certs. Otherwise leave True
verify_ssl=True

[NO_CREDENTIALS]
base_url=https://host1.looker.com:19999

[EMPTY_STRING_CREDENTIALS]
base_url=https://host1.looker.com:19999
client_id=
client_secret=
        """
    )
    return filename


@pytest.fixture(scope="function")
def auth_session(config_file):
    settings = api_settings.ApiSettings.configure(config_file)
    settings.api_version = "3.1"
    return auth.AuthSession(
        settings, MockTransport.configure(settings), serialize.deserialize31
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
            response = transport.Response(
                ok=True,
                value=bytes(access_token, encoding="utf-8"),
                response_mode=transport.ResponseMode.STRING,
            )
        elif (method == transport.HttpMethod.DELETE) and (path == "/logout"):
            response = transport.Response(
                ok=True, value=b"", response_mode=transport.ResponseMode.STRING
            )
        else:
            raise TypeError("Bad transport layer call")
        return response


def test_auto_admin_login(auth_session: auth.AuthSession):
    assert not auth_session.is_admin_authenticated
    auth_header = auth_session.authenticate()
    assert auth_header["Authorization"] == "Bearer AdminAccessToken"
    assert auth_session.is_admin_authenticated

    # even after explicit logout
    auth_session.logout()
    assert not auth_session.is_admin_authenticated
    auth_header = auth_session.authenticate()
    assert isinstance(auth_header, dict)
    assert auth_header["Authorization"] == "Bearer AdminAccessToken"
    assert auth_session.is_admin_authenticated


def test_user_login_auto_logs_in_admin(auth_session: auth.AuthSession):
    assert not auth_session.is_admin_authenticated
    assert not auth_session.is_user_authenticated
    auth_session.login_user(5)
    assert auth_session.is_admin_authenticated
    assert auth_session.is_user_authenticated
    auth_header = auth_session.authenticate()
    assert auth_header["Authorization"] == "Bearer UserAccessToken"


def test_user_logout_leaves_admin_logged_in(auth_session: auth.AuthSession):
    auth_session.login_user(5)
    auth_session.logout()
    assert not auth_session.is_user_authenticated
    assert auth_session.is_admin_authenticated


def test_login_user_login_user(auth_session: auth.AuthSession):
    auth_session.login_user(5)
    with pytest.raises(error.SDKError):
        auth_session.login_user(10)


def test_is_sudo(auth_session: auth.AuthSession):
    assert auth_session.is_sudo is None
    auth_session.authenticate()  # auto-login admin
    assert auth_session.is_sudo is None
    auth_session.login_user(5)
    assert auth_session.is_sudo == 5
    auth_session.logout()
    assert auth_session.is_sudo is None


@pytest.mark.parametrize(
    "test_section, test_env_client_id, test_env_client_secret",
    [
        ("NO_CREDENTIALS", "", ""),
        ("NO_CREDENTIALS", "id123", ""),
        ("NO_CREDENTIALS", "", "secret123"),
        ("EMPTY_STRING_CREDENTIALS", "", ""),
        ("EMPTY_STRING_CREDENTIALS", "id123", ""),
        ("EMPTY_STRING_CREDENTIALS", "", "secret123"),
    ],
)
def test_it_fails_with_missing_credentials(
    config_file, monkeypatch, test_section, test_env_client_id, test_env_client_secret
):
    monkeypatch.setenv("LOOKERSDK_CLIENT_ID", test_env_client_id)
    monkeypatch.setenv("LOOKERSDK_CLIENT_SECRET", test_env_client_secret)

    settings = api_settings.ApiSettings.configure(config_file, test_section)
    settings.api_version = "3.1"

    auth_session = auth.AuthSession(
        settings, MockTransport.configure(settings), serialize.deserialize31
    )

    with pytest.raises(error.SDKError) as exc_info:
        auth_session.authenticate()
    assert "auth credentials not found" in str(exc_info.value)


@pytest.mark.parametrize(
    "test_env_client_id, test_env_client_secret, expected_id, expected_secret",
    [
        ("", "", "your_API3_client_id", "your_API3_client_secret"),
        ("id123", "secret123", "id123", "secret123"),
    ],
)
def test_env_variables_override_config_file_credentials(
    auth_session: auth.AuthSession,
    mocker,
    monkeypatch,
    test_env_client_id: str,
    test_env_client_secret: str,
    expected_id: str,
    expected_secret: str,
):
    monkeypatch.setenv("LOOKERSDK_CLIENT_ID", test_env_client_id)
    monkeypatch.setenv("LOOKERSDK_CLIENT_SECRET", test_env_client_secret)
    mocked_request = mocker.patch.object(MockTransport, "request")
    mocked_request.return_value = transport.Response(
        ok=True,
        value=bytes(
            json.dumps(
                {
                    "access_token": "AdminAccessToken",
                    "token_type": "Bearer",
                    "expires_in": 3600,
                }
            ),
            encoding="utf-8",
        ),
        response_mode=transport.ResponseMode.STRING,
    )

    auth_session.authenticate()

    expected_body = urllib.parse.urlencode(
        {"client_id": expected_id, "client_secret": expected_secret}
    ).encode("utf-8")
    mocked_request.assert_called()
    actual_request_body = mocked_request.call_args[1]["body"]
    assert actual_request_body == expected_body
