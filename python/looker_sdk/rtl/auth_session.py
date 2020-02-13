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

"""AuthSession to provide automatic authentication
"""
from typing import cast, Dict, Optional, Type, Union
import urllib.parse

from looker_sdk import error
from looker_sdk.rtl import api_settings
from looker_sdk.rtl import auth_token
from looker_sdk.rtl import constants
from looker_sdk.rtl import serialize
from looker_sdk.rtl import transport
from looker_sdk.sdk.api31 import models as models31
from looker_sdk.sdk.api40 import models as models40


# I'd expect the following line to be sufficient to tell mypy that `access_token`
# is a Union[models31.AccessToken, models40.AccessToken] but it isn't.
#
# `isinstance(access_token, token_model)`
#
# hence the explicit tuple instead
token_model_isinstances = models31.AccessToken, models40.AccessToken
token_model: Union[Type[models31.AccessToken], Type[models40.AccessToken]]
if constants.api_version == "3.1":
    token_model = models31.AccessToken
elif constants.api_version == "4.0":
    token_model = models40.AccessToken


class AuthSession:
    """AuthSession to provide automatic authentication
    """

    def __init__(
        self,
        settings: api_settings.PApiSettings,
        transport: transport.Transport,
        deserialize: serialize.TDeserialize,
    ):
        if not settings.is_configured():
            raise error.SDKError(
                "Missing required configuration values like base_url and api_version."
            )
        self.settings = settings
        self.user_token: auth_token.AuthToken = auth_token.AuthToken()
        self.admin_token: auth_token.AuthToken = auth_token.AuthToken()
        self._sudo_id: Optional[int] = None
        self.transport = transport
        self.deserialize = deserialize

    def _is_authenticated(self, token: auth_token.AuthToken) -> bool:
        """Determines if current token is active."""
        if not (token.access_token):
            return False
        return token.is_active

    @property
    def is_user_authenticated(self) -> bool:
        return self._is_authenticated(self.user_token)

    @property
    def is_admin_authenticated(self) -> bool:
        return self._is_authenticated(self.admin_token)

    @property
    def is_sudo(self) -> Optional[int]:
        return self._sudo_id

    def _get_user_token(self) -> auth_token.AuthToken:
        """Returns an active user token."""
        if not self.is_user_authenticated:
            self._login_user()
        return self.user_token

    def _get_admin_token(self) -> auth_token.AuthToken:
        """Returns an active admin token."""
        if not self.is_admin_authenticated:
            self._login_admin()
        return self.admin_token

    def authenticate(self) -> Dict[str, str]:
        """Return the Authorization header to authenticate each API call.

        Expired token renewal happens automatically.
        """
        if self._sudo_id:
            token = self._get_user_token()
        else:
            token = self._get_admin_token()

        return {"Authorization": f"Bearer {token.access_token}"}

    def login_user(self, sudo_id: int) -> None:
        """Authenticate using settings credentials and sudo as sudo_id.

        Make API calls as if authenticated as sudo_id. The sudo_id
        token is automatically renewed when it expires. In order to
        subsequently login_user() as another user you must first logout()
        """
        if self._sudo_id is None:
            self._sudo_id = sudo_id
            try:
                self._login_user()
            except error.SDKError:
                self._sudo_id = None
                raise

        else:
            if self._sudo_id != sudo_id:
                raise error.SDKError(
                    f"Another user ({self._sudo_id}) "
                    "is already logged in. Log them out first."
                )
            elif not self.is_user_authenticated:
                self._login_user()

    def _login_admin(self) -> None:
        client_id = self.settings.get_client_id()
        client_secret = self.settings.get_client_secret()
        if not (client_id and client_secret):
            raise error.SDKError("Required auth credentials not found.")

        serialized = urllib.parse.urlencode(
            {
                "client_id": cast(str, client_id),
                "client_secret": cast(str, client_secret),
            }
        ).encode("utf-8")

        response = self._ok(
            self.transport.request(
                transport.HttpMethod.POST,
                "/login",
                body=serialized,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
        )

        access_token = self.deserialize(data=response, structure=token_model)
        assert isinstance(access_token, token_model_isinstances)
        self.admin_token = auth_token.AuthToken(access_token)

    def _login_user(self) -> None:
        response = self._ok(
            self.transport.request(
                transport.HttpMethod.POST,
                f"/login/{self._sudo_id}",
                authenticator=lambda: {
                    "Authorization": f"Bearer {self._get_admin_token().access_token}"
                },
            )
        )
        access_token = self.deserialize(data=response, structure=token_model)
        assert isinstance(access_token, token_model_isinstances)
        self.user_token = auth_token.AuthToken(access_token)

    def logout(self, full: bool = False) -> None:
        """Logout cuurent session or all.

        If the session is authenticated as sudo_id, logoout() "undoes"
        the sudo and deactivates that sudo_id's current token. By default
        the current admin/api3credential session is active at which point
        you can continue to make API calls as the admin/api3credential user
        or logout(). If you want to logout completely in one step pass
        full=True
        """
        if self._sudo_id:
            self._sudo_id = None
            if self.is_user_authenticated:
                self._logout_user()
                if full:
                    self._logout_admin()

        elif self.is_admin_authenticated:
            self._logout_admin()

    def _logout_user(self) -> None:
        self._ok(
            self.transport.request(
                transport.HttpMethod.DELETE,
                "/logout",
                authenticator=lambda: {
                    "Authorization": f"Bearer {self.user_token.access_token}"
                },
            )
        )
        self._reset_user_token()

    def _logout_admin(self) -> None:
        self._ok(
            self.transport.request(
                transport.HttpMethod.DELETE,
                "/logout",
                authenticator=lambda: {
                    "Authorization": f"Bearer {self.admin_token.access_token}"
                },
            )
        )

        self._reset_admin_token()

    def _reset_admin_token(self) -> None:
        self.admin_token = auth_token.AuthToken()

    def _reset_user_token(self) -> None:
        self.user_token = auth_token.AuthToken()

    def _ok(self, response: transport.Response) -> str:
        if not response.ok:
            raise error.SDKError(response.value)
        return response.value.decode(encoding="utf-8")
